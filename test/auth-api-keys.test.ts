import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { seedTestTenant } from "./helpers/seed-test-tenant.js";
import {
  generateApiKey,
  hashApiKey,
  createApiKey,
  validateApiKey,
} from "../core/auth/api-keys.js";

let db: Database;
let tenantId: string;
let userId: string;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  const seed = seedTestTenant(db);
  tenantId = seed.tenantId;
  userId = seed.userId;
});

describe("generateApiKey", () => {
  it("returns a key with mki_ prefix, its sha256 hash, and 8-char prefix", () => {
    const result = generateApiKey();

    expect(result).toEqual({
      key: expect.stringMatching(/^mki_[0-9a-f]{64}$/),
      hash: expect.stringMatching(/^[0-9a-f]{64}$/),
      prefix: expect.stringMatching(/^mki_[0-9a-f]{4}$/),
    });
    expect(result.prefix).toBe(result.key.slice(0, 8));
  });

  it("generates unique keys on each call", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.key).not.toBe(b.key);
    expect(a.hash).not.toBe(b.hash);
  });
});

describe("hashApiKey", () => {
  it("returns the same hash as generateApiKey for the same key", () => {
    const { key, hash } = generateApiKey();
    expect(hashApiKey(key)).toBe(hash);
  });
});

describe("createApiKey", () => {
  it("inserts an api key row and returns the plaintext key", () => {
    const result = createApiKey(db, {
      tenantId,
      userId,
      name: "CI Token",
      scopes: ["meetings:read", "search:execute"],
    });

    expect(result).toEqual({
      key: expect.stringMatching(/^mki_[0-9a-f]{64}$/),
      prefix: expect.stringMatching(/^mki_[0-9a-f]{4}$/),
      hash: expect.stringMatching(/^[0-9a-f]{64}$/),
    });

    const row = db
      .prepare("SELECT * FROM api_keys WHERE key_hash = ?")
      .get(result.hash) as {
      key_hash: string;
      tenant_id: string;
      user_id: string;
      name: string;
      prefix: string;
      scopes: string;
      created_at: string;
      last_used_at: string | null;
      revoked: number;
    };

    expect(row).toEqual({
      key_hash: result.hash,
      tenant_id: tenantId,
      user_id: userId,
      name: "CI Token",
      prefix: result.prefix,
      scopes: JSON.stringify(["meetings:read", "search:execute"]),
      created_at: expect.any(String),
      last_used_at: null,
      revoked: 0,
    });
  });
});

describe("validateApiKey", () => {
  it("returns an AuthIdentity for a valid, non-revoked key", () => {
    const { key } = createApiKey(db, {
      tenantId,
      userId,
      name: "Valid Key",
      scopes: ["meetings:read"],
    });

    const identity = validateApiKey(db, key);

    expect(identity).toEqual({
      tenantId,
      userId,
      scopes: ["meetings:read"],
    });
  });

  it("updates last_used_at on successful validation", () => {
    const { key, hash } = createApiKey(db, {
      tenantId,
      userId,
      name: "Usage Tracked",
      scopes: ["meetings:read"],
    });

    const beforeRow = db
      .prepare("SELECT last_used_at FROM api_keys WHERE key_hash = ?")
      .get(hash) as { last_used_at: string | null };
    expect(beforeRow.last_used_at).toBe(null);

    validateApiKey(db, key);

    const afterRow = db
      .prepare("SELECT last_used_at FROM api_keys WHERE key_hash = ?")
      .get(hash) as { last_used_at: string };
    expect(afterRow.last_used_at).toEqual(expect.any(String));
  });

  it("returns null for an unknown key", () => {
    const result = validateApiKey(db, "mki_0000000000000000000000000000000000000000000000000000000000000000");
    expect(result).toBe(null);
  });

  it("returns null for a revoked key", () => {
    const { key, hash } = createApiKey(db, {
      tenantId,
      userId,
      name: "Soon Revoked",
      scopes: ["meetings:read"],
    });

    db.prepare("UPDATE api_keys SET revoked = 1 WHERE key_hash = ?").run(hash);

    const result = validateApiKey(db, key);
    expect(result).toBe(null);
  });
});
