import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, getThread, listThreadsByClient } from "../core/threads.js";

let db: Database;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run(
    "Acme", "[]", "[]",
  );
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run(
    "Beta Co", "[]", "[]",
  );
});

describe("createThread", () => {
  it("creates a thread and returns a Thread with all fields", () => {
    const thread = createThread(db, {
      client_name: "Acme",
      title: "PR Deployments broken",
      shorthand: "PR-DEPLOY",
      description: "Track broken deployments",
      criteria_prompt: "Look for deployment failures or CI issues",
    });
    expect(thread).toMatchObject({
      client_name: "Acme",
      title: "PR Deployments broken",
      shorthand: "PR-DEPLOY",
      description: "Track broken deployments",
      criteria_prompt: "Look for deployment failures or CI issues",
      status: "open",
      summary: "",
    });
    expect(typeof thread.id).toBe("string");
    expect(thread.id.length).toBeGreaterThan(0);
    expect(typeof thread.created_at).toBe("string");
    expect(typeof thread.updated_at).toBe("string");
    expect(typeof thread.criteria_changed_at).toBe("string");
  });

  it("sets criteria_changed_at to created_at on creation", () => {
    const thread = createThread(db, {
      client_name: "Acme",
      title: "Outage tracking",
      shorthand: "OUTAGE",
      description: "",
      criteria_prompt: "Production outages",
    });
    expect(thread.criteria_changed_at).toBe(thread.created_at);
  });

  it("summary starts empty", () => {
    const thread = createThread(db, {
      client_name: "Acme",
      title: "My thread",
      shorthand: "MY-T",
      description: "",
      criteria_prompt: "",
    });
    expect(thread.summary).toBe("");
  });
});

describe("getThread", () => {
  it("returns the thread by id", () => {
    const created = createThread(db, {
      client_name: "Acme",
      title: "Feature requests",
      shorthand: "FEAT-REQ",
      description: "Track recurring feature asks",
      criteria_prompt: "Feature requests from client",
    });
    const found = getThread(db, created.id);
    expect(found).toEqual(created);
  });

  it("returns null for unknown id", () => {
    const result = getThread(db, "nonexistent-id");
    expect(result).toBeNull();
  });
});

describe("listThreadsByClient", () => {
  it("returns threads for the matching client ordered by created_at desc", () => {
    createThread(db, { client_name: "Acme", title: "Thread A", shorthand: "T-A", description: "", criteria_prompt: "" });
    createThread(db, { client_name: "Acme", title: "Thread B", shorthand: "T-B", description: "", criteria_prompt: "" });
    createThread(db, { client_name: "Beta Co", title: "Thread C", shorthand: "T-C", description: "", criteria_prompt: "" });
    const acmeThreads = listThreadsByClient(db, "Acme");
    expect(acmeThreads).toHaveLength(2);
    expect(acmeThreads.every((t) => t.client_name === "Acme")).toBe(true);
  });

  it("filters out threads from other clients", () => {
    createThread(db, { client_name: "Beta Co", title: "Beta Thread", shorthand: "B-T", description: "", criteria_prompt: "" });
    const acmeThreads = listThreadsByClient(db, "Acme");
    expect(acmeThreads).toHaveLength(0);
  });

  it("returns meeting_count of 0 for new threads", () => {
    createThread(db, { client_name: "Acme", title: "No meetings yet", shorthand: "NM", description: "", criteria_prompt: "" });
    const threads = listThreadsByClient(db, "Acme");
    expect(threads[0].meeting_count).toBe(0);
  });
});
