import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { connectVectorDb, createMeetingTable, createFeatureTable, createItemTable } from "../core/vector-db.js";

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
