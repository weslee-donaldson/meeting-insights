import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { listTranscriptFiles, parseFilename } from "../src/parser.js";

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

describe("parseFilename", () => {
  it("extracts ISO timestamp from Krisp filename", () => {
    const result = parseFilename(" 2026-01-19T15:43:52.210ZRevenium, INT, DSU");
    expect(result.timestamp).toBe("2026-01-19T15:43:52.210Z");
  });

  it("extracts meeting title from Krisp filename", () => {
    const result = parseFilename(" 2026-01-19T15:43:52.210ZRevenium, INT, DSU");
    expect(result.title).toBe("Revenium, INT, DSU");
  });

  it("handles titles with commas", () => {
    const result = parseFilename(" 2026-01-20T16:45:12.856ZTQ, Internal");
    expect(result.title).toBe("TQ, Internal");
  });

  it("handles unnamed meetings", () => {
    const result = parseFilename(" 2026-01-19T19:25:19.375Z02:25 PM - zoom.us meeting January 19");
    expect(result.title).toBe("02:25 PM - zoom.us meeting January 19");
  });

  it("handles duplicate suffix", () => {
    const result = parseFilename(" 2026-01-19T15:43:52.210ZRevenium, INT, DSU (1)");
    expect(result.title).toBe("Revenium, INT, DSU");
  });
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
