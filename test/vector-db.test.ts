import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { connectVectorDb, createMeetingTable, createFeatureTable, createItemTable, searchWithFilters } from "../core/vector-db.js";

let dbPath: string;
let db: Awaited<ReturnType<typeof connectVectorDb>>;

beforeAll(async () => {
  dbPath = join(tmpdir(), `lancedb-test-${Date.now()}`);
  mkdirSync(dbPath, { recursive: true });
  db = await connectVectorDb(dbPath);
});

afterAll(() => {
  rmSync(dbPath, { recursive: true, force: true });
});

describe("connectVectorDb", () => {
  it("opens LanceDB connection", () => {
    expect(db).toBeDefined();
    expect(typeof db.createTable).toBe("function");
  });
});

describe("createMeetingTable", () => {
  it("creates meeting_vectors table with correct schema", async () => {
    const table = await createMeetingTable(db);
    expect(table.name).toBe("meeting_vectors");
    const schema = await table.schema();
    const fieldNames = schema.fields.map((f: { name: string }) => f.name);
    expect(fieldNames).toContain("meeting_id");
    expect(fieldNames).toContain("vector");
    expect(fieldNames).toContain("client");
    expect(fieldNames).toContain("meeting_type");
    expect(fieldNames).toContain("date");
  });
});

describe("createFeatureTable", () => {
  it("creates feature_vectors table with correct schema", async () => {
    const table = await createFeatureTable(db);
    expect(table.name).toBe("feature_vectors");
    const schema = await table.schema();
    const fieldNames = schema.fields.map((f: { name: string }) => f.name);
    expect(fieldNames).toContain("feature_text");
    expect(fieldNames).toContain("meeting_id");
    expect(fieldNames).toContain("client");
    expect(fieldNames).toContain("date");
    expect(fieldNames).toContain("vector");
  });
});

describe("createItemTable", () => {
  it("creates item_vectors table with correct schema", async () => {
    const table = await createItemTable(db);
    expect(table.name).toBe("item_vectors");
    const schema = await table.schema();
    const fieldNames = schema.fields.map((f: { name: string }) => f.name);
    expect(fieldNames).toContain("canonical_id");
    expect(fieldNames).toContain("item_text");
    expect(fieldNames).toContain("item_type");
    expect(fieldNames).toContain("meeting_id");
    expect(fieldNames).toContain("date");
    expect(fieldNames).toContain("vector");
  });

  it("is idempotent on second call", async () => {
    const table1 = await createItemTable(db);
    const table2 = await createItemTable(db);
    expect(table1.name).toBe(table2.name);
  });
});

describe("searchWithFilters", () => {
  it("returns results filtered by conditions", async () => {
    const table = await createMeetingTable(db);
    const vec = new Float32Array(384).fill(0.1);
    await table.add([
      { meeting_id: "m1", vector: Array.from(vec), client: "Acme", meeting_type: "sync", date: "2025-01-01" },
      { meeting_id: "m2", vector: Array.from(vec), client: "Beta", meeting_type: "sync", date: "2025-02-01" },
    ]);
    const results = await searchWithFilters(table, vec, [
      { field: "client", op: "=", value: "Acme" },
    ], 10);
    expect(results.length).toBe(1);
    expect(results[0].meeting_id).toBe("m1");
  });

  it("returns all results when no filters provided", async () => {
    const table = await createMeetingTable(db);
    const vec = new Float32Array(384).fill(0.1);
    const results = await searchWithFilters(table, vec, [], 10);
    expect(results.length).toBeGreaterThanOrEqual(2);
  });
});
