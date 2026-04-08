import { describe, it, expect } from "vitest";
import type { SpeakerTurn } from "../core/parser.js";
import { computeCutPoints, partitionTurns, rebaseTimestamps } from "../core/meeting-split.js";

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
