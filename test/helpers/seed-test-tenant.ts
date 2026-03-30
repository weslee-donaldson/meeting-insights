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
  _tenantId: string,
  name: string,
): { id: string; name: string } {
  const id = randomUUID();

  db.prepare(
    "INSERT INTO clients (name, aliases, known_participants, client_team, implementation_team, meeting_names, is_default, glossary, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(name, "[]", "[]", "[]", "[]", "[]", 0, "[]", id);

  return { id, name };
}
