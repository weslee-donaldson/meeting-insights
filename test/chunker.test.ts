import { describe, it, expect } from "vitest";
import { chunkTranscript } from "../core/pipeline/chunker.js";
import type { SpeakerTurn } from "../core/pipeline/parser.js";

function makeTurns(count: number, wordsEach: number): SpeakerTurn[] {
  return Array.from({ length: count }, (_, i) => ({
    speaker_name: `Speaker ${i}`,
    timestamp: "00:00",
    text: Array.from({ length: wordsEach }, () => "word").join(" "),
  }));
}

describe("chunkTranscript", () => {
  it("returns single chunk when transcript is under token limit", () => {
    const turns = makeTurns(3, 10);
    const chunks = chunkTranscript(turns, 500);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual(turns);
  });

  it("splits transcript exceeding token limit into multiple chunks", () => {
    const turns = makeTurns(20, 50);
    const chunks = chunkTranscript(turns, 100);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("never splits mid-turn — each chunk contains complete speaker turns", () => {
    const turns = makeTurns(20, 50);
    const chunks = chunkTranscript(turns, 100);
    const rejoined = chunks.flat();
    expect(rejoined).toEqual(turns);
  });
});
