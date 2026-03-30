import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { Hono } from "hono";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";
import { generateKeyPair } from "../core/auth/jwt.js";
import { createApiKey } from "../core/auth/api-keys.js";
import { registerOAuthClient } from "../core/auth/oauth-clients.js";
import { issueTokenPair, revokeToken } from "../core/auth/token-service.js";
import { verifyAccessToken } from "../core/auth/jwt.js";
import { createAuthMiddleware } from "../api/middleware/auth.js";
import type { AuthConfig } from "../api/middleware/auth.js";
import { createApp } from "../api/server.js";

let keys: { publicKey: CryptoKey; privateKey: CryptoKey };

beforeAll(async () => {
  keys = await generateKeyPair();
});

function buildApp(db: DatabaseSync, authConfig: AuthConfig | undefined): Hono {
  const app = new Hono();
  app.use(createAuthMiddleware(db, authConfig));
  app.get("/api/meetings", (c) => c.json({ ok: true }));
  app.post("/api/meetings", (c) => c.json({ ok: true }));
  app.get("/api/debug", (c) => c.json({ ok: true }));
  app.get("/.well-known/oauth-authorization-server", (c) => c.json({ issuer: "test" }));
  app.get("/oauth/token", (c) => c.json({ ok: true }));
  app.get("/oauth/authorize", (c) => c.json({ ok: true }));
  app.get("/oauth/jwks", (c) => c.json({ ok: true }));
  app.get("/api/search", (c) => c.json({ ok: true }));
  return app;
}

describe("createAuthMiddleware", () => {
  describe("when auth is disabled", () => {
    it("passes all requests through without checking authorization", async () => {
      const db = new DatabaseSync(":memory:");
      migrate(db);
      const app = buildApp(db, undefined);

      const res = await app.request("/api/meetings");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });

    it("passes requests through when enabled is false", async () => {
      const db = new DatabaseSync(":memory:");
      migrate(db);
      const app = buildApp(db, { publicKey: keys.publicKey, privateKey: keys.privateKey, enabled: false });

      const res = await app.request("/api/meetings");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });
  });

  describe("when auth is enabled", () => {
    let db: DatabaseSync;
    let app: Hono;
    let tenantId: string;
    let userId: string;
    let oauthClientId: string;

    beforeEach(() => {
      db = new DatabaseSync(":memory:");
      migrate(db);
      ({ tenantId, userId } = seedTestTenant(db));
      ({ clientId: oauthClientId } = registerOAuthClient(db, {
        tenantId,
        name: "Test Service",
        grantTypes: ["client_credentials", "authorization_code"],
        scopes: ["meetings:read", "meetings:write", "search:execute", "admin"],
      }));
      app = buildApp(db, { publicKey: keys.publicKey, privateKey: keys.privateKey, enabled: true });
    });

    it("returns 401 when no authorization header is present", async () => {
      const res = await app.request("/api/meetings");

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    });

    it("returns 401 when authorization header is not Bearer", async () => {
      const res = await app.request("/api/meetings", {
        headers: { authorization: "Basic abc123" },
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    });

    it("returns 401 for an invalid JWT token", async () => {
      const res = await app.request("/api/meetings", {
        headers: { authorization: "Bearer invalid.jwt.token" },
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    });

    it("returns 200 with a valid JWT that has the required scope", async () => {
      const { access_token } = await issueTokenPair(db, {
        oauthClientId,
        userId,
        tenantId,
        scopes: ["meetings:read"],
      }, keys);

      const res = await app.request("/api/meetings", {
        headers: { authorization: `Bearer ${access_token}` },
      });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });

    it("returns 403 when JWT lacks the required scope", async () => {
      const { access_token } = await issueTokenPair(db, {
        oauthClientId,
        userId,
        tenantId,
        scopes: ["search:execute"],
      }, keys);

      const res = await app.request("/api/meetings", {
        headers: { authorization: `Bearer ${access_token}` },
      });

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "forbidden", required_scope: "meetings:read" });
    });

    it("returns 401 for a revoked JWT token", async () => {
      const { access_token } = await issueTokenPair(db, {
        oauthClientId,
        userId,
        tenantId,
        scopes: ["meetings:read"],
      }, keys);

      const payload = await verifyAccessToken(keys.publicKey, access_token);
      revokeToken(db, payload.jti);

      const res = await app.request("/api/meetings", {
        headers: { authorization: `Bearer ${access_token}` },
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    });

    it("returns 200 with a valid API key that has the required scope", async () => {
      const { key } = createApiKey(db, {
        tenantId,
        userId,
        name: "Test API Key",
        scopes: ["meetings:read"],
      });

      const res = await app.request("/api/meetings", {
        headers: { authorization: `Bearer ${key}` },
      });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });

    it("returns 401 for an invalid API key", async () => {
      const res = await app.request("/api/meetings", {
        headers: { authorization: "Bearer mki_0000000000000000000000000000000000000000000000000000000000000000" },
      });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    });

    it("returns 403 when API key lacks the required scope", async () => {
      const { key } = createApiKey(db, {
        tenantId,
        userId,
        name: "Limited API Key",
        scopes: ["search:execute"],
      });

      const res = await app.request("/api/meetings", {
        headers: { authorization: `Bearer ${key}` },
      });

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "forbidden", required_scope: "meetings:read" });
    });

    it("bypasses auth for /.well-known/oauth-authorization-server", async () => {
      const res = await app.request("/.well-known/oauth-authorization-server");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ issuer: "test" });
    });

    it("bypasses auth for /oauth/token", async () => {
      const res = await app.request("/oauth/token");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });

    it("bypasses auth for /oauth/authorize", async () => {
      const res = await app.request("/oauth/authorize");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });

    it("bypasses auth for /oauth/jwks", async () => {
      const res = await app.request("/oauth/jwks");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });

    it("sets auth identity on context for downstream handlers", async () => {
      const innerApp = new Hono();
      innerApp.use(createAuthMiddleware(db, { publicKey: keys.publicKey, privateKey: keys.privateKey, enabled: true }));
      innerApp.get("/api/meetings", (c) => {
        const auth = c.get("auth");
        return c.json(auth);
      });

      const { access_token } = await issueTokenPair(db, {
        oauthClientId,
        userId,
        tenantId,
        scopes: ["meetings:read"],
      }, keys);

      const res = await innerApp.request("/api/meetings", {
        headers: { authorization: `Bearer ${access_token}` },
      });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        tenantId,
        userId,
        scopes: ["meetings:read"],
      });
    });

    it("checks admin scope for /api/debug", async () => {
      const { access_token } = await issueTokenPair(db, {
        oauthClientId,
        userId,
        tenantId,
        scopes: ["meetings:read"],
      }, keys);

      const res = await app.request("/api/debug", {
        headers: { authorization: `Bearer ${access_token}` },
      });

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "forbidden", required_scope: "admin" });
    });

    it("allows admin-scoped token to access /api/debug", async () => {
      const { access_token } = await issueTokenPair(db, {
        oauthClientId,
        userId,
        tenantId,
        scopes: ["admin"],
      }, keys);

      const res = await app.request("/api/debug", {
        headers: { authorization: `Bearer ${access_token}` },
      });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });
  });
});

describe("createApp with authConfig", () => {
  let db: DatabaseSync;
  let tenantId: string;
  let userId: string;
  let oauthClientId: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId, userId } = seedTestTenant(db));
    ({ clientId: oauthClientId } = registerOAuthClient(db, {
      tenantId,
      name: "Integration Service",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read", "admin"],
    }));
  });

  it("allows unauthenticated access when authConfig is omitted", async () => {
    const app = createApp(db, ":memory:");

    const res = await app.request("/api/debug");

    expect(res.status).toBe(200);
  });

  it("returns 401 on protected route when auth is enabled and no token provided", async () => {
    const app = createApp(db, ":memory:", undefined, undefined, undefined, { publicKey: keys.publicKey, privateKey: keys.privateKey, enabled: true });

    const res = await app.request("/api/debug");

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  it("returns 200 on protected route with valid JWT through createApp", async () => {
    const app = createApp(db, ":memory:", undefined, undefined, undefined, { publicKey: keys.publicKey, privateKey: keys.privateKey, enabled: true });

    const { access_token } = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["admin"],
    }, keys);

    const res = await app.request("/api/debug", {
      headers: { authorization: `Bearer ${access_token}` },
    });

    expect(res.status).toBe(200);
  });

  it("returns 403 when JWT scope does not match route through createApp", async () => {
    const app = createApp(db, ":memory:", undefined, undefined, undefined, { publicKey: keys.publicKey, privateKey: keys.privateKey, enabled: true });

    const { access_token } = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const res = await app.request("/api/debug", {
      headers: { authorization: `Bearer ${access_token}` },
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "forbidden", required_scope: "admin" });
  });

  it("returns 200 with valid API key through createApp", async () => {
    const app = createApp(db, ":memory:", undefined, undefined, undefined, { publicKey: keys.publicKey, privateKey: keys.privateKey, enabled: true });

    const { key } = createApiKey(db, {
      tenantId,
      userId,
      name: "Integration API Key",
      scopes: ["meetings:read"],
    });

    const res = await app.request("/api/meetings", {
      headers: { authorization: `Bearer ${key}` },
    });

    expect(res.status).toBe(200);
  });
});
