import { describe, it, expect, beforeAll, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/pipeline/ingest.js";
import { splitMeeting } from "../core/meeting-split.js";
import { storeDetection } from "../core/clients/detection.js";
import { storeArtifact } from "../core/pipeline/extractor.js";
import type { Artifact } from "../core/pipeline/extractor.js";
import { createLlmAdapter } from "../core/llm/adapter.js";
import { createApp } from "../api/server.js";
import type { VectorDb } from "../core/search/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

vi.mock("../core/pipeline/meeting-pipeline.js", () => ({
  buildEmbeddingInput: vi.fn().mockReturnValue("summary"),
  embedMeeting: vi.fn().mockResolvedValue(new Float32Array(384)),
  storeMeetingVector: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../core/search/vector-db.js", () => {
  const mockTable = { query: () => ({ toArray: vi.fn().mockResolvedValue([]) }), add: vi.fn(), delete: vi.fn() };
  return {
    createMeetingTable: vi.fn().mockResolvedValue(mockTable),
    createItemTable: vi.fn().mockResolvedValue(mockTable),
  };
});

function seedClientRaw(db: ReturnType<typeof createDb>, name: string) {
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run(
    name, JSON.stringify([name]), JSON.stringify(["@testco.com"]), `client-${name.toLowerCase().replace(/\s+/g, "-")}`,
  );
}

describe("GET /api/clients", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    seedClientRaw(db, "TestCo");
    app = createApp(db, ":memory:");
  });

  it("should return list of client names", async () => {
    const res = await app.request("/api/clients");
    expect(res.status).toBe(200);
    const body = await res.json() as Array<{ id: string; name: string }>;
    expect(body).toEqual([{ id: "client-testco", name: "TestCo" }]);
  });
});

describe("GET /api/meetings", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId1: string;
  let meetingId2: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    seedClientRaw(db, "TestCo");
    seedClientRaw(db, "OtherCo");

    meetingId1 = ingestMeeting(db, {
      title: "TestCo DSU",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [{ id: "1", first_name: "A", last_name: "B", email: "a@testco.com" }],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "testco-dsu-1",
    });
    storeDetection(db, meetingId1, [{ client_name: "TestCo", client_id: "client-testco", confidence: 0.8, method: "participant" }]);

    meetingId2 = ingestMeeting(db, {
      title: "OtherCo Planning",
      timestamp: "2026-02-25T10:00:00.000Z",
      participants: [{ id: "2", first_name: "C", last_name: "D", email: "c@otherco.com" }],
      rawTranscript: "C | 00:00\nHi.",
      turns: [],
      sourceFilename: "otherco-plan-1",
    });
    storeDetection(db, meetingId2, [{ client_name: "OtherCo", client_id: "client-otherco", confidence: 0.8, method: "participant" }]);

    app = createApp(db, ":memory:");
  });

  it("should return all meetings with correct shape", async () => {
    const res = await app.request("/api/meetings");
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; title: string; date: string; client: string; series: string; actionItemCount: number }[];
    expect(body).toHaveLength(2);
    expect(body[0]).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      date: expect.any(String),
      client: expect.any(String),
      series: expect.any(String),
      actionItemCount: expect.any(Number),
      thread_tags: expect.any(Array),
      milestone_tags: expect.any(Array),
    });
  });

  it("should filter meetings by client query param", async () => {
    const res = await app.request("/api/meetings?client=TestCo");
    expect(res.status).toBe(200);
    const body = await res.json() as { title: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("TestCo DSU");
  });

  it("should filter meetings by after query param", async () => {
    const res = await app.request("/api/meetings?after=2026-02-25");
    expect(res.status).toBe(200);
    const body = await res.json() as { title: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("OtherCo Planning");
  });

  it("should filter meetings by before query param", async () => {
    const res = await app.request("/api/meetings?before=2026-02-24");
    expect(res.status).toBe(200);
    const body = await res.json() as { title: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("TestCo DSU");
  });

  it("should return 200 with meeting object for valid id", async () => {
    const res = await app.request(`/api/meetings/${meetingId1}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; title: string };
    expect(body).toMatchObject({ id: meetingId1, title: "TestCo DSU" });
  });

  it("should return 404 for unknown meeting id", async () => {
    const res = await app.request("/api/meetings/unknown-id");
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/meetings", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "To Delete",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "delete-me",
    });
    app = createApp(db, ":memory:");
  });

  it("deletes meetings by id and returns 204", async () => {
    const res = await app.request("/api/meetings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [meetingId] }),
    });
    expect(res.status).toBe(204);
  });
});

describe("POST /api/meetings/:id/re-extract", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "ReExtract Meeting",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "re-extract-me",
    });
    const llm = createLlmAdapter({ type: "stub" });
    app = createApp(db, ":memory:", llm);
  });

  it("returns 200 after re-extracting artifact", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/re-extract`, { method: "POST" });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/meetings/:id/client", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run("Acme", "[]", "[]", "client-acme");
    meetingId = ingestMeeting(db, {
      title: "Reassign Test",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "reassign-me",
    });
    app = createApp(db, ":memory:");
  });

  it("returns 204 after reassigning client", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName: "Acme" }),
    });
    expect(res.status).toBe(204);
  });
});

describe("POST /api/meetings/:id/ignored", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "Ignore Test",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "ignore-me",
    });
    app = createApp(db, ":memory:");
  });

  it("returns 204 after setting ignored flag", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/ignored`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ignored: true }),
    });
    expect(res.status).toBe(204);
  });
});

describe("POST /api/meetings/:id/action-items/:index/complete and GET /api/meetings/:id/completions", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "Completion Test",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "complete-me",
    });
    app = createApp(db, ":memory:");
  });

  it("returns 204 after completing an action item", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/action-items/0/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "done" }),
    });
    expect(res.status).toBe(204);
  });

  it("GET /completions returns the stored completion", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/completions`);
    expect(res.status).toBe(200);
    const body = await res.json() as { meeting_id: string; item_index: number; note: string }[];
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ meeting_id: meetingId, item_index: 0, note: "done" });
  });
});

describe("GET /api/clients/:name/action-items", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run("Acme", "[]", "[]", "client-acme");
    meetingId = ingestMeeting(db, {
      title: "Acme Weekly",
      timestamp: "2026-03-01T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHi.",
      turns: [],
      sourceFilename: "acme-weekly-1",
    });
    db.prepare("INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, open_questions, risk_items, additional_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      meetingId, "Summary", "[]", "[]",
      JSON.stringify([{ description: "Fix bug", owner: "Alice", requester: "Bob", due_date: null, priority: "critical" }]),
      "[]", "[]", "[]",
    );
    storeDetection(db, meetingId, [{ client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "participant" }]);
    app = createApp(db, ":memory:");
  });

  it("returns 200 with action items array for known client", async () => {
    const res = await app.request("/api/clients/Acme/action-items");
    expect(res.status).toBe(200);
    const body = await res.json() as { description: string; priority: string }[];
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ description: "Fix bug", priority: "critical", meeting_id: meetingId });
  });

  it("returns empty array for unknown client", async () => {
    const res = await app.request("/api/clients/Unknown/action-items");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("filters action items by after query param", async () => {
    const res = await app.request("/api/clients/Acme/action-items?after=2026-03-02");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("filters action items by before query param", async () => {
    const res = await app.request("/api/clients/Acme/action-items?before=2026-02-28");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("returns items within date range query params", async () => {
    const res = await app.request("/api/clients/Acme/action-items?after=2026-02-28&before=2026-03-02");
    expect(res.status).toBe(200);
    const body = await res.json() as { description: string }[];
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ description: "Fix bug" });
  });
});

describe("GET /api/templates", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    app = createApp(db, ":memory:");
  });

  it("returns sorted list of template names", async () => {
    const res = await app.request("/api/templates");
    expect(res.status).toBe(200);
    const body = await res.json() as string[];
    expect(body).toEqual(["jira-epic", "jira-ticket", "team-actions", "thread-discovery"]);
  });
});

describe("POST /api/artifacts/batch", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId1: string;
  let meetingId2: string;
  const baseArtifact: Artifact = {
    summary: "Test summary",
    decisions: [{ text: "Use TypeScript", decided_by: "Team" }],
    proposed_features: ["Feature A"],
    action_items: [{ description: "Do thing", owner: "Alice", requester: "Bob", due_date: null, priority: "normal" }],
    open_questions: ["What about X?"],
    risk_items: [{ category: "engineering", description: "Complexity" }],
    additional_notes: [],
    milestones: [],
  };

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    meetingId1 = ingestMeeting(db, {
      title: "Meeting Alpha",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "hello",
      turns: [],
      sourceFilename: "alpha-1",
    });
    storeArtifact(db, meetingId1, { ...baseArtifact, summary: "Alpha summary" });

    meetingId2 = ingestMeeting(db, {
      title: "Meeting Beta",
      timestamp: "2026-02-25T10:00:00.000Z",
      participants: [],
      rawTranscript: "world",
      turns: [],
      sourceFilename: "beta-1",
    });
    storeArtifact(db, meetingId2, { ...baseArtifact, summary: "Beta summary" });

    app = createApp(db, ":memory:");
  });

  it("should return artifacts for valid meeting IDs", async () => {
    const res = await app.request("/api/artifacts/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingIds: [meetingId1, meetingId2] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body[meetingId1]).toMatchObject({ summary: "Alpha summary" });
    expect(body[meetingId2]).toMatchObject({ summary: "Beta summary" });
  });

  it("should return null for stale/deleted meeting IDs", async () => {
    const res = await app.request("/api/artifacts/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingIds: [meetingId1, "nonexistent-id"] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body[meetingId1]).toMatchObject({ summary: "Alpha summary" });
    expect(body["nonexistent-id"]).toBe(null);
  });

  it("should return empty object for empty meetingIds array", async () => {
    const res = await app.request("/api/artifacts/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingIds: [] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toEqual({});
  });
});

const SPLIT_TRANSCRIPT =
  "Alice | 00:00\nWelcome\n\n" +
  "Bob | 00:15\nThanks\n\n" +
  "Alice | 00:30\nGood meeting\n\n" +
  "Bob | 01:00\nAgreed\n\n" +
  "Alice | 01:28\nBye\n\n";

describe("POST /api/meetings/:id/split", () => {
  let app: ReturnType<typeof createApp>;
  let db: ReturnType<typeof createDb>;
  let meetingId: string;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "Weekly Standup",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: SPLIT_TRANSCRIPT,
      sourceFilename: "weekly-standup-split-test.md",
    });
    app = createApp(db, ":memory:");
  });

  it("returns 200 with SplitResult for valid durations", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/split`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durations: [60, 30] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { source_meeting_id: string; segments: unknown[] };
    expect(body.source_meeting_id).toBe(meetingId);
    expect(body.segments).toHaveLength(2);
  });

  it("returns 404 for nonexistent meeting", async () => {
    const res = await app.request("/api/meetings/no-such-id/split", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durations: [60, 30] }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 400 for single-element durations", async () => {
    const unspentId = ingestMeeting(db, {
      title: "Another Meeting",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: SPLIT_TRANSCRIPT,
      sourceFilename: "another-split-test.md",
    });
    const res = await app.request(`/api/meetings/${unspentId}/split`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durations: [60] }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for already-ignored meeting", async () => {
    const ignoredId = ingestMeeting(db, {
      title: "Archived Meeting",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: SPLIT_TRANSCRIPT,
      sourceFilename: "archived-split-test.md",
    });
    db.prepare("UPDATE meetings SET ignored = 1 WHERE id = ?").run(ignoredId);
    const res = await app.request(`/api/meetings/${ignoredId}/split`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durations: [60, 30] }),
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/meetings/:id/lineage", () => {
  let app: ReturnType<typeof createApp>;
  let sourceId: string;
  let childId1: string;
  let unsplitId: string;

  beforeAll(async () => {
    const db = createDb(":memory:");
    migrate(db);
    sourceId = ingestMeeting(db, {
      title: "Source Meeting",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: SPLIT_TRANSCRIPT,
      sourceFilename: "lineage-source.md",
    });
    unsplitId = ingestMeeting(db, {
      title: "Unsplit Meeting",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: SPLIT_TRANSCRIPT,
      sourceFilename: "lineage-unsplit.md",
    });
    const { segments } = await splitMeeting(db, sourceId, [60, 30]);
    childId1 = segments[0].meeting_id;
    app = createApp(db, ":memory:");
  });

  it("lineage of a split source returns null source, 2 children, and null segment_index", async () => {
    const res = await app.request(`/api/meetings/${sourceId}/lineage`);
    expect(res.status).toBe(200);
    const body = await res.json() as { source: unknown; children: unknown[]; segment_index: number | null };
    expect(body.source).toBeNull();
    expect(body.children).toHaveLength(2);
    expect(body.segment_index).toBeNull();
  });

  it("lineage of a child returns the source, empty children, and correct segment_index", async () => {
    const res = await app.request(`/api/meetings/${childId1}/lineage`);
    expect(res.status).toBe(200);
    const body = await res.json() as { source: { id: string } | null; children: unknown[]; segment_index: number | null };
    expect(body.source?.id).toBe(sourceId);
    expect(body.children).toHaveLength(0);
    expect(body.segment_index).toBe(1);
  });

  it("lineage of an unsplit meeting returns null source and empty children", async () => {
    const res = await app.request(`/api/meetings/${unsplitId}/lineage`);
    expect(res.status).toBe(200);
    const body = await res.json() as { source: unknown; children: unknown[]; segment_index: number | null };
    expect(body.source).toBeNull();
    expect(body.children).toHaveLength(0);
    expect(body.segment_index).toBeNull();
  });
});

const REEXTRACT_TRANSCRIPT =
  "Alice | 00:00\nWelcome\n\n" +
  "Bob | 00:15\nThanks\n\n" +
  "Alice | 00:30\nGood meeting\n\n" +
  "Bob | 01:00\nAgreed\n\n" +
  "Alice | 01:28\nBye\n\n";

describe("POST /api/meetings/:id/split with re-extraction", () => {
  let db: ReturnType<typeof createDb>;
  let app: ReturnType<typeof createApp>;
  let meetingId: string;
  const mockSession = {} as InferenceSession & { _tokenizer: unknown };
  const mockVdb = {} as VectorDb;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "Weekly Standup",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: REEXTRACT_TRANSCRIPT,
      sourceFilename: "weekly-standup-reextract-test.md",
    });
    const llm = createLlmAdapter({ type: "stub" });
    app = createApp(db, ":memory:", llm, { session: mockSession, vdb: mockVdb });
  });

  it("returns split result and stores an artifact for each segment", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/split`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durations: [60, 30] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { source_meeting_id: string; segments: Array<{ meeting_id: string }> };
    expect(body.source_meeting_id).toBe(meetingId);
    expect(body.segments).toHaveLength(2);
    for (const seg of body.segments) {
      const artifact = db.prepare("SELECT meeting_id FROM artifacts WHERE meeting_id = ?").get(seg.meeting_id);
      expect(artifact).toBeTruthy();
    }
  });
});
