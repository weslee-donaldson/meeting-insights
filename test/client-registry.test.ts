import { describe, it, expect, beforeAll } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../core/db.js";
import { seedClients, getClientByName, getClientByAlias, getAllClients } from "../core/client-registry.js";
import type { DatabaseSync as Database } from "node:sqlite";

let db: Database;
let clientsFile: string;

const clientsData = [
  { name: "Revenium", aliases: ["Revenium", "REV"], known_participants: ["@revenium.com"] },
  { name: "Mandalore", aliases: ["Mandalore"], known_participants: ["@mandalore.com"] },
];

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  const dir = join(tmpdir(), `clients-test-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  clientsFile = join(dir, "clients.json");
  writeFileSync(clientsFile, JSON.stringify(clientsData));
  seedClients(db, clientsFile);
});

describe("seedClients", () => {
  it("inserts client records from JSON file", () => {
    const all = getAllClients(db);
    expect(all).toHaveLength(2);
  });

  it("rejects malformed client entries missing name", () => {
    const badDb = createDb(":memory:");
    migrate(badDb);
    const dir = join(tmpdir(), `clients-bad-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const badFile = join(dir, "clients.json");
    writeFileSync(badFile, JSON.stringify([{ aliases: ["X"] }]));
    expect(() => seedClients(badDb, badFile)).toThrow();
  });

  it("rejects malformed client entries missing aliases", () => {
    const badDb = createDb(":memory:");
    migrate(badDb);
    const dir = join(tmpdir(), `clients-bad2-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const badFile = join(dir, "clients.json");
    writeFileSync(badFile, JSON.stringify([{ name: "X" }]));
    expect(() => seedClients(badDb, badFile)).toThrow();
  });
});

describe("getClientByName", () => {
  it("retrieves client row by name", () => {
    const client = getClientByName(db, "Revenium");
    expect(client).not.toBeNull();
    expect(client!.name).toBe("Revenium");
  });
});

describe("getClientByAlias", () => {
  it("retrieves client row when alias matches", () => {
    const client = getClientByAlias(db, "REV");
    expect(client).not.toBeNull();
    expect(client!.name).toBe("Revenium");
  });
});

describe("getAllClients", () => {
  it("returns all client rows", () => {
    const all = getAllClients(db);
    expect(all.map((c) => c.name)).toEqual(["Revenium", "Mandalore"]);
  });
});

describe("refinement_prompt field", () => {
  it("returns refinement_prompt when client is seeded with one", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-refine-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([
      { name: "TestCo", aliases: ["Test"], known_participants: ["@test.com"], refinement_prompt: "Stace is the CTO." },
    ]));
    seedClients(localDb, file);
    const client = getClientByName(localDb, "TestCo");
    expect(client!.refinement_prompt).toBe("Stace is the CTO.");
  });

  it("returns null refinement_prompt when client has none", () => {
    const client = getClientByName(db, "Revenium");
    expect(client!.refinement_prompt).toBeNull();
  });
});

describe("meeting_names field", () => {
  it("returns parseable meeting_names array when client is seeded with one", () => {
    const localDb = createDb(":memory:");
    migrate(localDb);
    const dir = join(tmpdir(), `clients-meetingnames-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "clients.json");
    writeFileSync(file, JSON.stringify([
      { name: "TestCo", aliases: ["Test"], known_participants: ["@test.com"], meeting_names: ["Weekly Sync", "Team DSU"] },
    ]));
    seedClients(localDb, file);
    const client = getClientByName(localDb, "TestCo");
    expect(JSON.parse(client!.meeting_names)).toEqual(["Weekly Sync", "Team DSU"]);
  });

  it("returns empty array meeting_names when client has none", () => {
    const client = getClientByName(db, "Revenium");
    expect(JSON.parse(client!.meeting_names)).toEqual([]);
  });
});
