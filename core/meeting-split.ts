import type { Participant, SpeakerTurn } from "./parser.js";

function parseMinutes(timestamp: string): number {
  const [h, m] = timestamp.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function rebaseTimestamps(turns: SpeakerTurn[]): SpeakerTurn[] {
  if (turns.length === 0) return [];
  const offset = parseMinutes(turns[0].timestamp);
  return turns.map((t) => ({ ...t, timestamp: formatMinutes(parseMinutes(t.timestamp) - offset) }));
}

export function reconstructTranscript(turns: SpeakerTurn[]): string {
  return turns.map((t) => `${t.speaker_name} | ${t.timestamp}\n${t.text}\n\n`).join("");
}

export function deriveParticipants(turns: SpeakerTurn[], originalParticipants: Participant[]): Participant[] {
  const uniqueNames = [...new Set(turns.map((t) => t.speaker_name))];
  return uniqueNames.map((name) => {
    const match = originalParticipants.find((p) => `${p.first_name} ${p.last_name}` === name);
    return match ?? { id: "", first_name: name, last_name: "", email: "" };
  });
}

export function partitionTurns(
  turns: SpeakerTurn[],
  cutPoints: { turnIndex: number }[],
): SpeakerTurn[][] {
  const boundaries = [0, ...cutPoints.map((c) => c.turnIndex), turns.length];
  return boundaries.slice(0, -1).map((start, i) =>
    rebaseTimestamps(turns.slice(start, boundaries[i + 1])),
  );
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
