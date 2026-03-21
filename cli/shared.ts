process.loadEnvFile?.(".env.local");

export type ProviderType = "anthropic" | "local" | "stub" | "claudecli" | "local-claudeapi";

export interface CliConfig {
  dbPath: string;
  vectorPath: string;
  provider: ProviderType;
  apiKey: string | undefined;
  localBaseUrl: string;
  localModel: string;
  claudeApiUrl: string;
}

export function loadCliConfig(): CliConfig {
  return {
    dbPath: process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db",
    vectorPath: process.env.MTNINSIGHTS_VECTOR_PATH ?? "db/lancedb",
    provider: (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as ProviderType,
    apiKey: process.env.ANTHROPIC_API_KEY,
    localBaseUrl: process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434",
    localModel: process.env.MTNINSIGHTS_LOCAL_MODEL ?? "llama3.1:8b",
    claudeApiUrl: process.env.MTNINSIGHTS_CLAUDEAPI_URL ?? "http://localhost:8100",
  };
}

export interface SearchResult {
  meeting_id: string;
  score: number;
  client: string;
  meeting_type: string;
  date: string;
}

export interface Decision {
  text: string;
  decided_by: string;
}

export function parseDecisions(json: string): Decision[] {
  const raw = JSON.parse(json) as unknown[];
  return raw.map((d) => (typeof d === "string" ? { text: d, decided_by: "" } : d as Decision));
}
