import { mkdirSync } from "node:fs";
import { join } from "node:path";

export const DATA_SUBDIRS = [
  "assets",
  "audit",
  "eval",
  "external-transcripts",
  "manual/raw-transcripts",
  "manual/processed",
  "manual/failed",
  "webhook/raw-transcripts",
  "webhook/processed",
  "webhook/failed",
] as const;

export interface DataPaths {
  root: string;
  assets: string;
  audit: string;
  eval: string;
  externalTranscripts: string;
  manual: {
    rawTranscripts: string;
    processed: string;
    failed: string;
  };
  webhook: {
    rawTranscripts: string;
    processed: string;
    failed: string;
  };
}

export function resolveDataPaths(dataDir: string | undefined): DataPaths {
  const root = dataDir ?? "data";
  return {
    root,
    assets: join(root, "assets"),
    audit: join(root, "audit"),
    eval: join(root, "eval"),
    externalTranscripts: join(root, "external-transcripts"),
    manual: {
      rawTranscripts: join(root, "manual", "raw-transcripts"),
      processed: join(root, "manual", "processed"),
      failed: join(root, "manual", "failed"),
    },
    webhook: {
      rawTranscripts: join(root, "webhook", "raw-transcripts"),
      processed: join(root, "webhook", "processed"),
      failed: join(root, "webhook", "failed"),
    },
  };
}

export function ensureDataDirs(dataDir: string): void {
  for (const sub of DATA_SUBDIRS) {
    mkdirSync(join(dataDir, sub), { recursive: true });
  }
}

export function getDataPaths(): DataPaths {
  return resolveDataPaths(process.env.MTNINSIGHTS_DATA_DIR);
}
