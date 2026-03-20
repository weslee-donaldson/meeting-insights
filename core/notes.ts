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

export function listNotes(db: Database, objectType: ObjectType, objectId: string): Note[] {
  const rows = db.prepare(
    "SELECT * FROM notes WHERE object_type = ? AND object_id = ? ORDER BY created_at DESC, rowid DESC"
  ).all(objectType, objectId) as NoteRow[];
  return rows.map(rowToNote);
}

export function getNote(db: Database, id: string): Note | undefined {
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as NoteRow | undefined;
  return row ? rowToNote(row) : undefined;
}

export function updateNote(db: Database, id: string, input: UpdateNoteInput): Note {
  const now = new Date().toISOString();
  const existing = db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as NoteRow | undefined;
  if (!existing) throw new Error(`Note not found: ${id}`);
  const title = input.title !== undefined ? input.title : existing.title;
  const body = input.body !== undefined ? input.body : existing.body;
  db.prepare("UPDATE notes SET title = ?, body = ?, updated_at = ? WHERE id = ?").run(title, body, now, id);
  return rowToNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as NoteRow);
}

export function countNotes(db: Database, objectType: ObjectType, objectId: string): number {
  const row = db.prepare(
    "SELECT COUNT(*) as count FROM notes WHERE object_type = ? AND object_id = ?"
  ).get(objectType, objectId) as { count: number };
  return row.count;
}

export function deleteNote(db: Database, id: string): void {
  db.prepare("DELETE FROM notes WHERE id = ?").run(id);
}

export function deleteNotesByObject(db: Database, objectType: ObjectType, objectId: string): void {
  db.prepare("DELETE FROM notes WHERE object_type = ? AND object_id = ?").run(objectType, objectId);
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
