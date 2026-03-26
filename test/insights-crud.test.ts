import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import {
  createInsight,
  getInsight,
  listInsightsByClient,
  updateInsight,
  deleteInsight,
} from "../core/insights.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT INTO clients (name) VALUES ('Acme')").run();
  db.prepare("INSERT INTO clients (name) VALUES ('Globex')").run();
});

describe("createInsight", () => {
  it("stores and returns an insight with generated id and timestamps", () => {
    const result = createInsight(db, {
      client_name: "Acme",
      period_type: "week",
      period_start: "2026-03-02",
      period_end: "2026-03-08",
    });
    expect(result).toEqual({
      id: expect.any(String),
      client_name: "Acme",
      name: "",
      period_type: "week",
      period_start: "2026-03-02",
      period_end: "2026-03-08",
      status: "draft",
      rag_status: "green",
      rag_rationale: "",
      executive_summary: "",
      topic_details: "[]",
      generated_at: expect.any(String),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("stores a custom name when provided", () => {
    const result = createInsight(db, {
      client_name: "Acme",
      period_type: "week",
      period_start: "2026-03-09",
      period_end: "2026-03-15",
      name: "Leadership Weekly",
    });
    expect(result.name).toBe("Leadership Weekly");
  });
});

describe("getInsight", () => {
  it("retrieves an existing insight by id", () => {
    const created = createInsight(db, {
      client_name: "Acme",
      period_type: "day",
      period_start: "2026-03-08",
      period_end: "2026-03-08",
    });
    const result = getInsight(db, created.id);
    expect(result).toEqual(created);
  });

  it("returns null for non-existent id", () => {
    const result = getInsight(db, "non-existent");
    expect(result).toBe(null);
  });
});

describe("listInsightsByClient", () => {
  it("returns only insights for the specified client", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name) VALUES ('Acme')").run();
    db2.prepare("INSERT INTO clients (name) VALUES ('Globex')").run();
    createInsight(db2, { client_name: "Acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    createInsight(db2, { client_name: "Globex", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    createInsight(db2, { client_name: "Acme", period_type: "week", period_start: "2026-03-02", period_end: "2026-03-08" });
    const result = listInsightsByClient(db2, "Acme");
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.client_name === "Acme")).toBe(true);
  });

  it("includes meeting_count for each insight", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name) VALUES ('Acme')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('m1', 'Standup', '2026-03-01')").run();
    const ins = createInsight(db2, { client_name: "Acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    db2.prepare("INSERT INTO insight_meetings (insight_id, meeting_id) VALUES (?, ?)").run(ins.id, "m1");
    const result = listInsightsByClient(db2, "Acme");
    expect(result[0].meeting_count).toBe(1);
  });
});

describe("updateInsight", () => {
  it("updates specified fields and returns the updated insight", () => {
    const created = createInsight(db, {
      client_name: "Acme",
      period_type: "day",
      period_start: "2026-03-08",
      period_end: "2026-03-08",
    });
    const result = updateInsight(db, created.id, {
      status: "final",
      rag_status: "yellow",
      rag_rationale: "Some items pending",
      executive_summary: "Good progress overall",
    });
    expect(result).toEqual({
      ...created,
      status: "final",
      rag_status: "yellow",
      rag_rationale: "Some items pending",
      executive_summary: "Good progress overall",
      updated_at: expect.any(String),
    });
  });

  it("updates insight name", () => {
    const created = createInsight(db, {
      client_name: "Acme",
      period_type: "day",
      period_start: "2026-03-10",
      period_end: "2026-03-10",
    });
    const result = updateInsight(db, created.id, { name: "Renamed Insight" });
    expect(result.name).toBe("Renamed Insight");
  });
});

describe("deleteInsight", () => {
  it("removes insight and cascades to messages and meetings", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    db2.prepare("INSERT INTO clients (name) VALUES ('Acme')").run();
    db2.prepare("INSERT INTO meetings (id, title, date) VALUES ('m1', 'Standup', '2026-03-01')").run();
    const ins = createInsight(db2, { client_name: "Acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" });
    db2.prepare("INSERT INTO insight_meetings (insight_id, meeting_id) VALUES (?, ?)").run(ins.id, "m1");
    db2.prepare("INSERT INTO insight_messages (id, insight_id, role, content, created_at) VALUES ('msg1', ?, 'user', 'hello', '2026-03-01')").run(ins.id);
    deleteInsight(db2, ins.id);
    expect(getInsight(db2, ins.id)).toBe(null);
    expect(db2.prepare("SELECT * FROM insight_meetings WHERE insight_id = ?").all(ins.id)).toEqual([]);
    expect(db2.prepare("SELECT * FROM insight_messages WHERE insight_id = ?").all(ins.id)).toEqual([]);
  });
});
