import type { DatabaseSync as Database } from "node:sqlite";
import { randomUUID } from "node:crypto";

export interface MeetingMessage {
  id: string;
  meeting_id: string;
  role: "user" | "assistant";
  content: string;
  sources: string | null;
  created_at: string;
}

interface MeetingMessageRow {
  id: string;
  meeting_id: string;
  role: string;
  content: string;
  sources: string | null;
  created_at: string;
}

function rowToMessage(row: MeetingMessageRow): MeetingMessage {
  return {
    id: row.id,
    meeting_id: row.meeting_id,
    role: row.role as "user" | "assistant",
    content: row.content,
    sources: row.sources,
    created_at: row.created_at,
  };
}

export function appendMeetingMessage(db: Database, input: { meeting_id: string; role: "user" | "assistant"; content: string; sources?: string }): MeetingMessage {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO meeting_messages (id, meeting_id, role, content, sources, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, input.meeting_id, input.role, input.content, input.sources ?? null, now);
  return rowToMessage(db.prepare("SELECT * FROM meeting_messages WHERE id = ?").get(id) as MeetingMessageRow);
}

export function getMeetingMessages(db: Database, meetingId: string): MeetingMessage[] {
  const rows = db.prepare("SELECT * FROM meeting_messages WHERE meeting_id = ? ORDER BY created_at ASC").all(meetingId) as MeetingMessageRow[];
  return rows.map(rowToMessage);
}

export function clearMeetingMessages(db: Database, meetingId: string): void {
  db.prepare("DELETE FROM meeting_messages WHERE meeting_id = ?").run(meetingId);
}
