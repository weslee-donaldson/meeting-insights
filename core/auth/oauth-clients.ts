import type { DatabaseSync as Database } from "node:sqlite";
import { createHash, randomBytes, randomUUID } from "node:crypto";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

interface RegisterOAuthClientOpts {
  tenantId: string;
  name: string;
  grantTypes: string[];
  scopes: string[];
  redirectUris?: string[];
}

interface OAuthClientRow {
  client_id: string;
  tenant_id: string;
  client_secret_hash: string | null;
  name: string;
  grant_types: string;
  scopes: string;
  redirect_uris: string | null;
  created_at: string;
  revoked: number;
}

export function registerOAuthClient(
  db: Database,
  opts: RegisterOAuthClientOpts,
): { clientId: string; clientSecret?: string } {
  const clientId = randomUUID();
  const needsSecret = opts.grantTypes.includes("client_credentials");
  const clientSecret = needsSecret ? randomBytes(32).toString("hex") : undefined;
  const secretHash = clientSecret ? sha256(clientSecret) : null;
  const redirectUris = opts.redirectUris ? JSON.stringify(opts.redirectUris) : null;

  db.prepare(
    `INSERT INTO oauth_clients (client_id, tenant_id, client_secret_hash, name, grant_types, scopes, redirect_uris)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    clientId,
    opts.tenantId,
    secretHash,
    opts.name,
    JSON.stringify(opts.grantTypes),
    JSON.stringify(opts.scopes),
    redirectUris,
  );

  if (clientSecret) {
    return { clientId, clientSecret };
  }
  return { clientId };
}

export function getOAuthClient(db: Database, clientId: string): OAuthClientRow | null {
  const row = db
    .prepare("SELECT * FROM oauth_clients WHERE client_id = ? AND revoked = 0")
    .get(clientId) as OAuthClientRow | undefined;
  return row ?? null;
}

export function authenticateOAuthClient(
  db: Database,
  clientId: string,
  clientSecret: string | null,
): OAuthClientRow | null {
  const client = getOAuthClient(db, clientId);
  if (!client) return null;

  if (client.client_secret_hash === null) {
    return clientSecret === null ? client : null;
  }

  if (clientSecret === null) return null;

  return sha256(clientSecret) === client.client_secret_hash ? client : null;
}

export function revokeOAuthClient(db: Database, clientId: string): boolean {
  const result = db
    .prepare("UPDATE oauth_clients SET revoked = 1 WHERE client_id = ? AND revoked = 0")
    .run(clientId);
  return result.changes > 0;
}

export function listOAuthClients(
  db: Database,
  tenantId: string,
): Array<Omit<OAuthClientRow, "client_secret_hash">> {
  return db
    .prepare(
      `SELECT client_id, tenant_id, name, grant_types, scopes, redirect_uris, created_at, revoked
       FROM oauth_clients WHERE tenant_id = ?`,
    )
    .all(tenantId) as Array<Omit<OAuthClientRow, "client_secret_hash">>;
}
