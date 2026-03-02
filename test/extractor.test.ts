import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { extractSummary, validateArtifact, storeArtifact, getArtifact } from "../core/extractor.js";
import { ingestMeeting } from "../core/ingest.js";
import type { ParsedMeeting } from "../core/parser.js";
import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../core/llm-adapter.js";

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

  it("returns additional_notes as array and resolves without error (notes_count + notes_size logged)", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    expect(Array.isArray(artifact.additional_notes)).toBe(true);
    expect(typeof artifact.additional_notes.length).toBe("number");
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

  it("normalizes legacy string decisions to objects with empty decided_by", () => {
    const result = validateArtifact({ ...VALID_BASE, additional_notes: [], decisions: ["Use REST", "OAuth2"] });
    expect(result.decisions).toEqual([
      { text: "Use REST", decided_by: "" },
      { text: "OAuth2", decided_by: "" },
    ]);
  });

  it("preserves structured decisions unchanged", () => {
    const structured = [{ text: "Use REST", decided_by: "Alice" }];
    const result = validateArtifact({ ...VALID_BASE, additional_notes: [], decisions: structured });
    expect(result.decisions).toEqual([{ text: "Use REST", decided_by: "Alice" }]);
  });

  it("accepts valid artifact with additional_notes", () => {
    const result = validateArtifact({ ...VALID_BASE, additional_notes: [{ category: "ctx", note: "x" }] });
    expect(result.additional_notes).toEqual([{ category: "ctx", note: "x" }]);
  });
});

describe("extractSummary with fallback adapter", () => {
  it("returns minimal artifact when adapter returns __fallback sentinel", async () => {
    const fallbackAdapter: LlmAdapter = {
      complete: async () => ({ __fallback: true, raw_text: "not json" }),
    };
    const artifact = await extractSummary(fallbackAdapter, parsed.turns, 8000);
    expect(artifact.summary).toBe("");
    expect(artifact.decisions).toEqual([]);
    expect(artifact.additional_notes).toEqual([]);
  });
});

describe("extractSummary with refinementPrompt", () => {
  const minimalTemplate = "{{client_context}}## Transcript\n\n{{transcript}}";

  it("injects ## Client Context section when refinementPrompt is provided", async () => {
    let capturedContent = "";
    const recordingAdapter: LlmAdapter = {
      complete: async (cap, content) => { capturedContent = content; return adapter.complete(cap, content); },
    };
    await extractSummary(recordingAdapter, parsed.turns, 8000, minimalTemplate, "Stace is the CTO.");
    expect(capturedContent).toContain("## Client Context");
    expect(capturedContent).toContain("Stace is the CTO.");
  });

  it("removes {{client_context}} placeholder when refinementPrompt is omitted", async () => {
    let capturedContent = "";
    const recordingAdapter: LlmAdapter = {
      complete: async (cap, content) => { capturedContent = content; return adapter.complete(cap, content); },
    };
    await extractSummary(recordingAdapter, parsed.turns, 8000, minimalTemplate);
    expect(capturedContent).not.toContain("{{client_context}}");
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

  it("round-trips additional_notes through store/get", async () => {
    const artifact = await extractSummary(adapter, parsed.turns, 8000);
    const stored = getArtifact(db, meetingId);
    expect(JSON.parse(stored.additional_notes)).toEqual(artifact.additional_notes);
  });
});
