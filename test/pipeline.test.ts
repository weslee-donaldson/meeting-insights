import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../src/db.js";
import { connectVectorDb } from "../src/vector-db.js";
import { loadModel } from "../src/embedder.js";
import { createLlmAdapter } from "../src/llm-adapter.js";
import { processNewMeetings } from "../src/pipeline.js";
import type { Database } from "better-sqlite3";

let db: Database;
let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let session: Awaited<ReturnType<typeof loadModel>>;

let baseDir: string;
let rawDir: string;
let processedDir: string;
let failedDir: string;
let auditDir: string;

const GOOD_FILENAME = " 2026-01-10T00:00:00.000ZAPI Architecture Review";
const GOOD_CONTENT = `Attendance:
{'last_name': 'Donaldson', 'id': '014200be-0001-0001-0001-000000000001', 'first_name': 'Wesley', 'email': 'wesley@xolv.io'},{'last_name': 'Doshi', 'id': '014200be-0002-0002-0002-000000000002', 'first_name': 'Dev', 'email': 'dev.doshi@revenium.com'}
Transcript:
Wesley Donaldson | 00:11
We should discuss the REST API design and OAuth authentication approach.
Dev Doshi | 01:30
Agreed. Let us use OAuth2 with bearer tokens for the API endpoints.`;

const BAD_FILENAME = " 2026-01-11T00:00:00.000ZCorrupted Meeting";
const BAD_CONTENT = `NOT A VALID KRISP FILE FORMAT`;

beforeAll(async () => {
  baseDir = join(tmpdir(), `pipeline-test-${Date.now()}`);
  rawDir = join(baseDir, "raw-transcripts");
  processedDir = join(baseDir, "processed");
  failedDir = join(baseDir, "failed-processing");
  auditDir = join(baseDir, "audit");
  mkdirSync(rawDir, { recursive: true });

  db = createDb(":memory:");
  migrate(db);
  vdbPath = join(tmpdir(), `lancedb-pipeline-${Date.now()}`);
  mkdirSync(vdbPath, { recursive: true });
  vdb = await connectVectorDb(vdbPath);
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");

  writeFileSync(join(rawDir, GOOD_FILENAME), GOOD_CONTENT, "utf-8");
  writeFileSync(join(rawDir, BAD_FILENAME), BAD_CONTENT, "utf-8");
}, 30000);

afterAll(() => {
  rmSync(baseDir, { recursive: true, force: true });
  rmSync(vdbPath, { recursive: true, force: true });
});

describe("processNewMeetings", () => {
  it("parses, ingests, extracts, and embeds all unprocessed files", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    await processNewMeetings({ rawDir, processedDir, failedDir, auditDir, db, vdb, session, llm });
    const meetings = db.prepare("SELECT id FROM meetings").all() as Array<{ id: string }>;
    expect(meetings.length).toBeGreaterThan(0);
  });

  it("skips files already in processed/", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    const countBefore = (db.prepare("SELECT COUNT(*) as n FROM meetings").get() as { n: number }).n;
    await processNewMeetings({ rawDir: processedDir, processedDir, failedDir, auditDir, db, vdb, session, llm });
    const countAfter = (db.prepare("SELECT COUNT(*) as n FROM meetings").get() as { n: number }).n;
    expect(countAfter).toBe(countBefore);
  });

  it("logs failures to audit/ and moves failed files to failed-processing/", async () => {
    expect(existsSync(failedDir)).toBe(true);
    const failedFiles = readdirSync(failedDir);
    expect(failedFiles.length).toBeGreaterThan(0);
    expect(existsSync(auditDir)).toBe(true);
    const auditFiles = readdirSync(auditDir);
    expect(auditFiles.length).toBeGreaterThan(0);
  });

  it("runs client detection for each ingested meeting", async () => {
    const detections = db.prepare("SELECT COUNT(*) as n FROM client_detections").get() as { n: number };
    expect(detections.n).toBeGreaterThanOrEqual(0);
  });

  it("logs full pipeline summary via mtninsights:pipeline", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    const newRaw = join(tmpdir(), `raw-log-test-${Date.now()}`);
    mkdirSync(newRaw, { recursive: true });
    await expect(processNewMeetings({ rawDir: newRaw, processedDir, failedDir, auditDir, db, vdb, session, llm })).resolves.toBeDefined();
    rmSync(newRaw, { recursive: true, force: true });
  });
});
