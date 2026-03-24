import { mkdirSync, readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createLogger } from "./logger.js";
import { parseKrispFile, parseManifest, parseKrispFolder, listWebhookFiles, parseWebhookPayload } from "./parser.js";
import { ingestMeeting } from "./ingest.js";
import { extractSummary, storeArtifact } from "./extractor.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "./meeting-pipeline.js";
import { detectClient, storeDetection } from "./client-detection.js";
import { getClientByName, buildClientContext } from "./client-registry.js";
import type { Participant } from "./client-registry.js";
import { createMeetingTable, createItemTable } from "./vector-db.js";
import { moveToProcessed, moveToFailed } from "./lifecycle.js";
import { deduplicateItems } from "./item-dedup.js";
import { deepScanClient } from "./deep-dedup.js";
import { updateFts } from "./fts.js";
import { listThreadsByClient, evaluateMeetingAgainstThread, addThreadMeeting } from "./threads.js";
import { reconcileMilestones } from "./timelines.js";
import { embed } from "./embedder.js";
import { cosineSimilarity } from "./math.js";
import type { DatabaseSync as Database } from "node:sqlite";
import type { VectorDb } from "./vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { LlmAdapter } from "./llm-adapter.js";

const log = createLogger("pipeline");

function isKnownNonTranscriptEvent(json: string): boolean {
  try {
    const payload = JSON.parse(json);
    return typeof payload.event === "string" && payload.event !== "transcript_created";
  } catch {
    return false;
  }
}

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
  threadSimilarityThreshold?: number;
  filterFolder?: string;
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

interface MeetingParsed {
  meetingId: string;
  turns: ReturnType<typeof parseKrispFile> extends infer T ? T extends null ? never : T : never;
  timestamp: string;
  title: string;
}

function detectAndExtract(
  db: Database,
  llm: LlmAdapter,
  parsed: MeetingParsed,
  tokenLimit: number,
  promptTemplate: string | undefined,
) {
  const detections = detectClient(db, parsed.meetingId);
  storeDetection(db, parsed.meetingId, detections);
  const topClient = detections.sort((a, b) => b.confidence - a.confidence)[0];
  const clientRow = topClient ? getClientByName(db, topClient.client_name) : null;
  const clientContext = clientRow ? buildClientContext(
    clientRow.name,
    JSON.parse(clientRow.client_team ?? "[]") as Participant[],
    JSON.parse(clientRow.implementation_team ?? "[]") as Participant[],
    clientRow.additional_extraction_llm_prompt ?? undefined,
  ) : undefined;
  return { topClient, clientContext, extractFn: () => extractSummary(llm, parsed.turns.turns, tokenLimit, promptTemplate, clientContext) };
}

async function indexAndDedup(
  db: Database,
  itemTable: Awaited<ReturnType<typeof createItemTable>>,
  session: InferenceSession & { _tokenizer: unknown },
  llm: LlmAdapter,
  meetingId: string,
  artifact: Awaited<ReturnType<typeof extractSummary>>,
  timestamp: string,
  title: string,
  client: string,
) {
  updateFts(db, meetingId);
  await deduplicateItems(db, itemTable, session, meetingId, artifact, timestamp, client);
  if (client && process.env.MTNINSIGHTS_DEDUP_DEEP === "1") {
    const dedupPromptPath = "config/prompts/dedup-intent.md";
    const dedupTemplate = existsSync(dedupPromptPath) ? readFileSync(dedupPromptPath, "utf-8") : "{{items}}";
    await deepScanClient(db, itemTable, session, llm, client, [{ id: meetingId, date: timestamp, title }], dedupTemplate);
  }
}

async function embedAndThread(
  db: Database,
  table: Awaited<ReturnType<typeof createMeetingTable>>,
  session: InferenceSession & { _tokenizer: unknown },
  llm: LlmAdapter,
  meetingId: string,
  artifact: Awaited<ReturnType<typeof extractSummary>>,
  client: string,
  title: string,
  timestamp: string,
  threadSimilarityThreshold: number,
) {
  const vec = await embedMeeting(session, buildEmbeddingInput(artifact));
  await storeMeetingVector(table, meetingId, vec, { client, meeting_type: title, date: timestamp });
  if (client) {
    const openThreads = listThreadsByClient(db, client).filter((t) => t.status === "open");
    for (const thread of openThreads) {
      const threadVec = await embed(session as Parameters<typeof embed>[0], `${thread.title} ${thread.description} ${thread.criteria_prompt}`);
      const similarity = cosineSimilarity(Array.from(threadVec), Array.from(vec));
      if (similarity > threadSimilarityThreshold) {
        const evalResult = await evaluateMeetingAgainstThread(db, llm, meetingId, thread);
        if (evalResult.related) {
          addThreadMeeting(db, {
            thread_id: thread.id,
            meeting_id: meetingId,
            relevance_summary: evalResult.relevance_summary,
            relevance_score: evalResult.relevance_score,
          });
        }
      }
    }
  }
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
  itemTable: Awaited<ReturnType<typeof createItemTable>>,
  session: InferenceSession & { _tokenizer: unknown },
  llm: LlmAdapter,
  tokenLimit: number,
  promptTemplate: string | undefined,
  threadSimilarityThreshold: number,
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
    const meeting: MeetingParsed = { meetingId, turns: parsed, timestamp: parsed.timestamp, title: parsed.title };
    const { topClient, extractFn } = detectAndExtract(db, llm, meeting, tokenLimit, promptTemplate);
    const artifact = await extractFn();
    storeArtifact(db, meetingId, artifact);
    if (topClient?.client_name && artifact.milestones.length > 0) {
      reconcileMilestones(db, topClient.client_name, meetingId, parsed.timestamp, artifact.milestones);
    }
    const client = topClient?.client_name ?? "";
    await indexAndDedup(db, itemTable, session, llm, meetingId, artifact, parsed.timestamp, parsed.title, client);
    await embedAndThread(db, table, session, llm, meetingId, artifact, client, parsed.title, parsed.timestamp, threadSimilarityThreshold);
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
  const { rawDir, processedDir, failedDir, auditDir, db, vdb, session, llm, tokenLimit = 2000, extractionPromptPath, onProgress, threadSimilarityThreshold = 0.3, filterFolder } = config;

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
    const allEntries = parseManifest(rawDir);
    const entries = filterFolder
      ? allEntries.filter((e) => e.meeting_files[0].split("/")[0] === filterFolder)
      : allEntries;
    const total = entries.length;
    const existingIds = filterFolder
      ? new Set<string>()
      : new Set((db.prepare("SELECT id FROM meetings").all() as { id: string }[]).map((r) => r.id));

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const folderName = entry.meeting_files[0].split("/")[0];
      const index = i + 1;

      if (existingIds.has(entry.meeting_id)) {
        onProgress?.({ type: "skipped", name: folderName, title: entry.meeting_title, index, total });
        skipped++;
        continue;
      }

      if (!existsSync(join(rawDir, folderName))) {
        const reason = `folder not found: ${folderName}`;
        log(reason);
        onProgress?.({ type: "failed", name: folderName, title: entry.meeting_title, reason, elapsed_ms: 0 });
        failed++;
        continue;
      }

      onProgress?.({ type: "processing", name: folderName, title: entry.meeting_title, index, total });
      const parsed = parseKrispFolder(rawDir, folderName, entry);
      const result = await processEntry(parsed, folderName, rawDir, processedDir, failedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate, threadSimilarityThreshold);

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
    const result = await processEntry(parsed, filename, rawDir, processedDir, failedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate, threadSimilarityThreshold);

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

interface WebhookPipelineConfig {
  webhookRawDir: string;
  webhookProcessedDir: string;
  webhookFailedDir: string;
  auditDir: string;
  db: Database;
  vdb: VectorDb;
  session: InferenceSession & { _tokenizer: unknown };
  llm: LlmAdapter;
  tokenLimit?: number;
  extractionPromptPath?: string;
  onProgress?: (event: PipelineEvent) => void;
  threadSimilarityThreshold?: number;
}

export async function processWebhookMeetings(config: WebhookPipelineConfig): Promise<PipelineResult> {
  const { webhookRawDir, webhookProcessedDir, webhookFailedDir, auditDir, db, vdb, session, llm, tokenLimit = 2000, extractionPromptPath, onProgress, threadSimilarityThreshold = 0.3 } = config;

  const promptTemplate = extractionPromptPath && existsSync(extractionPromptPath)
    ? readFileSync(extractionPromptPath, "utf-8")
    : undefined;

  mkdirSync(auditDir, { recursive: true });

  const files = listWebhookFiles(webhookRawDir);
  const total = files.length;
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  const table = await createMeetingTable(vdb);
  const itemTable = await createItemTable(vdb);
  const existingIds = new Set((db.prepare("SELECT id FROM meetings").all() as { id: string }[]).map((r) => r.id));

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const index = i + 1;
    const json = readFileSync(join(webhookRawDir, filename), "utf-8");
    const parsed = parseWebhookPayload(json, filename);

    if (!parsed) {
      const isNonTranscriptEvent = isKnownNonTranscriptEvent(json);
      if (isNonTranscriptEvent) {
        skipped++;
        continue;
      }
      onProgress?.({ type: "processing", name: filename, title: filename, index, total });
      const result = await processEntry(null, filename, webhookRawDir, webhookProcessedDir, webhookFailedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate, threadSimilarityThreshold);
      onProgress?.({ type: "failed", name: filename, title: filename, reason: result.status === "failed" ? result.reason : "parse failed", elapsed_ms: result.status === "failed" ? result.elapsed_ms : 0 });
      failed++;
      continue;
    }

    if (parsed.externalId && existingIds.has(parsed.externalId)) {
      onProgress?.({ type: "skipped", name: filename, title: parsed.title, index, total });
      skipped++;
      continue;
    }

    onProgress?.({ type: "processing", name: filename, title: parsed.title, index, total });
    const result = await processEntry(parsed, filename, webhookRawDir, webhookProcessedDir, webhookFailedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate, threadSimilarityThreshold);

    if (result.status === "ok") {
      onProgress?.({ type: "ok", name: filename, title: parsed.title, client: result.client, elapsed_ms: result.elapsed_ms });
      succeeded++;
    } else {
      onProgress?.({ type: "failed", name: filename, title: parsed.title, reason: result.reason, elapsed_ms: result.elapsed_ms });
      failed++;
    }
  }

  log("webhook pipeline complete total=%d succeeded=%d failed=%d skipped=%d", total, succeeded, failed, skipped);
  return { total, succeeded, failed, skipped };
}
