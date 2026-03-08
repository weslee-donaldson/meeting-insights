import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { seedClients } from "../core/client-registry.js";
import { detectClient, storeDetection, normalizeTokens, nameTokensFromParticipant, parseSpeakerNames } from "../core/client-detection.js";
import { ingestMeeting } from "../core/ingest.js";
import type { ParsedMeeting } from "../core/parser.js";
import type { DatabaseSync as Database } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

let db: Database;

const clientsData = [
  {
    name: "Revenium",
    aliases: ["Revenium", "REV"],
    client_team: [
      { name: "John Smith", email: "john@revenium.com", role: "Developer" },
      { name: "Dev User", email: "dev@revenium.com", role: "Developer" },
    ],
  },
  {
    name: "Mandalore",
    aliases: ["Mandalore"],
    client_team: [
      { name: "Mando User", email: "user@mandalore.com", role: "Developer" },
    ],
  },
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
  it("returns client when participant email matches client_team member email", () => {
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

  it("returns confidence 0.8 for participant email match", () => {
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
      { name: "TestCo", aliases: ["TestAlias"], client_team: [{ name: "Test User", email: "test@testco.com", role: "Dev" }], meeting_names: ["AppDev Leads - Weekly Sync"] },
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
      { name: "TestCo", aliases: [], client_team: [], meeting_names: ["AppDev Leads DSU"] },
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
      { name: "TestCo", aliases: [], client_team: [{ name: "A", email: "a@testco.com", role: "Dev" }], meeting_names: ["Weekly Sync"] },
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

describe("nameTokensFromParticipant", () => {
  it("extracts name tokens from email local part", () => {
    expect(nameTokensFromParticipant("ray.li@llsa.com")).toEqual(new Set(["ray", "li"]));
  });

  it("extracts name tokens from plain name entry", () => {
    expect(nameTokensFromParticipant("Brian DeFeyter")).toEqual(new Set(["brian", "defeyter"]));
  });

  it("returns empty set for domain pattern entry", () => {
    expect(nameTokensFromParticipant("@llsa.com")).toEqual(new Set());
  });
});

describe("parseSpeakerNames", () => {
  it("extracts unique speaker names from raw transcript lines", () => {
    const raw = "Ray Li | 00:01\nHello\nRay Li | 01:00\nWorld\nJennifer K | 02:00\nHi";
    expect(parseSpeakerNames(raw)).toEqual(["Ray Li", "Jennifer K"]);
  });
});

describe("speaker name matching", () => {
  it("detects client when speaker name matches client_team member email tokens (full name)", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `det-sp1-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, "clients.json");
    writeFileSync(f, JSON.stringify([
      { name: "TestCo", aliases: [], client_team: [{ name: "Ray Li", email: "ray.li@testco.com", role: "Dev" }] },
    ]));
    seedClients(localDb, f);
    const meeting = makeMeeting({
      rawTranscript: "Attendance:\nTranscript:\nRay Li | 00:01\nHello world.",
    });
    const mid = ingestMeeting(localDb, meeting);
    const results = detectClient(localDb, mid);
    expect(results.find((r) => r.client_name === "TestCo")).toMatchObject({ confidence: 0.8, method: "speaker_name" });
  });

  it("detects client when speaker uses first name only (single token match)", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `det-sp2-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, "clients.json");
    writeFileSync(f, JSON.stringify([
      { name: "TestCo", aliases: [], client_team: [{ name: "Ray Li", email: "ray.li@testco.com", role: "Dev" }] },
    ]));
    seedClients(localDb, f);
    const meeting = makeMeeting({
      rawTranscript: "Attendance:\nTranscript:\nRay | 00:01\nHello.",
    });
    const mid = ingestMeeting(localDb, meeting);
    const results = detectClient(localDb, mid);
    expect(results.some((r) => r.client_name === "TestCo")).toBe(true);
  });

  it("detects client via plain-name participant matched by speaker", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `det-sp3-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, "clients.json");
    writeFileSync(f, JSON.stringify([
      { name: "TestCo", aliases: [], client_team: [{ name: "Brian DeFeyter", role: "Developer" }] },
    ]));
    seedClients(localDb, f);
    const meeting = makeMeeting({
      rawTranscript: "Attendance:\nTranscript:\nBrian | 00:01\nHello.",
    });
    const mid = ingestMeeting(localDb, meeting);
    const results = detectClient(localDb, mid);
    expect(results.some((r) => r.client_name === "TestCo")).toBe(true);
  });

  it("does not match client when speaker name does not overlap participant name tokens", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `det-sp4-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, "clients.json");
    writeFileSync(f, JSON.stringify([
      { name: "TestCo", aliases: [], client_team: [{ name: "Alice Bob", email: "alice@testco.com", role: "Dev" }] },
    ]));
    seedClients(localDb, f);
    const meeting = makeMeeting({
      rawTranscript: "Attendance:\nTranscript:\nTestco | 00:01\nHello.",
    });
    const mid = ingestMeeting(localDb, meeting);
    const results = detectClient(localDb, mid);
    expect(results.find((r) => r.client_name === "TestCo")).toBeUndefined();
  });

  it("returns confidence 0.95 and method speaker_name+meeting_name when both signals present", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `det-sp5-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, "clients.json");
    writeFileSync(f, JSON.stringify([
      { name: "TestCo", aliases: [], client_team: [{ name: "Ray Li", email: "ray.li@testco.com", role: "Dev" }], meeting_names: ["Weekly Sync"] },
    ]));
    seedClients(localDb, f);
    const meeting = makeMeeting({
      title: "Weekly Sync",
      rawTranscript: "Attendance:\nTranscript:\nRay Li | 00:01\nHello.",
    });
    const mid = ingestMeeting(localDb, meeting);
    const results = detectClient(localDb, mid);
    expect(results.find((r) => r.client_name === "TestCo")).toMatchObject({ confidence: 0.95, method: "speaker_name+meeting_name" });
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

  it("sets meetings.client_id to the top-confidence client id", () => {
    const meeting = makeMeeting({
      title: "Revenium Sync",
      participants: [{ last_name: "S", id: "6", first_name: "John", email: "john@revenium.com" }],
    });
    const mid = ingestMeeting(db, meeting);
    const results = detectClient(db, mid);
    storeDetection(db, mid, results);
    const row = db.prepare("SELECT client_id FROM meetings WHERE id = ?").get(mid) as { client_id: string | null };
    const clientRow = db.prepare("SELECT id FROM clients WHERE name = 'Revenium'").get() as { id: string };
    expect(row.client_id).toBe(clientRow.id);
  });
});
