import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";
import type { InferenceSession } from "onnxruntime-node";
import type { Participant, SpeakerTurn } from "./parser.js";
import { parseTranscriptBody } from "./parser.js";
import { getMeeting, ingestMeeting } from "./ingest.js";
import type { MeetingRow } from "./ingest.js";
import { detectClient, storeDetection } from "./client-detection.js";
import { getClientById } from "./client-registry.js";
import { extractSummary, storeArtifact } from "./extractor.js";
import { updateFts } from "./fts.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "./meeting-pipeline.js";
import { createMeetingTable, createItemTable } from "./vector-db.js";
import type { VectorDb } from "./vector-db.js";
import type { LlmAdapter } from "./llm-adapter.js";

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

export interface SplitSegmentResult {
  meeting_id: string;
  segment_index: number;
  title: string;
  turn_count: number;
  actual_start: string;
  actual_end: string;
  requested_duration: number;
  actual_duration: number;
}

export interface SplitResult {
  source_meeting_id: string;
  segments: SplitSegmentResult[];
}

export interface PipelineDeps {
  llm: LlmAdapter;
  session: InferenceSession & { _tokenizer: unknown };
  vdb: VectorDb;
  tokenLimit?: number;
  extractionPromptPath?: string;
  threadSimilarityThreshold?: number;
}

export async function cleanupArchivedMeeting(db: Database, meetingId: string, vdb?: VectorDb): Promise<void> {
  db.prepare("DELETE FROM artifacts WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM artifact_fts WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM client_detections WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM meeting_clusters WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM item_mentions WHERE meeting_id = ?").run(meetingId);
  if (vdb) {
    const meetingTable = await createMeetingTable(vdb);
    await meetingTable.delete(`meeting_id = '${meetingId}'`);
    const itemTable = await createItemTable(vdb);
    await itemTable.delete(`meeting_id = '${meetingId}'`);
  }
}

export async function reprocessSplitSegments(
  db: Database,
  splitResult: SplitResult,
  deps: PipelineDeps,
): Promise<{ meeting_id: string; status: "ok" | "failed"; error?: string }[]> {
  const tokenLimit = deps.tokenLimit ?? 30000;
  const table = await createMeetingTable(deps.vdb);
  const itemTable = await createItemTable(deps.vdb);
  const results: { meeting_id: string; status: "ok" | "failed"; error?: string }[] = [];

  for (const seg of splitResult.segments) {
    try {
      const meeting = getMeeting(db, seg.meeting_id);
      const turns = parseTranscriptBody(meeting.raw_transcript);
      const detections = detectClient(db, seg.meeting_id);
      storeDetection(db, seg.meeting_id, detections);
      const topClient = detections.sort((a, b) => b.confidence - a.confidence)[0];
      const clientRow = topClient ? getClientById(db, topClient.client_id) : null;
      const artifact = await extractSummary(deps.llm, turns, tokenLimit, deps.extractionPromptPath);
      storeArtifact(db, seg.meeting_id, artifact);
      updateFts(db, seg.meeting_id);
      const vec = await embedMeeting(deps.session, buildEmbeddingInput(artifact));
      await storeMeetingVector(table, seg.meeting_id, vec, {
        client: clientRow?.name ?? "",
        meeting_type: meeting.title,
        date: meeting.date,
      });
      results.push({ meeting_id: seg.meeting_id, status: "ok" });
    } catch (err) {
      results.push({ meeting_id: seg.meeting_id, status: "failed", error: (err as Error).message });
    }
  }

  return results;
}

export function getChildMeetings(db: Database, sourceMeetingId: string): MeetingRow[] {
  return db.prepare(`
    SELECT m.* FROM meetings m
    JOIN meeting_lineage l ON l.result_meeting_id = m.id
    WHERE l.source_meeting_id = ?
    ORDER BY l.segment_index
  `).all(sourceMeetingId) as MeetingRow[];
}

export function getSourceMeeting(db: Database, resultMeetingId: string): MeetingRow | null {
  const row = db.prepare(`
    SELECT m.* FROM meetings m
    JOIN meeting_lineage l ON l.source_meeting_id = m.id
    WHERE l.result_meeting_id = ?
  `).get(resultMeetingId) as MeetingRow | undefined;
  return row ?? null;
}

export async function splitMeeting(db: Database, meetingId: string, durations: number[], vdb?: VectorDb): Promise<SplitResult> {
  const { meeting, turns, participants } = validateSplitRequest(db, meetingId, durations);
  const cutPoints = computeCutPoints(turns, durations);
  const segmentTurnArrays = partitionTurns(turns, cutPoints);
  const N = segmentTurnArrays.length;

  const segments: SplitSegmentResult[] = segmentTurnArrays.map((segTurns, i) => {
    const k = i + 1;
    const title = `${meeting.title} (${k} of ${N})`;
    const sourceFilename = `${meeting.source_filename}::split:${k}`;
    const transcript = reconstructTranscript(segTurns);
    const segParticipants = deriveParticipants(segTurns, participants);
    const newMeetingId = ingestMeeting(db, {
      title,
      timestamp: meeting.date,
      participants: segParticipants,
      turns: segTurns,
      rawTranscript: transcript,
      sourceFilename,
    });
    const splitAtTurn = i === 0 ? 0 : cutPoints[i - 1].turnIndex;
    db.prepare(
      "INSERT INTO meeting_lineage (id, source_meeting_id, result_meeting_id, segment_index, split_at_turn) VALUES (?, ?, ?, ?, ?)",
    ).run(randomUUID(), meetingId, newMeetingId, k, splitAtTurn);
    const actualStart = segTurns[0].timestamp;
    const actualEnd = segTurns[segTurns.length - 1].timestamp;
    return {
      meeting_id: newMeetingId,
      segment_index: k,
      title,
      turn_count: segTurns.length,
      actual_start: actualStart,
      actual_end: actualEnd,
      requested_duration: durations[i],
      actual_duration: parseMinutes(actualEnd) - parseMinutes(actualStart),
    };
  });

  db.prepare("UPDATE meetings SET ignored = 1 WHERE id = ?").run(meetingId);
  await cleanupArchivedMeeting(db, meetingId, vdb);
  return { source_meeting_id: meetingId, segments };
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
