import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import {
  createInsight,
  addInsightMeeting,
  removeInsightMeeting,
  getInsightMeetings,
  discoverMeetingsForPeriod,
} from "../core/insights.js";
import { seedTestTenant, seedTestClient } from "./helpers/seed-test-tenant.js";

let db: Database;
let acmeClientId: string;
let testTenantId: string;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  const { tenantId } = seedTestTenant(db);
  testTenantId = tenantId;
  acmeClientId = seedTestClient(db, tenantId, "Acme").id;
  db.prepare("INSERT INTO meetings (id, title, date, client_id) VALUES ('m1', 'Standup Mon', '2026-03-02', ?)").run(acmeClientId);
  db.prepare("INSERT INTO meetings (id, title, date, client_id) VALUES ('m2', 'Standup Tue', '2026-03-03', ?)").run(acmeClientId);
  db.prepare("INSERT INTO meetings (id, title, date, client_id) VALUES ('m3', 'Standup Wed', '2026-03-04', ?)").run(acmeClientId);
  db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES ('m1', 'Acme', 0.9, 'alias')").run();
  db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES ('m2', 'Acme', 0.9, 'alias')").run();
  db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES ('m3', 'Acme', 0.9, 'alias')").run();
});

describe("addInsightMeeting", () => {
  it("links a meeting to an insight", () => {
    const ins = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "day", period_start: "2026-03-02", period_end: "2026-03-02" });
    addInsightMeeting(db, { insight_id: ins.id, meeting_id: "m1", contribution_summary: "Discussed deploy" });
    const rows = db.prepare("SELECT * FROM insight_meetings WHERE insight_id = ?").all(ins.id) as { insight_id: string; meeting_id: string; contribution_summary: string }[];
    expect(rows).toEqual([{ insight_id: ins.id, meeting_id: "m1", contribution_summary: "Discussed deploy" }]);
  });

  it("upserts on conflict", () => {
    const ins = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "day", period_start: "2026-03-02", period_end: "2026-03-02" });
    addInsightMeeting(db, { insight_id: ins.id, meeting_id: "m1", contribution_summary: "v1" });
    addInsightMeeting(db, { insight_id: ins.id, meeting_id: "m1", contribution_summary: "v2" });
    const rows = db.prepare("SELECT contribution_summary FROM insight_meetings WHERE insight_id = ? AND meeting_id = 'm1'").all(ins.id) as { contribution_summary: string }[];
    expect(rows).toEqual([{ contribution_summary: "v2" }]);
  });
});

describe("getInsightMeetings", () => {
  it("returns linked meetings with titles and dates ordered by date", () => {
    const ins = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "week", period_start: "2026-03-02", period_end: "2026-03-08" });
    addInsightMeeting(db, { insight_id: ins.id, meeting_id: "m2", contribution_summary: "Tuesday update" });
    addInsightMeeting(db, { insight_id: ins.id, meeting_id: "m1", contribution_summary: "Monday update" });
    const result = getInsightMeetings(db, ins.id);
    expect(result).toEqual([
      { insight_id: ins.id, meeting_id: "m1", meeting_title: "Standup Mon", meeting_date: "2026-03-02", contribution_summary: "Monday update" },
      { insight_id: ins.id, meeting_id: "m2", meeting_title: "Standup Tue", meeting_date: "2026-03-03", contribution_summary: "Tuesday update" },
    ]);
  });
});

describe("removeInsightMeeting", () => {
  it("removes a linked meeting from an insight", () => {
    const ins = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "week", period_start: "2026-03-02", period_end: "2026-03-08" });
    addInsightMeeting(db, { insight_id: ins.id, meeting_id: "m1", contribution_summary: "Monday" });
    addInsightMeeting(db, { insight_id: ins.id, meeting_id: "m2", contribution_summary: "Tuesday" });
    removeInsightMeeting(db, ins.id, "m1");
    const remaining = getInsightMeetings(db, ins.id);
    expect(remaining).toEqual([
      { insight_id: ins.id, meeting_id: "m2", meeting_title: "Standup Tue", meeting_date: "2026-03-03", contribution_summary: "Tuesday" },
    ]);
  });

  it("is a no-op when meeting is not linked", () => {
    const ins = createInsight(db, { client_name: "Acme", client_id: acmeClientId, period_type: "day", period_start: "2026-03-02", period_end: "2026-03-02" });
    addInsightMeeting(db, { insight_id: ins.id, meeting_id: "m1", contribution_summary: "v1" });
    removeInsightMeeting(db, ins.id, "m99");
    const remaining = getInsightMeetings(db, ins.id);
    expect(remaining).toHaveLength(1);
  });
});

describe("discoverMeetingsForPeriod", () => {
  it("returns meeting ids for a client within date range", () => {
    const result = discoverMeetingsForPeriod(db, acmeClientId, "2026-03-02", "2026-03-03");
    expect(result).toEqual(["m1", "m2"]);
  });

  it("excludes ignored meetings", () => {
    db.prepare("UPDATE meetings SET ignored = 1 WHERE id = 'm3'").run();
    const result = discoverMeetingsForPeriod(db, acmeClientId, "2026-03-02", "2026-03-04");
    expect(result).toEqual(["m1", "m2"]);
    db.prepare("UPDATE meetings SET ignored = 0 WHERE id = 'm3'").run();
  });

  it("returns empty array when no meetings match", () => {
    const result = discoverMeetingsForPeriod(db, acmeClientId, "2026-04-01", "2026-04-30");
    expect(result).toEqual([]);
  });

  it("discovers meetings with ISO timestamp dates within date-only period bounds", () => {
    db.prepare("INSERT INTO meetings (id, title, date, client_id) VALUES ('m-ts1', 'Morning', '2026-03-05T10:00:00.000Z', ?)").run(acmeClientId);
    db.prepare("INSERT INTO meetings (id, title, date, client_id) VALUES ('m-ts2', 'Afternoon', '2026-03-05T15:30:00.000Z', ?)").run(acmeClientId);
    const result = discoverMeetingsForPeriod(db, acmeClientId, "2026-03-05", "2026-03-05");
    expect(result).toEqual(["m-ts1", "m-ts2"]);
    db.prepare("DELETE FROM meetings WHERE id IN ('m-ts1', 'm-ts2')").run();
  });

  it("excludes meetings where client is not the top-confidence detection", () => {
    const betaClientId = seedTestClient(db, testTenantId, "Beta").id;
    db.prepare("INSERT INTO meetings (id, title, date, client_id) VALUES ('m4', 'Cross-client', '2026-03-02', ?)").run(betaClientId);
    db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES ('m4', 'Acme', 0.3, 'alias')").run();
    db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES ('m4', 'Beta', 0.9, 'alias')").run();
    const result = discoverMeetingsForPeriod(db, acmeClientId, "2026-03-02", "2026-03-04");
    expect(result).toEqual(["m1", "m2", "m3"]);
  });
});
