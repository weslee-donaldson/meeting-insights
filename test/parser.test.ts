import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { listTranscriptFiles, listWebhookFiles, parseFilename, readTranscriptFile, splitSections, parseAttendance, parseTranscriptBody, parseWebVttBody, parseKrispFile, parseWebhookPayload, parseWebhookNote } from "../core/pipeline/parser.js";
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

  it("returns empty array for empty directory", () => {
    const emptyWebhookDir = join(tmpDir, "webhook-empty");
    mkdirSync(emptyWebhookDir, { recursive: true });
    expect(listWebhookFiles(emptyWebhookDir)).toEqual([]);
  });

  it("returns empty array for non-existent directory", () => {
    const missingDir = join(tmpDir, "webhook-does-not-exist");
    expect(listWebhookFiles(missingDir)).toEqual([]);
  });
});

describe("parseWebhookPayload", () => {
  const validPayload = JSON.stringify({
    id: "019d214e5f7874eba207b346751c7061",
    event: "transcript_created",
    data: {
      meeting: {
        id: "019d213a456f75cf950826ad521ca886",
        title: "03:02 PM - Microsoft Teams meeting March 24",
        duration: 1313,
        speakers: [
          { index: 1, first_name: "Wesley", last_name: "Donaldson", id: "2d123521305e5ba2b050e5c705b00890", email: "wesley.donaldson@xolv.io" },
        ],
        start_date: "2026-03-24T19:02:09.316Z",
        end_date: "2026-03-24T19:24:02.316Z",
        url: "https://app.krisp.ai/n/019d213a456f75cf950826ad521ca886",
      },
      content: [
        { speaker: "Wesley Donaldson", speakerIndex: 1, text: "Good afternoon." },
      ],
    },
  });

  it("returns ParsedMeeting with externalId from data.meeting.id", () => {
    const result = parseWebhookPayload(validPayload, "krisp-2026-03-24.json");
    expect(result!.externalId).toBe("019d213a456f75cf950826ad521ca886");
  });

  it("maps start_date to timestamp, title to title, filename to sourceFilename", () => {
    const result = parseWebhookPayload(validPayload, "krisp-2026-03-24.json");
    expect(result).toEqual(expect.objectContaining({
      timestamp: "2026-03-24T19:02:09.316Z",
      title: "03:02 PM - Microsoft Teams meeting March 24",
      sourceFilename: "krisp-2026-03-24.json",
    }));
  });

  it("maps data.meeting.speakers to Participant[] with first_name, last_name, email, id", () => {
    const result = parseWebhookPayload(validPayload, "krisp-2026-03-24.json");
    expect(result!.participants).toEqual([
      { first_name: "Wesley", last_name: "Donaldson", id: "2d123521305e5ba2b050e5c705b00890", email: "wesley.donaldson@xolv.io" },
    ]);
  });

  it("handles speakers with null names using email prefix as first_name fallback", () => {
    const payload = JSON.stringify({
      id: "evt1",
      event: "transcript_created",
      data: {
        meeting: {
          id: "mtg1",
          title: "Test",
          duration: 100,
          speakers: [
            { index: 1, first_name: null, last_name: null, id: "abc123", email: "jeremy.campeau@llsa.com" },
          ],
          start_date: "2026-03-24T19:02:09.316Z",
          end_date: "2026-03-24T19:24:02.316Z",
          url: "https://app.krisp.ai/n/mtg1",
        },
        content: [
          { speaker: "jeremy.campeau@llsa.com", speakerIndex: 1, text: "Hello." },
        ],
      },
    });
    const result = parseWebhookPayload(payload, "test.json");
    expect(result!.participants).toEqual([
      { first_name: "jeremy.campeau", last_name: "", id: "abc123", email: "jeremy.campeau@llsa.com" },
    ]);
  });

  it("maps data.content[] to SpeakerTurn[] with 00:00 timestamps", () => {
    const result = parseWebhookPayload(validPayload, "krisp-2026-03-24.json");
    expect(result!.turns).toEqual([
      { speaker_name: "Wesley Donaldson", timestamp: "00:00", text: "Good afternoon." },
    ]);
  });

  it("synthesizes rawTranscript as pipe-delimited lines compatible with parseSpeakerNames", () => {
    const twoTurnPayload = JSON.stringify({
      id: "evt1",
      event: "transcript_created",
      data: {
        meeting: {
          id: "mtg1",
          title: "Test",
          duration: 100,
          speakers: [
            { index: 1, first_name: "Alice", last_name: "Smith", id: "a1", email: "alice@test.com" },
            { index: 2, first_name: "Bob", last_name: "Jones", id: "b1", email: "bob@test.com" },
          ],
          start_date: "2026-01-01T00:00:00.000Z",
          end_date: "2026-01-01T00:10:00.000Z",
          url: "https://app.krisp.ai/n/mtg1",
        },
        content: [
          { speaker: "Alice Smith", speakerIndex: 1, text: "Hello there." },
          { speaker: "Bob Jones", speakerIndex: 2, text: "Hi Alice." },
        ],
      },
    });
    const result = parseWebhookPayload(twoTurnPayload, "test.json");
    expect(result!.rawTranscript).toBe(
      "Alice Smith | 00:00\nHello there.\nBob Jones | 00:00\nHi Alice.\n"
    );
  });

  it("returns null for non-transcript_created events", () => {
    const notesPayload = JSON.stringify({
      id: "evt1",
      event: "notes_generated",
      data: { meeting: { id: "mtg1" }, content: "Some notes" },
    });
    expect(parseWebhookPayload(notesPayload, "notes.json")).toBeNull();
  });

  it("returns null for malformed JSON and missing required fields", () => {
    expect(parseWebhookPayload("", "empty.json")).toBeNull();
    expect(parseWebhookPayload("not json", "bad.json")).toBeNull();
    expect(parseWebhookPayload(JSON.stringify({ event: "transcript_created" }), "no-data.json")).toBeNull();
    expect(parseWebhookPayload(JSON.stringify({ event: "transcript_created", data: {} }), "no-meeting.json")).toBeNull();
    expect(parseWebhookPayload(JSON.stringify({ event: "transcript_created", data: { meeting: { id: "m1" } } }), "no-content.json")).toBeNull();
  });
});

describe("parseWebhookNote", () => {
  it("returns null for non-note events", () => {
    expect(parseWebhookNote(JSON.stringify({ event: "transcript_created", data: {} }), "t.json")).toBeNull();
    expect(parseWebhookNote(JSON.stringify({ event: "recording_ready", data: {} }), "r.json")).toBeNull();
  });

  it("extracts key_points_generated as key-points note using raw_content", () => {
    const payload = {
      event: "key_points_generated",
      data: {
        meeting: { id: "mtg-001", title: "Planning" },
        raw_content: "- Point 1\n- Point 2",
        content: [{ id: "c1", description: "Point 1" }],
      },
    };
    expect(parseWebhookNote(JSON.stringify(payload), "kp.json")).toEqual({
      externalMeetingId: "mtg-001",
      noteType: "key-points",
      title: "Krisp Key Points",
      body: "- Point 1\n- Point 2",
    });
  });

  it("extracts action_items_generated as action-items note using raw_content", () => {
    const payload = {
      event: "action_items_generated",
      data: {
        meeting: { id: "mtg-001", title: "Planning" },
        raw_content: "- [ ] Task 1\n- [ ] Task 2",
        content: [{ id: "a1", title: "Task 1" }],
      },
    };
    expect(parseWebhookNote(JSON.stringify(payload), "ai.json")).toEqual({
      externalMeetingId: "mtg-001",
      noteType: "action-items",
      title: "Krisp Action Items",
      body: "- [ ] Task 1\n- [ ] Task 2",
    });
  });

  it("returns null for malformed payloads", () => {
    expect(parseWebhookNote("", "e.json")).toBeNull();
    expect(parseWebhookNote("not json", "b.json")).toBeNull();
    expect(parseWebhookNote(JSON.stringify({ event: "key_points_generated" }), "no-data.json")).toBeNull();
    expect(parseWebhookNote(JSON.stringify({ event: "key_points_generated", data: { meeting: { id: "m1" } } }), "no-content.json")).toBeNull();
  });
});
