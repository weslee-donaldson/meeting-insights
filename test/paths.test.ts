import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveDataPaths, ensureDataDirs, DATA_SUBDIRS } from "../core/utils/paths.js";

describe("resolveDataPaths", () => {
  it("uses the provided dataDir as the base", () => {
    const paths = resolveDataPaths("/custom/data");

    expect(paths.root).toBe("/custom/data");
    expect(paths.assets).toBe("/custom/data/assets");
    expect(paths.audit).toBe("/custom/data/audit");
    expect(paths.eval).toBe("/custom/data/eval");
    expect(paths.manual.rawTranscripts).toBe("/custom/data/manual/raw-transcripts");
    expect(paths.manual.processed).toBe("/custom/data/manual/processed");
    expect(paths.manual.failed).toBe("/custom/data/manual/failed");
    expect(paths.manual.externalTranscripts).toBe("/custom/data/manual/external-transcripts");

    expect(paths.webhook.rawTranscripts).toBe("/custom/data/webhook/raw-transcripts");
    expect(paths.webhook.processed).toBe("/custom/data/webhook/processed");
    expect(paths.webhook.failed).toBe("/custom/data/webhook/failed");
  });

  it("defaults dataDir to 'data' when arg is undefined", () => {
    const paths = resolveDataPaths(undefined);
    expect(paths.root).toBe("data");
    expect(paths.assets).toBe("data/assets");
    expect(paths.manual.rawTranscripts).toBe("data/manual/raw-transcripts");
    expect(paths.webhook.rawTranscripts).toBe("data/webhook/raw-transcripts");
  });
});

describe("DATA_SUBDIRS", () => {
  it("lists all required subdirectory paths relative to the data root", () => {
    expect(DATA_SUBDIRS).toEqual([
      "assets",
      "audit",
      "eval",
      "manual/raw-transcripts",
      "manual/processed",
      "manual/failed",
      "manual/external-transcripts",
      "webhook/raw-transcripts",
      "webhook/processed",
      "webhook/failed",
    ]);
  });
});

describe("ensureDataDirs", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "mtninsights-paths-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates all subdirs under the given data root", () => {
    const dataDir = join(tempDir, "data");

    ensureDataDirs(dataDir);

    for (const sub of DATA_SUBDIRS) {
      expect(existsSync(join(dataDir, sub))).toBe(true);
    }
  });

  it("is idempotent (safe to re-run)", () => {
    const dataDir = join(tempDir, "data");
    mkdirSync(join(dataDir, "assets"), { recursive: true });
    mkdirSync(join(dataDir, "manual", "raw-transcripts"), { recursive: true });

    expect(() => ensureDataDirs(dataDir)).not.toThrow();

    for (const sub of DATA_SUBDIRS) {
      expect(existsSync(join(dataDir, sub))).toBe(true);
    }
  });
});
