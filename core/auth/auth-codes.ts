import type { DatabaseSync as Database } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { verifyCodeChallenge } from "./pkce.js";
import { AppError } from "../errors.js";

interface CreateCodeOpts {
  oauthClientId: string;
  userId: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
  codeChallenge: string;
}

interface ExchangeCodeOpts {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}

interface ExchangeResult {
  userId: string;
  tenantId: string;
  scopes: string[];
}

interface AuthCodeRow {
  code: string;
  oauth_client_id: string;
  user_id: string;
  tenant_id: string;
  redirect_uri: string;
  scopes: string;
  code_challenge: string;
  code_challenge_method: string;
  expires_at: string;
  used: number;
  created_at: string;
}

export function createAuthorizationCode(db: Database, opts: CreateCodeOpts): string {
  const code = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  db.prepare(
    `INSERT INTO oauth_authorization_codes
     (code, oauth_client_id, user_id, tenant_id, redirect_uri, scopes, code_challenge, code_challenge_method, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'S256', ?)`,
  ).run(
    code,
    opts.oauthClientId,
    opts.userId,
    opts.tenantId,
    opts.redirectUri,
    JSON.stringify(opts.scopes),
    opts.codeChallenge,
    expiresAt,
  );

  return code;
}

export function exchangeAuthorizationCode(db: Database, opts: ExchangeCodeOpts): ExchangeResult {
  const row = db
    .prepare("SELECT * FROM oauth_authorization_codes WHERE code = ?")
    .get(opts.code) as AuthCodeRow | undefined;

  if (!row) {
    throw new AppError("INVALID_GRANT", "Authorization code not found");
  }

  if (row.used === 1) {
    throw new AppError("INVALID_GRANT", "Authorization code already used");
  }

  if (new Date(row.expires_at) < new Date()) {
    throw new AppError("INVALID_GRANT", "Authorization code expired");
  }

  if (row.oauth_client_id !== opts.clientId) {
    throw new AppError("INVALID_GRANT", "Client ID mismatch");
  }

  if (row.redirect_uri !== opts.redirectUri) {
    throw new AppError("INVALID_GRANT", "Redirect URI mismatch");
  }

  if (!verifyCodeChallenge(opts.codeVerifier, row.code_challenge)) {
    throw new AppError("INVALID_GRANT", "PKCE verification failed");
  }

  db.prepare("UPDATE oauth_authorization_codes SET used = 1 WHERE code = ?").run(opts.code);

  return {
    userId: row.user_id,
    tenantId: row.tenant_id,
    scopes: JSON.parse(row.scopes),
  };
}
