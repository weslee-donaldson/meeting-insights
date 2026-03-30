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
