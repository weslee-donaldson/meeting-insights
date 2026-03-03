import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import { buildLabeledContext } from "../core/labeled-context.js";
import { recordMention } from "../core/item-dedup.js";

function makeArtifact() {
  return {
    summary: "We discussed the roadmap.",
    decisions: [{ text: "Use TypeScript", decided_by: "CEO" }],
    proposed_features: [],
    action_items: [{ description: "Write tests", owner: "Alice", requester: "Bob", due_date: null }],
    open_questions: ["When to launch?"],
    risk_items: [],
    additional_notes: [],
  };
}

describe("buildLabeledContext", () => {
  let db: ReturnType<typeof createDb>;
  let id1: string;
  let id2: string;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);

    id1 = ingestMeeting(db, {
      title: "Alpha Meeting",
      timestamp: "2026-02-25T10:00:00.000Z",
      participants: [],
      rawTranscript: "Alice | 00:00\nHello.",
      turns: [],
      sourceFilename: "alpha",
    });
    storeArtifact(db, id1, makeArtifact());

    id2 = ingestMeeting(db, {
      title: "Beta Meeting",
      timestamp: "2026-02-26T10:00:00.000Z",
      participants: [],
      rawTranscript: "Bob | 00:00\nHi.",
      turns: [],
      sourceFilename: "beta",
    });
    storeArtifact(db, id2, makeArtifact());
  });

  it("should return labeled blocks for 2 meeting IDs", () => {
    const result = buildLabeledContext(db, [id1, id2]);
    expect(result.contextText).toContain("[M1]");
    expect(result.contextText).toContain("[M2]");
  });

  it("should sort meetings newest first", () => {
    const result = buildLabeledContext(db, [id1, id2]);
    const m1pos = result.contextText.indexOf("[M1]");
    const betaPos = result.contextText.indexOf("Beta Meeting");
    expect(betaPos).toBeGreaterThanOrEqual(m1pos);
    expect(betaPos).toBeLessThan(result.contextText.indexOf("Alpha Meeting"));
  });

  it("should return correct charCount equal to contextText length", () => {
    const result = buildLabeledContext(db, [id1, id2]);
    expect(result.charCount).toBe(result.contextText.length);
  });

  it("should return meetings array with id, title, date", () => {
    const result = buildLabeledContext(db, [id1, id2]);
    expect(result.meetings).toHaveLength(2);
    expect(result.meetings[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      date: expect.any(String),
    });
  });

  it("formats decisions with decided_by and action items with requester", () => {
    const result = buildLabeledContext(db, [id1]);
    expect(result.contextText).toContain("- Use TypeScript (decided by CEO)");
    expect(result.contextText).toContain("- Write tests (Alice, requested by Bob)");
  });

  it("should return empty context for unknown meeting IDs", () => {
    const result = buildLabeledContext(db, ["nonexistent-id"]);
    expect(result.contextText).toBe("");
    expect(result.charCount).toBe(0);
    expect(result.meetings).toHaveLength(0);
  });

  it("annotates items with mention count when raised multiple times", () => {
    const extraId = ingestMeeting(db, {
      title: "Extra Meeting",
      timestamp: "2026-02-27T10:00:00.000Z",
      participants: [],
      rawTranscript: "X | 00:00\nHi.",
      turns: [],
      sourceFilename: "extra",
    });
    recordMention(db, "can-ctx-1", id1, "action_items", 0, "Write tests", "2026-02-25");
    recordMention(db, "can-ctx-1", id2, "action_items", 0, "Write tests", "2026-02-26");
    recordMention(db, "can-ctx-1", extraId, "action_items", 0, "Write tests", "2026-02-27");
    const result = buildLabeledContext(db, [id1]);
    expect(result.contextText).toContain("[raised 3x, first mentioned 2026-02-25]");
  });

  it("does not annotate items with only one mention", () => {
    recordMention(db, "can-ctx-2", id1, "decisions", 0, "Use TypeScript", "2026-02-25");
    const result = buildLabeledContext(db, [id1]);
    const decisionLine = result.contextText.split("\n").find(l => l.includes("Use TypeScript"));
    expect(decisionLine).not.toContain("[raised");
  });
});
