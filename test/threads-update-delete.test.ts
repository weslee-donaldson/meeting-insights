import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, updateThread, deleteThread, getThread } from "../core/threads.js";

let db: Database;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("Acme", "[]", "[]");
});

describe("updateThread", () => {
  it("updates title and updated_at, leaving other fields unchanged", () => {
    const thread = createThread(db, { client_name: "Acme", title: "Old title", shorthand: "OT", description: "desc", criteria_prompt: "crit" });
    const updated = updateThread(db, thread.id, { title: "New title" });
    expect(updated.title).toBe("New title");
    expect(updated.shorthand).toBe("OT");
    expect(updated.description).toBe("desc");
    expect(updated.criteria_prompt).toBe("crit");
    expect(updated.updated_at >= thread.updated_at).toBe(true);
  });

  it("updates status to resolved", () => {
    const thread = createThread(db, { client_name: "Acme", title: "My thread", shorthand: "MT", description: "", criteria_prompt: "" });
    const updated = updateThread(db, thread.id, { status: "resolved" });
    expect(updated.status).toBe("resolved");
  });

  it("updates criteria_prompt and sets criteria_changed_at to now", () => {
    const thread = createThread(db, { client_name: "Acme", title: "My thread", shorthand: "MT", description: "", criteria_prompt: "old criteria" });
    const before = thread.criteria_changed_at;
    const updated = updateThread(db, thread.id, { criteria_prompt: "new criteria" });
    expect(updated.criteria_prompt).toBe("new criteria");
    expect(updated.criteria_changed_at >= before).toBe(true);
  });

  it("does not change criteria_changed_at when criteria_prompt unchanged", () => {
    const thread = createThread(db, { client_name: "Acme", title: "My thread", shorthand: "MT", description: "", criteria_prompt: "same" });
    const updated = updateThread(db, thread.id, { title: "Different title" });
    expect(updated.criteria_changed_at).toBe(thread.criteria_changed_at);
  });

  it("updates summary field", () => {
    const thread = createThread(db, { client_name: "Acme", title: "T", shorthand: "T", description: "", criteria_prompt: "" });
    const updated = updateThread(db, thread.id, { summary: "New summary here." });
    expect(updated.summary).toBe("New summary here.");
  });
});

describe("deleteThread", () => {
  it("deletes the thread from the database", () => {
    const thread = createThread(db, { client_name: "Acme", title: "To delete", shorthand: "TD", description: "", criteria_prompt: "" });
    deleteThread(db, thread.id);
    expect(getThread(db, thread.id)).toBeNull();
  });

  it("cascades delete to thread_meetings", () => {
    const thread = createThread(db, { client_name: "Acme", title: "With meetings", shorthand: "WM", description: "", criteria_prompt: "" });
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m1', 'Some meeting', '2026-01-01')").run();
    db.prepare("INSERT INTO thread_meetings (thread_id, meeting_id, relevance_summary, relevance_score, evaluated_at) VALUES (?, 'm1', '', 50, ?)").run(thread.id, new Date().toISOString());
    deleteThread(db, thread.id);
    const rows = db.prepare("SELECT * FROM thread_meetings WHERE thread_id = ?").all(thread.id);
    expect(rows).toHaveLength(0);
  });

  it("cascades delete to thread_messages", () => {
    const thread = createThread(db, { client_name: "Acme", title: "With messages", shorthand: "WMS", description: "", criteria_prompt: "" });
    db.prepare("INSERT INTO thread_messages (id, thread_id, role, content, created_at) VALUES ('msg1', ?, 'user', 'hello', ?)").run(thread.id, new Date().toISOString());
    deleteThread(db, thread.id);
    const rows = db.prepare("SELECT * FROM thread_messages WHERE thread_id = ?").all(thread.id);
    expect(rows).toHaveLength(0);
  });
});
