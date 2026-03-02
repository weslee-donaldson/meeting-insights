import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../src/db.js";
import { connectVectorDb } from "../src/vector-db.js";
import { loadModel } from "../src/embedder.js";
import { createLlmAdapter } from "../src/llm-adapter.js";
import { processNewMeetings, type PipelineEvent } from "../src/pipeline.js";
import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../src/llm-adapter.js";

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

describe("processNewMeetings threads client refinement_prompt into extraction", () => {
  let rDb: Database;
  let rVdb: Awaited<ReturnType<typeof connectVectorDb>>;
  let rVdbPath: string;
  let rBaseDir: string;
  let capturedContent = "";

  const FILENAME = " 2026-03-01T00:00:00.000ZRefinement Test Meeting";
  const CONTENT = `Attendance:
{'last_name': 'Smith', 'id': '014200be-9999-9999-9999-000000000001', 'first_name': 'Alice', 'email': 'alice@testclientco.com'}
Transcript:
Alice Smith | 00:11
Let us discuss the project roadmap and upcoming priorities.`;

  beforeAll(async () => {
    rBaseDir = join(tmpdir(), `pipeline-refinement-${Date.now()}`);
    const rawDir = join(rBaseDir, "raw");
    const processedDir = join(rBaseDir, "processed");
    const failedDir = join(rBaseDir, "failed");
    const auditDir = join(rBaseDir, "audit");
    mkdirSync(rawDir, { recursive: true });

    rDb = createDb(":memory:");
    migrate(rDb);
    rDb.prepare(
      "INSERT INTO clients (name, aliases, known_participants, refinement_prompt) VALUES (?, ?, ?, ?)",
    ).run("TestClientCo", '["TestClientCo"]', '["@testclientco.com"]', "Alice is the lead engineer and her action items are high priority.");

    rVdbPath = join(tmpdir(), `lancedb-refinement-${Date.now()}`);
    mkdirSync(rVdbPath, { recursive: true });
    rVdb = await connectVectorDb(rVdbPath);

    const templatePath = join(rBaseDir, "template.md");
    writeFileSync(templatePath, "{{client_context}}## Transcript\n\n{{transcript}}", "utf-8");
    writeFileSync(join(rawDir, FILENAME), CONTENT, "utf-8");

    capturedContent = "";
    const stubLlm = createLlmAdapter({ type: "stub" });
    const recordingLlm: LlmAdapter = {
      complete: async (cap, content) => {
        if (cap === "extract_artifact") capturedContent = content;
        return stubLlm.complete(cap, content);
      },
    };

    await processNewMeetings({
      rawDir, processedDir, failedDir, auditDir,
      db: rDb, vdb: rVdb, session, llm: recordingLlm,
      extractionPromptPath: templatePath,
    });
  }, 30000);

  afterAll(() => {
    rmSync(rBaseDir, { recursive: true, force: true });
    rmSync(rVdbPath, { recursive: true, force: true });
  });

  it("injects client refinement_prompt as ## Client Context into extraction prompt", () => {
    expect(capturedContent).toContain("## Client Context");
    expect(capturedContent).toContain("Alice is the lead engineer");
  });
});

describe("onProgress callback", () => {
  let pDb: Database;
  let pVdbPath: string;
  let pVdb: Awaited<ReturnType<typeof connectVectorDb>>;
  let pBaseDir: string;
  let pRawDir: string;
  let pProcessedDir: string;
  let pFailedDir: string;
  let pAuditDir: string;
  let firstRunEvents: PipelineEvent[] = [];
  let secondRunEvents: PipelineEvent[] = [];

  const FILENAME = " 2026-01-15T00:00:00.000ZProgress Test Meeting";
  const CONTENT = `Attendance:
{'last_name': 'Donaldson', 'id': '014200be-0001-0001-0001-000000000099', 'first_name': 'Wesley', 'email': 'wesley@xolv.io'}
Transcript:
Wesley Donaldson | 00:11
Let us discuss progress events and run logging.`;

  beforeAll(async () => {
    pBaseDir = join(tmpdir(), `pipeline-progress-test-${Date.now()}`);
    pRawDir = join(pBaseDir, "raw");
    pProcessedDir = join(pBaseDir, "processed");
    pFailedDir = join(pBaseDir, "failed");
    pAuditDir = join(pBaseDir, "audit");
    mkdirSync(pRawDir, { recursive: true });
    pDb = createDb(":memory:");
    migrate(pDb);
    pVdbPath = join(tmpdir(), `lancedb-progress-${Date.now()}`);
    mkdirSync(pVdbPath, { recursive: true });
    pVdb = await connectVectorDb(pVdbPath);
    writeFileSync(join(pRawDir, FILENAME), CONTENT, "utf-8");
    writeFileSync(join(pRawDir, "bad-file"), "NOT VALID", "utf-8");

    const llm = createLlmAdapter({ type: "stub" });
    // First run: processes FILENAME (ok) and bad-file (failed)
    await processNewMeetings({ rawDir: pRawDir, processedDir: pProcessedDir, failedDir: pFailedDir, auditDir: pAuditDir, db: pDb, vdb: pVdb, session, llm, onProgress: (e) => firstRunEvents.push(e) });
    // Second run: FILENAME now in processed/, all entries skipped
    await processNewMeetings({ rawDir: pProcessedDir, processedDir: pProcessedDir, failedDir: pFailedDir, auditDir: pAuditDir, db: pDb, vdb: pVdb, session, llm, onProgress: (e) => secondRunEvents.push(e) });
  }, 30000);

  afterAll(() => {
    rmSync(pBaseDir, { recursive: true, force: true });
    rmSync(pVdbPath, { recursive: true, force: true });
  });

  it("emits processing event before each unprocessed meeting", () => {
    const processing = firstRunEvents.filter((e) => e.type === "processing");
    expect(processing.length).toBeGreaterThan(0);
    expect(processing[0]).toMatchObject({ type: "processing", index: expect.any(Number), total: expect.any(Number) });
  });

  it("emits ok event with client name and elapsed_ms on success", () => {
    const okEvents = firstRunEvents.filter((e) => e.type === "ok");
    expect(okEvents.length).toBeGreaterThan(0);
    const okEvent = okEvents[0] as Extract<PipelineEvent, { type: "ok" }>;
    expect(typeof okEvent.elapsed_ms).toBe("number");
    expect(typeof okEvent.client).toBe("string");
  });

  it("emits failed event with reason on parse failure", () => {
    const failedEvents = firstRunEvents.filter((e) => e.type === "failed");
    expect(failedEvents.length).toBeGreaterThan(0);
    const failedEvent = failedEvents[0] as Extract<PipelineEvent, { type: "failed" }>;
    expect(typeof failedEvent.reason).toBe("string");
    expect(failedEvent.reason.length).toBeGreaterThan(0);
  });

  it("emits skipped event for already-processed meetings with index and total", () => {
    const skipped = secondRunEvents.filter((e) => e.type === "skipped");
    expect(skipped.length).toBeGreaterThan(0);
    const skippedEvent = skipped[0] as Extract<PipelineEvent, { type: "skipped" }>;
    expect(typeof skippedEvent.index).toBe("number");
    expect(typeof skippedEvent.total).toBe("number");
  });
});
