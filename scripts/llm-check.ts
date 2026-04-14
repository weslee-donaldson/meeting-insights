import { createLlmAdapter } from "../core/llm/adapter.js";

process.loadEnvFile?.(".env.local");

const PROVIDER = (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as "anthropic" | "openai" | "local" | "stub";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const LOCAL_BASE_URL = process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
const LOCAL_MODEL = process.env.MTNINSIGHTS_LOCAL_MODEL ?? "llama3.1:8b";
const OPENAI_MODEL = process.env.OPENAI_MODEL;

function buildConfig() {
  if (PROVIDER === "stub") return { type: "stub" as const };
  if (PROVIDER === "local") return { type: "local" as const, baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL };
  if (PROVIDER === "openai") {
    if (!OPENAI_KEY) { console.error("Error: OPENAI_API_KEY not set in .env.local"); process.exit(1); }
    return { type: "openai" as const, apiKey: OPENAI_KEY, model: OPENAI_MODEL };
  }
  if (!ANTHROPIC_KEY) { console.error("Error: ANTHROPIC_API_KEY not set in .env.local"); process.exit(1); }
  return { type: "anthropic" as const, apiKey: ANTHROPIC_KEY };
}

const config = buildConfig();
const adapter = createLlmAdapter(config);

console.log(`Provider: ${PROVIDER}`);
console.log("Sending test request...\n");

const start = Date.now();
try {
  const result = await adapter.complete(
    "extract_artifact",
    'Return exactly this JSON object and nothing else: { "status": "ok", "message": "LLM connection healthy" }',
  );
  const latency = Date.now() - start;
  console.log("Success!");
  console.log(`Latency: ${latency}ms`);
  console.log("Response:", JSON.stringify(result, null, 2));
} catch (err) {
  const latency = Date.now() - start;
  console.error(`Failed after ${latency}ms`);
  console.error("Error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
}
