import { mkdirSync, writeFileSync } from "node:fs";
import { createDb, migrate } from "../src/db.js";
import { connectVectorDb } from "../src/vector-db.js";
import { loadModel } from "../src/embedder.js";
import { createLlmAdapter } from "../src/llm-adapter.js";
import { seedClients } from "../src/client-registry.js";
import { processNewMeetings, type PipelineEvent } from "../src/pipeline.js";

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
console.log("Model loaded.\n");

const llm = createLlmAdapter({ type: "anthropic", apiKey: API_KEY });

const runStart = Date.now();
const runId = new Date().toISOString().replace(/:/g, "-");
const events: PipelineEvent[] = [];

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
  onProgress: (event) => {
    events.push(event);
    if (event.type === "processing") {
      process.stdout.write(`[${event.index}/${event.total}] ${event.title} ... `);
    } else if (event.type === "ok") {
      const client = event.client ? ` [${event.client}]` : "";
      console.log(`✓${client} (${event.elapsed_ms}ms)`);
    } else if (event.type === "failed") {
      console.log(`✗ FAILED`);
      console.log(`         ${event.reason}`);
    } else if (event.type === "skipped") {
      console.log(`[${event.index}/${event.total}] ${event.title} — skipped`);
    }
  },
});

const elapsed = Date.now() - runStart;
console.log(`\n✓ total=${result.total} succeeded=${result.succeeded} failed=${result.failed} skipped=${result.skipped} (${elapsed}ms)`);

mkdirSync("logs", { recursive: true });
writeFileSync(
  `logs/run-${runId}.json`,
  JSON.stringify({
    run_id: runId,
    started_at: new Date(runStart).toISOString(),
    completed_at: new Date().toISOString(),
    elapsed_ms: elapsed,
    summary: result,
    events,
  }, null, 2),
  "utf-8",
);
console.log(`Log: logs/run-${runId}.json`);
