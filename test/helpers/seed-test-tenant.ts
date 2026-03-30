import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";

export function seedTestTenant(db: Database): { tenantId: string; userId: string } {
  const tenantId = randomUUID();
  const userId = randomUUID();

  db.prepare(
    "INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)",
  ).run(tenantId, "Test Tenant", "test-tenant");

  db.prepare(
    "INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)",
  ).run(userId, "owner@test.local", "Test Owner");

  db.prepare(
    "INSERT INTO tenant_memberships (tenant_id, user_id, role) VALUES (?, ?, ?)",
  ).run(tenantId, userId, "owner");

  return { tenantId, userId };
}

export function seedTestClient(
  db: Database,
  tenantId: string,
  name: string,
): { id: string; tenant_id: string; name: string } {
  const id = randomUUID();

  db.prepare(
    "INSERT INTO clients (id, tenant_id, name, aliases, known_participants, client_team, implementation_team, meeting_names, is_default, glossary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(id, tenantId, name, "[]", "[]", "[]", "[]", "[]", 0, "[]");

  return { id, tenant_id: tenantId, name };
}
