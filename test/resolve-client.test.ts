import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { resolveClient } from "../core/clients/resolve.js";
import type { DatabaseSync as Database } from "node:sqlite";

describe("resolveClient", () => {
  let db: Database;
  const clientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
  const tenantId = "t1000000-0000-0000-0000-000000000001";

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare(
      "INSERT INTO tenants (id, slug, name) VALUES (?, 'default', 'Default')"
    ).run(tenantId);
    db.prepare(
      `INSERT INTO clients (id, tenant_id, name, aliases, known_participants, client_team, implementation_team, meeting_names, glossary)
       VALUES (?, ?, 'Acme', '[]', '[]', '[]', '[]', '[]', '[]')`
    ).run(clientId, tenantId);
  });

  it("resolves client by name", () => {
    const result = resolveClient(db, "Acme");
    expect(result).toEqual(expect.objectContaining({ id: clientId, name: "Acme" }));
  });

  it("resolves client by UUID", () => {
    const result = resolveClient(db, clientId);
    expect(result).toEqual(expect.objectContaining({ id: clientId, name: "Acme" }));
  });

  it("returns null for unknown name", () => {
    const result = resolveClient(db, "NonExistent");
    expect(result).toBe(null);
  });

  it("returns null for unknown UUID", () => {
    const result = resolveClient(db, "ffffffff-0000-0000-0000-000000000000");
    expect(result).toBe(null);
  });

  it("scopes by tenantId when provided", () => {
    const result = resolveClient(db, "Acme", tenantId);
    expect(result).toEqual(expect.objectContaining({ id: clientId, name: "Acme" }));
  });

  it("returns null when tenantId does not match", () => {
    const result = resolveClient(db, "Acme", "00000000-0000-0000-0000-999999999999");
    expect(result).toBe(null);
  });

  it("scopes UUID lookup by tenantId", () => {
    const result = resolveClient(db, clientId, tenantId);
    expect(result).toEqual(expect.objectContaining({ id: clientId, name: "Acme" }));
  });

  it("returns null for UUID when tenantId does not match", () => {
    const result = resolveClient(db, clientId, "00000000-0000-0000-0000-999999999999");
    expect(result).toBe(null);
  });
});
