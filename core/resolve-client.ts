import type { DatabaseSync as Database } from "node:sqlite";
import type { ClientRow } from "./client-registry.js";

const UUID_PREFIX = /^[0-9a-f]{8}-/;

export function resolveClient(db: Database, clientParam: string, tenantId?: string): ClientRow | null {
  const isUuid = UUID_PREFIX.test(clientParam);
  if (isUuid) {
    if (tenantId) {
      return (db.prepare("SELECT * FROM clients WHERE id = ? AND tenant_id = ?").get(clientParam, tenantId) as ClientRow) ?? null;
    }
    return (db.prepare("SELECT * FROM clients WHERE id = ?").get(clientParam) as ClientRow) ?? null;
  }
  const byName = tenantId
    ? (db.prepare("SELECT * FROM clients WHERE name = ? AND tenant_id = ?").get(clientParam, tenantId) as ClientRow | undefined)
    : (db.prepare("SELECT * FROM clients WHERE name = ?").get(clientParam) as ClientRow | undefined);
  if (byName) return byName;
  return tenantId
    ? (db.prepare("SELECT * FROM clients WHERE id = ? AND tenant_id = ?").get(clientParam, tenantId) as ClientRow) ?? null
    : (db.prepare("SELECT * FROM clients WHERE id = ?").get(clientParam) as ClientRow) ?? null;
}
