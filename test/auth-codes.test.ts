import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";
import { registerOAuthClient } from "../core/auth/oauth-clients.js";
import { generateCodeVerifier, computeCodeChallenge } from "../core/auth/pkce.js";
import {
  createAuthorizationCode,
  exchangeAuthorizationCode,
} from "../core/auth/auth-codes.js";

describe("createAuthorizationCode", () => {
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
      name: "Auth Code Client",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:read"],
      redirectUris: ["http://localhost:3000/callback"],
    }));
  });

  it("returns a 64-character hex code", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    expect(code.length).toBe(64);
    expect(code).toMatch(/^[0-9a-f]+$/);
  });

  it("stores the code in the database with correct fields", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    const row = db.prepare("SELECT * FROM oauth_authorization_codes WHERE code = ?").get(code) as {
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
    };

    expect(row).toEqual({
      code,
      oauth_client_id: oauthClientId,
      user_id: userId,
      tenant_id: tenantId,
      redirect_uri: "http://localhost:3000/callback",
      scopes: JSON.stringify(["meetings:read"]),
      code_challenge: challenge,
      code_challenge_method: "S256",
      expires_at: expect.any(String),
      used: 0,
      created_at: expect.any(String),
    });
  });
});

describe("exchangeAuthorizationCode", () => {
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
      name: "Exchange Client",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:read", "meetings:write"],
      redirectUris: ["http://localhost:3000/callback"],
    }));
  });

  it("returns userId, tenantId, and scopes for a valid exchange", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    const result = exchangeAuthorizationCode(db, {
      code,
      clientId: oauthClientId,
      redirectUri: "http://localhost:3000/callback",
      codeVerifier: verifier,
    });

    expect(result).toEqual({
      userId,
      tenantId,
      scopes: ["meetings:read"],
    });
  });

  it("marks the code as used after exchange", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    exchangeAuthorizationCode(db, {
      code,
      clientId: oauthClientId,
      redirectUri: "http://localhost:3000/callback",
      codeVerifier: verifier,
    });

    const row = db.prepare("SELECT used FROM oauth_authorization_codes WHERE code = ?").get(code) as { used: number };
    expect(row.used).toBe(1);
  });

  it("throws INVALID_GRANT for a non-existent code", () => {
    expect(() =>
      exchangeAuthorizationCode(db, {
        code: "nonexistent",
        clientId: oauthClientId,
        redirectUri: "http://localhost:3000/callback",
        codeVerifier: "any",
      }),
    ).toThrow("Authorization code not found");
  });

  it("throws INVALID_GRANT for an already-used code", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    exchangeAuthorizationCode(db, {
      code,
      clientId: oauthClientId,
      redirectUri: "http://localhost:3000/callback",
      codeVerifier: verifier,
    });

    expect(() =>
      exchangeAuthorizationCode(db, {
        code,
        clientId: oauthClientId,
        redirectUri: "http://localhost:3000/callback",
        codeVerifier: verifier,
      }),
    ).toThrow("Authorization code already used");
  });

  it("throws INVALID_GRANT for an expired code", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    const pastTime = new Date(Date.now() - 60_000).toISOString();
    db.prepare("UPDATE oauth_authorization_codes SET expires_at = ? WHERE code = ?").run(pastTime, code);

    expect(() =>
      exchangeAuthorizationCode(db, {
        code,
        clientId: oauthClientId,
        redirectUri: "http://localhost:3000/callback",
        codeVerifier: verifier,
      }),
    ).toThrow("Authorization code expired");
  });

  it("throws INVALID_GRANT when clientId does not match", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    expect(() =>
      exchangeAuthorizationCode(db, {
        code,
        clientId: "wrong-client-id",
        redirectUri: "http://localhost:3000/callback",
        codeVerifier: verifier,
      }),
    ).toThrow("Client ID mismatch");
  });

  it("throws INVALID_GRANT when redirectUri does not match", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    expect(() =>
      exchangeAuthorizationCode(db, {
        code,
        clientId: oauthClientId,
        redirectUri: "http://localhost:4000/callback",
        codeVerifier: verifier,
      }),
    ).toThrow("Redirect URI mismatch");
  });

  it("throws INVALID_GRANT when the code verifier is wrong", () => {
    const verifier = generateCodeVerifier();
    const challenge = computeCodeChallenge(verifier);

    const code = createAuthorizationCode(db, {
      oauthClientId,
      userId,
      tenantId,
      redirectUri: "http://localhost:3000/callback",
      scopes: ["meetings:read"],
      codeChallenge: challenge,
    });

    const wrongVerifier = generateCodeVerifier();

    expect(() =>
      exchangeAuthorizationCode(db, {
        code,
        clientId: oauthClientId,
        redirectUri: "http://localhost:3000/callback",
        codeVerifier: wrongVerifier,
      }),
    ).toThrow("PKCE verification failed");
  });
});
