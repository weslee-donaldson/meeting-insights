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
  let fileConfig: { baseUrl: string; token: string | null };
  if (!existsSync(configPath)) {
    fileConfig = { ...DEFAULTS };
  } else {
    const raw = JSON.parse(readFileSync(configPath, "utf-8"));
    fileConfig = {
      baseUrl: raw.baseUrl ?? DEFAULTS.baseUrl,
      token: raw.token ?? DEFAULTS.token,
    };
  }
  const envBaseUrl = process.env.MTI_BASE_URL;
  const envToken = process.env.MTI_TOKEN;
  return {
    baseUrl: envBaseUrl ? envBaseUrl : fileConfig.baseUrl,
    token: envToken ? envToken : fileConfig.token,
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
