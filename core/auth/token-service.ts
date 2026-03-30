import type { DatabaseSync as Database } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./jwt.js";
import type { Scope } from "./scopes.js";
import { AppError } from "../errors.js";

interface IssueOpts {
  oauthClientId: string;
  userId?: string;
  tenantId: string;
  scopes: Scope[];
}

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export async function issueTokenPair(
  db: Database,
  opts: IssueOpts,
  keys: KeyPair,
): Promise<{
  access_token: string;
  refresh_token?: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}> {
  const scopeString = opts.scopes.join(" ");
  const sub = opts.userId ?? opts.oauthClientId;
  const accessJti = randomUUID();
  const accessToken = await signAccessToken(keys.privateKey, {
    sub,
    tid: opts.tenantId,
    scope: scopeString,
    jti: accessJti,
  });

  const accessExpiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
  db.prepare(
    `INSERT INTO oauth_tokens (jti, oauth_client_id, user_id, tenant_id, scopes, token_type, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(accessJti, opts.oauthClientId, opts.userId ?? null, opts.tenantId, scopeString, "access", accessExpiresAt);

  if (!opts.userId) {
    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: scopeString,
    };
  }

  const refreshJti = randomUUID();
  const refreshToken = await signRefreshToken(keys.privateKey, {
    sub,
    tid: opts.tenantId,
    jti: refreshJti,
  });

  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  db.prepare(
    `INSERT INTO oauth_tokens (jti, oauth_client_id, user_id, tenant_id, scopes, token_type, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(refreshJti, opts.oauthClientId, opts.userId, opts.tenantId, scopeString, "refresh", refreshExpiresAt);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: scopeString,
  };
}

interface TokenRow {
  jti: string;
  oauth_client_id: string;
  user_id: string | null;
  tenant_id: string;
  scopes: string;
  token_type: string;
  expires_at: string;
  revoked: number;
}

export async function refreshTokens(
  db: Database,
  refreshToken: string,
  keys: KeyPair,
): Promise<{
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}> {
  let payload: { sub: string; tid: string; jti: string };
  try {
    payload = await verifyRefreshToken(keys.publicKey, refreshToken);
  } catch {
    throw new AppError("TOKEN_INVALID", "Invalid refresh token");
  }

  const row = db
    .prepare("SELECT * FROM oauth_tokens WHERE jti = ?")
    .get(payload.jti) as TokenRow | undefined;

  if (!row || row.revoked === 1) {
    throw new AppError("TOKEN_REVOKED", "Refresh token has been revoked");
  }

  db.prepare("UPDATE oauth_tokens SET revoked = 1 WHERE jti = ?").run(payload.jti);

  const scopes = row.scopes.split(" ") as Scope[];
  return issueTokenPair(db, {
    oauthClientId: row.oauth_client_id,
    userId: row.user_id ?? undefined,
    tenantId: row.tenant_id,
    scopes,
  }, keys) as Promise<{
    access_token: string;
    refresh_token: string;
    token_type: "Bearer";
    expires_in: number;
    scope: string;
  }>;
}

export function revokeToken(db: Database, jti: string): boolean {
  const result = db
    .prepare("UPDATE oauth_tokens SET revoked = 1 WHERE jti = ? AND revoked = 0")
    .run(jti);
  return result.changes > 0;
}

export function isTokenRevoked(db: Database, jti: string): boolean {
  const row = db
    .prepare("SELECT revoked FROM oauth_tokens WHERE jti = ?")
    .get(jti) as { revoked: number } | undefined;
  if (!row) return true;
  return row.revoked === 1;
}
