import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { listTranscriptFiles } from "../src/parser.js";

const tmpDir = join(tmpdir(), `mtninsights-test-${Date.now()}`);
const rawDir = join(tmpDir, "raw-transcripts");

beforeAll(() => {
  mkdirSync(rawDir, { recursive: true });
  writeFileSync(join(rawDir, " 2026-01-19T15:43:52.210ZRevenium, INT, DSU"), "content");
  writeFileSync(join(rawDir, " 2026-01-19T16:01:40.392ZMandalore DSU"), "content");
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("listTranscriptFiles", () => {
  it("returns array of filenames from raw-transcripts directory", () => {
    const files = listTranscriptFiles(rawDir);
    expect(files).toEqual([
      " 2026-01-19T15:43:52.210ZRevenium, INT, DSU",
      " 2026-01-19T16:01:40.392ZMandalore DSU",
    ]);
  });

  it("returns empty array for empty directory", () => {
    const emptyDir = join(tmpDir, "empty");
    mkdirSync(emptyDir);
    expect(listTranscriptFiles(emptyDir)).toEqual([]);
  });
});
