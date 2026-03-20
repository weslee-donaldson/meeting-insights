import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { createNote } from "../core/notes.js";

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
