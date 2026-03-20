import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { createNote, listNotes, updateNote } from "../core/notes.js";

function freshDb(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  migrate(db);
  return db;
}

describe("createNote", () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = freshDb();
  });

  it("creates a note with generated id and timestamps", () => {
    const result = createNote(db, {
      objectType: "meeting",
      objectId: "m1",
      title: "Risk: timeline unclear",
      body: "<p>Jennifer flagged the checkout issue</p>",
    });

    expect(result).toEqual({
      id: expect.any(String),
      objectType: "meeting",
      objectId: "m1",
      title: "Risk: timeline unclear",
      body: "<p>Jennifer flagged the checkout issue</p>",
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(result.createdAt).toBe(result.updatedAt);
  });

  it("creates a note with null title when title is omitted", () => {
    const result = createNote(db, {
      objectType: "insight",
      objectId: "i1",
      body: "<p>Summary misses observability gap</p>",
    });

    expect(result.title).toBeNull();
    expect(result.objectType).toBe("insight");
  });
});

describe("listNotes", () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = freshDb();
  });

  it("returns notes in reverse-chronological order for a given object", () => {
    createNote(db, { objectType: "meeting", objectId: "m1", title: "First", body: "<p>a</p>" });
    createNote(db, { objectType: "meeting", objectId: "m1", title: "Second", body: "<p>b</p>" });
    createNote(db, { objectType: "meeting", objectId: "m2", title: "Other", body: "<p>c</p>" });

    const result = listNotes(db, "meeting", "m1");

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Second");
    expect(result[1].title).toBe("First");
  });

  it("returns empty array when no notes exist for an object", () => {
    const result = listNotes(db, "meeting", "nonexistent");

    expect(result).toEqual([]);
  });
});

describe("updateNote", () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = freshDb();
  });

  it("updates title and body, sets new updated_at", () => {
    const note = createNote(db, { objectType: "meeting", objectId: "m1", title: "Old", body: "<p>old</p>" });

    const result = updateNote(db, note.id, { title: "New title", body: "<p>new body</p>" });

    expect(result).toEqual({
      id: note.id,
      objectType: "meeting",
      objectId: "m1",
      title: "New title",
      body: "<p>new body</p>",
      createdAt: note.createdAt,
      updatedAt: expect.any(String),
    });
    expect(result.updatedAt >= note.updatedAt).toBe(true);
  });

  it("updates only body when title is not provided", () => {
    const note = createNote(db, { objectType: "meeting", objectId: "m1", title: "Keep", body: "<p>old</p>" });

    const result = updateNote(db, note.id, { body: "<p>changed</p>" });

    expect(result.title).toBe("Keep");
    expect(result.body).toBe("<p>changed</p>");
  });

  it("sets title to null when explicitly passed null", () => {
    const note = createNote(db, { objectType: "meeting", objectId: "m1", title: "Remove me", body: "<p>x</p>" });

    const result = updateNote(db, note.id, { title: null });

    expect(result.title).toBeNull();
  });

  it("throws when note does not exist", () => {
    expect(() => updateNote(db, "nonexistent", { body: "x" })).toThrow("Note not found");
  });
});
