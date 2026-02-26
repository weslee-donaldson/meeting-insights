import { mkdirSync } from "node:fs";
import { createDb, migrate } from "../src/db.js";
import { connectVectorDb } from "../src/vector-db.js";
import { loadModel } from "../src/embedder.js";
import { createLlmAdapter } from "../src/llm-adapter.js";
import { seedClients } from "../src/client-registry.js";
import { processNewMeetings } from "../src/pipeline.js";

process.loadEnvFile?.(".env.local");

const DB_PATH = process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db";
const VECTOR_PATH = process.env.MTNINSIGHTS_VECTOR_PATH ?? "db/lancedb";
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY || API_KEY.startsWith("sk-ant-...")) {
  console.error("Error: ANTHROPIC_API_KEY not set. Add it to .env.local");
  process.exit(1);
}

mkdirSync("db", { recursive: true });

const db = createDb(DB_PATH);
migrate(db);
seedClients(db, "data/clients/clients.json");

const vdb = await connectVectorDb(VECTOR_PATH);

console.log("Loading embedding model...");
const session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
console.log("Model loaded.");

const llm = createLlmAdapter({ type: "anthropic", apiKey: API_KEY });

const result = await processNewMeetings({
  rawDir: "data/raw-transcripts",
  processedDir: "data/processed",
  failedDir: "data/failed-processing",
  auditDir: "data/audit",
  extractionPromptPath: "config/prompts/extraction.md",
  db,
  vdb,
  session,
  llm,
});

console.log(`✓ total=${result.total} succeeded=${result.succeeded} failed=${result.failed} skipped=${result.skipped}`);
