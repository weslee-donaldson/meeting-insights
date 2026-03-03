import { mkdirSync, readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createLogger } from "./logger.js";
import { parseKrispFile, parseManifest, parseKrispFolder } from "./parser.js";
import { ingestMeeting } from "./ingest.js";
import { extractSummary, storeArtifact } from "./extractor.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "./meeting-pipeline.js";
import { detectClient, storeDetection } from "./client-detection.js";
import { getClientByName, buildClientContext } from "./client-registry.js";
import type { Participant } from "./client-registry.js";
import { createMeetingTable, createItemTable } from "./vector-db.js";
import { moveToProcessed, moveToFailed } from "./lifecycle.js";
import { deduplicateItems } from "./item-dedup.js";
import type { DatabaseSync as Database } from "node:sqlite";
import type { VectorDb } from "./vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { LlmAdapter } from "./llm-adapter.js";

const log = createLogger("pipeline");

function extractErrorType(reason: string): "rate_limit" | "api_error" | "json_parse" | "unknown" {
  if (reason.startsWith("[rate_limit]")) return "rate_limit";
  if (reason.startsWith("[api_error]")) return "api_error";
  if (reason.startsWith("[json_parse]")) return "json_parse";
  return "unknown";
}

export type PipelineEvent =
  | { type: "processing"; name: string; title: string; index: number; total: number }
  | { type: "ok"; name: string; title: string; client: string; elapsed_ms: number }
  | { type: "failed"; name: string; title: string; reason: string; elapsed_ms: number }
  | { type: "skipped"; name: string; title: string; index: number; total: number };

interface PipelineConfig {
  rawDir: string;
  processedDir: string;
  failedDir: string;
  auditDir: string;
  db: Database;
  vdb: VectorDb;
  session: InferenceSession & { _tokenizer: unknown };
  llm: LlmAdapter;
  tokenLimit?: number;
  extractionPromptPath?: string;
  onProgress?: (event: PipelineEvent) => void;
}

interface PipelineResult {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

type EntryResult =
  | { status: "ok"; client: string; elapsed_ms: number }
  | { status: "failed"; reason: string; elapsed_ms: number };

async function processEntry(
  parsed: ReturnType<typeof parseKrispFile>,
  name: string,
  rawDir: string,
  processedDir: string,
  failedDir: string,
  auditDir: string,
  db: Database,
  table: Awaited<ReturnType<typeof createMeetingTable>>,
  itemTable: Awaited<ReturnType<typeof createItemTable>>,
  session: InferenceSession & { _tokenizer: unknown },
  llm: LlmAdapter,
  tokenLimit: number,
  promptTemplate: string | undefined,
): Promise<EntryResult> {
  const start = Date.now();
  if (!parsed) {
    const reason = "parse failed";
    moveToFailed(rawDir, failedDir, name, reason);
    writeFileSync(join(auditDir, `${Date.now()}-${name.trim()}.json`), JSON.stringify({ filename: name, reason, error_type: extractErrorType(reason), timestamp: new Date().toISOString() }), "utf-8");
    return { status: "failed", reason, elapsed_ms: Date.now() - start };
  }
  try {
    const meetingId = ingestMeeting(db, parsed);
    const detections = detectClient(db, meetingId);
    storeDetection(db, meetingId, detections);
    const topClient = detections.sort((a, b) => b.confidence - a.confidence)[0];
    const clientRow = topClient ? getClientByName(db, topClient.client_name) : null;
    const clientContext = clientRow ? buildClientContext(
      clientRow.name,
      JSON.parse(clientRow.client_team ?? "[]") as Participant[],
      JSON.parse(clientRow.implementation_team ?? "[]") as Participant[],
      clientRow.additional_extraction_llm_prompt ?? undefined,
    ) : undefined;
    const artifact = await extractSummary(llm, parsed.turns, tokenLimit, promptTemplate, clientContext);
    storeArtifact(db, meetingId, artifact);
    await deduplicateItems(db, itemTable, session, meetingId, artifact, parsed.timestamp);
    const vec = await embedMeeting(session, buildEmbeddingInput(artifact));
    const client = topClient?.client_name ?? "";
    await storeMeetingVector(table, meetingId, vec, { client, meeting_type: parsed.title, date: parsed.timestamp });
    moveToProcessed(rawDir, processedDir, name);
    return { status: "ok", client, elapsed_ms: Date.now() - start };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    moveToFailed(rawDir, failedDir, name, reason);
    writeFileSync(join(auditDir, `${Date.now()}-${name.trim()}.json`), JSON.stringify({ filename: name, reason, error_type: extractErrorType(reason), timestamp: new Date().toISOString() }), "utf-8");
    return { status: "failed", reason, elapsed_ms: Date.now() - start };
  }
}

export async function processNewMeetings(config: PipelineConfig): Promise<PipelineResult> {
  const { rawDir, processedDir, failedDir, auditDir, db, vdb, session, llm, tokenLimit = 2000, extractionPromptPath, onProgress } = config;

  const promptTemplate = extractionPromptPath && existsSync(extractionPromptPath)
    ? readFileSync(extractionPromptPath, "utf-8")
    : undefined;

  mkdirSync(auditDir, { recursive: true });

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  const table = await createMeetingTable(vdb);
  const itemTable = await createItemTable(vdb);

  const manifestPath = join(rawDir, "manifest.json");
  if (existsSync(manifestPath)) {
    const entries = parseManifest(rawDir);
    const total = entries.length;
    const existingIds = new Set(
      (db.prepare("SELECT id FROM meetings").all() as { id: string }[]).map((r) => r.id),
    );

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const folderName = entry.meeting_files[0].split("/")[0];
      const index = i + 1;

      if (existingIds.has(entry.meeting_id)) {
        onProgress?.({ type: "skipped", name: folderName, title: entry.meeting_title, index, total });
        skipped++;
        continue;
      }

      onProgress?.({ type: "processing", name: folderName, title: entry.meeting_title, index, total });
      const parsed = parseKrispFolder(rawDir, folderName, entry);
      const result = await processEntry(parsed, folderName, rawDir, processedDir, failedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate);

      if (result.status === "ok") {
        onProgress?.({ type: "ok", name: folderName, title: entry.meeting_title, client: result.client, elapsed_ms: result.elapsed_ms });
        succeeded++;
      } else {
        onProgress?.({ type: "failed", name: folderName, title: entry.meeting_title, reason: result.reason, elapsed_ms: result.elapsed_ms });
        failed++;
      }
    }

    log("pipeline complete total=%d succeeded=%d failed=%d skipped=%d", total, succeeded, failed, skipped);
    return { total, succeeded, failed, skipped };
  }

  // Legacy flat-file processing (used by tests)
  const files = existsSync(rawDir) ? readdirSync(rawDir) : [];
  const total = files.length;
  const alreadyProcessed = existsSync(processedDir) ? new Set(readdirSync(processedDir)) : new Set<string>();

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const index = i + 1;

    if (alreadyProcessed.has(filename)) {
      onProgress?.({ type: "skipped", name: filename, title: filename, index, total });
      skipped++;
      continue;
    }

    onProgress?.({ type: "processing", name: filename, title: filename, index, total });
    const parsed = parseKrispFile(join(rawDir, filename), filename);
    const result = await processEntry(parsed, filename, rawDir, processedDir, failedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate);

    if (result.status === "ok") {
      onProgress?.({ type: "ok", name: filename, title: filename, client: result.client, elapsed_ms: result.elapsed_ms });
      succeeded++;
    } else {
      onProgress?.({ type: "failed", name: filename, title: filename, reason: result.reason, elapsed_ms: result.elapsed_ms });
      failed++;
    }
  }

  log("pipeline complete total=%d succeeded=%d failed=%d skipped=%d", total, succeeded, failed, skipped);
  return { total, succeeded, failed, skipped };
}
