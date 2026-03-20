import type { DatabaseSync as Database } from "node:sqlite";
import { randomUUID } from "node:crypto";

export type ObjectType = "meeting" | "insight" | "milestone" | "thread";

export interface Note {
  id: string;
  objectType: ObjectType;
  objectId: string;
  title: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  objectType: ObjectType;
  objectId: string;
  title?: string;
  body: string;
}

export interface UpdateNoteInput {
  title?: string | null;
  body?: string;
}

interface NoteRow {
  id: string;
  object_type: string;
  object_id: string;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    objectType: row.object_type as ObjectType,
    objectId: row.object_id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createNote(db: Database, input: CreateNoteInput): Note {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO notes (id, object_type, object_id, title, body, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, input.objectType, input.objectId, input.title ?? null, input.body, now, now);
  return rowToNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as NoteRow);
}
