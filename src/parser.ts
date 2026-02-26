import { readdirSync } from "node:fs";
import { createLogger } from "./logger.js";

const logFilename = createLogger("parser:filename");

const logDir = createLogger("parser:dir");

const TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;
const DUPLICATE_SUFFIX_RE = /\s*\(\d+\)$/;

export function parseFilename(filename: string): { timestamp: string; title: string } {
  const stripped = filename.trimStart();
  const match = stripped.match(TIMESTAMP_RE);
  if (!match) throw new Error(`Cannot parse filename: ${filename}`);
  const timestamp = match[1];
  const title = stripped.slice(timestamp.length).replace(DUPLICATE_SUFFIX_RE, "").trim();
  logFilename("parsed timestamp=%s title=%s", timestamp, title);
  return { timestamp, title };
}

export function listTranscriptFiles(dir: string): string[] {
  const files = readdirSync(dir).sort();
  logDir("found %d files in %s", files.length, dir);
  return files;
}
