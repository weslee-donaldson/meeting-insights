import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { migrate } from "../core/db.js";
import { getAssets, storeAsset, deleteAsset, getAssetData, deleteAssetsForMeeting } from "../core/assets.js";
import { ingestMeeting } from "../core/pipeline/ingest.js";
import { handleUploadAsset, handleGetMeetingAssets, handleDeleteAsset, handleGetAssetData } from "../electron-ui/electron/handlers/meetings.js";

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

  it("reads asset data as buffer with metadata", () => {
    const meetingId = "mtg-004";
    ingestMeeting(db, {
      externalId: meetingId,
      title: "Test Meeting 4",
      timestamp: "2026-03-13",
      participants: [{ name: "Dave", role: "attendee" }],
      turns: [],
      rawTranscript: "data test",
      sourceFilename: "test4.md",
    });

    const content = Buffer.from("png-bytes-here");
    const row = storeAsset(db, meetingId, "arch.png", "image/png", content, assetsDir);

    const result = getAssetData(db, row.id, assetsDir);
    expect(result).toEqual({
      data: content,
      filename: "arch.png",
      mimeType: "image/png",
    });
  });

  it("returns null for nonexistent asset id", () => {
    const result = getAssetData(db, "no-such-id", assetsDir);
    expect(result).toBe(null);
  });

  it("deletes all assets for a meeting", () => {
    const meetingId = "mtg-005";
    ingestMeeting(db, {
      externalId: meetingId,
      title: "Test Meeting 5",
      timestamp: "2026-03-13",
      participants: [{ name: "Eve", role: "attendee" }],
      turns: [],
      rawTranscript: "cascade",
      sourceFilename: "test5.md",
    });

    const row1 = storeAsset(db, meetingId, "a.png", "image/png", Buffer.from("aaa"), assetsDir);
    const row2 = storeAsset(db, meetingId, "b.jpg", "image/jpeg", Buffer.from("bbb"), assetsDir);

    deleteAssetsForMeeting(db, meetingId, assetsDir);

    expect(getAssets(db, meetingId)).toEqual([]);
    expect(existsSync(join(assetsDir, row1.storage_path))).toBe(false);
    expect(existsSync(join(assetsDir, row2.storage_path))).toBe(false);
  });
});

describe("asset handlers", () => {
  let db: DatabaseSync;
  let assetsDir: string;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
    assetsDir = mkdtempSync(join(tmpdir(), "asset-handlers-"));
    ingestMeeting(db, {
      externalId: "h-mtg-1",
      title: "Handler Meeting",
      timestamp: "2026-03-13",
      participants: [{ name: "Alice", role: "attendee" }],
      turns: [],
      rawTranscript: "handler test",
      sourceFilename: "handler.md",
    });
  });

  afterEach(() => {
    rmSync(assetsDir, { recursive: true, force: true });
  });

  it("uploads asset via handler with base64 input", () => {
    const base64 = Buffer.from("handler-data").toString("base64");
    const row = handleUploadAsset(db, "h-mtg-1", "seq.png", "image/png", base64, assetsDir);

    expect(row).toEqual({
      id: expect.any(String),
      meeting_id: "h-mtg-1",
      filename: "seq.png",
      mime_type: "image/png",
      file_size: Buffer.from("handler-data").length,
      storage_path: expect.stringContaining("h-mtg-1/"),
      created_at: expect.any(String),
    });
  });

  it("lists assets via handler", () => {
    handleUploadAsset(db, "h-mtg-1", "a.png", "image/png", Buffer.from("aa").toString("base64"), assetsDir);
    const assets = handleGetMeetingAssets(db, "h-mtg-1");
    expect(assets).toHaveLength(1);
    expect(assets[0].filename).toBe("a.png");
  });

  it("deletes asset via handler", () => {
    const row = handleUploadAsset(db, "h-mtg-1", "del.png", "image/png", Buffer.from("dd").toString("base64"), assetsDir);
    handleDeleteAsset(db, row.id, assetsDir);
    expect(handleGetMeetingAssets(db, "h-mtg-1")).toEqual([]);
  });

  it("returns asset data as base64 via handler", () => {
    const original = Buffer.from("base64-test-data");
    const row = handleUploadAsset(db, "h-mtg-1", "data.png", "image/png", original.toString("base64"), assetsDir);
    const result = handleGetAssetData(db, row.id, assetsDir);
    expect(result).toEqual({
      data: original.toString("base64"),
      filename: "data.png",
      mimeType: "image/png",
    });
  });

  it("returns null for nonexistent asset via handler", () => {
    expect(handleGetAssetData(db, "nope", assetsDir)).toBe(null);
  });
});
