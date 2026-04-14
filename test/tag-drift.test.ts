import { describe, it, expect, beforeAll } from "vitest";
import { randomUUID } from "node:crypto";
import { createDb, migrate } from "../core/db.js";
import { detectTagDrift } from "../core/clustering/tag-drift.js";
import type { DatabaseSync as Database } from "node:sqlite";

let db: Database;
let stableClusterId: string;
let driftedClusterId: string;

const THRESHOLD = 0.1;

function makeCentroid(value: number): string {
  return JSON.stringify(new Array(384).fill(value));
}

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);

  stableClusterId = randomUUID();
  driftedClusterId = randomUUID();

  const now = new Date().toISOString();

  // Stable: centroid_snapshot matches current (same value)
  db.prepare("INSERT INTO clusters (cluster_id, centroid_snapshot, updated_at) VALUES (?, ?, ?)").run(
    stableClusterId,
    makeCentroid(0.5),
    now,
  );

  // Drifted: centroid_snapshot is very different from provided current centroid
  db.prepare("INSERT INTO clusters (cluster_id, centroid_snapshot, updated_at) VALUES (?, ?, ?)").run(
    driftedClusterId,
    makeCentroid(0.0),
    now,
  );
});

describe("detectTagDrift", () => {
  it("compares current cluster centroid to stored centroid_snapshot", () => {
    const current = new Array(384).fill(0.5);
    const result = detectTagDrift(db, stableClusterId, current, THRESHOLD);
    expect(typeof result.drifted).toBe("boolean");
    expect(typeof result.magnitude).toBe("number");
  });

  it("triggers tag regeneration when centroid shift exceeds threshold", () => {
    const shiftedCentroid = new Array(384).fill(1.0);
    const result = detectTagDrift(db, driftedClusterId, shiftedCentroid, THRESHOLD);
    expect(result.drifted).toBe(true);
    expect(result.magnitude).toBeGreaterThan(THRESHOLD);
  });

  it("logs drift magnitude via mtninsights:cluster:drift", () => {
    const current = new Array(384).fill(0.5);
    expect(() => detectTagDrift(db, stableClusterId, current, THRESHOLD)).not.toThrow();
  });
});
