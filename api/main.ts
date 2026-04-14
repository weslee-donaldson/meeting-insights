import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { createApp } from "./server.js";
import type { SearchDeps, AuthConfig } from "./server.js";

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  process.loadEnvFile?.(".env.local");

  const { setLogLevel, setLogDir } = await import("../core/logger.js");
  const envLevel = process.env.MTNINSIGHTS_LOG_LEVEL as "error" | "warn" | "info" | "debug" | undefined;
  if (envLevel) setLogLevel(envLevel);
  setLogDir(resolve(process.env.MTNINSIGHTS_APP_ROOT ?? process.cwd(), "logs/api"));

  const { createDb, migrate } = await import("../core/db.js");
  const { createLlmAdapter } = await import("../core/llm-adapter.js");
  const { connectVectorDb } = await import("../core/vector-db.js");
  const { loadModel } = await import("../core/embedder.js");

  const APP_ROOT = resolve(process.env.MTNINSIGHTS_APP_ROOT ?? process.cwd());
  const DB_PATH = process.env.MTNINSIGHTS_DB_PATH
    ? resolve(process.env.MTNINSIGHTS_DB_PATH)
    : join(APP_ROOT, "db/mtninsights.db");
  const VECTOR_PATH = process.env.MTNINSIGHTS_VECTOR_PATH
    ? resolve(process.env.MTNINSIGHTS_VECTOR_PATH)
    : join(APP_ROOT, "db/lancedb");
  const PORT = Number(process.env.PORT ?? 3000);

  const { ensureFtsCurrent } = await import("../core/fts.js");
  const db = createDb(DB_PATH);
  migrate(db);
  ensureFtsCurrent(db);
  const provider = (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as "anthropic" | "local" | "openai" | "stub" | "claudecli" | "local-claudeapi";
  const llmConfig =
    provider === "local"
      ? { type: "local" as const, baseUrl: process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434", model: process.env.MTNINSIGHTS_LOCAL_MODEL ?? "llama3.1:8b" }
      : provider === "openai"
        ? { type: "openai" as const, apiKey: process.env.OPENAI_API_KEY ?? "", model: process.env.OPENAI_MODEL }
        : provider === "claudecli"
          ? { type: "claudecli" as const }
          : provider === "local-claudeapi"
          ? { type: "local-claudeapi" as const, baseUrl: process.env.MTNINSIGHTS_CLAUDEAPI_URL ?? "http://localhost:8100" }
          : provider === "stub"
          ? { type: "stub" as const }
          : { type: "anthropic" as const, apiKey: process.env.ANTHROPIC_API_KEY ?? "", model: process.env.ANTHROPIC_MODEL };
  const llm = createLlmAdapter(llmConfig);

  let searchDeps: SearchDeps | undefined;
  try {
    const vdb = await connectVectorDb(VECTOR_PATH);
    const session = await loadModel(
      join(APP_ROOT, "models/all-MiniLM-L6-v2.onnx"),
      join(APP_ROOT, "models/tokenizer.json"),
    );
    searchDeps = { vdb, session };
    console.log("[api] Search deps loaded");
  } catch (err) {
    console.warn("[api] Search unavailable:", (err as Error).message);
  }

  let authConfig: AuthConfig | undefined;
  if (process.env.MTNINSIGHTS_AUTH_ENABLED === "1") {
    const { loadOrCreateKeys } = await import("../core/auth/jwt.js");
    const keysDir = join(APP_ROOT, ".keys");
    const keys = await loadOrCreateKeys(keysDir);
    authConfig = { publicKey: keys.publicKey, privateKey: keys.privateKey, enabled: true };
    console.log("[api] Auth enabled");
  }

  const { resolveDataPaths } = await import("../core/paths.js");
  const dataDir = process.env.MTNINSIGHTS_DATA_DIR
    ? resolve(process.env.MTNINSIGHTS_DATA_DIR)
    : join(APP_ROOT, "data");
  const ASSETS_DIR = resolveDataPaths(dataDir).assets;
  const app = createApp(db, DB_PATH, llm, searchDeps, ASSETS_DIR, authConfig);
  serve({ fetch: app.fetch, port: PORT });
  console.log(`[api] Listening on http://localhost:${PORT}`);
}
