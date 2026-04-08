import { describe, it, expect, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { runSplit } from "../cli/split.js";

vi.mock("../core/vector-db.js", () => {
  const mockTable = { query: () => ({ toArray: vi.fn().mockResolvedValue([]) }), add: vi.fn(), delete: vi.fn().mockResolvedValue(undefined) };
  return {
    createMeetingTable: vi.fn().mockResolvedValue(mockTable),
    createItemTable: vi.fn().mockResolvedValue(mockTable),
  };
});

const VALID_TRANSCRIPT =
  "Alice | 00:00\nWelcome\n\n" +
  "Bob | 00:15\nThanks\n\n" +
  "Alice | 00:30\nGood meeting\n\n" +
  "Bob | 01:00\nAgreed\n\n" +
  "Alice | 01:28\nBye\n\n";

describe("runSplit", () => {
  it("outputs segment table with meeting IDs and archived confirmation", async () => {
    const db = createDb(":memory:");
    migrate(db);
    const meetingId = ingestMeeting(db, {
      title: "Weekly Standup",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: VALID_TRANSCRIPT,
      sourceFilename: "weekly-standup-cli.md",
    });
    const output = await runSplit(db, meetingId, [60, 30]);
    expect(output).toContain('Split meeting "Weekly Standup" into 2 segments:');
    expect(output).toContain("1 of 2:");
    expect(output).toContain("2 of 2:");
    expect(output).toContain("Original meeting archived");
    expect(output).toContain("Run pipeline to extract insights");
  });

  it("throws when meeting not found", async () => {
    const db = createDb(":memory:");
    migrate(db);
    await expect(runSplit(db, "no-such-id", [60, 30])).rejects.toThrow("not found");
  });

  it("throws when durations is a single element", async () => {
    const db = createDb(":memory:");
    migrate(db);
    const meetingId = ingestMeeting(db, {
      title: "Test",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: VALID_TRANSCRIPT,
      sourceFilename: "cli-split-single.md",
    });
    await expect(runSplit(db, meetingId, [60])).rejects.toThrow();
  });
});
