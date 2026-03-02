import { mkdirSync, renameSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createLogger } from "./logger.js";
import { parseKrispFile } from "./parser.js";

const logFile = createLogger("ingest:file");
const logDedup = createLogger("ingest:dedup");
const logPipeline = createLogger("pipeline");

export function moveToProcessed(rawDir: string, processedDir: string, filename: string): void {
  mkdirSync(processedDir, { recursive: true });
  renameSync(join(rawDir, filename), join(processedDir, filename));
  logFile("moved to processed: %s", filename);
}

export function moveToFailed(rawDir: string, failedDir: string, filename: string, reason: string): void {
  mkdirSync(failedDir, { recursive: true });
  renameSync(join(rawDir, filename), join(failedDir, filename));
  logFile("moved to failed: %s reason=%s", filename, reason);
}

export interface ProcessResult {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

export function processDirectory(rawDir: string, processedDir: string, failedDir: string): ProcessResult {
  const files = readdirSync(rawDir);
  const alreadyProcessed = existsSync(processedDir) ? new Set(readdirSync(processedDir)) : new Set<string>();

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const filename of files) {
    if (alreadyProcessed.has(filename)) {
      logDedup("skipping duplicate: %s", filename);
      skipped++;
      continue;
    }
    const filePath = join(rawDir, filename);
    const parsed = parseKrispFile(filePath, filename);
    if (parsed) {
      moveToProcessed(rawDir, processedDir, filename);
      succeeded++;
    } else {
      moveToFailed(rawDir, failedDir, filename, "parse failed");
      failed++;
    }
  }

  logPipeline("total=%d succeeded=%d failed=%d skipped=%d", files.length, succeeded, failed, skipped);
  return { total: files.length, succeeded, failed, skipped };
}
