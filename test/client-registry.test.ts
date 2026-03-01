import { describe, it, expect, beforeAll } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDb, migrate } from "../src/db.js";
import { seedClients, getClientByName, getClientByAlias, getAllClients } from "../src/client-registry.js";
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
