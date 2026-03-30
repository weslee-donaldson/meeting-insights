import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  generateKeyPair,
  loadOrCreateKeys,
  signAccessToken,
  verifyAccessToken,
} from "../core/auth/jwt.js";

describe("generateKeyPair", () => {
  it("returns a CryptoKey pair with public and private keys", async () => {
    const keys = await generateKeyPair();
    expect(keys.publicKey).toBeInstanceOf(CryptoKey);
    expect(keys.privateKey).toBeInstanceOf(CryptoKey);
  });
});

describe("loadOrCreateKeys", () => {
  let tempDir: string;

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), "jwt-test-"));
  });

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("generates key files when they do not exist", async () => {
    const keysDir = join(tempDir, "fresh");
    const keys = await loadOrCreateKeys(keysDir);
    expect(keys.publicKey).toBeInstanceOf(CryptoKey);
    expect(keys.privateKey).toBeInstanceOf(CryptoKey);
    expect(existsSync(join(keysDir, "private.pem"))).toBe(true);
    expect(existsSync(join(keysDir, "public.pem"))).toBe(true);
  });

  it("loads existing keys from PEM files on second call", async () => {
    const keysDir = join(tempDir, "reload");
    const first = await loadOrCreateKeys(keysDir);
    const second = await loadOrCreateKeys(keysDir);

    const token = await signAccessToken(first.privateKey, {
      sub: "u1",
      tid: "t1",
      scope: "meetings:read",
      jti: "j1",
    });
    const payload = await verifyAccessToken(second.publicKey, token);
    expect(payload.sub).toBe("u1");
    expect(payload.tid).toBe("t1");
  });

  it("writes valid PEM-formatted files", async () => {
    const keysDir = join(tempDir, "pem-check");
    await loadOrCreateKeys(keysDir);
    const privPem = readFileSync(join(keysDir, "private.pem"), "utf-8");
    const pubPem = readFileSync(join(keysDir, "public.pem"), "utf-8");
    expect(privPem).toContain("-----BEGIN PRIVATE KEY-----");
    expect(pubPem).toContain("-----BEGIN PUBLIC KEY-----");
  });
});

describe("signAccessToken + verifyAccessToken", () => {
  let publicKey: CryptoKey;
  let privateKey: CryptoKey;

  beforeAll(async () => {
    const keys = await generateKeyPair();
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
  });

  it("produces a JWT string that verifies with the matching public key", async () => {
    const token = await signAccessToken(privateKey, {
      sub: "user-42",
      tid: "tenant-7",
      scope: "meetings:read meetings:write",
      jti: "token-99",
    });

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const payload = await verifyAccessToken(publicKey, token);
    expect(payload).toEqual({
      sub: "user-42",
      tid: "tenant-7",
      scope: "meetings:read meetings:write",
      jti: "token-99",
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });

  it("sets expiry to approximately 1 hour from now", async () => {
    const before = Math.floor(Date.now() / 1000);
    const token = await signAccessToken(privateKey, {
      sub: "u1",
      tid: "t1",
      scope: "admin",
      jti: "j1",
    });
    const after = Math.floor(Date.now() / 1000);
    const payload = await verifyAccessToken(publicKey, token);
    const expectedMinExp = before + 3600;
    const expectedMaxExp = after + 3600;
    expect(payload.exp).toBeGreaterThanOrEqual(expectedMinExp);
    expect(payload.exp).toBeLessThanOrEqual(expectedMaxExp);
  });

  it("rejects a token signed with a different key", async () => {
    const otherKeys = await generateKeyPair();
    const token = await signAccessToken(otherKeys.privateKey, {
      sub: "u1",
      tid: "t1",
      scope: "admin",
      jti: "j1",
    });
    await expect(verifyAccessToken(publicKey, token)).rejects.toThrow();
  });

  it("rejects a malformed token string", async () => {
    await expect(verifyAccessToken(publicKey, "not.a.jwt")).rejects.toThrow();
  });
});
