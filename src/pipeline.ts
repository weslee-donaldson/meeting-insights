import { mkdirSync, readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createLogger } from "./logger.js";
import { parseKrispFile } from "./parser.js";
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

export async function processNewMeetings(config: PipelineConfig): Promise<PipelineResult> {
  const { rawDir, processedDir, failedDir, auditDir, db, vdb, session, llm, tokenLimit = 2000, extractionPromptPath } = config;

  const promptTemplate = extractionPromptPath && existsSync(extractionPromptPath)
    ? readFileSync(extractionPromptPath, "utf-8")
    : undefined;

  mkdirSync(auditDir, { recursive: true });

  const files = existsSync(rawDir) ? readdirSync(rawDir) : [];
  const alreadyProcessed = existsSync(processedDir) ? new Set(readdirSync(processedDir)) : new Set<string>();

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  const table = await createMeetingTable(vdb);

  for (const filename of files) {
    if (alreadyProcessed.has(filename)) {
      skipped++;
      continue;
    }

    const filePath = join(rawDir, filename);
    const parsed = parseKrispFile(filePath, filename);

    if (!parsed) {
      const reason = "parse failed";
      moveToFailed(rawDir, failedDir, filename, reason);
      const auditEntry = JSON.stringify({ filename, reason, timestamp: new Date().toISOString() });
      writeFileSync(join(auditDir, `${Date.now()}-${filename.trim()}.json`), auditEntry, "utf-8");
      failed++;
      continue;
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

      moveToProcessed(rawDir, processedDir, filename);
      succeeded++;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      moveToFailed(rawDir, failedDir, filename, reason);
      const auditEntry = JSON.stringify({ filename, reason, timestamp: new Date().toISOString() });
      writeFileSync(join(auditDir, `${Date.now()}-${filename.trim()}.json`), auditEntry, "utf-8");
      failed++;
    }
  }

  log("pipeline complete total=%d succeeded=%d failed=%d skipped=%d", files.length, succeeded, failed, skipped);
  return { total: files.length, succeeded, failed, skipped };
}
