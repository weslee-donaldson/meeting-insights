import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import { timingSafeEqual } from "node:crypto";
import { authenticateOAuthClient, getOAuthClient } from "../../core/auth/oauth-clients.js";
import { issueTokenPair, refreshTokens } from "../../core/auth/token-service.js";
import { createAuthorizationCode, exchangeAuthorizationCode } from "../../core/auth/auth-codes.js";
import { isValidScope } from "../../core/auth/scopes.js";
import type { Scope } from "../../core/auth/scopes.js";
import { AppError } from "../../core/errors.js";

export interface OAuthDeps {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

export function registerOAuthRoutes(app: Hono, db: Database, deps?: OAuthDeps): void {
  if (!deps) return;

  app.post("/oauth/token", async (c) => {
    const body = await c.req.json();
    const grantType = body.grant_type;

    if (grantType === "client_credentials") {
      return handleClientCredentials(c, db, body, deps);
    }

    if (grantType === "authorization_code") {
      return handleAuthorizationCodeGrant(c, db, body, deps);
    }

    if (grantType === "refresh_token") {
      return handleRefreshTokenGrant(c, db, body, deps);
    }

    return c.json({ error: "unsupported_grant_type" }, 400);
  });

  app.get("/oauth/authorize", (c) => {
    const clientId = c.req.query("client_id") ?? "";
    const redirectUri = c.req.query("redirect_uri") ?? "";
    const scope = c.req.query("scope") ?? "";
    const codeChallenge = c.req.query("code_challenge") ?? "";
    const codeChallengeMethod = c.req.query("code_challenge_method") ?? "";
    const state = c.req.query("state") ?? "";

    const html = `<!DOCTYPE html>
<html><body>
<h1>Authorize</h1>
<form method="POST" action="/oauth/authorize">
<input type="hidden" name="client_id" value="${clientId}" />
<input type="hidden" name="redirect_uri" value="${redirectUri}" />
<input type="hidden" name="scope" value="${scope}" />
<input type="hidden" name="code_challenge" value="${codeChallenge}" />
<input type="hidden" name="code_challenge_method" value="${codeChallengeMethod}" />
<input type="hidden" name="state" value="${state}" />
<label>Owner Secret: <input type="password" name="owner_secret" /></label>
<button type="submit">Approve</button>
</form>
</body></html>`;

    return c.html(html);
  });

  app.post("/oauth/authorize", async (c) => {
    const body = await c.req.json();
    return handleAuthorize(c, db, body);
  });
}

async function handleClientCredentials(
  c: { json: (data: unknown, status?: number) => Response },
  db: Database,
  body: { client_id: string; client_secret: string; scope?: string },
  deps: OAuthDeps,
): Promise<Response> {
  const client = authenticateOAuthClient(db, body.client_id, body.client_secret);
  if (!client) {
    return c.json({ error: "invalid_client" }, 401);
  }

  const allowedScopes: string[] = JSON.parse(client.scopes);
  const requestedScopes = body.scope ? body.scope.split(" ") : allowedScopes;

  for (const s of requestedScopes) {
    if (!isValidScope(s) || !allowedScopes.includes(s)) {
      return c.json({ error: "invalid_scope" }, 400);
    }
  }

  const result = await issueTokenPair(
    db,
    {
      oauthClientId: client.client_id,
      tenantId: client.tenant_id,
      scopes: requestedScopes as Scope[],
    },
    deps,
  );

  return c.json(result);
}

async function handleAuthorizationCodeGrant(
  c: { json: (data: unknown, status?: number) => Response },
  db: Database,
  body: { code: string; redirect_uri: string; client_id: string; code_verifier: string },
  deps: OAuthDeps,
): Promise<Response> {
  try {
    const result = exchangeAuthorizationCode(db, {
      code: body.code,
      clientId: body.client_id,
      redirectUri: body.redirect_uri,
      codeVerifier: body.code_verifier,
    });

    const tokenResult = await issueTokenPair(
      db,
      {
        oauthClientId: body.client_id,
        userId: result.userId,
        tenantId: result.tenantId,
        scopes: result.scopes as Scope[],
      },
      deps,
    );

    return c.json(tokenResult);
  } catch (err) {
    if (err instanceof AppError) {
      return c.json({ error: "invalid_grant" }, 400);
    }
    throw err;
  }
}

async function handleRefreshTokenGrant(
  c: { json: (data: unknown, status?: number) => Response },
  db: Database,
  body: { refresh_token: string; client_id: string },
  deps: OAuthDeps,
): Promise<Response> {
  try {
    const result = await refreshTokens(db, body.refresh_token, deps);
    return c.json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return c.json({ error: "invalid_grant" }, 400);
    }
    throw err;
  }
}

function verifyOwnerSecret(provided: string): boolean {
  const expected = process.env.MTNINSIGHTS_OWNER_SECRET;
  if (!expected) return false;
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

function handleAuthorize(
  c: { json: (data: unknown, status?: number) => Response; redirect: (url: string, status?: number) => Response },
  db: Database,
  body: {
    client_id: string;
    redirect_uri: string;
    scope: string;
    code_challenge: string;
    code_challenge_method: string;
    state: string;
    owner_secret: string;
  },
): Response {
  if (!verifyOwnerSecret(body.owner_secret)) {
    return c.json({ error: "invalid_owner_secret" }, 401);
  }

  const client = getOAuthClient(db, body.client_id);
  if (!client) {
    return c.json({ error: "invalid_client" }, 400);
  }

  const allowedRedirects: string[] | null = client.redirect_uris ? JSON.parse(client.redirect_uris) : null;
  if (allowedRedirects && !allowedRedirects.includes(body.redirect_uri)) {
    return c.json({ error: "invalid_redirect_uri" }, 400);
  }

  const ownerRow = db
    .prepare("SELECT user_id FROM tenant_memberships WHERE tenant_id = ? AND role = 'owner' LIMIT 1")
    .get(client.tenant_id) as { user_id: string } | undefined;
  const userId = ownerRow?.user_id ?? client.tenant_id;

  const requestedScopes = body.scope ? body.scope.split(" ") : [];
  const allowedScopes: string[] = JSON.parse(client.scopes);
  for (const s of requestedScopes) {
    if (!isValidScope(s) || !allowedScopes.includes(s)) {
      return c.json({ error: "invalid_scope" }, 400);
    }
  }

  const code = createAuthorizationCode(db, {
    oauthClientId: client.client_id,
    userId,
    tenantId: client.tenant_id,
    redirectUri: body.redirect_uri,
    scopes: requestedScopes,
    codeChallenge: body.code_challenge,
  });

  const redirectUrl = new URL(body.redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (body.state) {
    redirectUrl.searchParams.set("state", body.state);
  }

  return c.redirect(redirectUrl.toString(), 302);
}
