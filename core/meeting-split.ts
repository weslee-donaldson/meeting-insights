import type { SpeakerTurn } from "./parser.js";

function parseMinutes(timestamp: string): number {
  const [h, m] = timestamp.split(":").map(Number);
  return h * 60 + m;
}

export function computeCutPoints(
  turns: SpeakerTurn[],
  durations: number[],
): { turnIndex: number; timestamp: string }[] {
  const cutPoints: { turnIndex: number; timestamp: string }[] = [];
  let cumulative = 0;
  for (let i = 0; i < durations.length - 1; i++) {
    cumulative += durations[i];
    let lastIndex = -1;
    for (let t = 0; t < turns.length; t++) {
      if (parseMinutes(turns[t].timestamp) <= cumulative) {
        lastIndex = t;
      }
    }
    if (lastIndex === -1) {
      throw new Error(`Cut at ${cumulative} minutes falls before first turn`);
    }
    if (lastIndex === turns.length - 1) {
      throw new Error(`Cut at ${cumulative} minutes falls at or after last turn`);
    }
    cutPoints.push({ turnIndex: lastIndex + 1, timestamp: turns[lastIndex].timestamp });
  }
  return cutPoints;
}
