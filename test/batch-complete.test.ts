import { describe, it, expect, beforeEach } from "vitest";
import { createDb, type Database } from "../core/db.js";
import { migrate } from "../core/db.js";
import { storeArtifact, generateShortId } from "../core/pipeline/extractor.js";
import type { Artifact } from "../core/pipeline/extractor.js";
import { handleBatchCompleteItems, handleBatchUncompleteItems } from "../electron-ui/electron/handlers/meetings.js";

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

describe("handleBatchCompleteItems", () => {
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

  it("marks multiple items complete across meetings", () => {
    const result = handleBatchCompleteItems(db, [sid_m1_0, sid_m2_0], "batch done");

    expect(result).toEqual({
      results: [
        { short_id: sid_m1_0, status: "completed" },
        { short_id: sid_m2_0, status: "completed" },
      ],
    });

    const rows = db.prepare("SELECT * FROM action_item_completions ORDER BY id").all() as { id: string; note: string }[];
    expect(rows).toEqual([
      expect.objectContaining({ id: `${m1}:0`, note: "batch done" }),
      expect.objectContaining({ id: `${m2}:0`, note: "batch done" }),
    ]);
  });

  it("returns not_found for unknown short_ids", () => {
    const result = handleBatchCompleteItems(db, ["zzzzzz"], "");

    expect(result).toEqual({
      results: [
        { short_id: "zzzzzz", status: "not_found" },
      ],
    });
  });

  it("handles mix of valid and invalid short_ids", () => {
    const result = handleBatchCompleteItems(db, [sid_m1_0, "zzzzzz"], "note");

    expect(result).toEqual({
      results: [
        { short_id: sid_m1_0, status: "completed" },
        { short_id: "zzzzzz", status: "not_found" },
      ],
    });
  });
});

describe("handleBatchUncompleteItems", () => {
  let db: Database;
  const m1 = "meeting-aaa";
  let sid_m1_0: string;
  let sid_m1_1: string;

  beforeEach(() => {
    db = createDb(":memory:");
    migrate(db);

    seedMeeting(db, m1);

    storeArtifact(db, m1, makeArtifact([
      { description: "Draft roadmap", owner: "Alice", requester: "", due_date: null, priority: "normal" },
      { description: "Review PR", owner: "Bob", requester: "", due_date: null, priority: "critical" },
    ]));

    sid_m1_0 = generateShortId(m1, 0);
    sid_m1_1 = generateShortId(m1, 1);

    db.prepare(
      "INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES (?, ?, ?, ?, ?)",
    ).run(`${m1}:0`, m1, 0, new Date().toISOString(), "done");
    db.prepare(
      "INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES (?, ?, ?, ?, ?)",
    ).run(`${m1}:1`, m1, 1, new Date().toISOString(), "done");
  });

  it("reverts completion for resolved items", () => {
    const result = handleBatchUncompleteItems(db, [sid_m1_0]);

    expect(result).toEqual({
      results: [
        { short_id: sid_m1_0, status: "uncompleted" },
      ],
    });

    const remaining = db.prepare("SELECT id FROM action_item_completions").all() as { id: string }[];
    expect(remaining).toEqual([{ id: `${m1}:1` }]);
  });

  it("returns not_found for unknown short_ids", () => {
    const result = handleBatchUncompleteItems(db, ["zzzzzz"]);

    expect(result).toEqual({
      results: [
        { short_id: "zzzzzz", status: "not_found" },
      ],
    });
  });
});
