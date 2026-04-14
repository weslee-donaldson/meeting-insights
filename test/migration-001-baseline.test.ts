import { describe, it, expect } from "vitest";
import { createDb } from "../core/db.js";
import { runMigrations } from "../core/migrations/runner.js";
import * as baseline from "../core/migrations/001-baseline.js";
import { allMigrations } from "../core/migrations/index.js";

const EXPECTED_TABLES = [
  "meetings", "artifacts", "clients", "client_detections", "clusters",
  "meeting_clusters", "action_item_completions", "item_mentions", "artifact_fts",
  "threads", "thread_meetings", "thread_messages", "insights", "insight_meetings",
  "insight_messages", "milestones", "milestone_mentions", "milestone_action_items",
  "assets", "milestone_messages", "meeting_messages", "notes", "tenants", "users",
  "tenant_memberships", "oauth_clients", "oauth_tokens", "oauth_authorization_codes",
  "api_keys", "system_errors", "meeting_lineage",
];

describe("baseline migration (001)", () => {
  it("has version 1 and description 'Baseline schema'", () => {
    expect(baseline.version).toBe(1);
    expect(baseline.description).toBe("Baseline schema");
  });

  it("creates all expected tables on fresh DB", () => {
    const db = createDb(":memory:");
    baseline.up(db);

    const tables = (db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' OR type='virtual' ORDER BY name",
    ).all() as { name: string }[]).map((r) => r.name);

    for (const expected of EXPECTED_TABLES) {
      expect(tables).toContain(expected);
    }
  });

  it("allMigrations is sorted and contains baseline at version 1", () => {
    expect(allMigrations[0].version).toBe(1);
    expect(allMigrations[0].description).toBe("Baseline schema");
    for (let i = 1; i < allMigrations.length; i++) {
      expect(allMigrations[i].version).toBeGreaterThan(allMigrations[i - 1].version);
    }
  });

  it("running via runner twice applies once and skips second", () => {
    const db = createDb(":memory:");

    runMigrations(db, allMigrations);
    const firstCount = (db.prepare("SELECT COUNT(*) as c FROM schema_version").get() as { c: number }).c;

    runMigrations(db, allMigrations);
    const secondCount = (db.prepare("SELECT COUNT(*) as c FROM schema_version").get() as { c: number }).c;

    expect(firstCount).toBe(1);
    expect(secondCount).toBe(1);
  });

  it("migrate() wrapper still produces the same schema", () => {
    const db = createDb(":memory:");
    runMigrations(db, allMigrations);

    const tables = (db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' OR type='virtual' ORDER BY name",
    ).all() as { name: string }[]).map((r) => r.name);

    for (const expected of EXPECTED_TABLES) {
      expect(tables).toContain(expected);
    }
  });
});
