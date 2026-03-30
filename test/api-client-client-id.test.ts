import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createApp } from "../api/server.js";
import type { DatabaseSync as Database } from "node:sqlite";

describe("API client client-id pass-through", () => {
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
    app = createApp(db, ":memory:");
  });

  it("POST /api/threads with clientId passes it through", async () => {
    const res = await app.request("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: "Acme",
        clientId,
        title: "Thread via clientId",
        shorthand: "TC",
        description: "desc",
        criteria_prompt: "cp",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { client_id: string };
    expect(body.client_id).toBe(clientId);
  });

  it("POST /api/insights with clientId passes it through", async () => {
    const res = await app.request("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: "Acme",
        clientId,
        period_type: "week",
        period_start: "2026-03-01",
        period_end: "2026-03-07",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { client_id: string };
    expect(body.client_id).toBe(clientId);
  });

  it("POST /api/milestones with clientId passes it through", async () => {
    const res = await app.request("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: "Acme",
        clientId,
        title: "MS via clientId",
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { client_id: string };
    expect(body.client_id).toBe(clientId);
  });

  it("GET /api/threads?client=<uuid> works via api path", async () => {
    const res = await app.request(`/api/threads?client=${clientId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/insights?client=<uuid> works via api path", async () => {
    const res = await app.request(`/api/insights?client=${clientId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/milestones?client=<uuid> works via api path", async () => {
    const res = await app.request(`/api/milestones?client=${clientId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body.length).toBeGreaterThanOrEqual(1);
  });
});
