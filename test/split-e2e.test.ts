import { describe, it, expect, beforeAll, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import type { Artifact } from "../core/extractor.js";
import { updateFts } from "../core/fts.js";
import { storeDetection } from "../core/client-detection.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { createApp } from "../api/server.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

vi.mock("../core/meeting-pipeline.js", () => ({
  buildEmbeddingInput: vi.fn().mockReturnValue("summary"),
  embedMeeting: vi.fn().mockResolvedValue(new Float32Array(384)),
  storeMeetingVector: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../core/vector-db.js", () => {
  const mockTable = { query: () => ({ toArray: vi.fn().mockResolvedValue([]) }), add: vi.fn(), delete: vi.fn().mockResolvedValue(undefined) };
  return {
    createMeetingTable: vi.fn().mockResolvedValue(mockTable),
    createItemTable: vi.fn().mockResolvedValue(mockTable),
  };
});

// 21-turn transcript: Alice+Bob in first 60 min, Alice+Charlie after
// Turns 3 and 4 share timestamp 00:05 (shared-timestamp edge case)
const E2E_TRANSCRIPT =
  "Alice | 00:00\nOpening\n\n" +
  "Bob | 00:05\nHello\n\n" +
  "Alice | 00:05\nHi Bob\n\n" +
  "Bob | 00:10\nAgenda\n\n" +
  "Alice | 00:15\nStatus\n\n" +
  "Bob | 00:20\nBlockers\n\n" +
  "Alice | 00:25\nProgress\n\n" +
  "Bob | 00:30\nUpdate\n\n" +
  "Alice | 00:35\nQuestions\n\n" +
  "Bob | 00:40\nAnswers\n\n" +
  "Alice | 00:45\nDecisions\n\n" +
  "Bob | 00:50\nAction items\n\n" +
  "Alice | 00:55\nSummary\n\n" +
  "Bob | 01:00\nWrap up\n\n" +
  "Alice | 01:05\nSecond meeting\n\n" +
  "Charlie | 01:10\nHello\n\n" +
  "Alice | 01:15\nWelcome Charlie\n\n" +
  "Charlie | 01:20\nThanks\n\n" +
  "Alice | 01:25\nTopics\n\n" +
  "Charlie | 01:30\nIdeas\n\n" +
  "Alice | 01:35\nClose\n\n";

const STUB_ARTIFACT: Artifact = {
  summary: "Summary",
  decisions: [],
  proposed_features: [],
  action_items: [],
  open_questions: [],
  risk_items: [],
  additional_notes: [],
  milestones: [],
};

describe("split E2E: lifecycle", () => {
  let db: ReturnType<typeof createDb>;
  let app: ReturnType<typeof createApp>;
  let meetingId: string;
  let splitResult: { source_meeting_id: string; segments: Array<{ meeting_id: string; segment_index: number; turn_count: number; actual_start: string; actual_end: string; actual_duration: number; requested_duration: number }> };
  const mockSession = {} as InferenceSession & { _tokenizer: unknown };
  const mockVdb = {} as VectorDb;

  beforeAll(async () => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run(
      "Acme", "[]", "[]", "client-acme",
    );
    meetingId = ingestMeeting(db, {
      title: "Weekly Standup",
      timestamp: "2024-01-01",
      participants: [
        { id: "p1", first_name: "Alice", last_name: "Smith", email: "alice@acme.com" },
        { id: "p2", first_name: "Bob", last_name: "Jones", email: "bob@acme.com" },
        { id: "p3", first_name: "Charlie", last_name: "Brown", email: "charlie@acme.com" },
      ],
      turns: [],
      rawTranscript: E2E_TRANSCRIPT,
      sourceFilename: "e2e-split-test.md",
    });
    storeArtifact(db, meetingId, STUB_ARTIFACT);
    updateFts(db, meetingId);
    storeDetection(db, meetingId, [{ client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "participant" }]);
    const llm = createLlmAdapter({ type: "stub" });
    app = createApp(db, ":memory:", llm, { session: mockSession, vdb: mockVdb });

    const res = await app.request(`/api/meetings/${meetingId}/split`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durations: [60, 30] }),
    });
    splitResult = await res.json();
  });

  it("split via API creates correct segments", () => {
    expect(splitResult.source_meeting_id).toBe(meetingId);
    expect(splitResult.segments).toHaveLength(2);
    expect(splitResult.segments[0].segment_index).toBe(1);
    expect(splitResult.segments[1].segment_index).toBe(2);
    expect(splitResult.segments[0].turn_count).toBe(14);
    expect(splitResult.segments[1].turn_count).toBe(7);
    expect(splitResult.segments[0].actual_start).toBe("00:00");
    expect(splitResult.segments[0].actual_end).toBe("01:00");
    expect(splitResult.segments[1].actual_start).toBe("00:00");
    expect(Math.abs(splitResult.segments[0].actual_duration - splitResult.segments[0].requested_duration)).toBeLessThanOrEqual(2);
  });

  it("new segments appear in meeting list, original does not", async () => {
    const res = await app.request("/api/meetings");
    expect(res.status).toBe(200);
    const meetings = await res.json() as Array<{ id: string }>;
    const ids = meetings.map((m) => m.id);
    expect(ids).toContain(splitResult.segments[0].meeting_id);
    expect(ids).toContain(splitResult.segments[1].meeting_id);
    expect(ids).not.toContain(meetingId);
  });

  it("each new segment title follows (K of N) convention", async () => {
    const res = await app.request("/api/meetings");
    const meetings = await res.json() as Array<{ id: string; title: string }>;
    const seg1 = meetings.find((m) => m.id === splitResult.segments[0].meeting_id);
    const seg2 = meetings.find((m) => m.id === splitResult.segments[1].meeting_id);
    expect(seg1?.title).toMatch(/\(1 of 2\)$/);
    expect(seg2?.title).toMatch(/\(2 of 2\)$/);
  });

  it("each new segment has correct participants", async () => {
    const res1 = await app.request(`/api/meetings/${splitResult.segments[0].meeting_id}`);
    const seg1 = await res1.json() as { participants: string };
    const seg1Participants = JSON.parse(seg1.participants) as Array<{ first_name: string }>;
    const seg1Names = seg1Participants.map((p) => p.first_name);
    expect(seg1Names).toContain("Alice");
    expect(seg1Names).toContain("Bob");
    expect(seg1Names).not.toContain("Charlie");

    const res2 = await app.request(`/api/meetings/${splitResult.segments[1].meeting_id}`);
    const seg2 = await res2.json() as { participants: string };
    const seg2Participants = JSON.parse(seg2.participants) as Array<{ first_name: string }>;
    const seg2Names = seg2Participants.map((p) => p.first_name);
    expect(seg2Names).toContain("Alice");
    expect(seg2Names).toContain("Charlie");
    expect(seg2Names).not.toContain("Bob");
  });

  it("archived meeting's stale data is removed", () => {
    expect(db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meetingId)).toBeUndefined();
    expect(db.prepare("SELECT * FROM artifact_fts WHERE meeting_id = ?").get(meetingId)).toBeUndefined();
    expect(db.prepare("SELECT * FROM client_detections WHERE meeting_id = ?").get(meetingId)).toBeUndefined();
    const original = db.prepare("SELECT ignored FROM meetings WHERE id = ?").get(meetingId) as { ignored: number };
    expect(original.ignored).toBe(1);
  });

  it("lineage is queryable from both directions", async () => {
    const parentRes = await app.request(`/api/meetings/${meetingId}/lineage`);
    const parentLineage = await parentRes.json() as { source: null; children: Array<{ id: string }>; segment_index: null };
    expect(parentLineage.source).toBeNull();
    expect(parentLineage.children).toHaveLength(2);
    expect(parentLineage.segment_index).toBeNull();

    const child1Res = await app.request(`/api/meetings/${splitResult.segments[0].meeting_id}/lineage`);
    const child1Lineage = await child1Res.json() as { source: { id: string }; children: unknown[]; segment_index: number };
    expect(child1Lineage.source?.id).toBe(meetingId);
    expect(child1Lineage.children).toHaveLength(0);
    expect(child1Lineage.segment_index).toBe(1);

    const child2Res = await app.request(`/api/meetings/${splitResult.segments[1].meeting_id}/lineage`);
    const child2Lineage = await child2Res.json() as { segment_index: number };
    expect(child2Lineage.segment_index).toBe(2);
  });

  it("cannot split an already-archived meeting", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/split`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durations: [30, 30] }),
    });
    expect(res.status).toBe(400);
  });
});

describe("split E2E: re-extraction", () => {
  let db: ReturnType<typeof createDb>;
  let app: ReturnType<typeof createApp>;
  let meetingId: string;
  let splitResult: { segments: Array<{ meeting_id: string }> };
  const mockSession = {} as InferenceSession & { _tokenizer: unknown };
  const mockVdb = {} as VectorDb;

  beforeAll(async () => {
    db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "Reextract Test",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: E2E_TRANSCRIPT,
      sourceFilename: "e2e-reextract-test.md",
    });
    const llm = createLlmAdapter({ type: "stub" });
    app = createApp(db, ":memory:", llm, { session: mockSession, vdb: mockVdb });

    const res = await app.request(`/api/meetings/${meetingId}/split`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durations: [60, 30] }),
    });
    splitResult = await res.json();
  });

  it("re-extraction produces artifacts for each new segment", () => {
    for (const seg of splitResult.segments) {
      const artifact = db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(seg.meeting_id) as { summary: string } | undefined;
      expect(artifact).toBeTruthy();
      expect(typeof artifact!.summary).toBe("string");
      expect(artifact!.summary.length).toBeGreaterThan(0);
    }
  });

  it("FTS indexes new segments after re-extraction", () => {
    for (const seg of splitResult.segments) {
      const fts = db.prepare("SELECT meeting_id FROM artifact_fts WHERE meeting_id = ?").get(seg.meeting_id);
      expect(fts).toBeTruthy();
    }
    expect(db.prepare("SELECT meeting_id FROM artifact_fts WHERE meeting_id = ?").get(meetingId)).toBeUndefined();
  });

  it("client detection runs independently per segment", () => {
    for (const seg of splitResult.segments) {
      const detections = db.prepare("SELECT * FROM client_detections WHERE meeting_id = ?").all(seg.meeting_id);
      expect(Array.isArray(detections)).toBe(true);
    }
  });
});
