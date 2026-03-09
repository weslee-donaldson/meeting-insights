import debug from "debug";
import { mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

export function createLogger(namespace: string) {
  return debug(`mtninsights:${namespace}`);
}

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 } as const;
export type LogLevel = keyof typeof LEVELS;

let currentLevel: LogLevel = (process.env.MTNINSIGHTS_LOG_LEVEL as LogLevel) ?? "info";
if (!(currentLevel in LEVELS)) currentLevel = "info";

let logDir: string | null = null;

export function getLogLevel(): LogLevel {
  return currentLevel;
}

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function setLogDir(dir: string): void {
  logDir = dir;
  mkdirSync(logDir, { recursive: true });
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] <= LEVELS[currentLevel];
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + `... (${text.length} chars total)`;
}

function dateTag(): string {
  return new Date().toISOString().slice(0, 10);
}

function writeToFile(filename: string, entry: Record<string, unknown>): void {
  if (!logDir) return;
  try {
    appendFileSync(join(logDir, filename), JSON.stringify(entry) + "\n");
  } catch {
    // logging must never crash the app
  }
}

export interface LlmLogEntry {
  timestamp: string;
  level: LogLevel;
  capability: string;
  provider?: string;
  model?: string;
  latency_ms?: number;
  tokens?: number;
  prompt?: string;
  raw_response?: string;
  parsed_result?: Record<string, unknown>;
  error?: string;
}

const llmLog = createLogger("llm:trace");

export function logLlmCall(entry: Omit<LlmLogEntry, "timestamp" | "level">, level: LogLevel = "debug"): void {
  if (!shouldLog(level)) return;
  const full: LlmLogEntry = { timestamp: formatTimestamp(), level, ...entry };
  if (full.prompt && currentLevel !== "debug") {
    full.prompt = truncate(full.prompt, 500);
  }
  if (full.raw_response && currentLevel !== "debug") {
    full.raw_response = truncate(full.raw_response, 500);
  }
  llmLog("%O", full);
  writeToFile(`llm-${dateTag()}.jsonl`, full);
}

const apiLog = createLogger("api");

export function logApiCall(method: string, path: string, status: number, latency_ms: number, error?: string): void {
  if (!shouldLog("info")) return;
  const entry = { timestamp: formatTimestamp(), method, path, status, latency_ms, ...(error ? { error } : {}) };
  if (error) {
    apiLog("%s %s → %d (%dms) error=%s", method, path, status, latency_ms, error);
  } else {
    apiLog("%s %s → %d (%dms)", method, path, status, latency_ms);
  }
  writeToFile(`api-${dateTag()}.jsonl`, entry);
}
