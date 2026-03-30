import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";
import { generateKeyPair, verifyAccessToken, verifyRefreshToken } from "../core/auth/jwt.js";
import { registerOAuthClient } from "../core/auth/oauth-clients.js";
import { issueTokenPair } from "../core/auth/token-service.js";

describe("issueTokenPair", () => {
  let db: DatabaseSync;
  let tenantId: string;
  let userId: string;
  let keys: { publicKey: CryptoKey; privateKey: CryptoKey };
  let oauthClientId: string;

  beforeAll(async () => {
    keys = await generateKeyPair();
  });

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId, userId } = seedTestTenant(db));
    ({ clientId: oauthClientId } = registerOAuthClient(db, {
      tenantId,
      name: "Test Service",
      grantTypes: ["client_credentials", "authorization_code"],
      scopes: ["meetings:read", "meetings:write"],
    }));
  });

  it("returns access token, token type, expires_in, and scope for client_credentials flow", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    expect(result).toEqual({
      access_token: expect.any(String),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meetings:read",
    });
  });

  it("includes refresh_token when userId is provided", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read", "meetings:write"],
    }, keys);

    expect(result).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meetings:read meetings:write",
    });
  });

  it("omits refresh_token when userId is not provided", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    expect(result.refresh_token).toBeUndefined();
  });

  it("access token contains correct JWT claims", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const payload = await verifyAccessToken(keys.publicKey, result.access_token);
    expect(payload).toEqual({
      sub: userId,
      tid: tenantId,
      scope: "meetings:read",
      jti: expect.any(String),
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it("access token sub is oauthClientId when no userId", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const payload = await verifyAccessToken(keys.publicKey, result.access_token);
    expect(payload.sub).toBe(oauthClientId);
  });

  it("refresh token contains correct JWT claims", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const payload = await verifyRefreshToken(keys.publicKey, result.refresh_token!);
    expect(payload).toEqual({
      sub: userId,
      tid: tenantId,
      jti: expect.any(String),
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it("inserts access token row into oauth_tokens", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const payload = await verifyAccessToken(keys.publicKey, result.access_token);
    const row = db.prepare("SELECT * FROM oauth_tokens WHERE jti = ?").get(payload.jti) as {
      jti: string;
      oauth_client_id: string;
      user_id: string | null;
      tenant_id: string;
      scopes: string;
      token_type: string;
      expires_at: string;
      revoked: number;
      created_at: string;
    };

    expect(row).toEqual({
      jti: payload.jti,
      oauth_client_id: oauthClientId,
      user_id: null,
      tenant_id: tenantId,
      scopes: "meetings:read",
      token_type: "access",
      expires_at: expect.any(String),
      revoked: 0,
      created_at: expect.any(String),
    });
  });

  it("inserts both access and refresh token rows when userId is provided", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const accessPayload = await verifyAccessToken(keys.publicKey, result.access_token);
    const refreshPayload = await verifyRefreshToken(keys.publicKey, result.refresh_token!);

    const rows = db.prepare("SELECT * FROM oauth_tokens ORDER BY token_type").all() as Array<{
      jti: string;
      token_type: string;
      user_id: string | null;
    }>;

    expect(rows).toEqual([
      {
        jti: accessPayload.jti,
        oauth_client_id: oauthClientId,
        user_id: userId,
        tenant_id: tenantId,
        scopes: "meetings:read",
        token_type: "access",
        expires_at: expect.any(String),
        revoked: 0,
        created_at: expect.any(String),
      },
      {
        jti: refreshPayload.jti,
        oauth_client_id: oauthClientId,
        user_id: userId,
        tenant_id: tenantId,
        scopes: "meetings:read",
        token_type: "refresh",
        expires_at: expect.any(String),
        revoked: 0,
        created_at: expect.any(String),
      },
    ]);
  });

  it("joins multiple scopes with space separator", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read", "meetings:write", "search:execute"],
    }, keys);

    expect(result.scope).toBe("meetings:read meetings:write search:execute");
  });
});
