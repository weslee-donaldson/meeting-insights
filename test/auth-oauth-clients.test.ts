import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { migrate } from "../core/db.js";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";
import {
  registerOAuthClient,
  getOAuthClient,
  authenticateOAuthClient,
  revokeOAuthClient,
  listOAuthClients,
} from "../core/auth/oauth-clients.js";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

describe("registerOAuthClient", () => {
  let db: DatabaseSync;
  let tenantId: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId } = seedTestTenant(db));
  });

  it("registers a confidential client with client_credentials grant", () => {
    const result = registerOAuthClient(db, {
      tenantId,
      name: "My Service",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read", "meetings:write"],
    });

    expect(result).toEqual({
      clientId: expect.any(String),
      clientSecret: expect.any(String),
    });
    expect(result.clientSecret!.length).toBe(64);
  });

  it("stores the hashed secret in the database", () => {
    const result = registerOAuthClient(db, {
      tenantId,
      name: "Hashed Secret Check",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    const row = db.prepare("SELECT * FROM oauth_clients WHERE client_id = ?").get(result.clientId) as {
      client_secret_hash: string;
      name: string;
      tenant_id: string;
      grant_types: string;
      scopes: string;
      revoked: number;
      created_at: string;
    };

    expect(row).toEqual({
      client_id: result.clientId,
      tenant_id: tenantId,
      client_secret_hash: sha256(result.clientSecret!),
      name: "Hashed Secret Check",
      grant_types: JSON.stringify(["client_credentials"]),
      scopes: JSON.stringify(["meetings:read"]),
      redirect_uris: null,
      created_at: expect.any(String),
      revoked: 0,
    });
  });

  it("registers a public client with authorization_code grant and no secret", () => {
    const result = registerOAuthClient(db, {
      tenantId,
      name: "Public SPA",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:read"],
      redirectUris: ["http://localhost:3000/callback"],
    });

    expect(result).toEqual({
      clientId: expect.any(String),
    });
    expect(result.clientSecret).toBeUndefined();
  });

  it("stores redirect_uris as JSON when provided", () => {
    const result = registerOAuthClient(db, {
      tenantId,
      name: "Redirect Client",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:read"],
      redirectUris: ["http://localhost:3000/callback", "http://localhost:4000/callback"],
    });

    const row = db.prepare("SELECT redirect_uris FROM oauth_clients WHERE client_id = ?").get(result.clientId) as {
      redirect_uris: string;
    };

    expect(JSON.parse(row.redirect_uris)).toEqual([
      "http://localhost:3000/callback",
      "http://localhost:4000/callback",
    ]);
  });

  it("generates a secret when grantTypes includes client_credentials among others", () => {
    const result = registerOAuthClient(db, {
      tenantId,
      name: "Hybrid Client",
      grantTypes: ["client_credentials", "authorization_code"],
      scopes: ["meetings:read"],
      redirectUris: ["http://localhost:3000/callback"],
    });

    expect(result.clientSecret).toEqual(expect.any(String));
  });
});

describe("getOAuthClient", () => {
  let db: DatabaseSync;
  let tenantId: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId } = seedTestTenant(db));
  });

  it("returns the client row for an active client", () => {
    const { clientId } = registerOAuthClient(db, {
      tenantId,
      name: "Active Client",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    const client = getOAuthClient(db, clientId);

    expect(client).toEqual({
      client_id: clientId,
      tenant_id: tenantId,
      client_secret_hash: expect.any(String),
      name: "Active Client",
      grant_types: JSON.stringify(["client_credentials"]),
      scopes: JSON.stringify(["meetings:read"]),
      redirect_uris: null,
      created_at: expect.any(String),
      revoked: 0,
    });
  });

  it("returns null for a non-existent client_id", () => {
    expect(getOAuthClient(db, "nonexistent")).toBe(null);
  });

  it("returns null for a revoked client", () => {
    const { clientId } = registerOAuthClient(db, {
      tenantId,
      name: "Soon Revoked",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    db.prepare("UPDATE oauth_clients SET revoked = 1 WHERE client_id = ?").run(clientId);

    expect(getOAuthClient(db, clientId)).toBe(null);
  });
});

describe("authenticateOAuthClient", () => {
  let db: DatabaseSync;
  let tenantId: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId } = seedTestTenant(db));
  });

  it("returns the client row when the secret matches", () => {
    const { clientId, clientSecret } = registerOAuthClient(db, {
      tenantId,
      name: "Auth Test",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    const client = authenticateOAuthClient(db, clientId, clientSecret!);

    expect(client).toEqual({
      client_id: clientId,
      tenant_id: tenantId,
      client_secret_hash: expect.any(String),
      name: "Auth Test",
      grant_types: JSON.stringify(["client_credentials"]),
      scopes: JSON.stringify(["meetings:read"]),
      redirect_uris: null,
      created_at: expect.any(String),
      revoked: 0,
    });
  });

  it("returns null when the secret does not match", () => {
    const { clientId } = registerOAuthClient(db, {
      tenantId,
      name: "Wrong Secret",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    expect(authenticateOAuthClient(db, clientId, "wrong-secret")).toBe(null);
  });

  it("returns null for a non-existent client_id", () => {
    expect(authenticateOAuthClient(db, "nonexistent", "any-secret")).toBe(null);
  });

  it("authenticates a public client when clientSecret is null and client has no secret", () => {
    const { clientId } = registerOAuthClient(db, {
      tenantId,
      name: "Public Client",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:read"],
      redirectUris: ["http://localhost:3000/callback"],
    });

    const client = authenticateOAuthClient(db, clientId, null);

    expect(client).toEqual({
      client_id: clientId,
      tenant_id: tenantId,
      client_secret_hash: null,
      name: "Public Client",
      grant_types: JSON.stringify(["authorization_code"]),
      scopes: JSON.stringify(["meetings:read"]),
      redirect_uris: JSON.stringify(["http://localhost:3000/callback"]),
      created_at: expect.any(String),
      revoked: 0,
    });
  });

  it("returns null when a confidential client receives null secret", () => {
    const { clientId } = registerOAuthClient(db, {
      tenantId,
      name: "Confidential Client",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    expect(authenticateOAuthClient(db, clientId, null)).toBe(null);
  });

  it("returns null for a revoked client even with correct secret", () => {
    const { clientId, clientSecret } = registerOAuthClient(db, {
      tenantId,
      name: "Revoked Auth",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    db.prepare("UPDATE oauth_clients SET revoked = 1 WHERE client_id = ?").run(clientId);

    expect(authenticateOAuthClient(db, clientId, clientSecret!)).toBe(null);
  });
});

describe("revokeOAuthClient", () => {
  let db: DatabaseSync;
  let tenantId: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId } = seedTestTenant(db));
  });

  it("returns true and marks the client as revoked", () => {
    const { clientId } = registerOAuthClient(db, {
      tenantId,
      name: "To Revoke",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    const result = revokeOAuthClient(db, clientId);

    expect(result).toBe(true);
    expect(getOAuthClient(db, clientId)).toBe(null);
  });

  it("returns false when the client_id does not exist", () => {
    expect(revokeOAuthClient(db, "nonexistent")).toBe(false);
  });
});

describe("listOAuthClients", () => {
  let db: DatabaseSync;
  let tenantId: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    ({ tenantId } = seedTestTenant(db));
  });

  it("returns all clients for a tenant without the secret hash", () => {
    registerOAuthClient(db, {
      tenantId,
      name: "Client A",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });
    registerOAuthClient(db, {
      tenantId,
      name: "Client B",
      grantTypes: ["authorization_code"],
      scopes: ["meetings:write"],
      redirectUris: ["http://localhost:3000/callback"],
    });

    const clients = listOAuthClients(db, tenantId);

    expect(clients).toEqual([
      {
        client_id: expect.any(String),
        tenant_id: tenantId,
        name: "Client A",
        grant_types: JSON.stringify(["client_credentials"]),
        scopes: JSON.stringify(["meetings:read"]),
        redirect_uris: null,
        created_at: expect.any(String),
        revoked: 0,
      },
      {
        client_id: expect.any(String),
        tenant_id: tenantId,
        name: "Client B",
        grant_types: JSON.stringify(["authorization_code"]),
        scopes: JSON.stringify(["meetings:write"]),
        redirect_uris: JSON.stringify(["http://localhost:3000/callback"]),
        created_at: expect.any(String),
        revoked: 0,
      },
    ]);
  });

  it("returns an empty array when no clients exist for the tenant", () => {
    expect(listOAuthClients(db, tenantId)).toEqual([]);
  });

  it("does not return clients belonging to a different tenant", () => {
    const otherTenantId = "other-tenant-id";
    db.prepare("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)").run(otherTenantId, "Other", "other");

    registerOAuthClient(db, {
      tenantId: otherTenantId,
      name: "Other Client",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    expect(listOAuthClients(db, tenantId)).toEqual([]);
  });

  it("includes revoked clients in the listing", () => {
    const { clientId } = registerOAuthClient(db, {
      tenantId,
      name: "Revoked Listed",
      grantTypes: ["client_credentials"],
      scopes: ["meetings:read"],
    });

    revokeOAuthClient(db, clientId);

    const clients = listOAuthClients(db, tenantId);
    expect(clients).toEqual([
      {
        client_id: clientId,
        tenant_id: tenantId,
        name: "Revoked Listed",
        grant_types: JSON.stringify(["client_credentials"]),
        scopes: JSON.stringify(["meetings:read"]),
        redirect_uris: null,
        created_at: expect.any(String),
        revoked: 1,
      },
    ]);
  });
});
