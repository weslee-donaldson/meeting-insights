import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { storeArtifact } from "../core/extractor.js";
import { ingestMeeting } from "../core/ingest.js";
import { updateFts, populateFts } from "../core/fts.js";
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
