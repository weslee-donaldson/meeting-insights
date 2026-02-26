import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rmSync } from "node:fs";
import { moveToProcessed, moveToFailed, processDirectory } from "../src/lifecycle.js";

let tmpDir: string;
let rawDir: string;
let processedDir: string;
let failedDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `mtninsights-lifecycle-${Date.now()}`);
  rawDir = join(tmpDir, "raw-transcripts");
  processedDir = join(tmpDir, "processed");
  failedDir = join(tmpDir, "failed-processing");
  mkdirSync(rawDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

const VALID_CONTENT = `Attendance:
{'last_name': 'Doe', 'id': '00000000-0000-0000-0000-000000000001', 'first_name': 'Jane', 'email': 'jane@xolv.io'}
Transcript:
Jane Doe | 00:01
Hello world.
`;

describe("moveToProcessed", () => {
  it("moves file from raw-transcripts/ to processed/ preserving filename", () => {
    const filename = " 2026-01-19T15:43:52.210ZTest Meeting";
    writeFileSync(join(rawDir, filename), "content");
    moveToProcessed(rawDir, processedDir, filename);
    expect(existsSync(join(processedDir, filename))).toBe(true);
    expect(existsSync(join(rawDir, filename))).toBe(false);
  });

  it("creates processed/ directory if it does not exist", () => {
    const filename = " 2026-01-19T15:43:52.210ZTest Meeting";
    writeFileSync(join(rawDir, filename), "content");
    moveToProcessed(rawDir, processedDir, filename);
    expect(existsSync(processedDir)).toBe(true);
  });
});

describe("moveToFailed", () => {
  it("moves file from raw-transcripts/ to failed-processing/ preserving filename", () => {
    const filename = " 2026-01-19T15:43:52.210ZBad Meeting";
    writeFileSync(join(rawDir, filename), "bad");
    moveToFailed(rawDir, failedDir, filename, "parse error");
    expect(existsSync(join(failedDir, filename))).toBe(true);
    expect(existsSync(join(rawDir, filename))).toBe(false);
  });

  it("creates failed-processing/ directory if it does not exist", () => {
    const filename = " 2026-01-19T15:43:52.210ZBad Meeting";
    writeFileSync(join(rawDir, filename), "bad");
    moveToFailed(rawDir, failedDir, filename, "parse error");
    expect(existsSync(failedDir)).toBe(true);
  });
});

describe("processDirectory", () => {
  it("parses valid files and moves to processed/, invalid to failed-processing/", () => {
    writeFileSync(join(rawDir, " 2026-01-19T15:43:52.210ZGood Meeting"), VALID_CONTENT);
    writeFileSync(join(rawDir, " 2026-01-19T16:00:00.000ZBad Meeting"), "garbage");
    const result = processDirectory(rawDir, processedDir, failedDir);
    expect(result).toEqual({ total: 2, succeeded: 1, failed: 1, skipped: 0 });
    expect(existsSync(join(processedDir, " 2026-01-19T15:43:52.210ZGood Meeting"))).toBe(true);
    expect(existsSync(join(failedDir, " 2026-01-19T16:00:00.000ZBad Meeting"))).toBe(true);
  });

  it("skips files already present in processed/", () => {
    mkdirSync(processedDir, { recursive: true });
    const filename = " 2026-01-19T15:43:52.210ZAlready Done";
    writeFileSync(join(rawDir, filename), VALID_CONTENT);
    writeFileSync(join(processedDir, filename), VALID_CONTENT);
    const result = processDirectory(rawDir, processedDir, failedDir);
    expect(result.skipped).toBe(1);
    expect(result.succeeded).toBe(0);
  });
});
