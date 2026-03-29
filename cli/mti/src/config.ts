import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const DEFAULT_CONFIG_PATH = join(homedir(), ".mtirc");

const DEFAULTS = {
  baseUrl: "http://localhost:3000",
  token: null as string | null,
};

export function loadConfig(
  configPath: string = DEFAULT_CONFIG_PATH
): { baseUrl: string; token: string | null } {
  if (!existsSync(configPath)) {
    return { ...DEFAULTS };
  }
  const raw = JSON.parse(readFileSync(configPath, "utf-8"));
  return {
    baseUrl: raw.baseUrl ?? DEFAULTS.baseUrl,
    token: raw.token ?? DEFAULTS.token,
  };
}

export function saveConfig(
  partial: Partial<{ baseUrl: string; token: string | null }>,
  configPath: string = DEFAULT_CONFIG_PATH
): void {
  let existing: Record<string, unknown> = {};
  if (existsSync(configPath)) {
    existing = JSON.parse(readFileSync(configPath, "utf-8"));
  } else {
    existing = { ...DEFAULTS };
  }
  const merged = { ...existing, ...partial };
  writeFileSync(configPath, JSON.stringify(merged, null, 2));
}
