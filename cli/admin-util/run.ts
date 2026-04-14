import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createDb, migrate } from "../../core/db.js";
import { connectVectorDb } from "../../core/search/vector-db.js";
import { loadModel } from "../../core/embedder.js";
import { createLlmAdapter } from "../../core/llm/adapter.js";
import { seedClients } from "../../core/client-registry.js";
import { processNewMeetings, type PipelineEvent } from "../../core/pipeline.js";
import { createNotifierFromEnv } from "../../core/notifier.js";
import { loadCliConfig } from "./shared.js";
import { resolveDataPaths } from "../../core/paths.js";

const dataPaths = resolveDataPaths(process.env.MTNINSIGHTS_DATA_DIR);

const filterFolder = process.argv[2];

const { dbPath: DB_PATH, vectorPath: VECTOR_PATH, provider: PROVIDER, apiKey: API_KEY, localBaseUrl: LOCAL_BASE_URL, localModel: LOCAL_MODEL, claudeApiUrl: CLAUDEAPI_URL } = loadCliConfig();

if (PROVIDER === "anthropic" && (!API_KEY || API_KEY.startsWith("sk-ant-..."))) {
  console.error("Error: ANTHROPIC_API_KEY not set. Add it to .env.local");
  process.exit(1);
}

mkdirSync("db", { recursive: true });

const db = createDb(DB_PATH);
migrate(db);
seedClients(db, process.env.MTNINSIGHTS_CLIENTS_PATH ?? "config/clients.json");

const vdb = await connectVectorDb(VECTOR_PATH);

console.log("Loading embedding model...");
const session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
console.log("Model loaded.\n");

const llm = PROVIDER === "local"
  ? createLlmAdapter({ type: "local", baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL })
  : PROVIDER === "claudecli"
    ? createLlmAdapter({ type: "claudecli" })
    : PROVIDER === "local-claudeapi"
    ? createLlmAdapter({ type: "local-claudeapi", baseUrl: CLAUDEAPI_URL })
    : PROVIDER === "stub"
    ? createLlmAdapter({ type: "stub" })
    : createLlmAdapter({ type: "anthropic", apiKey: API_KEY! });

if (filterFolder) {
  const rawDir = dataPaths.manual.rawTranscripts;
  const manifestPath = join(rawDir, "manifest.json");
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as Array<{ meeting_id: string; meeting_files: string[] }>;
    const entry = manifest.find((e) => e.meeting_files[0].split("/")[0] === filterFolder);
    if (!entry) {
      console.error(`Folder "${filterFolder}" not found in manifest.json`);
      process.exit(1);
    }
    const meetingId = entry.meeting_id;
    const existing = db.prepare("SELECT id FROM meetings WHERE id = ?").get(meetingId) as { id: string } | undefined;
    if (existing) {
      console.log(`Purging existing meeting ${meetingId}...`);
      db.prepare("DELETE FROM insight_meetings WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM thread_meetings WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM milestone_mentions WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM milestone_action_items WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM item_mentions WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM action_item_completions WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM meeting_clusters WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM client_detections WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM artifact_fts WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM artifacts WHERE meeting_id = ?").run(meetingId);
      db.prepare("DELETE FROM meetings WHERE id = ?").run(meetingId);
      const filter = `meeting_id = '${meetingId.replace(/'/g, "''")}'`;
      const names = await vdb.tableNames();
      for (const name of ["meeting_vectors", "feature_vectors", "item_vectors"].filter((n) => names.includes(n))) {
        const table = await vdb.openTable(name);
        await table.delete(filter);
      }
      console.log(`Purged meeting ${meetingId}`);
    }
    const processedDir = dataPaths.manual.processed;
    const processedFolder = join(processedDir, filterFolder);
    if (existsSync(processedFolder)) {
      const { rmSync } = await import("node:fs");
      rmSync(processedFolder, { recursive: true });
      console.log(`Removed old processed folder: ${filterFolder}`);
    }
  }
  console.log(`Processing only: ${filterFolder}\n`);
}

const runStart = Date.now();
const runId = new Date().toISOString().replace(/:/g, "-");
const events: PipelineEvent[] = [];

const notifier = createNotifierFromEnv();
const result = await processNewMeetings({
  rawDir: dataPaths.manual.rawTranscripts,
  processedDir: dataPaths.manual.processed,
  failedDir: dataPaths.manual.failed,
  auditDir: dataPaths.audit,
  extractionPromptPath: "config/prompts/extraction.md",
  webhookRawDir: dataPaths.webhook.rawTranscripts,
  webhookProcessedDir: dataPaths.webhook.processed,
  webhookFailedDir: dataPaths.webhook.failed,
  db,
  vdb,
  session,
  llm,
  filterFolder,
  provider: PROVIDER,
  notifier,
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
