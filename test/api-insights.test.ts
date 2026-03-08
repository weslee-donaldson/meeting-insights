import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { storeArtifact } from "../core/extractor.js";
import { storeDetection } from "../core/client-detection.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { createApp } from "../api/server.js";
import type { Insight } from "../core/insights.js";

let app: ReturnType<typeof createApp>;
let db: ReturnType<typeof createDb>;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT INTO clients (name) VALUES ('Acme')").run();
  db.prepare("INSERT INTO meetings (id, title, date, ignored) VALUES ('m1', 'Sprint Review', '2026-03-01', 0)").run();
  db.prepare("INSERT INTO meetings (id, title, date, ignored) VALUES ('m2', 'Client Sync', '2026-03-02', 0)").run();
  storeDetection(db, "m1", [{ client_name: "Acme", confidence: 0.9, method: "auto" }]);
  storeDetection(db, "m2", [{ client_name: "Acme", confidence: 0.9, method: "auto" }]);
  storeArtifact(db, "m1", { summary: "Sprint review.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  storeArtifact(db, "m2", { summary: "Client sync.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  const llm = createLlmAdapter({ type: "stub" });
  app = createApp(db, ":memory:", llm);
});

describe("Insight API routes", () => {
  it("POST /api/insights creates an insight", async () => {
    const res = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Insight;
    expect(body.client_name).toBe("Acme");
    expect(body.status).toBe("draft");
  });

  it("GET /api/insights?client=Acme returns insights", async () => {
    const res = await app.request("/api/insights?client=Acme");
    expect(res.status).toBe(200);
    const body = await res.json() as Insight[];
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it("PUT /api/insights/:id updates an insight", async () => {
    const createRes = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" }),
    });
    const created = await createRes.json() as Insight;
    const res = await app.request(`/api/insights/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "final" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Insight;
    expect(body.status).toBe("final");
  });

  it("DELETE /api/insights/:id deletes an insight", async () => {
    const createRes = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Acme", period_type: "day", period_start: "2026-03-05", period_end: "2026-03-05" }),
    });
    const created = await createRes.json() as Insight;
    const res = await app.request(`/api/insights/${created.id}`, { method: "DELETE" });
    expect(res.status).toBe(200);
  });

  it("POST /api/insights/:id/discover-meetings finds meetings", async () => {
    const createRes = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" }),
    });
    const created = await createRes.json() as Insight;
    const res = await app.request(`/api/insights/${created.id}/discover-meetings`, { method: "POST" });
    expect(res.status).toBe(200);
    const body = await res.json() as { meetingIds: string[] };
    expect(body.meetingIds).toContain("m1");
    expect(body.meetingIds).toContain("m2");
  });

  it("POST /api/insights/:id/generate produces structured result", async () => {
    const createRes = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" }),
    });
    const created = await createRes.json() as Insight;
    await app.request(`/api/insights/${created.id}/discover-meetings`, { method: "POST" });
    const res = await app.request(`/api/insights/${created.id}/generate`, { method: "POST" });
    expect(res.status).toBe(200);
    const body = await res.json() as Insight;
    expect(body.rag_status).toBe("yellow");
    expect(body.executive_summary).toBe("Stub executive summary of the reporting period.");
  });

  it("GET /api/insights/:id/messages returns empty initially", async () => {
    const createRes = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" }),
    });
    const created = await createRes.json() as Insight;
    const res = await app.request(`/api/insights/${created.id}/messages`);
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toEqual([]);
  });

  it("DELETE /api/insights/:id/meetings/:meetingId removes a linked meeting", async () => {
    const createRes = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Acme", period_type: "week", period_start: "2026-03-01", period_end: "2026-03-07" }),
    });
    const created = await createRes.json() as Insight;
    await app.request(`/api/insights/${created.id}/discover-meetings`, { method: "POST" });
    const res = await app.request(`/api/insights/${created.id}/meetings/m1`, { method: "DELETE" });
    expect(res.status).toBe(200);
    const meetingsRes = await app.request(`/api/insights/${created.id}/meetings`);
    const meetings = await meetingsRes.json() as { meeting_id: string }[];
    expect(meetings.find((m) => m.meeting_id === "m1")).toBeUndefined();
    expect(meetings.find((m) => m.meeting_id === "m2")).toBeDefined();
  });

  it("DELETE /api/insights/:id/messages clears messages", async () => {
    const createRes = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_name: "Acme", period_type: "day", period_start: "2026-03-01", period_end: "2026-03-01" }),
    });
    const created = await createRes.json() as Insight;
    const res = await app.request(`/api/insights/${created.id}/messages`, { method: "DELETE" });
    expect(res.status).toBe(200);
  });
});
