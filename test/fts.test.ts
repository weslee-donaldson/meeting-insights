import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { storeArtifact } from "../core/extractor.js";
import { ingestMeeting } from "../core/ingest.js";
import { updateFts, populateFts, searchFts, sanitizeFtsQuery, ensureFtsCurrent, filterBySearchFields } from "../core/fts.js";
import type { Database } from "../core/db.js";

let db: Database;
let meetingId: string;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  meetingId = ingestMeeting(db, {
    timestamp: "2026-01-10T10:00:00Z",
    title: "API Integration Meeting",
    participants: [],
    turns: [],
    rawTranscript: "",
    sourceFilename: "fts-test-1",
  });
  storeArtifact(db, meetingId, {
    summary: "Discussed REST API integration and DLQ error handling",
    decisions: [{ text: "Use Recurly Commerce for billing", decided_by: "Alice" }],
    proposed_features: ["Dead letter queue for webhooks"],
    action_items: [{ description: "Set up DLQ monitoring dashboard", owner: "Bob", requester: "Alice", due_date: null }],
    open_questions: ["Which message broker for DLQ?"],
    risk_items: ["DLQ backlog could grow unbounded"],
  });
});

describe("updateFts", () => {
  it("inserts FTS content for a meeting and is searchable via MATCH", () => {
    updateFts(db, meetingId);
    const rows = db.prepare("SELECT meeting_id FROM artifact_fts WHERE artifact_fts MATCH 'DLQ'").all() as { meeting_id: string }[];
    expect(rows.length).toBe(1);
    expect(rows[0].meeting_id).toBe(meetingId);
  });

  it("replaces existing FTS content on re-call (idempotent)", () => {
    updateFts(db, meetingId);
    updateFts(db, meetingId);
    const rows = db.prepare("SELECT meeting_id FROM artifact_fts WHERE artifact_fts MATCH 'DLQ'").all() as { meeting_id: string }[];
    expect(rows.length).toBe(1);
  });

  it("includes decisions, features, action items, questions, and risks in content", () => {
    updateFts(db, meetingId);
    expect(db.prepare("SELECT meeting_id FROM artifact_fts WHERE artifact_fts MATCH 'Recurly'").all().length).toBe(1);
    expect(db.prepare("SELECT meeting_id FROM artifact_fts WHERE artifact_fts MATCH 'webhook'").all().length).toBe(1);
    expect(db.prepare("SELECT meeting_id FROM artifact_fts WHERE artifact_fts MATCH 'monitoring'").all().length).toBe(1);
    expect(db.prepare("SELECT meeting_id FROM artifact_fts WHERE artifact_fts MATCH 'broker'").all().length).toBe(1);
    expect(db.prepare("SELECT meeting_id FROM artifact_fts WHERE artifact_fts MATCH 'backlog'").all().length).toBe(1);
  });
});

describe("sanitizeFtsQuery", () => {
  it("strips FTS5 special characters", () => {
    expect(sanitizeFtsQuery("hello*world")).toBe("hello world");
  });

  it("returns empty string for all-special input", () => {
    expect(sanitizeFtsQuery("***")).toBe("");
  });

  it("preserves normal text", () => {
    expect(sanitizeFtsQuery("DLQ dead letter queue")).toBe("DLQ dead letter queue");
  });
});

describe("searchFts", () => {
  it("returns matching meeting_id and bm25 score for exact keyword", () => {
    updateFts(db, meetingId);
    const results = searchFts(db, "DLQ", 10);
    expect(results.length).toBe(1);
    expect(results[0].meeting_id).toBe(meetingId);
    expect(typeof results[0].score).toBe("number");
  });

  it("returns empty array for unmatched query", () => {
    const results = searchFts(db, "xyznonexistent", 10);
    expect(results).toEqual([]);
  });

  it("handles special characters without crashing", () => {
    expect(() => searchFts(db, "DLQ: what's the * plan?", 10)).not.toThrow();
  });
});

describe("populateFts", () => {
  it("bulk-rebuilds FTS for all meetings with artifacts", () => {
    db.prepare("DELETE FROM artifact_fts").run();
    const meeting2Id = ingestMeeting(db, {
      timestamp: "2026-01-12T10:00:00Z",
      title: "Budget Review",
      participants: [],
      turns: [],
      rawTranscript: "",
      sourceFilename: "fts-test-2",
    });
    storeArtifact(db, meeting2Id, {
      summary: "Quarterly budget review and headcount",
      decisions: [],
      proposed_features: [],
      action_items: [],
      open_questions: [],
      risk_items: [],
    });
    populateFts(db);
    const rows = db.prepare("SELECT DISTINCT meeting_id FROM artifact_fts").all() as { meeting_id: string }[];
    expect(rows.length).toBe(2);
  });
});

describe("field-tagged FTS content", () => {
  it("tags each section with field labels in FTS content", () => {
    updateFts(db, meetingId);
    const row = db.prepare("SELECT content FROM artifact_fts WHERE meeting_id = ?").get(meetingId) as { content: string };
    expect(row.content).toContain("[summary]");
    expect(row.content).toContain("[decisions]");
    expect(row.content).toContain("[action_items]");
    expect(row.content).toContain("[open_questions]");
    expect(row.content).toContain("[risk_items]");
    expect(row.content).toContain("[proposed_features]");
  });

  it("places field tags before their respective section content", () => {
    updateFts(db, meetingId);
    const row = db.prepare("SELECT content FROM artifact_fts WHERE meeting_id = ?").get(meetingId) as { content: string };
    const summaryIdx = row.content.indexOf("[summary]");
    const decisionsIdx = row.content.indexOf("[decisions]");
    const recurlyIdx = row.content.indexOf("Recurly");
    expect(summaryIdx).toBeLessThan(decisionsIdx);
    expect(decisionsIdx).toBeLessThan(recurlyIdx);
  });
});

describe("ensureFtsCurrent", () => {
  it("rebuilds FTS when existing content lacks field tags", () => {
    db.prepare("DELETE FROM artifact_fts").run();
    db.prepare("INSERT INTO artifact_fts (meeting_id, content) VALUES (?, ?)").run(meetingId, "old untagged content");
    ensureFtsCurrent(db);
    const row = db.prepare("SELECT content FROM artifact_fts WHERE meeting_id = ?").get(meetingId) as { content: string };
    expect(row.content).toContain("[summary]");
  });

  it("does not rebuild FTS when content already has field tags", () => {
    updateFts(db, meetingId);
    const before = db.prepare("SELECT content FROM artifact_fts WHERE meeting_id = ?").get(meetingId) as { content: string };
    ensureFtsCurrent(db);
    const after = db.prepare("SELECT content FROM artifact_fts WHERE meeting_id = ?").get(meetingId) as { content: string };
    expect(after.content).toBe(before.content);
  });

  it("rebuilds FTS when table is empty", () => {
    db.prepare("DELETE FROM artifact_fts").run();
    ensureFtsCurrent(db);
    const rows = db.prepare("SELECT meeting_id FROM artifact_fts").all() as { meeting_id: string }[];
    expect(rows.length).toBeGreaterThan(0);
  });
});

describe("filterBySearchFields", () => {
  it("keeps result when query term appears in the specified field section", () => {
    updateFts(db, meetingId);
    const ftsResults = searchFts(db, "DLQ", 10);
    const filtered = filterBySearchFields(db, ftsResults, "DLQ", ["summary"]);
    expect(filtered.length).toBe(1);
    expect(filtered[0].meeting_id).toBe(meetingId);
  });

  it("removes result when query term only appears outside specified fields", () => {
    updateFts(db, meetingId);
    const ftsResults = searchFts(db, "Recurly", 10);
    const filtered = filterBySearchFields(db, ftsResults, "Recurly", ["summary"]);
    expect(filtered).toEqual([]);
  });

  it("returns all results when searchFields is empty", () => {
    updateFts(db, meetingId);
    const ftsResults = searchFts(db, "DLQ", 10);
    const filtered = filterBySearchFields(db, ftsResults, "DLQ", []);
    expect(filtered.length).toBe(1);
  });

  it("matches across multiple specified fields", () => {
    updateFts(db, meetingId);
    const ftsResults = searchFts(db, "Recurly", 10);
    const filtered = filterBySearchFields(db, ftsResults, "Recurly", ["summary", "decisions"]);
    expect(filtered.length).toBe(1);
  });
});
