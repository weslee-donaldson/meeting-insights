import { mkdirSync } from "node:fs";
import { createDb, migrate } from "../src/db.js";
import { connectVectorDb, createMeetingTable, createFeatureTable } from "../src/vector-db.js";
import { seedClients, getAllClients } from "../src/client-registry.js";

process.loadEnvFile?.(".env.local");

const DB_PATH      = process.env.MTNINSIGHTS_DB_PATH      ?? "db/mtninsights.db";
const VECTOR_PATH  = process.env.MTNINSIGHTS_VECTOR_PATH  ?? "db/lancedb";
const PROVIDER     = process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic";
const LOCAL_BASE_URL = process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
const LOCAL_MODEL  = process.env.MTNINSIGHTS_LOCAL_MODEL  ?? "llama3.1:8b";

// ── Ollama validation (only when provider=local) ──────────────────────────────

if (PROVIDER === "local") {
  // Burst 197: validate Ollama server is reachable
  let tags: { models: Array<{ name: string }> } | null = null;
  try {
    const res = await fetch(`${LOCAL_BASE_URL}/api/tags`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tags = await res.json() as { models: Array<{ name: string }> };
    console.log(`✓ Ollama server reachable at ${LOCAL_BASE_URL}`);
  } catch (err) {
    console.error(`✗ Cannot reach Ollama at ${LOCAL_BASE_URL}: ${(err as Error).message}`);
    console.error(`  To install Ollama: https://ollama.com/download`);
    console.error(`  To start the server: ollama serve`);
    process.exit(1);
  }

  // Burst 198: verify model exists; auto-pull if missing
  const modelNames = (tags?.models ?? []).map(m => m.name);
  const modelPresent = modelNames.some(n => n === LOCAL_MODEL || n.startsWith(LOCAL_MODEL + ":"));
  if (!modelPresent) {
    console.log(`  Model "${LOCAL_MODEL}" not found locally. Pulling…`);
    try {
      const res = await fetch(`${LOCAL_BASE_URL}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: LOCAL_MODEL, stream: false }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log(`✓ Model "${LOCAL_MODEL}" pulled successfully`);
    } catch (err) {
      console.error(`✗ Failed to pull model "${LOCAL_MODEL}": ${(err as Error).message}`);
      console.error(`  Try manually: ollama pull ${LOCAL_MODEL}`);
      process.exit(1);
    }
  } else {
    console.log(`✓ Model "${LOCAL_MODEL}" available`);
  }
}

mkdirSync("db", { recursive: true });

const db = createDb(DB_PATH);
migrate(db);
seedClients(db, "data/clients/clients.json");

const vdb = await connectVectorDb(VECTOR_PATH);
await createMeetingTable(vdb);
await createFeatureTable(vdb);

const clientCount = getAllClients(db).length;
const meetingCount = (db.prepare("SELECT COUNT(*) as n FROM meetings").get() as { n: number }).n;

console.log(`✓ DB initialized at ${DB_PATH}`);
console.log(`✓ ${clientCount} clients seeded`);
console.log(`✓ ${meetingCount} meetings in DB`);
console.log(`✓ LanceDB ready at ${VECTOR_PATH}`);
