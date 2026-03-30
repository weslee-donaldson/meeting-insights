import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import { authenticateOAuthClient } from "../../core/auth/oauth-clients.js";
import { issueTokenPair } from "../../core/auth/token-service.js";
import { isValidScope } from "../../core/auth/scopes.js";
import type { Scope } from "../../core/auth/scopes.js";

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

    return c.json({ error: "unsupported_grant_type" }, 400);
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
