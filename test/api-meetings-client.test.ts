import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createApp } from "../api/server.js";
import type { DatabaseSync as Database } from "node:sqlite";

describe("Meeting routes client resolution", () => {
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
      `INSERT INTO meetings (id, title, date, raw_transcript, source_filename, client_id, ignored)
       VALUES ('m1', 'Sprint Planning', '2026-01-15T10:00:00Z', '', 'test.txt', ?, 0)`
    ).run(clientId);
    app = createApp(db, ":memory:");
  });

  it("GET /api/meetings?client=Acme filters by client name", async () => {
    const res = await app.request("/api/meetings?client=Acme");
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; client: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].client).toBe("Acme");
  });

  it("GET /api/meetings?client=<uuid> filters by client ID", async () => {
    const res = await app.request(`/api/meetings?client=${clientId}`);
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; client: string }[];
    expect(body).toHaveLength(1);
    expect(body[0].client).toBe("Acme");
  });

  it("GET /api/meetings?client=Unknown returns empty", async () => {
    const res = await app.request("/api/meetings?client=Unknown");
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(0);
  });

  it("GET /api/clients returns array of {id, name} objects", async () => {
    const res = await app.request("/api/clients");
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string; name: string }[];
    expect(body).toEqual([{ id: clientId, name: "Acme" }]);
  });

  it("GET /api/default-client returns name string", async () => {
    const res = await app.request("/api/default-client");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toBe(null);
  });
});
