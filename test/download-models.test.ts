import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getModelUrls,
  verifyHash,
  downloadIfMissing,
  MODEL_HASHES,
} from "../scripts/download-models.js";

describe("getModelUrls", () => {
  it("returns a map of filename to Hugging Face URL", () => {
    const urls = getModelUrls();
    expect(urls["all-MiniLM-L6-v2.onnx"]).toMatch(/^https:\/\/huggingface\.co\//);
    expect(urls["tokenizer.json"]).toMatch(/^https:\/\/huggingface\.co\//);
  });
});

describe("verifyHash", () => {
  let tempDir: string;
  let filePath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "mtninsights-test-"));
    filePath = join(tempDir, "hello.txt");
    writeFileSync(filePath, "hello");
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns true when the file's SHA256 matches the expected hash", async () => {
    const expected = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";
    expect(await verifyHash(filePath, expected)).toBe(true);
  });

  it("returns false when the hash does not match", async () => {
    expect(await verifyHash(filePath, "0".repeat(64))).toBe(false);
  });
});

describe("downloadIfMissing", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "mtninsights-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("skips download when files exist with correct hashes", async () => {
    const onnxPath = join(tempDir, "all-MiniLM-L6-v2.onnx");
    const tokenizerPath = join(tempDir, "tokenizer.json");
    writeFileSync(onnxPath, "stub onnx content");
    writeFileSync(tokenizerPath, "stub tokenizer content");

    const hashes = {
      "all-MiniLM-L6-v2.onnx": await computeSha256("stub onnx content"),
      "tokenizer.json": await computeSha256("stub tokenizer content"),
    };

    const fetchMock = vi.fn();
    await downloadIfMissing(tempDir, { hashes, fetch: fetchMock });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("downloads when a file is missing", async () => {
    const content = "downloaded content";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode(content).buffer,
    });

    const hashes = {
      "all-MiniLM-L6-v2.onnx": await computeSha256(content),
      "tokenizer.json": await computeSha256(content),
    };

    await downloadIfMissing(tempDir, { hashes, fetch: fetchMock as unknown as typeof globalThis.fetch });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(existsSync(join(tempDir, "all-MiniLM-L6-v2.onnx"))).toBe(true);
    expect(existsSync(join(tempDir, "tokenizer.json"))).toBe(true);
  });

  it("throws when downloaded file hash does not match expected", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode("wrong content").buffer,
    });

    const hashes = {
      "all-MiniLM-L6-v2.onnx": "0".repeat(64),
      "tokenizer.json": "0".repeat(64),
    };

    await expect(
      downloadIfMissing(tempDir, { hashes, fetch: fetchMock as unknown as typeof globalThis.fetch }),
    ).rejects.toThrow(/hash mismatch/i);
  });
});

describe("MODEL_HASHES", () => {
  it("exports SHA256 hashes for required model files", () => {
    expect(MODEL_HASHES["all-MiniLM-L6-v2.onnx"]).toMatch(/^[0-9a-f]{64}$/);
    expect(MODEL_HASHES["tokenizer.json"]).toMatch(/^[0-9a-f]{64}$/);
  });
});

async function computeSha256(content: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(content).digest("hex");
}
