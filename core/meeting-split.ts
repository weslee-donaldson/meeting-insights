import type { DatabaseSync as Database } from "node:sqlite";
import type { Participant, SpeakerTurn } from "./parser.js";
import { parseTranscriptBody } from "./parser.js";
import type { MeetingRow } from "./ingest.js";

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

type MeetingRowWithIgnored = MeetingRow & { ignored: number };

export function validateSplitRequest(
  db: Database,
  meetingId: string,
  durations: number[],
): { meeting: MeetingRowWithIgnored; turns: SpeakerTurn[]; participants: Participant[] } {
  const meeting = db.prepare("SELECT * FROM meetings WHERE id = ?").get(meetingId) as MeetingRowWithIgnored | undefined;
  if (!meeting) throw new Error(`Meeting not found: ${meetingId}`);
  if (meeting.ignored === 1) throw new Error(`Meeting is archived: ${meetingId}`);
  if (durations.length < 2) throw new Error("Must split into at least 2 segments");
  const turns = parseTranscriptBody(meeting.raw_transcript);
  if (turns.length < 2) throw new Error("Meeting transcript has fewer than 2 turns");
  computeCutPoints(turns, durations);
  const existing = db.prepare("SELECT id FROM meeting_lineage WHERE source_meeting_id = ?").get(meetingId);
  if (existing) throw new Error(`Meeting has already been split: ${meetingId}`);
  const participants: Participant[] = JSON.parse(meeting.participants);
  return { meeting, turns, participants };
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
