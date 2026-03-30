import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";
import { generateKeyPair, verifyAccessToken, verifyRefreshToken } from "../core/auth/jwt.js";
import { registerOAuthClient } from "../core/auth/oauth-clients.js";
import { issueTokenPair, refreshTokens, revokeToken, isTokenRevoked } from "../core/auth/token-service.js";

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

describe("refreshTokens", () => {
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

  it("returns a new token pair with access and refresh tokens", async () => {
    const original = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const result = await refreshTokens(db, original.refresh_token!, keys);

    expect(result).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "meetings:read",
    });
  });

  it("new tokens are different from the originals", async () => {
    const original = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const result = await refreshTokens(db, original.refresh_token!, keys);

    expect(result.access_token).not.toBe(original.access_token);
    expect(result.refresh_token).not.toBe(original.refresh_token);
  });

  it("revokes the old refresh token after rotation", async () => {
    const original = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const oldRefreshPayload = await verifyRefreshToken(keys.publicKey, original.refresh_token!);
    await refreshTokens(db, original.refresh_token!, keys);

    const row = db.prepare("SELECT revoked FROM oauth_tokens WHERE jti = ?").get(oldRefreshPayload.jti) as { revoked: number };
    expect(row.revoked).toBe(1);
  });

  it("throws TOKEN_REVOKED when using an already-revoked refresh token", async () => {
    const original = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    await refreshTokens(db, original.refresh_token!, keys);

    await expect(refreshTokens(db, original.refresh_token!, keys)).rejects.toThrow(
      expect.objectContaining({
        code: "TOKEN_REVOKED",
        name: "AppError",
      }),
    );
  });

  it("throws TOKEN_INVALID for a malformed refresh token", async () => {
    await expect(refreshTokens(db, "not.a.valid.token", keys)).rejects.toThrow(
      expect.objectContaining({
        code: "TOKEN_INVALID",
        name: "AppError",
      }),
    );
  });

  it("preserves the original scopes in the new token pair", async () => {
    const original = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read", "meetings:write"],
    }, keys);

    const result = await refreshTokens(db, original.refresh_token!, keys);

    expect(result.scope).toBe("meetings:read meetings:write");

    const accessPayload = await verifyAccessToken(keys.publicKey, result.access_token);
    expect(accessPayload.scope).toBe("meetings:read meetings:write");
  });

  it("new access token contains correct sub and tid claims", async () => {
    const original = await issueTokenPair(db, {
      oauthClientId,
      userId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const result = await refreshTokens(db, original.refresh_token!, keys);

    const payload = await verifyAccessToken(keys.publicKey, result.access_token);
    expect(payload.sub).toBe(userId);
    expect(payload.tid).toBe(tenantId);
  });
});

describe("revokeToken", () => {
  let db: DatabaseSync;
  let tenantId: string;
  let keys: { publicKey: CryptoKey; privateKey: CryptoKey };
  let oauthClientId: string;

  beforeAll(async () => {
    keys = await generateKeyPair();
  });

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId } = seedTestTenant(db));
    ({ clientId: oauthClientId } = registerOAuthClient(db, {
      tenantId,
      name: "Test Service",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    }));
  });

  it("returns true and marks the token as revoked", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const payload = await verifyAccessToken(keys.publicKey, result.access_token);
    const revoked = revokeToken(db, payload.jti);

    expect(revoked).toBe(true);

    const row = db.prepare("SELECT revoked FROM oauth_tokens WHERE jti = ?").get(payload.jti) as { revoked: number };
    expect(row.revoked).toBe(1);
  });

  it("returns false when the jti does not exist", () => {
    expect(revokeToken(db, "nonexistent-jti")).toBe(false);
  });

  it("returns false when the token is already revoked", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const payload = await verifyAccessToken(keys.publicKey, result.access_token);
    revokeToken(db, payload.jti);

    expect(revokeToken(db, payload.jti)).toBe(false);
  });
});

describe("isTokenRevoked", () => {
  let db: DatabaseSync;
  let tenantId: string;
  let keys: { publicKey: CryptoKey; privateKey: CryptoKey };
  let oauthClientId: string;

  beforeAll(async () => {
    keys = await generateKeyPair();
  });

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId } = seedTestTenant(db));
    ({ clientId: oauthClientId } = registerOAuthClient(db, {
      tenantId,
      name: "Test Service",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    }));
  });

  it("returns false for a non-revoked token", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const payload = await verifyAccessToken(keys.publicKey, result.access_token);
    expect(isTokenRevoked(db, payload.jti)).toBe(false);
  });

  it("returns true for a revoked token", async () => {
    const result = await issueTokenPair(db, {
      oauthClientId,
      tenantId,
      scopes: ["meetings:read"],
    }, keys);

    const payload = await verifyAccessToken(keys.publicKey, result.access_token);
    revokeToken(db, payload.jti);

    expect(isTokenRevoked(db, payload.jti)).toBe(true);
  });

  it("returns true when the jti does not exist in the database", () => {
    expect(isTokenRevoked(db, "nonexistent-jti")).toBe(true);
  });
});
