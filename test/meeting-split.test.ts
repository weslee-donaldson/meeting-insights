import { describe, it, expect } from "vitest";
import type { SpeakerTurn } from "../core/parser.js";
import { computeCutPoints } from "../core/meeting-split.js";

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
