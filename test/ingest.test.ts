import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../src/db.js";
import { ingestMeeting, getMeeting } from "../src/ingest.js";
import type { ParsedMeeting } from "../src/parser.js";
import type { Database } from "better-sqlite3";

let db: Database;

const parsed: ParsedMeeting = {
  timestamp: "2026-01-19T15:43:52.210Z",
  title: "Revenium, INT, DSU",
  participants: [
    { last_name: "Donaldson", id: "pid-001", first_name: "Wesley", email: "wesley@xolv.io" },
  ],
  turns: [{ speaker_name: "Wesley Donaldson", timestamp: "00:11", text: "Good morning." }],
  rawTranscript: "raw content",
  sourceFilename: " 2026-01-19T15:43:52.210ZRevenium, INT, DSU",
};

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
});

describe("ingestMeeting", () => {
  it("inserts parsed meeting and returns meeting_id", () => {
    const id = ingestMeeting(db, parsed);
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("stores participant list as JSON string in participants column", () => {
    const id = ingestMeeting(db, { ...parsed, sourceFilename: "unique-1" });
    const row = db.prepare("SELECT participants FROM meetings WHERE id = ?").get(id) as { participants: string };
    expect(JSON.parse(row.participants)).toEqual(parsed.participants);
  });

  it("stores source filename in source_filename column", () => {
    const id = ingestMeeting(db, { ...parsed, sourceFilename: "unique-2" });
    const row = db.prepare("SELECT source_filename FROM meetings WHERE id = ?").get(id) as { source_filename: string };
    expect(row.source_filename).toBe("unique-2");
  });

  it("rejects duplicate source_filename", () => {
    ingestMeeting(db, { ...parsed, sourceFilename: "unique-3" });
    expect(() => ingestMeeting(db, { ...parsed, sourceFilename: "unique-3" })).toThrow();
  });
});

describe("getMeeting", () => {
  it("retrieves stored meeting row by meeting_id", () => {
    const id = ingestMeeting(db, { ...parsed, sourceFilename: "unique-4" });
    const row = getMeeting(db, id);
    expect(row.id).toBe(id);
    expect(row.title).toBe("Revenium, INT, DSU");
    expect(row.source_filename).toBe("unique-4");
  });
});
