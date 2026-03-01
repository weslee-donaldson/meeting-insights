import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../src/db.js";
import type { Database } from "../src/db.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
});

describe("createDb", () => {
  it("accepts a path and returns a working SQLite connection", () => {
    const result = db.prepare("SELECT 1 AS val").get() as { val: number };
    expect(result).toEqual({ val: 1 });
  });
});

describe("migrate", () => {
  it("creates meetings table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='meetings'").get();
    expect(row).toEqual({ name: "meetings" });
  });

  it("creates artifacts table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='artifacts'").get();
    expect(row).toEqual({ name: "artifacts" });
  });

  it("creates clients table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'").get();
    expect(row).toEqual({ name: "clients" });
  });

  it("creates client_detections table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='client_detections'").get();
    expect(row).toEqual({ name: "client_detections" });
  });

  it("creates clusters table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clusters'").get();
    expect(row).toEqual({ name: "clusters" });
  });

  it("creates meeting_clusters table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='meeting_clusters'").get();
    expect(row).toEqual({ name: "meeting_clusters" });
  });

  it("adds additional_notes column to artifacts", () => {
    const cols = db.prepare("PRAGMA table_info(artifacts)").all() as { name: string }[];
    expect(cols.some(c => c.name === "additional_notes")).toBe(true);
  });

  it("is idempotent — calling migrate twice does not throw", () => {
    expect(() => migrate(db)).not.toThrow();
  });
});
