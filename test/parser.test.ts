import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { listTranscriptFiles, listWebhookFiles, parseFilename, readTranscriptFile, splitSections, parseAttendance, parseTranscriptBody, parseWebVttBody, parseKrispFile } from "../core/parser.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

const fixtureContent = readFileSync(resolve("test/fixtures/sample-meeting"), "utf-8");

describe("splitSections", () => {
  it("splits file contents into attendance string and transcript string", () => {
    const { attendance, transcript } = splitSections(fixtureContent);
    expect(attendance).toContain("Donaldson");
    expect(transcript).toContain("Wesley Donaldson | 00:11");
  });
});

describe("parseAttendance", () => {
  it("extracts array of participant objects from attendance string", () => {
    const { attendance } = splitSections(fixtureContent);
    const participants = parseAttendance(attendance);
    expect(participants).toEqual([
      { last_name: "Donaldson", id: "014200be-0001-0001-0001-000000000001", first_name: "Wesley", email: "wesley@xolv.io" },
      { last_name: "Doshi", id: "014200be-0002-0002-0002-000000000002", first_name: "Dev", email: "dev.doshi@revenium.com" },
    ]);
  });
});

describe("parseTranscriptBody", () => {
  it("extracts array of speaker turns with speaker_name and timestamp", () => {
    const { transcript } = splitSections(fixtureContent);
    const turns = parseTranscriptBody(transcript);
    expect(turns[0]).toEqual({ speaker_name: "Wesley Donaldson", timestamp: "00:11", text: "Good morning. Yep, you could come in." });
  });

  it("preserves multi-line dialogue blocks per speaker turn", () => {
    const { transcript } = splitSections(fixtureContent);
    const turns = parseTranscriptBody(transcript);
    expect(turns[1]).toEqual({ speaker_name: "Rinor Zekaj", timestamp: "01:19", text: "Here goes.\nSecond line of Rinor." });
  });

  it("normalizes Speaker N entries to Unknown Speaker N", () => {
    const { transcript } = splitSections(fixtureContent);
    const turns = parseTranscriptBody(transcript);
    expect(turns[2].speaker_name).toBe("Unknown Speaker 4");
  });
});

describe("readTranscriptFile", () => {
  it("reads file contents from full path and returns string", () => {
    const filePath = join(rawDir, " 2026-01-19T15:43:52.210ZRevenium, INT, DSU");
    expect(readTranscriptFile(filePath)).toBe("content");
  });

  it("handles UTF-8 encoding", () => {
    const filePath = join(tmpDir, "utf8-test");
    writeFileSync(filePath, "Héllo wörld 日本語", "utf-8");
    expect(readTranscriptFile(filePath)).toBe("Héllo wörld 日本語");
  });
});

describe("parseKrispFile", () => {
  it("combines parseFilename + parseAttendance + parseTranscriptBody into complete parsed meeting object", () => {
    const filePath = join(rawDir, " 2026-01-19T15:43:52.210ZRevenium, INT, DSU");
    writeFileSync(filePath, fixtureContent);
    const result = parseKrispFile(filePath, " 2026-01-19T15:43:52.210ZRevenium, INT, DSU");
    expect(result).toEqual({
      timestamp: "2026-01-19T15:43:52.210Z",
      title: "Revenium, INT, DSU",
      participants: [
        { last_name: "Donaldson", id: "014200be-0001-0001-0001-000000000001", first_name: "Wesley", email: "wesley@xolv.io" },
        { last_name: "Doshi", id: "014200be-0002-0002-0002-000000000002", first_name: "Dev", email: "dev.doshi@revenium.com" },
      ],
      turns: [
        { speaker_name: "Wesley Donaldson", timestamp: "00:11", text: "Good morning. Yep, you could come in." },
        { speaker_name: "Rinor Zekaj", timestamp: "01:19", text: "Here goes.\nSecond line of Rinor." },
        { speaker_name: "Unknown Speaker 4", timestamp: "03:41", text: "I haven't seen with him, but yeah..." },
      ],
      rawTranscript: fixtureContent,
      sourceFilename: " 2026-01-19T15:43:52.210ZRevenium, INT, DSU",
    });
  });

  it("returns null for unparseable files", () => {
    const badPath = join(tmpDir, "bad-file");
    writeFileSync(badPath, "not a valid krisp file");
    expect(parseKrispFile(badPath, "bad-file")).toBeNull();
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

describe("parseWebVttBody", () => {
  it("extracts speaker turns from WebVTT format", () => {
    const vtt = [
      "WEBVTT",
      "",
      "1",
      "00:00:38.020 --> 00:00:39.140",
      "Alice: Hello, hello.",
      "",
      "2",
      "00:01:00.360 --> 00:01:01.680",
      "Bob: Hey, how are you?",
    ].join("\n");
    expect(parseWebVttBody(vtt)).toEqual([
      { speaker_name: "Alice", timestamp: "00:00", text: "Hello, hello." },
      { speaker_name: "Bob", timestamp: "00:01", text: "Hey, how are you?" },
    ]);
  });

  it("merges consecutive lines from same speaker", () => {
    const vtt = [
      "1",
      "00:03:13.280 --> 00:03:14.100",
      "Sam: First line.",
      "",
      "2",
      "00:03:15.260 --> 00:03:15.980",
      "Sam: Second line.",
    ].join("\n");
    const turns = parseWebVttBody(vtt);
    expect(turns).toEqual([
      { speaker_name: "Sam", timestamp: "00:03", text: "First line.\nSecond line." },
    ]);
  });

  it("returns empty array for non-WebVTT content", () => {
    expect(parseWebVttBody("Just some plain text without timestamps.")).toEqual([]);
  });

  it("handles WEBVTT header line gracefully", () => {
    const vtt = [
      "WEBVTT",
      "",
      "1",
      "00:00:01.000 --> 00:00:02.000",
      "Alice: Hi.",
    ].join("\n");
    expect(parseWebVttBody(vtt)).toEqual([
      { speaker_name: "Alice", timestamp: "00:00", text: "Hi." },
    ]);
  });
});

describe("listWebhookFiles", () => {
  it("returns sorted array of *.json filenames from directory", () => {
    const webhookDir = join(tmpDir, "webhook-raw");
    mkdirSync(webhookDir, { recursive: true });
    writeFileSync(join(webhookDir, "krisp-2026-03-24T19-24-42-538Z.json"), "{}");
    writeFileSync(join(webhookDir, "krisp-2026-03-24T18-43-29-593Z.json"), "{}");
    writeFileSync(join(webhookDir, ".DS_Store"), "");
    const result = listWebhookFiles(webhookDir);
    expect(result).toEqual([
      "krisp-2026-03-24T18-43-29-593Z.json",
      "krisp-2026-03-24T19-24-42-538Z.json",
    ]);
  });
});
