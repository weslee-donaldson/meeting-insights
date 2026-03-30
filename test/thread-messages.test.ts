import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, appendThreadMessage, getThreadMessages, clearThreadMessages, markThreadMessagesStale } from "../core/threads.js";
import { seedTestTenant, seedTestClient } from "./helpers/seed-test-tenant.js";

let db: Database;
let threadId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  const { tenantId } = seedTestTenant(db);
  const acmeClientId = seedTestClient(db, tenantId, "Acme").id;
  const thread = createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "Thread", shorthand: "T", description: "", criteria_prompt: "" });
  threadId = thread.id;
});

describe("appendThreadMessage", () => {
  it("appends a user message and returns a ThreadMessage", () => {
    const msg = appendThreadMessage(db, { thread_id: threadId, role: "user", content: "What is the status?" });
    expect(msg).toMatchObject({
      thread_id: threadId,
      role: "user",
      content: "What is the status?",
      sources: null,
      context_stale: false,
      stale_details: null,
    });
    expect(typeof msg.id).toBe("string");
    expect(typeof msg.created_at).toBe("string");
  });

  it("appends an assistant message with sources", () => {
    const msg = appendThreadMessage(db, { thread_id: threadId, role: "assistant", content: "Here is the update.", sources: '["Sprint Planning"]' });
    expect(msg.role).toBe("assistant");
    expect(msg.sources).toBe('["Sprint Planning"]');
  });
});

describe("getThreadMessages", () => {
  it("returns messages in created_at ascending order", () => {
    appendThreadMessage(db, { thread_id: threadId, role: "user", content: "First" });
    appendThreadMessage(db, { thread_id: threadId, role: "assistant", content: "Second" });
    appendThreadMessage(db, { thread_id: threadId, role: "user", content: "Third" });
    const messages = getThreadMessages(db, threadId);
    expect(messages).toHaveLength(3);
    expect(messages[0].content).toBe("First");
    expect(messages[2].content).toBe("Third");
  });

  it("returns empty array when no messages", () => {
    expect(getThreadMessages(db, threadId)).toEqual([]);
  });
});

describe("clearThreadMessages", () => {
  it("removes all messages for the thread", () => {
    appendThreadMessage(db, { thread_id: threadId, role: "user", content: "Hello" });
    appendThreadMessage(db, { thread_id: threadId, role: "assistant", content: "Hi" });
    clearThreadMessages(db, threadId);
    expect(getThreadMessages(db, threadId)).toEqual([]);
  });
});

describe("markThreadMessagesStale", () => {
  it("sets context_stale=true and stale_details on all messages for the thread", () => {
    appendThreadMessage(db, { thread_id: threadId, role: "user", content: "Hello" });
    appendThreadMessage(db, { thread_id: threadId, role: "assistant", content: "Hi" });
    markThreadMessagesStale(db, threadId, [{ id: "m1", title: "Sprint Planning" }]);
    const messages = getThreadMessages(db, threadId);
    expect(messages.every((m) => m.context_stale === true)).toBe(true);
    expect(messages.every((m) => m.stale_details !== null)).toBe(true);
    const details = JSON.parse(messages[0].stale_details!);
    expect(details).toEqual([{ id: "m1", title: "Sprint Planning" }]);
  });
});
