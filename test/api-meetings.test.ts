import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeDetection } from "../core/client-detection.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { createApp } from "../api/server.js";

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
    const body = await res.json() as string[];
    expect(body).toEqual(["TestCo"]);
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
    storeDetection(db, meetingId1, [{ client_name: "TestCo", confidence: 0.8, method: "participant" }]);

    meetingId2 = ingestMeeting(db, {
      title: "OtherCo Planning",
      timestamp: "2026-02-25T10:00:00.000Z",
      participants: [{ id: "2", first_name: "C", last_name: "D", email: "c@otherco.com" }],
      rawTranscript: "C | 00:00\nHi.",
      turns: [],
      sourceFilename: "otherco-plan-1",
    });
    storeDetection(db, meetingId2, [{ client_name: "OtherCo", confidence: 0.8, method: "participant" }]);

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
    storeDetection(db, meetingId, [{ client_name: "Acme", confidence: 0.9, method: "participant" }]);
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
    expect(body).toEqual(["jira-epic", "jira-ticket", "thread-discovery"]);
  });
});
