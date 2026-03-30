import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { createApp } from "../api/server.js";
import { generateKeyPair } from "../core/auth/jwt.js";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";
import { registerOAuthClient } from "../core/auth/oauth-clients.js";
import { computeCodeChallenge } from "../core/auth/pkce.js";
import { createAuthorizationCode } from "../core/auth/auth-codes.js";

let keys: { publicKey: CryptoKey; privateKey: CryptoKey };

beforeAll(async () => {
  keys = await generateKeyPair();
});

describe("POST /oauth/token (client_credentials)", () => {
  let app: ReturnType<typeof createApp>;
  let db: DatabaseSync;
  let tenantId: string;
  let clientId: string;
  let clientSecret: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    const t = seedTestTenant(db);
    tenantId = t.tenantId;
    const reg = registerOAuthClient(db, {
      tenantId,
      name: "test-cc",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });
    clientId = reg.clientId;
    clientSecret = reg.clientSecret!;
    app = createApp(db, ":memory:", undefined, undefined, undefined, {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      enabled: true,
    });
  });

  it("returns access_token for valid client_credentials grant", async () => {
    const res = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "meetings:read",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      access_token: expect.any(String),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meetings:read",
    });
  });

  it("rejects unsupported grant_type with 400", async () => {
    const res = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "password",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "unsupported_grant_type" });
  });

  it("rejects invalid client credentials with 401", async () => {
    const res = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: "wrong-secret",
      }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "invalid_client" });
  });

  it("rejects scope that exceeds client allowed scopes with 400", async () => {
    const res = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "admin",
      }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_scope" });
  });
});

describe("GET+POST /oauth/authorize", () => {
  let app: ReturnType<typeof createApp>;
  let db: DatabaseSync;
  let tenantId: string;
  let userId: string;
  let clientId: string;
  const ownerSecret = "test-owner-secret-123";
  const codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
  const codeChallenge = computeCodeChallenge(codeVerifier);

  beforeEach(() => {
    process.env.MTNINSIGHTS_OWNER_SECRET = ownerSecret;
    db = new DatabaseSync(":memory:");
    migrate(db);
    const t = seedTestTenant(db);
    tenantId = t.tenantId;
    userId = t.userId;
    const reg = registerOAuthClient(db, {
      tenantId,
      name: "test-authcode",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:read", "meetings:write"],
      redirectUris: ["http://localhost:3000/callback"],
    });
    clientId = reg.clientId;
    app = createApp(db, ":memory:", undefined, undefined, undefined, {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      enabled: true,
    });
  });

  it("returns HTML consent form for valid GET request", async () => {
    const url = `/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent("http://localhost:3000/callback")}&scope=meetings:read&code_challenge=${codeChallenge}&code_challenge_method=S256&state=xyz`;
    const res = await app.request(url);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("form");
    expect(html).toContain(clientId);
  });

  it("returns 302 redirect with code on valid POST with owner_secret", async () => {
    const res = await app.request("/oauth/authorize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        redirect_uri: "http://localhost:3000/callback",
        scope: "meetings:read",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: "xyz",
        owner_secret: ownerSecret,
      }),
    });

    expect(res.status).toBe(302);
    const location = res.headers.get("location")!;
    const url = new URL(location);
    expect(url.origin).toBe("http://localhost:3000");
    expect(url.pathname).toBe("/callback");
    expect(url.searchParams.get("code")).toEqual(expect.any(String));
    expect(url.searchParams.get("state")).toBe("xyz");
  });

  it("rejects POST with wrong owner_secret with 401", async () => {
    const res = await app.request("/oauth/authorize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        redirect_uri: "http://localhost:3000/callback",
        scope: "meetings:read",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: "xyz",
        owner_secret: "wrong-secret",
      }),
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "invalid_owner_secret" });
  });

  it("rejects POST with invalid client_id with 400", async () => {
    const res = await app.request("/oauth/authorize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: "nonexistent",
        redirect_uri: "http://localhost:3000/callback",
        scope: "meetings:read",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: "xyz",
        owner_secret: ownerSecret,
      }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_client" });
  });
});

describe("POST /oauth/token (authorization_code)", () => {
  let app: ReturnType<typeof createApp>;
  let db: DatabaseSync;
  let tenantId: string;
  let userId: string;
  let clientId: string;
  const codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
  const codeChallenge = computeCodeChallenge(codeVerifier);

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    const t = seedTestTenant(db);
    tenantId = t.tenantId;
    userId = t.userId;
    const reg = registerOAuthClient(db, {
      tenantId,
      name: "test-authcode-token",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:read"],
      redirectUris: ["http://localhost:3000/callback"],
    });
    clientId = reg.clientId;
    app = createApp(db, ":memory:", undefined, undefined, undefined, {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      enabled: true,
    });
  });

  it("exchanges authorization code for token pair", async () => {
    const code = createAuthorizationCode(db, {
      oauthClientId: clientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge,
    });

    const res = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:3000/callback",
        client_id: clientId,
        code_verifier: codeVerifier,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meetings:read",
    });
  });

  it("rejects invalid authorization code with 400", async () => {
    const res = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: "invalid-code",
        redirect_uri: "http://localhost:3000/callback",
        client_id: clientId,
        code_verifier: codeVerifier,
      }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_grant" });
  });
});

describe("POST /oauth/token (refresh_token)", () => {
  let app: ReturnType<typeof createApp>;
  let db: DatabaseSync;
  let tenantId: string;
  let userId: string;
  let clientId: string;
  const codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
  const codeChallenge = computeCodeChallenge(codeVerifier);

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    const t = seedTestTenant(db);
    tenantId = t.tenantId;
    userId = t.userId;
    const reg = registerOAuthClient(db, {
      tenantId,
      name: "test-refresh",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:read"],
      redirectUris: ["http://localhost:3000/callback"],
    });
    clientId = reg.clientId;
    app = createApp(db, ":memory:", undefined, undefined, undefined, {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      enabled: true,
    });
  });

  it("exchanges refresh token for new token pair", async () => {
    const code = createAuthorizationCode(db, {
      oauthClientId: clientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge,
    });

    const tokenRes = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:3000/callback",
        client_id: clientId,
        code_verifier: codeVerifier,
      }),
    });
    const tokenBody = await tokenRes.json();

    const res = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: tokenBody.refresh_token,
        client_id: clientId,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meetings:read",
    });
  });

  it("rejects invalid refresh token with 400", async () => {
    const res = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: "invalid-token",
        client_id: clientId,
      }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_grant" });
  });
});

describe("POST /oauth/revoke", () => {
  let app: ReturnType<typeof createApp>;
  let db: DatabaseSync;
  let tenantId: string;
  let clientId: string;
  let clientSecret: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    const t = seedTestTenant(db);
    tenantId = t.tenantId;
    const reg = registerOAuthClient(db, {
      tenantId,
      name: "test-revoke",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });
    clientId = reg.clientId;
    clientSecret = reg.clientSecret!;
    app = createApp(db, ":memory:", undefined, undefined, undefined, {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      enabled: true,
    });
  });

  it("revokes a valid token and returns 200", async () => {
    const tokenRes = await app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "meetings:read",
      }),
    });
    const tokenBody = await tokenRes.json();

    const res = await app.request("/oauth/revoke", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: tokenBody.access_token }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({});
  });

  it("returns 200 for invalid token per RFC 7009", async () => {
    const res = await app.request("/oauth/revoke", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "not-a-real-token" }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({});
  });
});

describe("GET /.well-known/oauth-authorization-server", () => {
  let app: ReturnType<typeof createApp>;
  let db: DatabaseSync;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    seedTestTenant(db);
    app = createApp(db, ":memory:", undefined, undefined, undefined, {
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      enabled: true,
    });
  });

  it("returns server metadata per RFC 8414", async () => {
    const res = await app.request("/.well-known/oauth-authorization-server");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      issuer: "mtninsights",
      authorization_endpoint: "/oauth/authorize",
      token_endpoint: "/oauth/token",
      registration_endpoint: "/oauth/register",
      revocation_endpoint: "/oauth/revoke",
      jwks_uri: "/oauth/jwks",
      scopes_supported: [
        "meetings:read",
        "meetings:write",
        "search:execute",
        "threads:read",
        "threads:write",
        "insights:read",
        "insights:write",
        "milestones:read",
        "milestones:write",
        "notes:read",
        "notes:write",
        "admin",
      ],
      response_types_supported: ["code"],
      grant_types_supported: ["client_credentials", "authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
    });
  });
});
