import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import { createNote, listNotes, getNote, updateNote, deleteNote, countNotes } from "../../core/notes.js";
import type { ObjectType } from "../../core/notes.js";

const VALID_OBJECT_TYPES = new Set<string>(["meeting", "insight", "milestone", "thread"]);

export function registerNoteRoutes(app: Hono, db: Database): void {
  app.get("/api/notes/:objectType/:objectId", (c) => {
    const objectType = c.req.param("objectType");
    if (!VALID_OBJECT_TYPES.has(objectType)) return c.json({ error: "Invalid object type" }, 400);
    const objectId = c.req.param("objectId");
    return c.json(listNotes(db, objectType as ObjectType, objectId));
  });

  app.post("/api/notes/:objectType/:objectId", async (c) => {
    const objectType = c.req.param("objectType");
    if (!VALID_OBJECT_TYPES.has(objectType)) return c.json({ error: "Invalid object type" }, 400);
    const objectId = c.req.param("objectId");
    const { title, body, noteType } = await c.req.json<{ title?: string; body: string; noteType?: string }>();
    if (!body) return c.json({ error: "body is required" }, 400);
    const note = createNote(db, { objectType: objectType as ObjectType, objectId, title, body, noteType });
    return c.json(note, 201);
  });

  app.get("/api/notes/:objectType/:objectId/count", (c) => {
    const objectType = c.req.param("objectType");
    if (!VALID_OBJECT_TYPES.has(objectType)) return c.json({ error: "Invalid object type" }, 400);
    const objectId = c.req.param("objectId");
    return c.json({ count: countNotes(db, objectType as ObjectType, objectId) });
  });

  app.patch("/api/notes/:id", async (c) => {
    const id = c.req.param("id");
    const existing = getNote(db, id);
    if (!existing) return c.json({ error: "Not found" }, 404);
    if (existing.noteType !== "user") return c.json({ error: "Cannot modify non-user notes" }, 403);
    const input = await c.req.json<{ title?: string | null; body?: string }>();
    const updated = updateNote(db, id, input);
    return c.json(updated);
  });

  app.delete("/api/notes/:id", (c) => {
    const id = c.req.param("id");
    const existing = getNote(db, id);
    if (existing && existing.noteType !== "user") return c.json({ error: "Cannot delete non-user notes" }, 403);
    deleteNote(db, id);
    return c.json({ ok: true });
  });
}
