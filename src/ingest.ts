import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";
import { createLogger } from "./logger.js";
import type { ParsedMeeting } from "./parser.js";

const log = createLogger("ingest");

export interface MeetingRow {
  id: string;
  title: string;
  meeting_type: string | null;
  date: string;
  participants: string;
  raw_transcript: string;
  source_filename: string;
  created_at: string;
}

export function ingestMeeting(db: Database, meeting: ParsedMeeting): string {
  const id = meeting.externalId ?? randomUUID();
  db.prepare(`
    INSERT INTO meetings (id, title, meeting_type, date, participants, raw_transcript, source_filename, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    meeting.title,
    null,
    meeting.timestamp,
    JSON.stringify(meeting.participants),
    meeting.rawTranscript,
    meeting.sourceFilename,
    new Date().toISOString(),
  );
  log("ingested meeting id=%s title=%s", id, meeting.title);
  return id;
}

export function getMeeting(db: Database, meetingId: string): MeetingRow {
  return db.prepare("SELECT * FROM meetings WHERE id = ?").get(meetingId) as MeetingRow;
}
