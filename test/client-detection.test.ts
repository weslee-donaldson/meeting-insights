import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../src/db.js";
import { seedClients } from "../src/client-registry.js";
import { detectClient, storeDetection, normalizeTokens } from "../src/client-detection.js";
import { ingestMeeting } from "../src/ingest.js";
import type { ParsedMeeting } from "../src/parser.js";
import type { DatabaseSync as Database } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

let db: Database;

const clientsData = [
  { name: "Revenium", aliases: ["Revenium", "REV"], known_participants: ["@revenium.com"] },
  { name: "Mandalore", aliases: ["Mandalore"], known_participants: ["@mandalore.com"] },
];

function makeDir() {
  const dir = join(tmpdir(), `det-test-${Date.now()}-${Math.random()}`);
  mkdirSync(dir, { recursive: true });
  const f = join(dir, "clients.json");
  writeFileSync(f, JSON.stringify(clientsData));
  return f;
}

function makeMeeting(overrides: Partial<ParsedMeeting> = {}): ParsedMeeting {
  const base = {
    timestamp: "2026-01-19T15:43:52.210Z",
    title: "Test Meeting",
    participants: [] as ParsedMeeting["participants"],
    turns: [{ speaker_name: "Alice", timestamp: "00:01", text: "Hello." }] as ParsedMeeting["turns"],
    sourceFilename: `src-${Date.now()}-${Math.random()}`,
    ...overrides,
  };
  const rawTranscript = overrides.rawTranscript ?? `Attendance:\nTranscript:\n${base.turns.map((t) => `${t.speaker_name} | ${t.timestamp}\n${t.text}`).join("\n")}`;
  return { ...base, rawTranscript };
}

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  seedClients(db, makeDir());
});

describe("detectClient", () => {
  it("returns client when participant email domain matches known_participants", () => {
    const meeting = makeMeeting({
      participants: [{ last_name: "Smith", id: "1", first_name: "John", email: "john@revenium.com" }],
    });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    expect(results.some((r) => r.client_name === "Revenium")).toBe(true);
  });

  it("returns client when meeting title contains client alias", () => {
    const meeting = makeMeeting({ title: "REV Quarterly Review" });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    expect(results.some((r) => r.client_name === "Revenium")).toBe(true);
  });

  it("returns client when transcript text contains alias", () => {
    const meeting = makeMeeting({
      turns: [{ speaker_name: "Alice", timestamp: "00:01", text: "Let's discuss the Mandalore integration." }],
    });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    expect(results.some((r) => r.client_name === "Mandalore")).toBe(true);
  });

  it("returns confidence 0.8 for participant domain match", () => {
    const meeting = makeMeeting({
      participants: [{ last_name: "D", id: "2", first_name: "Dev", email: "dev@revenium.com" }],
    });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    const rev = results.find((r) => r.client_name === "Revenium");
    expect(rev!.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("returns confidence 0.5 for alias-only match", () => {
    const meeting = makeMeeting({
      turns: [{ speaker_name: "Alice", timestamp: "00:01", text: "Talking about Mandalore project scope." }],
    });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    const man = results.find((r) => r.client_name === "Mandalore");
    expect(man!.confidence).toBe(0.5);
  });

  it("returns confidence 0.95 when both participant and alias match", () => {
    const meeting = makeMeeting({
      title: "Revenium DSU",
      participants: [{ last_name: "D", id: "3", first_name: "Dev", email: "dev@revenium.com" }],
    });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    const rev = results.find((r) => r.client_name === "Revenium");
    expect(rev!.confidence).toBe(0.95);
  });

  it("returns empty array when no match found", () => {
    const meeting = makeMeeting({ title: "Internal sync", turns: [{ speaker_name: "Alice", timestamp: "00:01", text: "Nothing relevant." }] });
    const mid = ingestMeeting(db, meeting);
    expect(detectClient(db, mid)).toEqual([]);
  });

  it("returns multiple clients for multi-client meetings", () => {
    const meeting = makeMeeting({
      title: "Revenium and Mandalore sync",
      participants: [{ last_name: "D", id: "4", first_name: "Dev", email: "dev@revenium.com" }],
    });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    expect(results.length).toBeGreaterThanOrEqual(2);
  });
});

describe("normalizeTokens", () => {
  it("lowercases, strips non-alphanumeric, splits to token set", () => {
    expect(normalizeTokens("AppDev Leads - Weekly Sync")).toEqual(
      new Set(["appdev", "leads", "weekly", "sync"])
    );
  });
});

describe("meeting_names matching", () => {
  it("detects client via meeting_name when title matches (confidence 0.7, method meeting_name)", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `det-mn-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, "clients.json");
    writeFileSync(f, JSON.stringify([
      { name: "TestCo", aliases: ["TestAlias"], known_participants: ["@testco.com"], meeting_names: ["AppDev Leads - Weekly Sync"] },
    ]));
    seedClients(localDb, f);
    const meeting = makeMeeting({ title: "AppDev Leads - Weekly Sync" });
    const mid = ingestMeeting(localDb, meeting);
    const results = detectClient(localDb, mid);
    const r = results.find((r) => r.client_name === "TestCo");
    expect(r).toEqual({ client_name: "TestCo", confidence: 0.7, method: "meeting_name" });
  });

  it("detects client via token intersection on folder-derived title", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `det-mn2-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, "clients.json");
    writeFileSync(f, JSON.stringify([
      { name: "TestCo", aliases: [], known_participants: [], meeting_names: ["AppDev Leads DSU"] },
    ]));
    seedClients(localDb, f);
    const meeting = makeMeeting({ title: "appdev_leads_dsu-019cabc" });
    const mid = ingestMeeting(localDb, meeting);
    const results = detectClient(localDb, mid);
    expect(results.some((r) => r.client_name === "TestCo")).toBe(true);
  });

  it("returns confidence 0.95 and method participant+meeting_name when both signals present", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `det-mn3-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, "clients.json");
    writeFileSync(f, JSON.stringify([
      { name: "TestCo", aliases: [], known_participants: ["@testco.com"], meeting_names: ["Weekly Sync"] },
    ]));
    seedClients(localDb, f);
    const meeting = makeMeeting({
      title: "Weekly Sync",
      participants: [{ last_name: "A", id: "x1", first_name: "A", email: "a@testco.com" }],
    });
    const mid = ingestMeeting(localDb, meeting);
    const results = detectClient(localDb, mid);
    const r = results.find((r) => r.client_name === "TestCo");
    expect(r).toEqual({ client_name: "TestCo", confidence: 0.95, method: "participant+meeting_name" });
  });
});

describe("storeDetection", () => {
  it("inserts detection results into client_detections table", () => {
    const meeting = makeMeeting({
      participants: [{ last_name: "D", id: "5", first_name: "Dev", email: "dev@revenium.com" }],
    });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    storeDetection(db, mid, results);
    const rows = db.prepare("SELECT * FROM client_detections WHERE meeting_id = ?").all(mid);
    expect(rows.length).toBeGreaterThan(0);
  });
});
