import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { migrate } from "../core/db.js";
import { getAssets, storeAsset } from "../core/assets.js";
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
});
