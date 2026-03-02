import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import { connectVectorDb, createMeetingTable } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "../core/meeting-pipeline.js";
import type { ParsedMeeting } from "../core/parser.js";
import type { Artifact } from "../core/extractor.js";
import type { DatabaseSync as Database } from "node:sqlite";

let db: Database;
let vdbPath: string;
let vdb: Awaited<ReturnType<typeof connectVectorDb>>;
let session: Awaited<ReturnType<typeof loadModel>>;
let meetingId: string;

const artifact: Artifact = {
  summary: "Discussed API integration approach and timeline",
  decisions: [{ text: "Use REST over GraphQL", decided_by: "" }],
  proposed_features: ["Rate limiting", "OAuth2 support"],
  action_items: [{ description: "Draft API spec", owner: "Alice", requester: "", due_date: null }],
  technical_topics: ["REST API", "authentication"],
  open_questions: ["Which OAuth provider?"],
  risk_items: ["Third party dependency"],
  additional_notes: [{ category: "Architecture", notes: ["Prefer stateless design"] }],
};

const parsed: ParsedMeeting = {
  timestamp: "2026-01-19T15:43:52.210Z",
  title: "API Integration Meeting",
  participants: [],
  turns: [{ speaker_name: "Alice", timestamp: "00:01", text: "Let us discuss the API." }],
  rawTranscript: "raw",
  sourceFilename: "pipeline-test",
};

beforeAll(async () => {
  db = createDb(":memory:");
  migrate(db);
  meetingId = ingestMeeting(db, parsed);
  storeArtifact(db, meetingId, artifact);
  vdbPath = join(tmpdir(), `lancedb-pipeline-${Date.now()}`);
  mkdirSync(vdbPath, { recursive: true });
  vdb = await connectVectorDb(vdbPath);
  session = await loadModel("models/all-MiniLM-L6-v2.onnx", "models/tokenizer.json");
}, 30000);

afterAll(() => {
  rmSync(vdbPath, { recursive: true, force: true });
});

describe("buildEmbeddingInput", () => {
  it("concatenates summary + features + topics + decisions from artifact", () => {
    const input = buildEmbeddingInput(artifact);
    expect(input).toContain("Discussed API integration approach");
    expect(input).toContain("Rate limiting");
    expect(input).toContain("REST API");
    expect(input).toContain("Use REST over GraphQL");
  });

  it("includes canonicalized additional_notes with group header and note text", () => {
    const input = buildEmbeddingInput(artifact);
    expect(input).toContain("Architecture");
    expect(input).toContain("Prefer stateless design");
  });

  it("omits notes section when additional_notes is empty", () => {
    const noNotes = { ...artifact, additional_notes: [] };
    const input = buildEmbeddingInput(noNotes);
    expect(input).toContain("Discussed API integration approach");
    expect(input).not.toContain("Architecture");
  });
});

describe("embedMeeting", () => {
  it("generates 384-dim vector from artifact embedding input", async () => {
    const input = buildEmbeddingInput(artifact);
    const vec = await embedMeeting(session, input);
    expect(vec).toBeInstanceOf(Float32Array);
    expect(vec.length).toBe(384);
  });
});

describe("storeMeetingVector", () => {
  it("inserts vector and metadata into LanceDB meeting_vectors table", async () => {
    const table = await createMeetingTable(vdb);
    const input = buildEmbeddingInput(artifact);
    const vec = await embedMeeting(session, input);
    await storeMeetingVector(table, meetingId, vec, { client: "Revenium", meeting_type: "DSU", date: parsed.timestamp });
    const rows = await table.search(Array.from(vec)).limit(1).toArray();
    expect(rows[0].meeting_id).toBe(meetingId);
  });

  it("includes client, meeting_type and date in stored metadata", async () => {
    const table = await createMeetingTable(vdb);
    const rows = await table.search(new Array(384).fill(0)).limit(10).toArray();
    const row = rows.find((r: { meeting_id: string }) => r.meeting_id === meetingId);
    expect(row!.client).toBe("Revenium");
    expect(row!.meeting_type).toBe("DSU");
    expect(row!.date).toBe(parsed.timestamp);
  });
});
