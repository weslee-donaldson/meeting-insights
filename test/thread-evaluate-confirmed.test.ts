import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, addThreadMeeting, evaluateConfirmedCandidates, getThreadMeetings } from "../core/threads.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
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
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m3', 'Design Review', '2026-03-15')").run();
  storeArtifact(db, "m1", { summary: "Deployment failed.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  storeArtifact(db, "m2", { summary: "Discussed rollback.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  storeArtifact(db, "m3", { summary: "New feature design.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  const thread = createThread(db, { client_name: "Acme", client_id: acmeClientId, title: "Deployment issues", shorthand: "DEPLOY", description: "", criteria_prompt: "CI failures" });
  threadId = thread.id;
});

describe("evaluateConfirmedCandidates", () => {
  it("adds new associations when no existing meetings", async () => {
    const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as Parameters<typeof evaluateConfirmedCandidates>[2];
    const result = await evaluateConfirmedCandidates(db, llm, thread, ["m1", "m2"], false);
    expect(result).toEqual({ added: 2, updated: 0, errors: [] });
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings).toHaveLength(2);
  });

  it("non-override mode skips meetings already associated", async () => {
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "Old", relevance_score: 40 });
    const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as Parameters<typeof evaluateConfirmedCandidates>[2];
    const result = await evaluateConfirmedCandidates(db, llm, thread, ["m1", "m2"], false);
    expect(result).toEqual({ added: 1, updated: 0, errors: [] });
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings.find((m) => m.meeting_id === "m1")?.relevance_score).toBe(40);
  });

  it("override mode re-evaluates existing associations", async () => {
    addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "Old", relevance_score: 40 });
    const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as Parameters<typeof evaluateConfirmedCandidates>[2];
    const result = await evaluateConfirmedCandidates(db, llm, thread, ["m1", "m2"], true);
    expect(result).toEqual({ added: 1, updated: 1, errors: [] });
    const meetings = getThreadMeetings(db, threadId);
    expect(meetings.find((m) => m.meeting_id === "m1")?.relevance_score).toBe(75);
  });

  it("reports errors for meetings with missing artifacts", async () => {
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m-no-art', 'No Artifact', '2026-03-20')").run();
    const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as Parameters<typeof evaluateConfirmedCandidates>[2];
    const result = await evaluateConfirmedCandidates(db, llm, thread, ["m1", "m-no-art"], false);
    expect(result).toEqual({ added: 1, updated: 0, errors: [{ meetingId: "m-no-art", reason: "No artifact found" }] });
  });

  it("reports not_related for meetings the LLM marks as unrelated", async () => {
    const rejectLlm = createLlmAdapter({ type: "stub" });
    rejectLlm.complete = async () => ({ related: false, relevance_summary: "Not related", relevance_score: 10 });
    const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as Parameters<typeof evaluateConfirmedCandidates>[2];
    const result = await evaluateConfirmedCandidates(db, rejectLlm, thread, ["m1", "m2"], false);
    expect(result).toEqual({ added: 0, updated: 0, errors: [] });
    expect(getThreadMeetings(db, threadId)).toHaveLength(0);
  });
});
