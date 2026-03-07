export interface Thread {
  id: string;
  client_name: string;
  title: string;
  shorthand: string;
  description: string;
  status: "open" | "resolved";
  summary: string;
  criteria_prompt: string;
  criteria_changed_at: string;
  created_at: string;
  updated_at: string;
  meeting_count?: number;
}

export interface ThreadMeeting {
  thread_id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  relevance_summary: string;
  relevance_score: number;
  evaluated_at: string;
}

export interface ThreadMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  sources: string | null;
  context_stale: boolean;
  stale_details: string | null;
  created_at: string;
}

export interface CreateThreadInput {
  client_name: string;
  title: string;
  shorthand: string;
  description: string;
  criteria_prompt: string;
}

import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";

interface ThreadRow {
  id: string;
  client_name: string;
  title: string;
  shorthand: string;
  description: string;
  status: string;
  summary: string;
  criteria_prompt: string;
  criteria_changed_at: string;
  created_at: string;
  updated_at: string;
  meeting_count?: number;
}

function rowToThread(row: ThreadRow): Thread {
  return {
    id: row.id,
    client_name: row.client_name,
    title: row.title,
    shorthand: row.shorthand,
    description: row.description,
    status: row.status as "open" | "resolved",
    summary: row.summary,
    criteria_prompt: row.criteria_prompt,
    criteria_changed_at: row.criteria_changed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...(row.meeting_count !== undefined ? { meeting_count: row.meeting_count } : {}),
  };
}

export function createThread(db: Database, input: CreateThreadInput): Thread {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO threads (id, client_name, title, shorthand, description, status, summary, criteria_prompt, criteria_changed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'open', '', ?, ?, ?, ?)
  `).run(id, input.client_name, input.title, input.shorthand, input.description, input.criteria_prompt, now, now, now);
  return rowToThread(db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow);
}

export function getThread(db: Database, id: string): Thread | null {
  const row = db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow | undefined;
  return row ? rowToThread(row) : null;
}

export interface UpdateThreadInput {
  title?: string;
  shorthand?: string;
  description?: string;
  status?: "open" | "resolved";
  summary?: string;
  criteria_prompt?: string;
}

export function updateThread(db: Database, id: string, input: UpdateThreadInput): Thread {
  const current = db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow;
  const now = new Date().toISOString();
  const criteriaChanged = input.criteria_prompt !== undefined && input.criteria_prompt !== current.criteria_prompt;
  db.prepare(`
    UPDATE threads SET
      title = ?,
      shorthand = ?,
      description = ?,
      status = ?,
      summary = ?,
      criteria_prompt = ?,
      criteria_changed_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    input.title ?? current.title,
    input.shorthand ?? current.shorthand,
    input.description ?? current.description,
    input.status ?? current.status,
    input.summary ?? current.summary,
    input.criteria_prompt ?? current.criteria_prompt,
    criteriaChanged ? now : current.criteria_changed_at,
    now,
    id,
  );
  return rowToThread(db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow);
}

export function deleteThread(db: Database, id: string): void {
  db.prepare("DELETE FROM thread_messages WHERE thread_id = ?").run(id);
  db.prepare("DELETE FROM thread_meetings WHERE thread_id = ?").run(id);
  db.prepare("DELETE FROM threads WHERE id = ?").run(id);
}

export function listThreadsByClient(db: Database, clientName: string): Thread[] {
  const rows = db.prepare(`
    SELECT t.*, COUNT(tm.meeting_id) AS meeting_count
    FROM threads t
    LEFT JOIN thread_meetings tm ON t.id = tm.thread_id
    WHERE t.client_name = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all(clientName) as ThreadRow[];
  return rows.map(rowToThread);
}
