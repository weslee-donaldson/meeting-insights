import { mkdirSync, readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createLogger } from "./logger.js";
import { parseKrispFile, parseManifest, parseKrispFolder } from "./parser.js";
import { ingestMeeting } from "./ingest.js";
import { extractSummary, storeArtifact } from "./extractor.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "./meeting-pipeline.js";
import { detectClient, storeDetection } from "./client-detection.js";
import { createMeetingTable } from "./vector-db.js";
import { moveToProcessed, moveToFailed } from "./lifecycle.js";
import type { Database } from "better-sqlite3";
import type { VectorDb } from "./vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { LlmAdapter } from "./llm-adapter.js";

const log = createLogger("pipeline");

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
}

interface PipelineResult {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

async function processEntry(
  parsed: ReturnType<typeof parseKrispFile>,
  name: string,
  rawDir: string,
  processedDir: string,
  failedDir: string,
  auditDir: string,
  db: Database,
  table: Awaited<ReturnType<typeof createMeetingTable>>,
  session: InferenceSession & { _tokenizer: unknown },
  llm: LlmAdapter,
  tokenLimit: number,
  promptTemplate: string | undefined,
): Promise<"ok" | "failed"> {
  if (!parsed) {
    const reason = "parse failed";
    moveToFailed(rawDir, failedDir, name, reason);
    writeFileSync(join(auditDir, `${Date.now()}-${name.trim()}.json`), JSON.stringify({ filename: name, reason, timestamp: new Date().toISOString() }), "utf-8");
    return "failed";
  }
  try {
    const meetingId = ingestMeeting(db, parsed);
    const artifact = await extractSummary(llm, parsed.turns, tokenLimit, promptTemplate);
    storeArtifact(db, meetingId, artifact);
    const vec = await embedMeeting(session, buildEmbeddingInput(artifact));
    const detections = detectClient(db, meetingId);
    storeDetection(db, meetingId, detections);
    const client = detections[0]?.client_name ?? "";
    await storeMeetingVector(table, meetingId, vec, { client, meeting_type: parsed.title, date: parsed.timestamp });
    moveToProcessed(rawDir, processedDir, name);
    return "ok";
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    moveToFailed(rawDir, failedDir, name, reason);
    writeFileSync(join(auditDir, `${Date.now()}-${name.trim()}.json`), JSON.stringify({ filename: name, reason, timestamp: new Date().toISOString() }), "utf-8");
    return "failed";
  }
}

export async function processNewMeetings(config: PipelineConfig): Promise<PipelineResult> {
  const { rawDir, processedDir, failedDir, auditDir, db, vdb, session, llm, tokenLimit = 2000, extractionPromptPath } = config;

  const promptTemplate = extractionPromptPath && existsSync(extractionPromptPath)
    ? readFileSync(extractionPromptPath, "utf-8")
    : undefined;

  mkdirSync(auditDir, { recursive: true });

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  const table = await createMeetingTable(vdb);

  const manifestPath = join(rawDir, "manifest.json");
  if (existsSync(manifestPath)) {
    // Manifest-based folder processing
    const entries = parseManifest(rawDir);
    const existingIds = new Set(
      (db.prepare("SELECT id FROM meetings").all() as { id: string }[]).map((r) => r.id),
    );

    for (const entry of entries) {
      const folderName = entry.meeting_files[0].split("/")[0];
      if (existingIds.has(entry.meeting_id)) {
        skipped++;
        continue;
      }
      const parsed = parseKrispFolder(rawDir, folderName, entry);
      const outcome = await processEntry(parsed, folderName, rawDir, processedDir, failedDir, auditDir, db, table, session, llm, tokenLimit, promptTemplate);
      if (outcome === "ok") succeeded++;
      else failed++;
    }

    log("pipeline complete total=%d succeeded=%d failed=%d skipped=%d", entries.length, succeeded, failed, skipped);
    return { total: entries.length, succeeded, failed, skipped };
  }

  // Legacy flat-file processing (used by tests)
  const files = existsSync(rawDir) ? readdirSync(rawDir) : [];
  const alreadyProcessed = existsSync(processedDir) ? new Set(readdirSync(processedDir)) : new Set<string>();

  for (const filename of files) {
    if (alreadyProcessed.has(filename)) {
      skipped++;
      continue;
    }
    const parsed = parseKrispFile(join(rawDir, filename), filename);
    const outcome = await processEntry(parsed, filename, rawDir, processedDir, failedDir, auditDir, db, table, session, llm, tokenLimit, promptTemplate);
    if (outcome === "ok") succeeded++;
    else failed++;
  }

  log("pipeline complete total=%d succeeded=%d failed=%d skipped=%d", files.length, succeeded, failed, skipped);
  return { total: files.length, succeeded, failed, skipped };
}
