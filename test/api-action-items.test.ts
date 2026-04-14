import { describe, it, expect, beforeAll, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { storeArtifact, generateShortId } from "../core/extractor.js";
import type { Artifact } from "../core/extractor.js";
import { createApp } from "../api/server.js";

vi.mock("../core/meeting-pipeline.js", () => ({
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

function seedMeeting(db: ReturnType<typeof createDb>, id: string): void {
  db.prepare(
    "INSERT INTO meetings (id, title, date, participants, raw_transcript, source_filename, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(id, `Meeting ${id}`, "2026-01-15", "[]", "transcript", `${id}.txt`, new Date().toISOString());
}

function makeArtifact(actionItems: Artifact["action_items"]): Artifact {
  return {
    summary: "test summary",
    decisions: [],
    proposed_features: [],
    action_items: actionItems,
    open_questions: [],
    risk_items: [],
    additional_notes: [],
    milestones: [],
  };
}

describe("POST /api/action-items/complete", () => {
  const m1 = "meeting-aaa";
  const m2 = "meeting-bbb";
  let app: ReturnType<typeof createApp>;
  let sid_m1_0: string;
  let sid_m2_0: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    seedMeeting(db, m1);
    seedMeeting(db, m2);

    storeArtifact(db, m1, makeArtifact([
      { description: "Draft roadmap", owner: "Alice", requester: "", due_date: null, priority: "normal" },
    ]));
    storeArtifact(db, m2, makeArtifact([
      { description: "Send invoice", owner: "Charlie", requester: "", due_date: null, priority: "low" },
    ]));

    sid_m1_0 = generateShortId(m1, 0);
    sid_m2_0 = generateShortId(m2, 0);
    app = createApp(db, ":memory:");
  });

  it("marks items complete and returns per-item results", async () => {
    const res = await app.request("/api/action-items/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ short_ids: [sid_m1_0, sid_m2_0], note: "batch done" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      results: [
        { short_id: sid_m1_0, status: "completed" },
        { short_id: sid_m2_0, status: "completed" },
      ],
    });
  });

  it("returns 400 for empty short_ids array", async () => {
    const res = await app.request("/api/action-items/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ short_ids: [] }),
    });

    expect(res.status).toBe(400);
  });

  it("handles mix of valid and invalid short_ids", async () => {
    const res = await app.request("/api/action-items/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ short_ids: [sid_m1_0, "zzzzzz"] }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      results: [
        { short_id: sid_m1_0, status: "completed" },
        { short_id: "zzzzzz", status: "not_found" },
      ],
    });
  });
});

describe("POST /api/action-items/uncomplete", () => {
  const m1 = "meeting-ccc";
  let app: ReturnType<typeof createApp>;
  let sid_m1_0: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    seedMeeting(db, m1);

    storeArtifact(db, m1, makeArtifact([
      { description: "Draft roadmap", owner: "Alice", requester: "", due_date: null, priority: "normal" },
    ]));

    sid_m1_0 = generateShortId(m1, 0);

    db.prepare(
      "INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES (?, ?, ?, ?, ?)",
    ).run(`${m1}:0`, m1, 0, new Date().toISOString(), "done");

    app = createApp(db, ":memory:");
  });

  it("reverts completion and returns per-item results", async () => {
    const res = await app.request("/api/action-items/uncomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ short_ids: [sid_m1_0] }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      results: [
        { short_id: sid_m1_0, status: "uncompleted" },
      ],
    });
  });

  it("returns not_found for unknown short_ids", async () => {
    const res = await app.request("/api/action-items/uncomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ short_ids: ["zzzzzz"] }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      results: [
        { short_id: "zzzzzz", status: "not_found" },
      ],
    });
  });

  it("returns 400 for empty short_ids array", async () => {
    const res = await app.request("/api/action-items/uncomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ short_ids: [] }),
    });

    expect(res.status).toBe(400);
  });
});
