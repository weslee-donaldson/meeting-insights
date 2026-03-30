import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createApp } from "../api/server.js";
import type { DatabaseSync as Database } from "node:sqlite";

describe("Thread, insight, milestone routes client resolution", () => {
  let db: Database;
  let app: ReturnType<typeof createApp>;
  const clientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
  const tenantId = "t1000000-0000-0000-0000-000000000001";

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT INTO tenants (id, slug, name) VALUES (?, 'default', 'Default')").run(tenantId);
    db.prepare(
      `INSERT INTO clients (id, tenant_id, name, aliases, known_participants, client_team, implementation_team, meeting_names, glossary)
       VALUES (?, ?, 'Acme', '[]', '[]', '[]', '[]', '[]', '[]')`
    ).run(clientId, tenantId);
    db.prepare(
      `INSERT INTO threads (id, client_name, client_id, title, shorthand, description, status, summary, criteria_prompt, keywords, criteria_changed_at, created_at, updated_at)
       VALUES ('th1', 'Acme', ?, 'Test Thread', 'TT', 'desc', 'open', '', 'criteria', '', datetime('now'), datetime('now'), datetime('now'))`
    ).run(clientId);
    db.prepare(
      `INSERT INTO insights (id, client_name, client_id, name, period_type, period_start, period_end, status, rag_status, rag_rationale, executive_summary, topic_details, generated_at, created_at, updated_at)
       VALUES ('in1', 'Acme', ?, 'Test Insight', 'week', '2026-01-01', '2026-01-07', 'draft', 'green', '', '', '[]', datetime('now'), datetime('now'), datetime('now'))`
    ).run(clientId);
    db.prepare(
      `INSERT INTO milestones (id, client_name, client_id, title, description, target_date, status, created_at, updated_at)
       VALUES ('ms1', 'Acme', ?, 'Test Milestone', '', '2026-06-01', 'identified', datetime('now'), datetime('now'))`
    ).run(clientId);
    app = createApp(db, ":memory:");
  });

  it("GET /api/threads?client=Acme returns threads by name", async () => {
    const res = await app.request("/api/threads?client=Acme");
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("th1");
  });

  it("GET /api/threads?client=<uuid> returns threads by client ID", async () => {
    const res = await app.request(`/api/threads?client=${clientId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("th1");
  });

  it("GET /api/threads?client=Unknown returns empty", async () => {
    const res = await app.request("/api/threads?client=Unknown");
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(0);
  });

  it("GET /api/insights?client=Acme returns insights by name", async () => {
    const res = await app.request("/api/insights?client=Acme");
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("in1");
  });

  it("GET /api/insights?client=<uuid> returns insights by client ID", async () => {
    const res = await app.request(`/api/insights?client=${clientId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("in1");
  });

  it("GET /api/milestones?client=Acme returns milestones by name", async () => {
    const res = await app.request("/api/milestones?client=Acme");
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("ms1");
  });

  it("GET /api/milestones?client=<uuid> returns milestones by client ID", async () => {
    const res = await app.request(`/api/milestones?client=${clientId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("ms1");
  });

  it("POST /api/threads with client_name resolves client_id", async () => {
    const res = await app.request("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: "Acme",
        title: "New Thread",
        shorthand: "NT",
        description: "new desc",
        criteria_prompt: "new criteria",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { id: string; client_id: string };
    expect(body.client_id).toBe(clientId);
  });

  it("POST /api/insights with client_name resolves client_id", async () => {
    const res = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: "Acme",
        period_type: "week",
        period_start: "2026-02-01",
        period_end: "2026-02-07",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { id: string; client_id: string };
    expect(body.client_id).toBe(clientId);
  });

  it("POST /api/milestones with clientName resolves clientId", async () => {
    const res = await app.request("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: "Acme",
        title: "New Milestone",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { id: string; client_id: string };
    expect(body.client_id).toBe(clientId);
  });
});
