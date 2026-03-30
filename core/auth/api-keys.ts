import type { DatabaseSync as Database } from "node:sqlite";
import { createHash, randomBytes } from "node:crypto";
import type { Scope, AuthIdentity } from "./scopes.js";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw = randomBytes(32).toString("hex");
  const key = `mki_${raw}`;
  return { key, hash: sha256(key), prefix: key.slice(0, 8) };
}

export function hashApiKey(key: string): string {
  return sha256(key);
}

export function createApiKey(
  db: Database,
  opts: { tenantId: string; userId: string; name: string; scopes: Scope[] },
): { key: string; prefix: string; hash: string } {
  const { key, hash, prefix } = generateApiKey();

  db.prepare(
    "INSERT INTO api_keys (key_hash, tenant_id, user_id, name, prefix, scopes) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(hash, opts.tenantId, opts.userId, opts.name, prefix, JSON.stringify(opts.scopes));

  return { key, prefix, hash };
}

export function validateApiKey(db: Database, key: string): AuthIdentity | null {
  const hash = sha256(key);

  const row = db
    .prepare("SELECT tenant_id, user_id, scopes FROM api_keys WHERE key_hash = ? AND revoked = 0")
    .get(hash) as { tenant_id: string; user_id: string; scopes: string } | undefined;

  if (!row) return null;

  db.prepare("UPDATE api_keys SET last_used_at = datetime('now') WHERE key_hash = ?").run(hash);

  return {
    tenantId: row.tenant_id,
    userId: row.user_id,
    scopes: JSON.parse(row.scopes) as Scope[],
  };
}
