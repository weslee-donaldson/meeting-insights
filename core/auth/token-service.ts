import type { DatabaseSync as Database } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { signAccessToken, signRefreshToken } from "./jwt.js";
import type { Scope } from "./scopes.js";

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
