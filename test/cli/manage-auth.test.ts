import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../../core/db.js";
import type { Database } from "../../core/db.js";
import { seedTestTenant } from "../helpers/seed-test-tenant.js";
import { buildProgram } from "../../cli/manage-auth.js";

let db: Database;
let tenantId: string;
let userId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  const seed = seedTestTenant(db);
  tenantId = seed.tenantId;
  userId = seed.userId;
});

describe("create-client subcommand", () => {
  it("registers an OAuth client and returns client_id", () => {
    const output: string[] = [];
    const program = buildProgram(db, tenantId, userId, (msg: string) => output.push(msg));

    program.parse([
      "node", "manage-auth",
      "create-client",
      "--name", "Test App",
      "--grant-types", "authorization_code",
      "--scopes", "meetings:read,search:execute",
      "--redirect-uris", "http://localhost:3000/callback",
    ]);

    expect(output.length).toBeGreaterThanOrEqual(1);
    const parsed = JSON.parse(output[0]);
    expect(parsed).toEqual({
      client_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
    });
  });

  it("registers a client_credentials client and returns client_id and client_secret", () => {
    const output: string[] = [];
    const program = buildProgram(db, tenantId, userId, (msg: string) => output.push(msg));

    program.parse([
      "node", "manage-auth",
      "create-client",
      "--name", "Service Account",
      "--grant-types", "client_credentials",
      "--scopes", "meetings:read",
    ]);

    const parsed = JSON.parse(output[0]);
    expect(parsed).toEqual({
      client_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      client_secret: expect.stringMatching(/^[0-9a-f]{64}$/),
    });
  });
});

describe("create-api-key subcommand", () => {
  it("creates an API key and returns the plaintext key shown once", () => {
    const output: string[] = [];
    const program = buildProgram(db, tenantId, userId, (msg: string) => output.push(msg));

    program.parse([
      "node", "manage-auth",
      "create-api-key",
      "--name", "CI Token",
      "--scopes", "meetings:read,search:execute",
    ]);

    const parsed = JSON.parse(output[0]);
    expect(parsed).toEqual({
      key: expect.stringMatching(/^mki_[0-9a-f]{64}$/),
      prefix: expect.stringMatching(/^mki_[0-9a-f]{4}$/),
    });
  });

  it("persists the API key in the database", () => {
    const output: string[] = [];
    const program = buildProgram(db, tenantId, userId, (msg: string) => output.push(msg));

    program.parse([
      "node", "manage-auth",
      "create-api-key",
      "--name", "Persist Check",
      "--scopes", "meetings:read",
    ]);

    const parsed = JSON.parse(output[0]);
    const rows = db
      .prepare("SELECT prefix, name, scopes FROM api_keys WHERE prefix = ?")
      .all(parsed.prefix) as Array<{ prefix: string; name: string; scopes: string }>;

    expect(rows).toEqual([
      {
        prefix: parsed.prefix,
        name: "Persist Check",
        scopes: JSON.stringify(["meetings:read"]),
      },
    ]);
  });
});

describe("list-clients subcommand", () => {
  it("lists all registered OAuth clients for the tenant", () => {
    const output: string[] = [];
    const program = buildProgram(db, tenantId, userId, (msg: string) => output.push(msg));

    program.parse([
      "node", "manage-auth",
      "create-client",
      "--name", "App One",
      "--grant-types", "client_credentials",
      "--scopes", "meetings:read",
    ]);

    const listOutput: string[] = [];
    const listProgram = buildProgram(db, tenantId, userId, (msg: string) => listOutput.push(msg));
    listProgram.parse(["node", "manage-auth", "list-clients"]);

    const parsed = JSON.parse(listOutput[0]);
    expect(parsed).toEqual([
      {
        client_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
        name: "App One",
        grant_types: JSON.stringify(["client_credentials"]),
        scopes: JSON.stringify(["meetings:read"]),
        redirect_uris: null,
        created_at: expect.any(String),
        revoked: 0,
        tenant_id: tenantId,
      },
    ]);
  });
});

describe("list-api-keys subcommand", () => {
  it("lists all API keys for the tenant", () => {
    const output: string[] = [];
    const program = buildProgram(db, tenantId, userId, (msg: string) => output.push(msg));

    program.parse([
      "node", "manage-auth",
      "create-api-key",
      "--name", "Key One",
      "--scopes", "meetings:read",
    ]);

    const listOutput: string[] = [];
    const listProgram = buildProgram(db, tenantId, userId, (msg: string) => listOutput.push(msg));
    listProgram.parse(["node", "manage-auth", "list-api-keys"]);

    const parsed = JSON.parse(listOutput[0]);
    expect(parsed).toEqual([
      {
        prefix: expect.stringMatching(/^mki_[0-9a-f]{4}$/),
        name: "Key One",
        scopes: JSON.stringify(["meetings:read"]),
        created_at: expect.any(String),
        last_used_at: null,
        revoked: 0,
      },
    ]);
  });
});

describe("revoke-client subcommand", () => {
  it("revokes an OAuth client by client_id", () => {
    const createOutput: string[] = [];
    const createProgram = buildProgram(db, tenantId, userId, (msg: string) => createOutput.push(msg));
    createProgram.parse([
      "node", "manage-auth",
      "create-client",
      "--name", "Revokable",
      "--grant-types", "client_credentials",
      "--scopes", "meetings:read",
    ]);
    const { client_id } = JSON.parse(createOutput[0]);

    const revokeOutput: string[] = [];
    const revokeProgram = buildProgram(db, tenantId, userId, (msg: string) => revokeOutput.push(msg));
    revokeProgram.parse(["node", "manage-auth", "revoke-client", client_id]);

    const parsed = JSON.parse(revokeOutput[0]);
    expect(parsed).toEqual({ revoked: true });

    const row = db
      .prepare("SELECT revoked FROM oauth_clients WHERE client_id = ?")
      .get(client_id) as { revoked: number };
    expect(row.revoked).toBe(1);
  });
});

describe("revoke-api-key subcommand", () => {
  it("revokes an API key by prefix lookup", () => {
    const createOutput: string[] = [];
    const createProgram = buildProgram(db, tenantId, userId, (msg: string) => createOutput.push(msg));
    createProgram.parse([
      "node", "manage-auth",
      "create-api-key",
      "--name", "Revoke Me",
      "--scopes", "meetings:read",
    ]);
    const { prefix } = JSON.parse(createOutput[0]);

    const revokeOutput: string[] = [];
    const revokeProgram = buildProgram(db, tenantId, userId, (msg: string) => revokeOutput.push(msg));
    revokeProgram.parse(["node", "manage-auth", "revoke-api-key", prefix]);

    const parsed = JSON.parse(revokeOutput[0]);
    expect(parsed).toEqual({ revoked: true });

    const row = db
      .prepare("SELECT revoked FROM api_keys WHERE prefix = ?")
      .get(prefix) as { revoked: number };
    expect(row.revoked).toBe(1);
  });

  it("returns revoked false for an unknown prefix", () => {
    const revokeOutput: string[] = [];
    const revokeProgram = buildProgram(db, tenantId, userId, (msg: string) => revokeOutput.push(msg));
    revokeProgram.parse(["node", "manage-auth", "revoke-api-key", "mki_xxxx"]);

    const parsed = JSON.parse(revokeOutput[0]);
    expect(parsed).toEqual({ revoked: false });
  });
});
