import type { MiddlewareHandler } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import { validateApiKey } from "../../core/auth/api-keys.js";
import { verifyAccessToken } from "../../core/auth/jwt.js";
import { isTokenRevoked } from "../../core/auth/token-service.js";
import { scopesForRoute } from "../../core/auth/scopes.js";
import type { AuthIdentity, Scope } from "../../core/auth/scopes.js";

export interface AuthConfig {
  publicKey: CryptoKey;
  enabled: boolean;
}

const BYPASS_PATHS = [
  "/.well-known/oauth-authorization-server",
  "/oauth/token",
  "/oauth/authorize",
  "/oauth/jwks",
];

export function createAuthMiddleware(db: Database, authConfig: AuthConfig | undefined): MiddlewareHandler {
  return async (c, next) => {
    if (!authConfig?.enabled) {
      await next();
      return;
    }

    if (BYPASS_PATHS.includes(c.req.path)) {
      await next();
      return;
    }

    const authHeader = c.req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }

    const token = authHeader.slice(7);
    let identity: AuthIdentity;

    if (token.startsWith("mki_")) {
      const result = validateApiKey(db, token);
      if (!result) {
        c.status(401);
        return c.json({ error: "unauthorized" });
      }
      identity = result;
    } else {
      try {
        const payload = await verifyAccessToken(authConfig.publicKey, token);
        if (isTokenRevoked(db, payload.jti)) {
          c.status(401);
          return c.json({ error: "unauthorized" });
        }
        identity = {
          tenantId: payload.tid,
          userId: payload.sub,
          scopes: payload.scope.split(" ") as Scope[],
        };
      } catch {
        c.status(401);
        return c.json({ error: "unauthorized" });
      }
    }

    c.set("auth", identity);

    const requiredScopes = scopesForRoute(c.req.method, c.req.path);
    if (requiredScopes.length > 0) {
      const hasScope = requiredScopes.every(s => identity.scopes.includes(s));
      if (!hasScope) {
        c.status(403);
        return c.json({ error: "forbidden", required_scope: requiredScopes[0] });
      }
    }

    await next();
  };
}
