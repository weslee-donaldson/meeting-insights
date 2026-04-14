import { describe, it, expect, beforeEach } from "vitest";
import { createDb, type Database } from "../core/db.js";
import { migrate } from "../core/db.js";
import { storeArtifact, generateShortId } from "../core/extractor.js";
import { resolveShortIds } from "../core/action-item-resolver.js";
import type { Artifact } from "../core/extractor.js";

function seedMeeting(db: Database, id: string): void {
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

describe("resolveShortIds", () => {
  let db: Database;
  const m1 = "meeting-aaa";
  const m2 = "meeting-bbb";
  let sid_m1_0: string;
  let sid_m1_1: string;
  let sid_m2_0: string;

  beforeEach(() => {
    db = createDb(":memory:");
    migrate(db);

    seedMeeting(db, m1);
    seedMeeting(db, m2);

    storeArtifact(db, m1, makeArtifact([
      { description: "Draft roadmap", owner: "Alice", requester: "", due_date: null, priority: "normal" },
      { description: "Review PR", owner: "Bob", requester: "", due_date: null, priority: "critical" },
    ]));

    storeArtifact(db, m2, makeArtifact([
      { description: "Send invoice", owner: "Charlie", requester: "", due_date: null, priority: "low" },
    ]));

    sid_m1_0 = generateShortId(m1, 0);
    sid_m1_1 = generateShortId(m1, 1);
    sid_m2_0 = generateShortId(m2, 0);
  });

  it("resolves known short_ids from multiple meetings", () => {
    const result = resolveShortIds(db, [sid_m1_0, sid_m2_0]);

    expect(result).toEqual({
      resolved: [
        { short_id: sid_m1_0, meeting_id: m1, item_index: 0 },
        { short_id: sid_m2_0, meeting_id: m2, item_index: 0 },
      ],
      not_found: [],
    });
  });

  it("returns not_found for unknown short_ids", () => {
    const result = resolveShortIds(db, ["zzzzzz"]);

    expect(result).toEqual({
      resolved: [],
      not_found: ["zzzzzz"],
    });
  });

  it("handles mix of valid and invalid short_ids", () => {
    const result = resolveShortIds(db, [sid_m1_0, "zzzzzz", sid_m1_1]);

    expect(result).toEqual({
      resolved: [
        { short_id: sid_m1_0, meeting_id: m1, item_index: 0 },
        { short_id: sid_m1_1, meeting_id: m1, item_index: 1 },
      ],
      not_found: ["zzzzzz"],
    });
  });

  it("returns empty results for empty input", () => {
    const result = resolveShortIds(db, []);

    expect(result).toEqual({
      resolved: [],
      not_found: [],
    });
  });

  it("deduplicates input short_ids", () => {
    const result = resolveShortIds(db, [sid_m1_0, sid_m1_0]);

    expect(result).toEqual({
      resolved: [
        { short_id: sid_m1_0, meeting_id: m1, item_index: 0 },
      ],
      not_found: [],
    });
  });
});
