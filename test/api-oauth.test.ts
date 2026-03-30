import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { createApp } from "../api/server.js";
import { generateKeyPair } from "../core/auth/jwt.js";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";
import { registerOAuthClient } from "../core/auth/oauth-clients.js";

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
