import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../../core/db.js";
import type { Database } from "../../core/db.js";
import { seedTestTenant, seedTestClient } from "./seed-test-tenant.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
});

describe("seedTestTenant", () => {
  it("inserts a tenant, owner user, and membership", () => {
    const result = seedTestTenant(db);

    const tenant = db.prepare("SELECT * FROM tenants WHERE id = ?").get(result.tenantId) as {
      id: string; name: string; slug: string; created_at: string;
    };
    expect(tenant).toEqual({
      id: result.tenantId,
      name: "Test Tenant",
      slug: "test-tenant",
      created_at: expect.any(String),
    });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.userId) as {
      id: string; email: string; display_name: string; password_hash: string | null; created_at: string;
    };
    expect(user).toEqual({
      id: result.userId,
      email: "owner@test.local",
      display_name: "Test Owner",
      password_hash: null,
      created_at: expect.any(String),
    });

    const membership = db.prepare("SELECT * FROM tenant_memberships WHERE tenant_id = ? AND user_id = ?").get(result.tenantId, result.userId) as {
      tenant_id: string; user_id: string; role: string; created_at: string;
    };
    expect(membership).toEqual({
      tenant_id: result.tenantId,
      user_id: result.userId,
      role: "owner",
      created_at: expect.any(String),
    });
  });

  it("returns unique ids on each call", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    const first = seedTestTenant(db2);
    const db3 = createDb(":memory:");
    migrate(db3);
    const second = seedTestTenant(db3);
    expect(first.tenantId).not.toBe(second.tenantId);
    expect(first.userId).not.toBe(second.userId);
  });
});

describe("seedTestClient", () => {
  it("creates a client with UUID under the given tenant", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    const { tenantId } = seedTestTenant(db2);
    const client = seedTestClient(db2, tenantId, "Acme Corp");

    expect(client.id).toEqual(expect.any(String));
    expect(client.name).toBe("Acme Corp");

    const row = db2.prepare("SELECT id, name FROM clients WHERE name = ?").get("Acme Corp") as { id: string; name: string };
    expect(row).toEqual({ id: client.id, name: "Acme Corp" });
  });

  it("creates multiple clients with distinct ids", () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    const { tenantId } = seedTestTenant(db2);
    const c1 = seedTestClient(db2, tenantId, "Client A");
    const c2 = seedTestClient(db2, tenantId, "Client B");
    expect(c1.id).not.toBe(c2.id);
    expect(c1.name).toBe("Client A");
    expect(c2.name).toBe("Client B");
  });
});
