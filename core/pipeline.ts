import { mkdirSync, readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createLogger } from "./logger.js";
import { parseKrispFile, parseManifest, parseKrispFolder, listWebhookFiles, parseWebhookPayload, parseWebhookNote } from "./parser.js";
import { createNote } from "./notes.js";
import { recordSystemError } from "./system-health.js";
import type { Notifier } from "./notifier.js";
import { ingestMeeting } from "./ingest.js";
import { extractSummary, storeArtifact } from "./extractor.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "./meeting-pipeline.js";
import { detectClient, storeDetection } from "./client-detection.js";
import { getClientById, buildClientContext } from "./client-registry.js";
import type { Participant, GlossaryEntry } from "./client-registry.js";
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
import type { LlmAdapter } from "./llm/adapter.js";

const log = createLogger("pipeline");

function handleRecordingReady(db: Database, json: string): boolean {
  try {
    const payload = JSON.parse(json);
    if (payload.event !== "recording_ready") return false;
    const meetingId = payload.data?.meeting?.id;
    const recordingUrl = payload.data?.meeting?.recording_url;
    if (!meetingId || !recordingUrl) return false;
    db.prepare("UPDATE meetings SET recording_url = ? WHERE id = ?").run(recordingUrl, meetingId);
    log("recording_url updated for meeting=%s", meetingId);
    return true;
  } catch {
    return false;
  }
}

export function handleWebhookNote(db: Database, json: string): boolean {
  const parsed = parseWebhookNote(json, "");
  if (!parsed) return false;
  const meeting = db.prepare("SELECT id FROM meetings WHERE id = ?").get(parsed.externalMeetingId) as { id: string } | undefined;
  if (!meeting) return false;
  const existing = db.prepare(
    "SELECT id FROM notes WHERE object_type = 'meeting' AND object_id = ? AND note_type = ?"
  ).get(meeting.id, parsed.noteType) as { id: string } | undefined;
  if (existing) return true;
  createNote(db, {
    objectType: "meeting",
    objectId: meeting.id,
    title: parsed.title,
    body: parsed.body,
    noteType: parsed.noteType,
  });
  log("webhook note created type=%s meeting=%s", parsed.noteType, meeting.id);
  return true;
}

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
  webhookRawDir?: string;
  webhookProcessedDir?: string;
  webhookFailedDir?: string;
  provider?: string;
  notifier?: Notifier;
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

import type { SpeakerTurn } from "./parser.js";

const EMAIL_RE = /^[^@]+@[^@]+\.[^@]+$/;

export function resolveSpeakerNames(turns: SpeakerTurn[], participants: Participant[]): SpeakerTurn[] {
  const emailToName = new Map<string, string>();
  for (const p of participants) {
    if (p.email && p.name) {
      emailToName.set(p.email.toLowerCase(), p.name);
    }
  }
  if (emailToName.size === 0) return turns;
  return turns.map((turn) => {
    if (!EMAIL_RE.test(turn.speaker_name)) return turn;
    const friendly = emailToName.get(turn.speaker_name.toLowerCase());
    if (!friendly) return turn;
    return { ...turn, speaker_name: friendly };
  });
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
  const clientRow = topClient ? getClientById(db, topClient.client_id) : null;
  const clientTeam = JSON.parse(clientRow?.client_team ?? "[]") as Participant[];
  const implTeam = JSON.parse(clientRow?.implementation_team ?? "[]") as Participant[];
  const glossary = JSON.parse(clientRow?.glossary ?? "[]") as GlossaryEntry[];
  const clientContext = clientRow ? buildClientContext(
    clientRow.name,
    clientTeam,
    implTeam,
    clientRow.additional_extraction_llm_prompt ?? undefined,
    glossary,
  ) : undefined;
  const resolvedTurns = resolveSpeakerNames(parsed.turns.turns, [...clientTeam, ...implTeam]);
  return { topClient, clientContext, extractFn: () => extractSummary(llm, resolvedTurns, tokenLimit, promptTemplate, clientContext) };
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
  provider: string,
  notifier: Notifier | undefined,
): Promise<EntryResult> {
  const start = Date.now();
  if (!parsed) {
    const reason = "parse failed";
    moveToFailed(rawDir, failedDir, name, reason);
    writeFileSync(join(auditDir, `${Date.now()}-${name.trim()}.json`), JSON.stringify({ filename: name, reason, error_type: extractErrorType(reason), timestamp: new Date().toISOString() }), "utf-8");
    const recorded = recordSystemError(db, { error_type: extractErrorType(reason), message: reason, meeting_filename: name, provider });
    if (recorded && recorded.severity === "critical" && notifier) {
      try { await notifier.sendAlert(db, recorded); } catch (ne) { console.error("[pipeline] notifier.sendAlert failed:", ne); }
    }
    return { status: "failed", reason, elapsed_ms: Date.now() - start };
  }
  try {
    const meetingId = ingestMeeting(db, parsed);
    const meeting: MeetingParsed = { meetingId, turns: parsed, timestamp: parsed.timestamp, title: parsed.title };
    const { topClient, extractFn } = detectAndExtract(db, llm, meeting, tokenLimit, promptTemplate);
    const artifact = await extractFn();
    storeArtifact(db, meetingId, artifact);
    if (topClient?.client_id && artifact.milestones.length > 0) {
      reconcileMilestones(db, topClient.client_id, meetingId, parsed.timestamp, artifact.milestones);
    }
    const client = topClient?.client_id ?? "";
    await indexAndDedup(db, itemTable, session, llm, meetingId, artifact, parsed.timestamp, parsed.title, client);
    await embedAndThread(db, table, session, llm, meetingId, artifact, client, parsed.title, parsed.timestamp, threadSimilarityThreshold);
    moveToProcessed(rawDir, processedDir, name);
    return { status: "ok", client, elapsed_ms: Date.now() - start };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    moveToFailed(rawDir, failedDir, name, reason);
    writeFileSync(join(auditDir, `${Date.now()}-${name.trim()}.json`), JSON.stringify({ filename: name, reason, error_type: extractErrorType(reason), timestamp: new Date().toISOString() }), "utf-8");
    const recorded = recordSystemError(db, { error_type: extractErrorType(reason), message: reason, meeting_filename: name, provider });
    if (recorded && recorded.severity === "critical" && notifier) {
      try { await notifier.sendAlert(db, recorded); } catch (ne) { console.error("[pipeline] notifier.sendAlert failed:", ne); }
    }
    return { status: "failed", reason, elapsed_ms: Date.now() - start };
  }
}

export async function processNewMeetings(config: PipelineConfig): Promise<PipelineResult> {
  const defaultChunkLimit = parseInt(process.env.MTNINSIGHTS_LLM_CHUNK_TOKEN_LIMIT ?? "30000", 10);
  const { rawDir, processedDir, failedDir, auditDir, db, vdb, session, llm, tokenLimit = defaultChunkLimit, extractionPromptPath, onProgress, threadSimilarityThreshold = 0.3, filterFolder, webhookRawDir, webhookProcessedDir, webhookFailedDir, provider = "unknown", notifier } = config;

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  let totalCount = 0;

  if (webhookRawDir && webhookProcessedDir && webhookFailedDir) {
    const webhookResult = await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir,
      webhookFailedDir,
      auditDir,
      db,
      vdb,
      session,
      llm,
      tokenLimit,
      extractionPromptPath,
      onProgress,
      threadSimilarityThreshold,
      provider,
      notifier,
    });
    succeeded += webhookResult.succeeded;
    failed += webhookResult.failed;
    skipped += webhookResult.skipped;
    totalCount += webhookResult.total;
  }

  const promptTemplate = extractionPromptPath && existsSync(extractionPromptPath)
    ? readFileSync(extractionPromptPath, "utf-8")
    : undefined;

  mkdirSync(auditDir, { recursive: true });

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
      const result = await processEntry(parsed, folderName, rawDir, processedDir, failedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate, threadSimilarityThreshold, provider, notifier);

      if (result.status === "ok") {
        onProgress?.({ type: "ok", name: folderName, title: entry.meeting_title, client: result.client, elapsed_ms: result.elapsed_ms });
        succeeded++;
      } else {
        onProgress?.({ type: "failed", name: folderName, title: entry.meeting_title, reason: result.reason, elapsed_ms: result.elapsed_ms });
        failed++;
      }
    }

    const grandTotal = totalCount + total;
    log("pipeline complete total=%d succeeded=%d failed=%d skipped=%d", grandTotal, succeeded, failed, skipped);
    return { total: grandTotal, succeeded, failed, skipped };
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
    const result = await processEntry(parsed, filename, rawDir, processedDir, failedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate, threadSimilarityThreshold, provider, notifier);

    if (result.status === "ok") {
      onProgress?.({ type: "ok", name: filename, title: filename, client: result.client, elapsed_ms: result.elapsed_ms });
      succeeded++;
    } else {
      onProgress?.({ type: "failed", name: filename, title: filename, reason: result.reason, elapsed_ms: result.elapsed_ms });
      failed++;
    }
  }

  const grandTotal = totalCount + total;
  log("pipeline complete total=%d succeeded=%d failed=%d skipped=%d", grandTotal, succeeded, failed, skipped);
  return { total: grandTotal, succeeded, failed, skipped };
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
  provider?: string;
  notifier?: Notifier;
}

export async function processWebhookMeetings(config: WebhookPipelineConfig): Promise<PipelineResult> {
  const defaultChunkLimit = parseInt(process.env.MTNINSIGHTS_LLM_CHUNK_TOKEN_LIMIT ?? "30000", 10);
  const { webhookRawDir, webhookProcessedDir, webhookFailedDir, auditDir, db, vdb, session, llm, tokenLimit = defaultChunkLimit, extractionPromptPath, onProgress, threadSimilarityThreshold = 0.3, provider = "unknown", notifier } = config;

  const promptTemplate = extractionPromptPath && existsSync(extractionPromptPath)
    ? readFileSync(extractionPromptPath, "utf-8")
    : undefined;

  mkdirSync(auditDir, { recursive: true });
  mkdirSync(webhookProcessedDir, { recursive: true });
  mkdirSync(webhookFailedDir, { recursive: true });

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
    const filePath = join(webhookRawDir, filename);
    if (!existsSync(filePath)) {
      log("skipping %s — file no longer exists (concurrent run)", filename);
      skipped++;
      continue;
    }
    const json = readFileSync(filePath, "utf-8");
    const parsed = parseWebhookPayload(json, filename);

    if (!parsed) {
      if (handleRecordingReady(db, json)) {
        moveToProcessed(webhookRawDir, webhookProcessedDir, filename);
        skipped++;
        continue;
      }
      if (handleWebhookNote(db, json)) {
        moveToProcessed(webhookRawDir, webhookProcessedDir, filename);
        skipped++;
        continue;
      }
      if (isKnownNonTranscriptEvent(json)) {
        moveToProcessed(webhookRawDir, webhookProcessedDir, filename);
        skipped++;
        continue;
      }
      onProgress?.({ type: "processing", name: filename, title: filename, index, total });
      const result = await processEntry(null, filename, webhookRawDir, webhookProcessedDir, webhookFailedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate, threadSimilarityThreshold, provider, notifier);
      onProgress?.({ type: "failed", name: filename, title: filename, reason: result.status === "failed" ? result.reason : "parse failed", elapsed_ms: result.status === "failed" ? result.elapsed_ms : 0 });
      failed++;
      continue;
    }

    if (parsed.externalId && existingIds.has(parsed.externalId)) {
      moveToProcessed(webhookRawDir, webhookProcessedDir, filename);
      onProgress?.({ type: "skipped", name: filename, title: parsed.title, index, total });
      skipped++;
      continue;
    }

    onProgress?.({ type: "processing", name: filename, title: parsed.title, index, total });
    const result = await processEntry(parsed, filename, webhookRawDir, webhookProcessedDir, webhookFailedDir, auditDir, db, table, itemTable, session, llm, tokenLimit, promptTemplate, threadSimilarityThreshold, provider, notifier);

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
