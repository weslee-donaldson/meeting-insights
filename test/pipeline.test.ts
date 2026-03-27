import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../core/db.js";
import { connectVectorDb } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { processNewMeetings, processWebhookMeetings, handleWebhookNote, type PipelineEvent } from "../core/pipeline.js";
import { createThread } from "../core/threads.js";
import { listMilestonesByClient } from "../core/timelines.js";
import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../core/llm-adapter.js";

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

  it("populates artifact_fts for each processed meeting", () => {
    const meetings = db.prepare("SELECT id FROM meetings").all() as { id: string }[];
    const ftsCount = (db.prepare("SELECT COUNT(*) as n FROM artifact_fts").get() as { n: number }).n;
    expect(ftsCount).toBe(meetings.length);
  });

  it("logs full pipeline summary via mtninsights:pipeline", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    const newRaw = join(tmpdir(), `raw-log-test-${Date.now()}`);
    mkdirSync(newRaw, { recursive: true });
    await expect(processNewMeetings({ rawDir: newRaw, processedDir, failedDir, auditDir, db, vdb, session, llm })).resolves.toBeDefined();
    rmSync(newRaw, { recursive: true, force: true });
  });
});

describe("processNewMeetings threads buildClientContext into extraction", () => {
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
      "INSERT INTO clients (name, aliases, known_participants, client_team, additional_extraction_llm_prompt, glossary) VALUES (?, ?, ?, ?, ?, ?)",
    ).run("TestClientCo", '["TestClientCo"]', '[]', JSON.stringify([{ name: "Alice Smith", email: "alice@testclientco.com", role: "Client" }]), "Alice is the lead engineer and her action items are high priority.", JSON.stringify([{ term: "CSTAR", variants: ["C*", "C star"], description: "Project management platform" }]));

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

  it("injects buildClientContext output as ## Client Context into extraction prompt", () => {
    expect(capturedContent).toContain("## Client Context: TestClientCo");
    expect(capturedContent).toContain("Alice is the lead engineer");
  });

  it("injects glossary into extraction prompt when client has glossary entries", () => {
    expect(capturedContent).toContain("## Terminology Glossary");
    expect(capturedContent).toContain("**CSTAR**");
    expect(capturedContent).toContain('"C*"');
    expect(capturedContent).toContain("Project management platform");
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

describe("auto-evaluate threads after extraction", () => {
  let tDb: Database;
  let tVdb: Awaited<ReturnType<typeof connectVectorDb>>;
  let tVdbPath: string;
  let tBaseDir: string;

  const FILENAME = " 2026-03-02T00:00:00.000ZAPI Deployment Review";
  const CONTENT = `Attendance:
{'last_name': 'Smith', 'id': '014200be-9999-9999-9999-000000000001', 'first_name': 'Alice', 'email': 'alice@deploycorp.com'}
Transcript:
Alice Smith | 00:11
The deployment pipeline is broken again. We need to fix the CI/CD configuration.`;

  beforeAll(async () => {
    tBaseDir = join(tmpdir(), `pipeline-threads-${Date.now()}`);
    const rawDir = join(tBaseDir, "raw");
    const processedDir = join(tBaseDir, "processed");
    const failedDir = join(tBaseDir, "failed");
    const auditDir = join(tBaseDir, "audit");
    mkdirSync(rawDir, { recursive: true });

    tDb = createDb(":memory:");
    migrate(tDb);
    tDb.prepare(
      "INSERT INTO clients (name, aliases, known_participants, client_team) VALUES (?, ?, ?, ?)",
    ).run("DeployCorp", '["DeployCorp"]', '[]', JSON.stringify([{ name: "Alice Smith", email: "alice@deploycorp.com", role: "Client" }]));

    tVdbPath = join(tmpdir(), `lancedb-threads-${Date.now()}`);
    mkdirSync(tVdbPath, { recursive: true });
    tVdb = await connectVectorDb(tVdbPath);

    createThread(tDb, {
      client_name: "DeployCorp",
      title: "Deployment pipeline broken",
      shorthand: "DEPLOY",
      description: "CI/CD deployment pipeline failures",
      criteria_prompt: "deployment pipeline CI/CD broken failures",
    });

    createThread(tDb, {
      client_name: "DeployCorp",
      title: "Resolved issue",
      shorthand: "RESOLVED",
      description: "Old resolved thread",
      criteria_prompt: "deployment",
    });
    const resolvedThread = tDb.prepare("SELECT id FROM threads WHERE shorthand = 'RESOLVED'").get() as { id: string };
    tDb.prepare("UPDATE threads SET status = 'resolved' WHERE id = ?").run(resolvedThread.id);

    writeFileSync(join(rawDir, FILENAME), CONTENT, "utf-8");

    const llm = createLlmAdapter({ type: "stub" });
    await processNewMeetings({
      rawDir, processedDir, failedDir, auditDir,
      db: tDb, vdb: tVdb, session, llm,
      threadSimilarityThreshold: 0.1,
    });
  }, 30000);

  afterAll(() => {
    rmSync(tBaseDir, { recursive: true, force: true });
    rmSync(tVdbPath, { recursive: true, force: true });
  });

  it("creates thread association for matching open thread after processing", () => {
    const openThread = tDb.prepare("SELECT id FROM threads WHERE shorthand = 'DEPLOY'").get() as { id: string };
    const associations = tDb.prepare("SELECT * FROM thread_meetings WHERE thread_id = ?").all(openThread.id) as Array<{ thread_id: string; meeting_id: string; relevance_score: number }>;
    expect(associations.length).toBe(1);
    expect(associations[0].relevance_score).toBe(75);
  });

  it("skips resolved threads during auto-evaluation", () => {
    const resolvedThread = tDb.prepare("SELECT id FROM threads WHERE shorthand = 'RESOLVED'").get() as { id: string };
    const associations = tDb.prepare("SELECT * FROM thread_meetings WHERE thread_id = ?").all(resolvedThread.id) as Array<Record<string, unknown>>;
    expect(associations.length).toBe(0);
  });

  it("reconciles milestones from extracted artifact during pipeline processing", () => {
    const milestones = listMilestonesByClient(tDb, "DeployCorp");
    expect(milestones).toHaveLength(1);
    expect(milestones[0]).toEqual(expect.objectContaining({
      title: "Platform launch v2",
      target_date: "2026-06-01",
      status: "identified",
    }));
    expect(milestones[0].mention_count).toBe(1);
  });
});

describe("manifest with missing folder", () => {
  let mDb: Database;
  let mVdb: Awaited<ReturnType<typeof connectVectorDb>>;
  let mVdbPath: string;
  let mBaseDir: string;
  let events: PipelineEvent[];
  let result: Awaited<ReturnType<typeof processNewMeetings>>;

  beforeAll(async () => {
    mBaseDir = join(tmpdir(), `pipeline-missing-folder-${Date.now()}`);
    const rawDir = join(mBaseDir, "raw");
    mkdirSync(rawDir, { recursive: true });

    const manifest = [
      {
        meeting_id: "missing-001",
        meeting_title: "Ghost Meeting",
        meeting_date: "2026-01-01T00:00:00.000Z",
        meeting_files: ["ghost_meeting-missing-001/transcript.md"],
      },
    ];
    writeFileSync(join(rawDir, "manifest.json"), JSON.stringify(manifest), "utf-8");

    mDb = createDb(":memory:");
    migrate(mDb);
    mVdbPath = join(tmpdir(), `lancedb-missing-${Date.now()}`);
    mkdirSync(mVdbPath, { recursive: true });
    mVdb = await connectVectorDb(mVdbPath);

    events = [];
    const llm = createLlmAdapter({ type: "stub" });
    result = await processNewMeetings({
      rawDir,
      processedDir: join(mBaseDir, "processed"),
      failedDir: join(mBaseDir, "failed"),
      auditDir: join(mBaseDir, "audit"),
      db: mDb, vdb: mVdb, session, llm,
      onProgress: (e) => events.push(e),
    });
  }, 30000);

  afterAll(() => {
    rmSync(mBaseDir, { recursive: true, force: true });
    rmSync(mVdbPath, { recursive: true, force: true });
  });

  it("does not crash when manifest references a missing folder", () => {
    expect(result).toEqual({ total: 1, succeeded: 0, failed: 1, skipped: 0 });
  });

  it("emits a failed event with folder-not-found reason", () => {
    const failedEvents = events.filter((e) => e.type === "failed") as Extract<PipelineEvent, { type: "failed" }>[];
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0].reason).toBe("folder not found: ghost_meeting-missing-001");
    expect(failedEvents[0].title).toBe("Ghost Meeting");
  });
});

function makeWebhookJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    event: "transcript_created",
    data: {
      meeting: {
        id: overrides.meetingId ?? "webhook-meeting-001",
        title: overrides.title ?? "Webhook Test Meeting",
        start_date: "2026-03-20T10:00:00.000Z",
        speakers: [
          { index: 0, first_name: "Alice", last_name: "Smith", id: "spk-001", email: "alice@example.com" },
        ],
      },
      content: [
        { speaker: "Alice Smith", speakerIndex: 0, text: "Let us discuss the webhook integration." },
      ],
    },
    ...overrides,
  });
}

describe("processWebhookMeetings", () => {
  let wDb: Database;
  let wVdbPath: string;
  let wVdb: Awaited<ReturnType<typeof connectVectorDb>>;
  let wBaseDir: string;

  beforeAll(async () => {
    wBaseDir = join(tmpdir(), `pipeline-webhook-${Date.now()}`);
    wDb = createDb(":memory:");
    migrate(wDb);
    wVdbPath = join(tmpdir(), `lancedb-webhook-${Date.now()}`);
    mkdirSync(wVdbPath, { recursive: true });
    wVdb = await connectVectorDb(wVdbPath);
  }, 30000);

  afterAll(() => {
    rmSync(wBaseDir, { recursive: true, force: true });
    rmSync(wVdbPath, { recursive: true, force: true });
  });

  it("returns PipelineResult with correct total count from directory scan", async () => {
    const webhookRawDir = join(wBaseDir, "burst11-raw");
    mkdirSync(webhookRawDir, { recursive: true });
    writeFileSync(join(webhookRawDir, "meeting-a.json"), makeWebhookJson({ meetingId: "burst11-a" }), "utf-8");
    writeFileSync(join(webhookRawDir, "meeting-b.json"), makeWebhookJson({ meetingId: "burst11-b" }), "utf-8");

    const llm = createLlmAdapter({ type: "stub" });
    const result = await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir: join(wBaseDir, "burst11-processed"),
      webhookFailedDir: join(wBaseDir, "burst11-failed"),
      auditDir: join(wBaseDir, "burst11-audit"),
      db: wDb,
      vdb: wVdb,
      session,
      llm,
    });

    expect(result.total).toBe(2);
  });

  it("parses JSON files and processes valid meetings into the database", async () => {
    const webhookRawDir = join(wBaseDir, "burst12-raw");
    mkdirSync(webhookRawDir, { recursive: true });
    writeFileSync(join(webhookRawDir, "valid.json"), makeWebhookJson({ meetingId: "burst12-valid" }), "utf-8");

    const llm = createLlmAdapter({ type: "stub" });
    const result = await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir: join(wBaseDir, "burst12-processed"),
      webhookFailedDir: join(wBaseDir, "burst12-failed"),
      auditDir: join(wBaseDir, "burst12-audit"),
      db: wDb,
      vdb: wVdb,
      session,
      llm,
    });

    expect(result.succeeded).toBe(1);
    const meeting = wDb.prepare("SELECT id, title FROM meetings WHERE id = ?").get("burst12-valid") as { id: string; title: string };
    expect(meeting).toEqual({ id: "burst12-valid", title: "Webhook Test Meeting" });
  });

  it("skips meetings whose externalId already exists in the database", async () => {
    const webhookRawDir = join(wBaseDir, "burst13-raw");
    mkdirSync(webhookRawDir, { recursive: true });
    const existingId = "burst13-existing";
    wDb.prepare("INSERT INTO meetings (id, title, date, participants, raw_transcript, source_filename, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(existingId, "Pre-existing", "2026-01-01T00:00:00.000Z", "[]", "", "old-source", new Date().toISOString());
    writeFileSync(join(webhookRawDir, "duplicate.json"), makeWebhookJson({ meetingId: existingId }), "utf-8");

    const llm = createLlmAdapter({ type: "stub" });
    const result = await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir: join(wBaseDir, "burst13-processed"),
      webhookFailedDir: join(wBaseDir, "burst13-failed"),
      auditDir: join(wBaseDir, "burst13-audit"),
      db: wDb,
      vdb: wVdb,
      session,
      llm,
    });

    expect(result).toEqual({ total: 1, succeeded: 0, failed: 0, skipped: 1 });
  });

  it("moves processed files to webhook-processed directory", async () => {
    const webhookRawDir = join(wBaseDir, "burst14-raw");
    const webhookProcessedDir = join(wBaseDir, "burst14-processed");
    mkdirSync(webhookRawDir, { recursive: true });
    writeFileSync(join(webhookRawDir, "to-process.json"), makeWebhookJson({ meetingId: "burst14-move" }), "utf-8");

    const llm = createLlmAdapter({ type: "stub" });
    await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir,
      webhookFailedDir: join(wBaseDir, "burst14-failed"),
      auditDir: join(wBaseDir, "burst14-audit"),
      db: wDb,
      vdb: wVdb,
      session,
      llm,
    });

    expect(existsSync(join(webhookRawDir, "to-process.json"))).toBe(false);
    expect(existsSync(join(webhookProcessedDir, "to-process.json"))).toBe(true);
  });

  it("moves failed files to webhook-failed directory with audit log", async () => {
    const webhookRawDir = join(wBaseDir, "burst15-raw");
    const webhookFailedDir = join(wBaseDir, "burst15-failed");
    const auditDir = join(wBaseDir, "burst15-audit");
    mkdirSync(webhookRawDir, { recursive: true });
    writeFileSync(join(webhookRawDir, "bad.json"), '{"event":"transcript_created","data":{}}', "utf-8");

    const llm = createLlmAdapter({ type: "stub" });
    const result = await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir: join(wBaseDir, "burst15-processed"),
      webhookFailedDir,
      auditDir,
      db: wDb,
      vdb: wVdb,
      session,
      llm,
    });

    expect(result.failed).toBe(1);
    expect(existsSync(join(webhookFailedDir, "bad.json"))).toBe(true);
    expect(existsSync(join(webhookRawDir, "bad.json"))).toBe(false);
    const auditFiles = readdirSync(auditDir).filter((f) => f.endsWith(".json"));
    expect(auditFiles.length).toBeGreaterThan(0);
  });

  it("emits PipelineEvent callbacks for processing, ok, failed, and skipped", async () => {
    const webhookRawDir = join(wBaseDir, "burst16-raw");
    mkdirSync(webhookRawDir, { recursive: true });
    const existingId = "burst16-existing";
    wDb.prepare("INSERT INTO meetings (id, title, date, participants, raw_transcript, source_filename, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(existingId, "Existing", "2026-01-01T00:00:00.000Z", "[]", "", "burst16-old", new Date().toISOString());
    writeFileSync(join(webhookRawDir, "good.json"), makeWebhookJson({ meetingId: "burst16-new" }), "utf-8");
    writeFileSync(join(webhookRawDir, "dup.json"), makeWebhookJson({ meetingId: existingId }), "utf-8");
    writeFileSync(join(webhookRawDir, "bad.json"), '{"event":"transcript_created","data":{}}', "utf-8");

    const events: PipelineEvent[] = [];
    const llm = createLlmAdapter({ type: "stub" });
    await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir: join(wBaseDir, "burst16-processed"),
      webhookFailedDir: join(wBaseDir, "burst16-failed"),
      auditDir: join(wBaseDir, "burst16-audit"),
      db: wDb,
      vdb: wVdb,
      session,
      llm,
      onProgress: (e) => events.push(e),
    });

    const types = events.map((e) => e.type);
    expect(types).toContain("processing");
    expect(types).toContain("ok");
    expect(types).toContain("failed");
    expect(types).toContain("skipped");
  });

  it("silently skips non-transcript_created events without counting as failures", async () => {
    const webhookRawDir = join(wBaseDir, "burst17-raw");
    mkdirSync(webhookRawDir, { recursive: true });
    writeFileSync(join(webhookRawDir, "notes.json"), JSON.stringify({ event: "notes_generated", data: { meeting: { id: "burst17-notes" } } }), "utf-8");
    writeFileSync(join(webhookRawDir, "burst17-valid.json"), makeWebhookJson({ meetingId: "burst17-valid" }), "utf-8");

    const llm = createLlmAdapter({ type: "stub" });
    const result = await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir: join(wBaseDir, "burst17-processed"),
      webhookFailedDir: join(wBaseDir, "burst17-failed"),
      auditDir: join(wBaseDir, "burst17-audit"),
      db: wDb,
      vdb: wVdb,
      session,
      llm,
    });

    expect(result).toEqual({ total: 2, succeeded: 1, failed: 0, skipped: 1 });
  });

  it("creates webhook-processed and webhook-failed dirs if they do not exist", async () => {
    const webhookRawDir = join(wBaseDir, "burst18-raw");
    const webhookProcessedDir = join(wBaseDir, "burst18-processed");
    const webhookFailedDir = join(wBaseDir, "burst18-failed");
    mkdirSync(webhookRawDir, { recursive: true });
    writeFileSync(join(webhookRawDir, "burst18.json"), makeWebhookJson({ meetingId: "burst18-auto-dirs" }), "utf-8");

    expect(existsSync(webhookProcessedDir)).toBe(false);
    expect(existsSync(webhookFailedDir)).toBe(false);

    const llm = createLlmAdapter({ type: "stub" });
    await processWebhookMeetings({
      webhookRawDir,
      webhookProcessedDir,
      webhookFailedDir,
      auditDir: join(wBaseDir, "burst18-audit"),
      db: wDb,
      vdb: wVdb,
      session,
      llm,
    });

    expect(existsSync(webhookProcessedDir)).toBe(true);
    expect(existsSync(webhookFailedDir)).toBe(true);
  });
});

describe("processNewMeetings with webhook config", () => {
  let oDb: Database;
  let oVdbPath: string;
  let oVdb: Awaited<ReturnType<typeof connectVectorDb>>;
  let oBaseDir: string;

  beforeAll(async () => {
    oBaseDir = join(tmpdir(), `pipeline-orchestration-${Date.now()}`);
    oDb = createDb(":memory:");
    migrate(oDb);
    oVdbPath = join(tmpdir(), `lancedb-orchestration-${Date.now()}`);
    mkdirSync(oVdbPath, { recursive: true });
    oVdb = await connectVectorDb(oVdbPath);
  }, 30000);

  afterAll(() => {
    rmSync(oBaseDir, { recursive: true, force: true });
    rmSync(oVdbPath, { recursive: true, force: true });
  });

  it("accepts optional webhookRawDir, webhookProcessedDir, webhookFailedDir fields", async () => {
    const rawDir = join(oBaseDir, "burst19-raw");
    mkdirSync(rawDir, { recursive: true });
    const webhookRawDir = join(oBaseDir, "burst19-webhook-raw");
    mkdirSync(webhookRawDir, { recursive: true });

    const llm = createLlmAdapter({ type: "stub" });
    const result = await processNewMeetings({
      rawDir,
      processedDir: join(oBaseDir, "burst19-processed"),
      failedDir: join(oBaseDir, "burst19-failed"),
      auditDir: join(oBaseDir, "burst19-audit"),
      db: oDb,
      vdb: oVdb,
      session,
      llm,
      webhookRawDir,
      webhookProcessedDir: join(oBaseDir, "burst19-webhook-processed"),
      webhookFailedDir: join(oBaseDir, "burst19-webhook-failed"),
    });

    expect(result).toEqual({ total: 0, succeeded: 0, failed: 0, skipped: 0 });
  });

  it("calls processWebhookMeetings first and aggregates results with manifest processing", async () => {
    const rawDir = join(oBaseDir, "burst20-raw");
    mkdirSync(rawDir, { recursive: true });
    const webhookRawDir = join(oBaseDir, "burst20-webhook-raw");
    mkdirSync(webhookRawDir, { recursive: true });

    writeFileSync(join(webhookRawDir, "burst20.json"), makeWebhookJson({ meetingId: "burst20-webhook" }), "utf-8");

    const FILENAME = " 2026-01-20T00:00:00.000ZBurst20 Manifest Test";
    writeFileSync(join(rawDir, FILENAME), GOOD_CONTENT, "utf-8");

    const events: PipelineEvent[] = [];
    const llm = createLlmAdapter({ type: "stub" });
    const result = await processNewMeetings({
      rawDir,
      processedDir: join(oBaseDir, "burst20-processed"),
      failedDir: join(oBaseDir, "burst20-failed"),
      auditDir: join(oBaseDir, "burst20-audit"),
      db: oDb,
      vdb: oVdb,
      session,
      llm,
      webhookRawDir,
      webhookProcessedDir: join(oBaseDir, "burst20-webhook-processed"),
      webhookFailedDir: join(oBaseDir, "burst20-webhook-failed"),
      onProgress: (e) => events.push(e),
    });

    expect(result.succeeded).toBe(2);
    expect(result.total).toBe(2);

    const webhookMeeting = oDb.prepare("SELECT id FROM meetings WHERE id = ?").get("burst20-webhook") as { id: string } | undefined;
    expect(webhookMeeting).toBeDefined();

    const okEvents = events.filter((e) => e.type === "ok");
    expect(okEvents.length).toBe(2);
  });

  it("skips manifest entries whose meeting_id was already processed by webhook", async () => {
    const b21Db = createDb(":memory:");
    migrate(b21Db);
    const b21VdbPath = join(tmpdir(), `lancedb-burst21-${Date.now()}`);
    mkdirSync(b21VdbPath, { recursive: true });
    const b21Vdb = await connectVectorDb(b21VdbPath);

    const rawDir = join(oBaseDir, "burst21-raw");
    mkdirSync(rawDir, { recursive: true });
    const webhookRawDir = join(oBaseDir, "burst21-webhook-raw");
    mkdirSync(webhookRawDir, { recursive: true });

    const sharedMeetingId = "burst21-shared-id";

    writeFileSync(join(webhookRawDir, "burst21.json"), makeWebhookJson({ meetingId: sharedMeetingId, title: "Webhook Version" }), "utf-8");

    const folderName = "burst21_meeting-" + sharedMeetingId;
    const folderPath = join(rawDir, folderName);
    mkdirSync(folderPath, { recursive: true });
    writeFileSync(join(folderPath, "transcript.md"), GOOD_CONTENT, "utf-8");
    const manifest = [{
      meeting_id: sharedMeetingId,
      meeting_title: "Manifest Version",
      meeting_date: "2026-01-21T00:00:00.000Z",
      meeting_files: [folderName + "/transcript.md"],
    }];
    writeFileSync(join(rawDir, "manifest.json"), JSON.stringify(manifest), "utf-8");

    const events: PipelineEvent[] = [];
    const llm = createLlmAdapter({ type: "stub" });
    const result = await processNewMeetings({
      rawDir,
      processedDir: join(oBaseDir, "burst21-processed"),
      failedDir: join(oBaseDir, "burst21-failed"),
      auditDir: join(oBaseDir, "burst21-audit"),
      db: b21Db,
      vdb: b21Vdb,
      session,
      llm,
      webhookRawDir,
      webhookProcessedDir: join(oBaseDir, "burst21-webhook-processed"),
      webhookFailedDir: join(oBaseDir, "burst21-webhook-failed"),
      onProgress: (e) => events.push(e),
    });

    expect(result.succeeded).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.total).toBe(2);

    const meeting = b21Db.prepare("SELECT title FROM meetings WHERE id = ?").get(sharedMeetingId) as { title: string };
    expect(meeting.title).toBe("Webhook Version");

    const skippedEvents = events.filter((e) => e.type === "skipped");
    expect(skippedEvents.length).toBe(1);
    expect((skippedEvents[0] as Extract<PipelineEvent, { type: "skipped" }>).title).toBe("Manifest Version");

    rmSync(b21VdbPath, { recursive: true, force: true });
  });
});

describe("handleWebhookNote", () => {
  let nDb: ReturnType<typeof createDb>;

  beforeAll(() => {
    nDb = createDb(":memory:");
    migrate(nDb);
  });

  it("returns false for non-note events", () => {
    expect(handleWebhookNote(nDb, JSON.stringify({ event: "transcript_created", data: {} }))).toBe(false);
    expect(handleWebhookNote(nDb, JSON.stringify({ event: "recording_ready", data: {} }))).toBe(false);
  });

  it("creates note with correct type when meeting exists in DB", () => {
    nDb.prepare("INSERT INTO meetings (id, title, date, raw_transcript) VALUES (?, ?, ?, ?)").run("hwn-m1", "Test Meeting", "2026-03-26T13:00:00Z", "transcript");
    const payload = JSON.stringify({
      event: "key_points_generated",
      data: { meeting: { id: "hwn-m1" }, raw_content: "- Key point 1\n- Key point 2" },
    });
    expect(handleWebhookNote(nDb, payload)).toBe(true);
    const notes = nDb.prepare("SELECT * FROM notes WHERE object_id = 'hwn-m1'").all() as { note_type: string; title: string; body: string }[];
    expect(notes).toHaveLength(1);
    expect(notes[0].note_type).toBe("key-points");
    expect(notes[0].title).toBe("Krisp Key Points");
    expect(notes[0].body).toBe("- Key point 1\n- Key point 2");
  });

  it("returns false when meeting does not exist in DB", () => {
    const payload = JSON.stringify({
      event: "key_points_generated",
      data: { meeting: { id: "nonexistent-meeting" }, raw_content: "- Point" },
    });
    expect(handleWebhookNote(nDb, payload)).toBe(false);
  });

  it("is idempotent — skips if note of same type already exists for meeting", () => {
    const payload = JSON.stringify({
      event: "key_points_generated",
      data: { meeting: { id: "hwn-m1" }, raw_content: "- Updated point" },
    });
    expect(handleWebhookNote(nDb, payload)).toBe(true);
    const notes = nDb.prepare("SELECT * FROM notes WHERE object_id = 'hwn-m1' AND note_type = 'key-points'").all();
    expect(notes).toHaveLength(1);
  });

  it("creates action-items note for action_items_generated event", () => {
    const payload = JSON.stringify({
      event: "action_items_generated",
      data: { meeting: { id: "hwn-m1" }, raw_content: "- [ ] Task 1" },
    });
    expect(handleWebhookNote(nDb, payload)).toBe(true);
    const notes = nDb.prepare("SELECT * FROM notes WHERE object_id = 'hwn-m1' AND note_type = 'action-items'").all();
    expect(notes).toHaveLength(1);
  });
});
