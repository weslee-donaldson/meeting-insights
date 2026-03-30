import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import {
  createInsight,
  appendInsightMessage,
  getInsightMessages,
  clearInsightMessages,
  markInsightMessagesStale,
} from "../core/insights.js";
import { seedTestTenant, seedTestClient } from "./helpers/seed-test-tenant.js";

let db: Database;
let insightId: string;
let acmeClientId: string;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  const { tenantId } = seedTestTenant(db);
  acmeClientId = seedTestClient(db, tenantId, "Acme").id;
  const ins = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "day", period_start: "2026-03-08", period_end: "2026-03-08" });
  insightId = ins.id;
});

describe("appendInsightMessage", () => {
  it("stores a message and returns it with generated id and timestamp", () => {
    const result = appendInsightMessage(db, { insight_id: insightId, role: "user", content: "What happened today?" });
    expect(result).toEqual({
      id: expect.any(String),
      insight_id: insightId,
      role: "user",
      content: "What happened today?",
      sources: null,
      context_stale: false,
      stale_details: null,
      created_at: expect.any(String),
    });
  });

  it("stores assistant message with sources", () => {
    const result = appendInsightMessage(db, { insight_id: insightId, role: "assistant", content: "Here is a summary.", sources: '["m1","m2"]' });
    expect(result.sources).toBe('["m1","m2"]');
  });
});

describe("getInsightMessages", () => {
  it("returns messages ordered by created_at asc", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    const { tenantId: t2 } = seedTestTenant(db2);
    const acme2 = seedTestClient(db2, t2, "Acme").id;
    const ins = createInsight(db2, { client_name: "Acme", client_id: acme2, period_type: "day", period_start: "2026-03-08", period_end: "2026-03-08" });
    appendInsightMessage(db2, { insight_id: ins.id, role: "user", content: "first" });
    appendInsightMessage(db2, { insight_id: ins.id, role: "assistant", content: "second" });
    const result = getInsightMessages(db2, ins.id);
    expect(result.map((m) => m.content)).toEqual(["first", "second"]);
  });

  it("returns empty array for insight with no messages", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    const { tenantId: t2 } = seedTestTenant(db2);
    const acme2 = seedTestClient(db2, t2, "Acme").id;
    const ins = createInsight(db2, { client_name: "Acme", client_id: acme2, period_type: "day", period_start: "2026-03-08", period_end: "2026-03-08" });
    expect(getInsightMessages(db2, ins.id)).toEqual([]);
  });
});

describe("clearInsightMessages", () => {
  it("deletes all messages for an insight", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    const { tenantId: t2 } = seedTestTenant(db2);
    const acme2 = seedTestClient(db2, t2, "Acme").id;
    const ins = createInsight(db2, { client_name: "Acme", client_id: acme2, period_type: "day", period_start: "2026-03-08", period_end: "2026-03-08" });
    appendInsightMessage(db2, { insight_id: ins.id, role: "user", content: "hello" });
    appendInsightMessage(db2, { insight_id: ins.id, role: "assistant", content: "hi" });
    clearInsightMessages(db2, ins.id);
    expect(getInsightMessages(db2, ins.id)).toEqual([]);
  });
});

describe("markInsightMessagesStale", () => {
  it("marks all messages as stale with details about deleted meetings", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    const { tenantId: t2 } = seedTestTenant(db2);
    const acme2 = seedTestClient(db2, t2, "Acme").id;
    const ins = createInsight(db2, { client_name: "Acme", client_id: acme2, period_type: "day", period_start: "2026-03-08", period_end: "2026-03-08" });
    appendInsightMessage(db2, { insight_id: ins.id, role: "user", content: "tell me about today" });
    appendInsightMessage(db2, { insight_id: ins.id, role: "assistant", content: "here is what happened" });
    markInsightMessagesStale(db2, ins.id, [{ id: "m1", title: "Standup Mon" }]);
    const msgs = getInsightMessages(db2, ins.id);
    expect(msgs[0].context_stale).toBe(true);
    expect(msgs[0].stale_details).toBe('[{"id":"m1","title":"Standup Mon"}]');
    expect(msgs[1].context_stale).toBe(true);
  });
});
