import { describe, it, expect, beforeAll } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../core/db.js";
import { seedClients } from "../core/client-registry.js";
import { ingestMeeting } from "../core/ingest.js";
import { assignClient } from "../cli/admin-util/assign-client.js";
import type { ParsedMeeting } from "../core/parser.js";
import type { DatabaseSync as Database } from "node:sqlite";

let db: Database;
let meetingId: string;
let secondMeetingId: string;

const clientsData = [
  { name: "TestCo", aliases: ["TestCo"], known_participants: ["@testco.com"] },
  { name: "OtherCo", aliases: ["OtherCo"], known_participants: ["@other.com"] },
];

function makeMeeting(title: string): ParsedMeeting {
  return {
    timestamp: "2026-01-01T00:00:00.000Z",
    title,
    participants: [],
    turns: [{ speaker_name: "Alice", timestamp: "00:01", text: "Hello." }],
    sourceFilename: `src-${Date.now()}-${Math.random()}`,
    rawTranscript: `Attendance:\nTranscript:\nAlice | 00:01\nHello.`,
  };
}

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  const dir = join(tmpdir(), `assign-test-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  const f = join(dir, "clients.json");
  writeFileSync(f, JSON.stringify(clientsData));
  seedClients(db, f);
  meetingId = ingestMeeting(db, makeMeeting("Alpha Weekly Sync"));
  secondMeetingId = ingestMeeting(db, makeMeeting("Alpha Weekly Sync"));
});

describe("assignClient", () => {
  it("matches by exact meeting ID and updates client_detections", () => {
    const result = assignClient(db, meetingId, "TestCo");
    expect(result).toEqual({ matched: 1, client_name: "TestCo" });
    const rows = db.prepare("SELECT * FROM client_detections WHERE meeting_id = ? AND client_name = 'TestCo'").all(meetingId);
    expect(rows).toHaveLength(1);
  });

  it("matches by title substring and updates all matching meetings", () => {
    const result = assignClient(db, "Alpha Weekly", "OtherCo");
    expect(result.matched).toBe(2);
    expect(result.client_name).toBe("OtherCo");
  });

  it("throws when no meeting matches the identifier", () => {
    expect(() => assignClient(db, "nonexistent-xyz-999", "TestCo")).toThrow();
  });

  it("throws when client name does not exist in clients table", () => {
    expect(() => assignClient(db, meetingId, "UnknownCorp")).toThrow();
  });

  it("replaces pre-existing detection (DELETE + INSERT, not UPDATE)", () => {
    db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, ?, ?)").run(meetingId, "OtherCo", 0.5, "alias");
    assignClient(db, meetingId, "TestCo");
    const rows = db.prepare("SELECT * FROM client_detections WHERE meeting_id = ?").all(meetingId) as { client_name: string; confidence: number; method: string }[];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ client_name: "TestCo", confidence: 1.0, method: "manual" });
  });
});
