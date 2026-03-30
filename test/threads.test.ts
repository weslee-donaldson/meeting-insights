import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import type { Thread, ThreadMeeting, ThreadMessage } from "../core/threads.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
});

describe("migrate - threads tables", () => {
  it("creates threads table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='threads'").get();
    expect(row).toEqual({ name: "threads" });
  });

  it("threads table has all required columns", () => {
    const cols = db.prepare("PRAGMA table_info(threads)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    expect(names).toContain("id");
    expect(names).toContain("client_name");
    expect(names).toContain("client_id");
    expect(names).toContain("title");
    expect(names).toContain("shorthand");
    expect(names).toContain("description");
    expect(names).toContain("status");
    expect(names).toContain("summary");
    expect(names).toContain("criteria_prompt");
    expect(names).toContain("keywords");
    expect(names).toContain("criteria_changed_at");
    expect(names).toContain("created_at");
    expect(names).toContain("updated_at");
  });

  it("creates thread_meetings table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='thread_meetings'").get();
    expect(row).toEqual({ name: "thread_meetings" });
  });

  it("thread_meetings table has all required columns", () => {
    const cols = db.prepare("PRAGMA table_info(thread_meetings)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    expect(names).toContain("thread_id");
    expect(names).toContain("meeting_id");
    expect(names).toContain("relevance_summary");
    expect(names).toContain("relevance_score");
    expect(names).toContain("evaluated_at");
  });

  it("creates thread_messages table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='thread_messages'").get();
    expect(row).toEqual({ name: "thread_messages" });
  });

  it("thread_messages table has all required columns", () => {
    const cols = db.prepare("PRAGMA table_info(thread_messages)").all() as { name: string }[];
    const names = cols.map((c) => c.name);
    expect(names).toContain("id");
    expect(names).toContain("thread_id");
    expect(names).toContain("role");
    expect(names).toContain("content");
    expect(names).toContain("sources");
    expect(names).toContain("context_stale");
    expect(names).toContain("stale_details");
    expect(names).toContain("created_at");
  });
});

describe("Thread type shape", () => {
  it("Thread interface has correct shape", () => {
    const t: Thread = {
      id: "t1",
      client_name: "Acme",
      client_id: "client-uuid-123",
      title: "PR Deployments broken",
      shorthand: "PR-DEPLOY",
      description: "Track broken deployments",
      status: "open",
      summary: "",
      criteria_prompt: "Look for deployment failures",
      keywords: "",
      criteria_changed_at: "2026-03-07T00:00:00Z",
      created_at: "2026-03-07T00:00:00Z",
      updated_at: "2026-03-07T00:00:00Z",
    };
    expect(t.id).toBe("t1");
    expect(t.status).toBe("open");
    expect(t.shorthand).toBe("PR-DEPLOY");
    expect(t.client_id).toBe("client-uuid-123");
  });

  it("ThreadMeeting interface has correct shape", () => {
    const tm: ThreadMeeting = {
      thread_id: "t1",
      meeting_id: "m1",
      meeting_title: "Sprint Planning",
      meeting_date: "2026-03-01",
      relevance_summary: "Deployment was blocked.",
      relevance_score: 80,
      evaluated_at: "2026-03-07T00:00:00Z",
    };
    expect(tm.thread_id).toBe("t1");
    expect(tm.relevance_score).toBe(80);
  });

  it("ThreadMessage interface has correct shape", () => {
    const msg: ThreadMessage = {
      id: "msg1",
      thread_id: "t1",
      role: "user",
      content: "What is the latest status?",
      sources: null,
      context_stale: false,
      stale_details: null,
      created_at: "2026-03-07T00:00:00Z",
    };
    expect(msg.role).toBe("user");
    expect(msg.context_stale).toBe(false);
    expect(msg.sources).toBeNull();
  });
});
