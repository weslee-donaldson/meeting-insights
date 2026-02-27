import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../src/db.js";
import { createLlmAdapter } from "../src/llm-adapter.js";
import { extractSummary, validateArtifact, storeArtifact, getArtifact } from "../src/extractor.js";
import { ingestMeeting } from "../src/ingest.js";
import type { ParsedMeeting } from "../src/parser.js";
import type { Database } from "better-sqlite3";
import type { LlmAdapter } from "../src/llm-adapter.js";

let db: Database;
let adapter: LlmAdapter;
let meetingId: string;

const parsed: ParsedMeeting = {
  timestamp: "2026-01-19T15:43:52.210Z",
  title: "Test Meeting",
  participants: [],
  turns: [
    { speaker_name: "Alice", timestamp: "00:01", text: "We decided to go with approach A." },
    { speaker_name: "Bob", timestamp: "00:30", text: "Agreed. Let me follow up on the timeline." },
  ],
  rawTranscript: "Attendance:\nTranscript:\nAlice | 00:01\nWe decided to go with approach A.",
  sourceFilename: "test-meeting",
};

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  adapter = createLlmAdapter({ type: "stub" });
  meetingId = ingestMeeting(db, parsed);
});

describe("extractSummary", () => {
  it("returns meeting_summary string", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    expect(typeof artifact.summary).toBe("string");
    expect(artifact.summary.length).toBeGreaterThan(0);
  });

  it("returns decisions array", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    expect(Array.isArray(artifact.decisions)).toBe(true);
  });

  it("returns proposed_features array", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    expect(Array.isArray(artifact.proposed_features)).toBe(true);
  });

  it("returns action_items with description, owner, due_date", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    expect(Array.isArray(artifact.action_items)).toBe(true);
    expect(artifact.action_items[0]).toHaveProperty("description");
    expect(artifact.action_items[0]).toHaveProperty("owner");
    expect(artifact.action_items[0]).toHaveProperty("due_date");
  });

  it("returns technical_topics array", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    expect(Array.isArray(artifact.technical_topics)).toBe(true);
  });

  it("returns open_questions array", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    expect(Array.isArray(artifact.open_questions)).toBe(true);
  });

  it("returns risk_items array", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    expect(Array.isArray(artifact.risk_items)).toBe(true);
  });

  it("chunks long transcripts and merges results", async () => {
    const manyTurns = Array.from({ length: 40 }, (_, i) => ({
      speaker_name: "Alice",
      timestamp: "00:01",
      text: Array.from({ length: 30 }, () => "word").join(" "),
    }));
    const artifact = await extractSummary(adapter, manyTurns, 50);
    expect(typeof artifact.summary).toBe("string");
  });
});

const VALID_BASE = {
  summary: "ok",
  decisions: [],
  proposed_features: [],
  action_items: [],
  technical_topics: [],
  open_questions: [],
  risk_items: [],
};

describe("validateArtifact", () => {
  it("rejects response missing required keys", () => {
    expect(() => validateArtifact({ summary: "ok" })).toThrow();
  });

  it("rejects response containing non-JSON prose", () => {
    expect(() => validateArtifact("Here is a summary of the meeting" as unknown as object)).toThrow();
  });

  it("throws when additional_notes is missing", () => {
    expect(() => validateArtifact(VALID_BASE)).toThrow(/missing required key: additional_notes/);
  });

  it("normalizes additional_notes to [] when it is a string", () => {
    const result = validateArtifact({ ...VALID_BASE, additional_notes: "bad" });
    expect(result.additional_notes).toEqual([]);
  });

  it("normalizes additional_notes to [] when elements are null or numbers", () => {
    expect(validateArtifact({ ...VALID_BASE, additional_notes: [null] }).additional_notes).toEqual([]);
    expect(validateArtifact({ ...VALID_BASE, additional_notes: [42] }).additional_notes).toEqual([]);
  });

  it("accepts valid artifact with additional_notes", () => {
    const result = validateArtifact({ ...VALID_BASE, additional_notes: [{ category: "ctx", note: "x" }] });
    expect(result.additional_notes).toEqual([{ category: "ctx", note: "x" }]);
  });
});

describe("storeArtifact / getArtifact", () => {
  it("inserts artifact and retrieves it by meeting_id", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    storeArtifact(db, meetingId, artifact);
    const stored = getArtifact(db, meetingId);
    expect(stored.meeting_id).toBe(meetingId);
    expect(JSON.parse(stored.decisions)).toEqual(artifact.decisions);
  });
});
