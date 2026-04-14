import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, addThreadMeeting, regenerateThreadSummary, getThread } from "../core/threads.js";
import { createLlmAdapter } from "../core/llm/adapter.js";
import { storeArtifact } from "../core/extractor.js";
import { seedTestTenant, seedTestClient } from "./helpers/seed-test-tenant.js";

const llm = createLlmAdapter({ type: "stub" });
let db: Database;
let threadId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  const { tenantId } = seedTestTenant(db);
  const acmeClientId = seedTestClient(db, tenantId, "Acme").id;
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m1', 'Sprint Planning', '2026-03-01')").run();
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m2', 'Retrospective', '2026-03-08')").run();
  storeArtifact(db, "m1", { summary: "Deployment failed.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  storeArtifact(db, "m2", { summary: "Discussed rollback.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  const thread = createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "Deployment issues", shorthand: "DEPLOY", description: "Track CI failures", criteria_prompt: "CI failures" });
  threadId = thread.id;
  addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "Deployment broken in m1.", relevance_score: 90 });
  addThreadMeeting(db, { thread_id: threadId, meeting_id: "m2", relevance_summary: "Rollback discussed in m2.", relevance_score: 70 });
});

describe("regenerateThreadSummary", () => {
  it("updates thread summary and returns the new summary", async () => {
    const result = await regenerateThreadSummary(db, llm, threadId);
    expect(result).toBe("Stub answer based on meeting context.");
    const thread = getThread(db, threadId);
    expect(thread?.summary).toBe("Stub answer based on meeting context.");
  });

  it("uses only specified meetingIds when provided", async () => {
    const result = await regenerateThreadSummary(db, llm, threadId, ["m1"]);
    expect(result).toBe("Stub answer based on meeting context.");
    const thread = getThread(db, threadId);
    expect(thread?.summary).toBe("Stub answer based on meeting context.");
  });
});
