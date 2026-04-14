import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/pipeline/ingest.js";
import { storeDetection } from "../core/clients/detection.js";
import { createApp } from "../api/server.js";
import { createMilestone, addMilestoneMention } from "../core/timelines.js";
import type { Milestone, MilestoneMention, MilestoneMessage, DateSlippageEntry } from "../core/timelines.js";

let app: ReturnType<typeof createApp>;
let db: ReturnType<typeof createDb>;
let meetingId: string;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT INTO clients (name, id) VALUES ('Acme', 'client-acme')").run();
  meetingId = ingestMeeting(db, {
    title: "Sprint Review",
    timestamp: "2026-03-01T10:00:00.000Z",
    participants: [],
    rawTranscript: "A | 00:00\nHello.",
    turns: [],
    sourceFilename: "sprint-review-1",
  });
  storeDetection(db, meetingId, [{ client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "auto" }]);
  app = createApp(db, ":memory:");
});

describe("Milestone API routes", () => {
  it("POST /api/milestones creates a milestone", async () => {
    const res = await app.request("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName: "Acme", title: "Launch v2", targetDate: "2026-06-01", description: "Go live" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Milestone;
    expect(body.client_name).toBe("Acme");
    expect(body.title).toBe("Launch v2");
    expect(body.status).toBe("identified");
  });

  it("GET /api/milestones?client=Acme returns milestones", async () => {
    const res = await app.request("/api/milestones?client=Acme");
    expect(res.status).toBe(200);
    const body = await res.json() as Milestone[];
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it("PUT /api/milestones/:id updates a milestone", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Update Target", targetDate: "2026-07-01" });
    const res = await app.request(`/api/milestones/${ms.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "tracked" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Milestone;
    expect(body.status).toBe("tracked");
  });

  it("DELETE /api/milestones/:id deletes a milestone", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "To Delete" });
    const res = await app.request(`/api/milestones/${ms.id}`, { method: "DELETE" });
    expect(res.status).toBe(200);
  });

  it("GET /api/milestones/:id/mentions returns mentions with meeting context", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Mentions Test" });
    addMilestoneMention(db, { milestoneId: ms.id, meetingId, mentionType: "introduced", excerpt: "We are launching", targetDateAtMention: "2026-06-01", mentionedAt: "2026-03-01" });
    const res = await app.request(`/api/milestones/${ms.id}/mentions`);
    expect(res.status).toBe(200);
    const body = await res.json() as MilestoneMention[];
    expect(body).toHaveLength(1);
    expect(body[0].meeting_title).toBe("Sprint Review");
  });

  it("GET /api/milestones/:id/slippage returns date slippage entries", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Slippage Test", targetDate: "2026-06-01" });
    const meetingId2 = ingestMeeting(db, {
      title: "Slip Meeting 2",
      timestamp: "2026-03-10T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nSlip.",
      turns: [],
      sourceFilename: "slip-meeting-2",
    });
    addMilestoneMention(db, { milestoneId: ms.id, meetingId, mentionType: "introduced", excerpt: "Launch", targetDateAtMention: "2026-06-01", mentionedAt: "2026-03-01" });
    addMilestoneMention(db, { milestoneId: ms.id, meetingId: meetingId2, mentionType: "updated", excerpt: "Delayed", targetDateAtMention: "2026-07-01", mentionedAt: "2026-03-10" });
    const res = await app.request(`/api/milestones/${ms.id}/slippage`);
    expect(res.status).toBe(200);
    const body = await res.json() as DateSlippageEntry[];
    expect(body).toHaveLength(2);
  });

  it("GET /api/milestones/:id/messages returns empty initially", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Messages Test" });
    const res = await app.request(`/api/milestones/${ms.id}/messages`);
    expect(res.status).toBe(200);
    const body = await res.json() as MilestoneMessage[];
    expect(body).toEqual([]);
  });

  it("DELETE /api/milestones/:id/messages clears messages", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Clear Msgs Test" });
    const res = await app.request(`/api/milestones/${ms.id}/messages`, { method: "DELETE" });
    expect(res.status).toBe(200);
  });

  it("GET /api/meetings/:id/milestones returns milestones for a meeting", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Meeting MS Test" });
    addMilestoneMention(db, { milestoneId: ms.id, meetingId, mentionType: "referenced", excerpt: "ref", targetDateAtMention: null, mentionedAt: "2026-03-01" });
    const res = await app.request(`/api/meetings/${meetingId}/milestones`);
    expect(res.status).toBe(200);
    const body = await res.json() as { milestone_id: string; title: string }[];
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/milestones/:id/confirm-mention confirms a pending mention", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Confirm Test" });
    addMilestoneMention(db, { milestoneId: ms.id, meetingId, mentionType: "referenced", excerpt: "test", targetDateAtMention: null, mentionedAt: "2026-03-01" });
    db.prepare("UPDATE milestone_mentions SET pending_review = 1 WHERE milestone_id = ? AND meeting_id = ?").run(ms.id, meetingId);
    const res = await app.request(`/api/milestones/${ms.id}/confirm-mention`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId }),
    });
    expect(res.status).toBe(200);
  });

  it("POST /api/milestones/:id/reject-mention rejects a pending mention", async () => {
    const ms2 = createMilestone(db, { clientId: "client-acme", title: "Reject Source" });
    const meetingId2 = ingestMeeting(db, {
      title: "Another Meeting",
      timestamp: "2026-03-05T10:00:00.000Z",
      participants: [],
      rawTranscript: "B | 00:00\nHi.",
      turns: [],
      sourceFilename: "another-meeting",
    });
    addMilestoneMention(db, { milestoneId: ms2.id, meetingId: meetingId2, mentionType: "introduced", excerpt: "new thing", targetDateAtMention: "2026-07-01", mentionedAt: "2026-03-05" });
    db.prepare("UPDATE milestone_mentions SET pending_review = 1 WHERE milestone_id = ? AND meeting_id = ?").run(ms2.id, meetingId2);
    const res = await app.request(`/api/milestones/${ms2.id}/reject-mention`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId: meetingId2 }),
    });
    expect(res.status).toBe(200);
  });

  it("POST /api/milestones/merge merges two milestones", async () => {
    const source = createMilestone(db, { clientId: "client-acme", title: "Merge Source" });
    const target = createMilestone(db, { clientId: "client-acme", title: "Merge Target" });
    const res = await app.request("/api/milestones/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: source.id, targetId: target.id }),
    });
    expect(res.status).toBe(200);
  });

  it("POST /api/milestones/:id/link-action-item links an action item", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Link AI Test" });
    const res = await app.request(`/api/milestones/${ms.id}/link-action-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, itemIndex: 0 }),
    });
    expect(res.status).toBe(200);
  });

  it("DELETE /api/milestones/:id/link-action-item unlinks an action item", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Unlink AI Test" });
    const { linkActionItem } = await import("../core/timelines.js");
    linkActionItem(db, ms.id, meetingId, 0);
    const res = await app.request(`/api/milestones/${ms.id}/link-action-item`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, itemIndex: 0 }),
    });
    expect(res.status).toBe(200);
  });

  it("GET /api/milestones/:id/action-items returns linked action items", async () => {
    const ms = createMilestone(db, { clientId: "client-acme", title: "Get AI Test" });
    const res = await app.request(`/api/milestones/${ms.id}/action-items`);
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toEqual([]);
  });
});
