import { describe, it, expect, beforeEach } from "vitest";
import { createDb, type Database } from "../core/db.js";
import { runMigrations, getCurrentVersion, type Migration } from "../core/migrations/runner.js";

describe("migration runner", () => {
  let db: Database;

  beforeEach(() => {
    db = createDb(":memory:");
  });

  it("creates schema_version table on empty DB", () => {
    runMigrations(db, []);

    const row = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'",
    ).get() as { name: string } | undefined;
    expect(row).toEqual({ name: "schema_version" });
  });

  it("applies migrations in version order", () => {
    const applied: number[] = [];
    const migrations: Migration[] = [
      { version: 2, description: "second", up: () => { applied.push(2); } },
      { version: 1, description: "first", up: () => { applied.push(1); } },
    ];

    runMigrations(db, migrations);

    expect(applied).toEqual([1, 2]);
  });

  it("records version, description, and applied_at in schema_version", () => {
    const migrations: Migration[] = [
      { version: 1, description: "baseline", up: () => {} },
    ];

    runMigrations(db, migrations);

    const rows = db.prepare("SELECT version, description, applied_at FROM schema_version").all() as {
      version: number;
      description: string;
      applied_at: string;
    }[];
    expect(rows).toHaveLength(1);
    expect(rows[0].version).toBe(1);
    expect(rows[0].description).toBe("baseline");
    expect(rows[0].applied_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it("skips migrations already applied (idempotent)", () => {
    let calls = 0;
    const migrations: Migration[] = [
      { version: 1, description: "first", up: () => { calls++; } },
    ];

    runMigrations(db, migrations);
    runMigrations(db, migrations);

    expect(calls).toBe(1);
  });

  it("rolls back on failure (no partial state)", () => {
    const migrations: Migration[] = [
      {
        version: 1,
        description: "bad",
        up: (db) => {
          db.exec("CREATE TABLE partial (id INTEGER)");
          throw new Error("boom");
        },
      },
    ];

    expect(() => runMigrations(db, migrations)).toThrow("boom");

    const partial = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='partial'",
    ).get();
    expect(partial).toBeUndefined();

    expect(getCurrentVersion(db)).toBe(0);
  });

  it("getCurrentVersion returns 0 when schema_version is empty", () => {
    runMigrations(db, []);
    expect(getCurrentVersion(db)).toBe(0);
  });

  it("getCurrentVersion returns highest applied version", () => {
    const migrations: Migration[] = [
      { version: 1, description: "first", up: () => {} },
      { version: 2, description: "second", up: () => {} },
      { version: 3, description: "third", up: () => {} },
    ];

    runMigrations(db, migrations);

    expect(getCurrentVersion(db)).toBe(3);
  });
});
