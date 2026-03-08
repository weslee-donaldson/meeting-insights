import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
});

describe("createDb", () => {
  it("accepts a path and returns a working SQLite connection", () => {
    const result = db.prepare("SELECT 1 AS val").get() as { val: number };
    expect(result).toEqual({ val: 1 });
  });
});

describe("migrate", () => {
  it("creates meetings table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='meetings'").get();
    expect(row).toEqual({ name: "meetings" });
  });

  it("creates artifacts table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='artifacts'").get();
    expect(row).toEqual({ name: "artifacts" });
  });

  it("creates clients table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'").get();
    expect(row).toEqual({ name: "clients" });
  });

  it("creates client_detections table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='client_detections'").get();
    expect(row).toEqual({ name: "client_detections" });
  });

  it("creates clusters table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clusters'").get();
    expect(row).toEqual({ name: "clusters" });
  });

  it("creates meeting_clusters table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='meeting_clusters'").get();
    expect(row).toEqual({ name: "meeting_clusters" });
  });

  it("adds additional_notes column to artifacts", () => {
    const cols = db.prepare("PRAGMA table_info(artifacts)").all() as { name: string }[];
    expect(cols.some(c => c.name === "additional_notes")).toBe(true);
  });

  it("creates action_item_completions table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='action_item_completions'").get();
    expect(row).toEqual({ name: "action_item_completions" });
  });

  it("action_item_completions insert + query round-trip", () => {
    db.prepare("INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES ('c1', 'm1', 0, '2026-03-01T00:00:00Z', 'done')").run();
    const row = db.prepare("SELECT * FROM action_item_completions WHERE id = 'c1'").get() as { id: string; meeting_id: string; item_index: number; completed_at: string; note: string };
    expect(row).toEqual({ id: "c1", meeting_id: "m1", item_index: 0, completed_at: "2026-03-01T00:00:00Z", note: "done" });
  });

  it("creates item_mentions table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='item_mentions'").get();
    expect(row).toEqual({ name: "item_mentions" });
  });

  it("item_mentions insert + query round-trip", () => {
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('im-m1', 'Standup', '2026-01-15')").run();
    db.prepare("INSERT INTO item_mentions (canonical_id, meeting_id, item_type, item_index, item_text, first_mentioned_at) VALUES ('can1', 'im-m1', 'action_items', 0, 'Deploy to prod', '2026-01-15')").run();
    const row = db.prepare("SELECT * FROM item_mentions WHERE canonical_id = 'can1'").get() as { canonical_id: string; meeting_id: string; item_type: string; item_index: number; item_text: string; first_mentioned_at: string };
    expect(row).toEqual({
      canonical_id: "can1",
      meeting_id: "im-m1",
      item_type: "action_items",
      item_index: 0,
      item_text: "Deploy to prod",
      first_mentioned_at: "2026-01-15",
    });
  });

  it("creates artifact_fts virtual table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='artifact_fts'").get();
    expect(row).toEqual({ name: "artifact_fts" });
  });

  it("creates insights table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='insights'").get();
    expect(row).toEqual({ name: "insights" });
  });

  it("creates insight_meetings table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='insight_meetings'").get();
    expect(row).toEqual({ name: "insight_meetings" });
  });

  it("creates insight_messages table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='insight_messages'").get();
    expect(row).toEqual({ name: "insight_messages" });
  });

  it("is idempotent — calling migrate twice does not throw", () => {
    expect(() => migrate(db)).not.toThrow();
  });
});
