import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { migrate } from "../core/db.js";
import { getAssets, storeAsset, deleteAsset } from "../core/assets.js";
import { ingestMeeting } from "../core/ingest.js";

describe("assets", () => {
  let db: DatabaseSync;
  let assetsDir: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    assetsDir = mkdtempSync(join(tmpdir(), "assets-test-"));
  });

  afterEach(() => {
    rmSync(assetsDir, { recursive: true, force: true });
  });

  it("returns empty array for nonexistent meeting", () => {
    const result = getAssets(db, "nonexistent");
    expect(result).toEqual([]);
  });

  it("stores asset file and returns metadata row", () => {
    const meetingId = "mtg-001";
    ingestMeeting(db, {
      externalId: meetingId,
      title: "Test Meeting",
      timestamp: "2026-03-13",
      participants: [{ name: "Alice", role: "attendee" }],
      turns: [],
      rawTranscript: "hello",
      sourceFilename: "test.md",
    });

    const data = Buffer.from("fake-image-data");
    const row = storeAsset(db, meetingId, "diagram.png", "image/png", data, assetsDir);

    expect(row).toEqual({
      id: expect.any(String),
      meeting_id: meetingId,
      filename: "diagram.png",
      mime_type: "image/png",
      file_size: data.length,
      storage_path: expect.stringContaining(`${meetingId}/`),
      created_at: expect.any(String),
    });

    const stored = getAssets(db, meetingId);
    expect(stored).toEqual([row]);

    const filePath = join(assetsDir, row.storage_path);
    expect(existsSync(filePath)).toBe(true);
    expect(readFileSync(filePath)).toEqual(data);
  });

  it("deletes asset file and row", () => {
    const meetingId = "mtg-002";
    ingestMeeting(db, {
      externalId: meetingId,
      title: "Test Meeting 2",
      timestamp: "2026-03-13",
      participants: [{ name: "Bob", role: "attendee" }],
      turns: [],
      rawTranscript: "world",
      sourceFilename: "test2.md",
    });

    const data = Buffer.from("to-be-deleted");
    const row = storeAsset(db, meetingId, "temp.png", "image/png", data, assetsDir);
    const filePath = join(assetsDir, row.storage_path);
    expect(existsSync(filePath)).toBe(true);

    deleteAsset(db, row.id, assetsDir);

    expect(getAssets(db, meetingId)).toEqual([]);
    expect(existsSync(filePath)).toBe(false);
  });

  it("tolerates deleting asset when file is already missing", () => {
    const meetingId = "mtg-003";
    ingestMeeting(db, {
      externalId: meetingId,
      title: "Test Meeting 3",
      timestamp: "2026-03-13",
      participants: [{ name: "Charlie", role: "attendee" }],
      turns: [],
      rawTranscript: "missing",
      sourceFilename: "test3.md",
    });

    const row = storeAsset(db, meetingId, "ghost.png", "image/png", Buffer.from("x"), assetsDir);
    rmSync(join(assetsDir, row.storage_path));

    deleteAsset(db, row.id, assetsDir);
    expect(getAssets(db, meetingId)).toEqual([]);
  });
});
