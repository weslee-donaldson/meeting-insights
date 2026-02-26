import { readdirSync } from "node:fs";
import { createLogger } from "./logger.js";

const logDir = createLogger("parser:dir");

export function listTranscriptFiles(dir: string): string[] {
  const files = readdirSync(dir).sort();
  logDir("found %d files in %s", files.length, dir);
  return files;
}
