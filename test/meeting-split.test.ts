import { describe, it, expect } from "vitest";
import type { SpeakerTurn, Participant } from "../core/parser.js";
import { parseTranscriptBody } from "../core/parser.js";
import { computeCutPoints, deriveParticipants, partitionTurns, rebaseTimestamps, reconstructTranscript, validateSplitRequest } from "../core/meeting-split.js";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";

const VALID_TRANSCRIPT =
  "Alice | 00:00\nWelcome\n\n" +
  "Bob | 00:15\nThanks\n\n" +
  "Alice | 00:30\nGood meeting\n\n" +
  "Bob | 01:00\nAgreed\n\n" +
  "Alice | 01:28\nBye\n\n";

let _seedCounter = 0;
function seedMeeting(db: ReturnType<typeof createDb>, opts?: { transcript?: string; ignored?: 1 }): string {
  const id = ingestMeeting(db, {
    title: "Test Meeting",
    timestamp: "2024-01-01",
    participants: [],
    turns: [],
    rawTranscript: opts?.transcript ?? VALID_TRANSCRIPT,
    sourceFilename: `test-meeting-${++_seedCounter}.md`,
  });
  if (opts?.ignored) db.prepare("UPDATE meetings SET ignored = 1 WHERE id = ?").run(id);
  return id;
}

const participants: Participant[] = [
  { id: "1", first_name: "Alice",   last_name: "Smith",   email: "alice@co.com" },
  { id: "2", first_name: "Bob",     last_name: "Jones",   email: "bob@co.com" },
  { id: "3", first_name: "Charlie", last_name: "Lee",     email: "charlie@co.com" },
];

const turns: SpeakerTurn[] = [
  { speaker_name: "Alice",   timestamp: "00:00", text: "Welcome to the standup" },
  { speaker_name: "Bob",     timestamp: "00:05", text: "Here's my update" },
  { speaker_name: "Alice",   timestamp: "00:05", text: "Go ahead" },
  { speaker_name: "Bob",     timestamp: "00:05", text: "We shipped the fix" },
  { speaker_name: "Alice",   timestamp: "00:12", text: "Nice work" },
  { speaker_name: "Bob",     timestamp: "00:20", text: "Next topic" },
  { speaker_name: "Alice",   timestamp: "00:32", text: "Let's review the metrics" },
  { speaker_name: "Bob",     timestamp: "00:32", text: "Sure, pulling them up" },
  { speaker_name: "Alice",   timestamp: "00:45", text: "Numbers look good" },
  { speaker_name: "Bob",     timestamp: "00:50", text: "Agreed" },
  { speaker_name: "Alice",   timestamp: "00:55", text: "Any blockers?" },
  { speaker_name: "Bob",     timestamp: "00:58", text: "None from me" },
  { speaker_name: "Alice",   timestamp: "00:58", text: "Alright, that wraps up standup" },
  { speaker_name: "Alice",   timestamp: "01:02", text: "OK Charlie, let's discuss the design" },
  { speaker_name: "Charlie", timestamp: "01:05", text: "Sure, I have the mockups ready" },
  { speaker_name: "Alice",   timestamp: "01:10", text: "These look great" },
  { speaker_name: "Charlie", timestamp: "01:15", text: "I'll walk through the flow" },
  { speaker_name: "Alice",   timestamp: "01:20", text: "Makes sense" },
  { speaker_name: "Charlie", timestamp: "01:25", text: "One more thing" },
  { speaker_name: "Charlie", timestamp: "01:28", text: "I'll send the updated designs" },
];

describe("computeCutPoints", () => {
  it("two-way split: cut between turns snaps to last turn before threshold", () => {
    const cutPoints = computeCutPoints(turns, [60, 30]);
    expect(cutPoints).toEqual([{ turnIndex: 13, timestamp: "00:58" }]);
  });

  it("two-way split: exact cut on a turn boundary (58 min)", () => {
    const cutPoints = computeCutPoints(turns, [58, 30]);
    expect(cutPoints).toEqual([{ turnIndex: 13, timestamp: "00:58" }]);
  });

  it("three-way split: produces two cut points", () => {
    const cutPoints = computeCutPoints(turns, [30, 30, 30]);
    expect(cutPoints).toEqual([
      { turnIndex: 6, timestamp: "00:20" },
      { turnIndex: 13, timestamp: "00:58" },
    ]);
  });

  it("cut exactly on boundary includes all turns at that timestamp in earlier segment", () => {
    const cutPoints = computeCutPoints(turns, [32, 60]);
    expect(cutPoints).toEqual([{ turnIndex: 8, timestamp: "00:32" }]);
  });

  it("throws when cumulative cut falls before first turn", () => {
    const lateTurns: SpeakerTurn[] = [
      { speaker_name: "Alice", timestamp: "01:30", text: "Late start" },
      { speaker_name: "Bob",   timestamp: "01:45", text: "Yes" },
    ];
    expect(() => computeCutPoints(lateTurns, [30, 30])).toThrow();
  });

  it("throws when cumulative cut falls after last turn", () => {
    expect(() => computeCutPoints(turns, [200, 30])).toThrow();
  });
});

describe("partitionTurns", () => {
  it("2-way split: produces 2 segments with correct turn counts and content", () => {
    const cutPoints = [{ turnIndex: 13, timestamp: "00:58" }];
    const segments = partitionTurns(turns, cutPoints);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual(turns.slice(0, 13));
    expect(segments[1]).toHaveLength(7);
    expect(segments[1][0]).toEqual({ speaker_name: "Alice", timestamp: "00:00", text: "OK Charlie, let's discuss the design" });
    expect(segments[1][6]).toEqual({ speaker_name: "Charlie", timestamp: "00:26", text: "I'll send the updated designs" });
  });

  it("3-way split: produces 3 segments with correct turn counts", () => {
    const cutPoints = [
      { turnIndex: 6, timestamp: "00:20" },
      { turnIndex: 13, timestamp: "00:58" },
    ];
    const segments = partitionTurns(turns, cutPoints);
    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual(turns.slice(0, 6));
    expect(segments[1]).toHaveLength(7);
    expect(segments[2]).toHaveLength(7);
  });

  it("segment 2 timestamps are rebased: 01:02-01:28 becomes 00:00-00:26", () => {
    const cutPoints = [{ turnIndex: 13, timestamp: "00:58" }];
    const segments = partitionTurns(turns, cutPoints);
    const seg2Timestamps = segments[1].map((t) => t.timestamp);
    expect(seg2Timestamps).toEqual(["00:00", "00:03", "00:08", "00:13", "00:18", "00:23", "00:26"]);
  });

  it("does not mutate the input array", () => {
    const originalTimestamps = turns.map((t) => t.timestamp);
    partitionTurns(turns, [{ turnIndex: 13, timestamp: "00:58" }]);
    expect(turns.map((t) => t.timestamp)).toEqual(originalTimestamps);
  });
});

describe("rebaseTimestamps", () => {
  it("rebases turns starting at 01:02 to start at 00:00", () => {
    const seg: SpeakerTurn[] = [
      { speaker_name: "Alice",   timestamp: "01:02", text: "OK Charlie" },
      { speaker_name: "Charlie", timestamp: "01:05", text: "Ready" },
      { speaker_name: "Charlie", timestamp: "01:28", text: "Done" },
    ];
    const rebased = rebaseTimestamps(seg);
    expect(rebased).toEqual([
      { speaker_name: "Alice",   timestamp: "00:00", text: "OK Charlie" },
      { speaker_name: "Charlie", timestamp: "00:03", text: "Ready" },
      { speaker_name: "Charlie", timestamp: "00:26", text: "Done" },
    ]);
  });

  it("turns already starting at 00:00 are unchanged", () => {
    const seg: SpeakerTurn[] = [
      { speaker_name: "Alice", timestamp: "00:00", text: "Hi" },
      { speaker_name: "Bob",   timestamp: "00:05", text: "Hey" },
    ];
    const rebased = rebaseTimestamps(seg);
    expect(rebased).toEqual([
      { speaker_name: "Alice", timestamp: "00:00", text: "Hi" },
      { speaker_name: "Bob",   timestamp: "00:05", text: "Hey" },
    ]);
  });

  it("does not mutate the input array", () => {
    const seg: SpeakerTurn[] = [
      { speaker_name: "Alice", timestamp: "01:00", text: "Hello" },
    ];
    rebaseTimestamps(seg);
    expect(seg[0].timestamp).toBe("01:00");
  });
});

describe("reconstructTranscript", () => {
  it("produces speaker | timestamp header line followed by text, one blank line between turns", () => {
    const seg: SpeakerTurn[] = [
      { speaker_name: "Alice", timestamp: "00:00", text: "Welcome" },
      { speaker_name: "Bob",   timestamp: "00:05", text: "Thanks" },
      { speaker_name: "Alice", timestamp: "00:10", text: "Let's go" },
    ];
    expect(reconstructTranscript(seg)).toBe(
      "Alice | 00:00\nWelcome\n\nBob | 00:05\nThanks\n\nAlice | 00:10\nLet's go\n\n",
    );
  });

  it("round-trip: parseTranscriptBody(reconstructTranscript(turns)) reproduces original turns", () => {
    const rebased = rebaseTimestamps(turns.slice(13));
    expect(parseTranscriptBody(reconstructTranscript(rebased))).toEqual(rebased);
  });
});

describe("deriveParticipants", () => {
  it("returns only participants whose full names appear in the turns", () => {
    const seg: SpeakerTurn[] = [
      { speaker_name: "Alice Smith",   timestamp: "00:00", text: "Hi" },
      { speaker_name: "Charlie Lee",   timestamp: "00:05", text: "Hey" },
      { speaker_name: "Alice Smith",   timestamp: "00:10", text: "Bye" },
    ];
    expect(deriveParticipants(seg, participants)).toEqual([
      { id: "1", first_name: "Alice",   last_name: "Smith", email: "alice@co.com" },
      { id: "3", first_name: "Charlie", last_name: "Lee",   email: "charlie@co.com" },
    ]);
  });

  it("unmatched speaker name produces synthetic participant with empty id/last_name/email", () => {
    const seg: SpeakerTurn[] = [
      { speaker_name: "Unknown Speaker 1", timestamp: "00:00", text: "hi" },
    ];
    expect(deriveParticipants(seg, participants)).toEqual([
      { id: "", first_name: "Unknown Speaker 1", last_name: "", email: "" },
    ]);
  });
});

describe("validateSplitRequest", () => {
  it("returns meeting, turns, and participants for a valid request", () => {
    const db = createDb(":memory:");
    migrate(db);
    const meetingId = seedMeeting(db);
    const result = validateSplitRequest(db, meetingId, [60, 30]);
    expect(result.meeting.id).toBe(meetingId);
    expect(result.turns).toHaveLength(5);
    expect(result.participants).toEqual([]);
  });

  it("throws when meeting does not exist", () => {
    const db = createDb(":memory:");
    migrate(db);
    expect(() => validateSplitRequest(db, "no-such-id", [60, 30])).toThrow("not found");
  });

  it("throws when meeting is archived", () => {
    const db = createDb(":memory:");
    migrate(db);
    const meetingId = seedMeeting(db, { ignored: 1 });
    expect(() => validateSplitRequest(db, meetingId, [60, 30])).toThrow("archived");
  });

  it("throws when durations has fewer than 2 elements", () => {
    const db = createDb(":memory:");
    migrate(db);
    const meetingId = seedMeeting(db);
    expect(() => validateSplitRequest(db, meetingId, [60])).toThrow();
  });

  it("throws when cumulative duration exceeds transcript time span", () => {
    const db = createDb(":memory:");
    migrate(db);
    const meetingId = seedMeeting(db);
    expect(() => validateSplitRequest(db, meetingId, [200, 30])).toThrow();
  });

  it("throws when meeting is already a split source", () => {
    const db = createDb(":memory:");
    migrate(db);
    const meetingId = seedMeeting(db);
    const childId = seedMeeting(db);
    db.prepare(
      "INSERT INTO meeting_lineage (id, source_meeting_id, result_meeting_id, segment_index, split_at_turn) VALUES (?, ?, ?, ?, ?)",
    ).run("lin-1", meetingId, childId, 1, 3);
    expect(() => validateSplitRequest(db, meetingId, [60, 30])).toThrow("already been split");
  });
});
