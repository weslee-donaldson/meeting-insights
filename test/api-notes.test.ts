import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createApp } from "../api/server.js";
import type { Note } from "../core/notes.js";

let app: ReturnType<typeof createApp>;
let db: ReturnType<typeof createDb>;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  app = createApp(db, ":memory:");
});

describe("Notes API routes", () => {
  it("GET /api/notes/meeting/m1 returns empty array initially", async () => {
    const res = await app.request("/api/notes/meeting/m1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("POST /api/notes/meeting/m1 creates a note", async () => {
    const res = await app.request("/api/notes/meeting/m1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Risk note", body: "<p>checkout issue</p>" }),
    });
    expect(res.status).toBe(201);
    const note = await res.json() as Note;
    expect(note).toEqual({
      id: expect.any(String),
      objectType: "meeting",
      objectId: "m1",
      title: "Risk note",
      body: "<p>checkout issue</p>",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("POST /api/notes/meeting/m1 rejects missing body", async () => {
    const res = await app.request("/api/notes/meeting/m1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "No body" }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/notes/invalid/x rejects invalid object type", async () => {
    const res = await app.request("/api/notes/invalid/x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "<p>x</p>" }),
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/notes/meeting/m1 returns created notes", async () => {
    const res = await app.request("/api/notes/meeting/m1");
    expect(res.status).toBe(200);
    const notes = await res.json() as Note[];
    expect(notes.length).toBeGreaterThanOrEqual(1);
    expect(notes[0].title).toBe("Risk note");
  });

  it("GET /api/notes/meeting/m1/count returns note count", async () => {
    const res = await app.request("/api/notes/meeting/m1/count");
    expect(res.status).toBe(200);
    const body = await res.json() as { count: number };
    expect(body.count).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/notes/:id updates a note", async () => {
    const listRes = await app.request("/api/notes/meeting/m1");
    const notes = await listRes.json() as Note[];
    const noteId = notes[0].id;

    const res = await app.request(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated title", body: "<p>updated</p>" }),
    });
    expect(res.status).toBe(200);
    const updated = await res.json() as Note;
    expect(updated.title).toBe("Updated title");
    expect(updated.body).toBe("<p>updated</p>");
  });

  it("PATCH /api/notes/nonexistent returns 404", async () => {
    const res = await app.request("/api/notes/nonexistent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "<p>x</p>" }),
    });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/notes/:id removes the note", async () => {
    const listRes = await app.request("/api/notes/meeting/m1");
    const notes = await listRes.json() as Note[];
    const noteId = notes[0].id;

    const res = await app.request(`/api/notes/${noteId}`, { method: "DELETE" });
    expect(res.status).toBe(200);

    const countRes = await app.request("/api/notes/meeting/m1/count");
    const body = await countRes.json() as { count: number };
    expect(body.count).toBe(0);
  });
});
