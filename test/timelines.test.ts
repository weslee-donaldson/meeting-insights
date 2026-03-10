import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createMilestone, getMilestone } from "../core/timelines.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES ('Acme', '[]', '[]')").run();
});

describe("createMilestone", () => {
  it("inserts a milestone and returns it with generated id and timestamps", () => {
    const result = createMilestone(db, {
      clientName: "Acme",
      title: "Launch commerce platform",
      description: "Phase 1 go-live",
      targetDate: "2026-06-01",
    });

    expect(result).toEqual({
      id: expect.any(String),
      client_name: "Acme",
      title: "Launch commerce platform",
      description: "Phase 1 go-live",
      target_date: "2026-06-01",
      status: "identified",
      completed_at: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("defaults description to empty string and target_date to null when omitted", () => {
    const result = createMilestone(db, {
      clientName: "Acme",
      title: "Migration complete",
    });

    expect(result).toEqual({
      id: expect.any(String),
      client_name: "Acme",
      title: "Migration complete",
      description: "",
      target_date: null,
      status: "identified",
      completed_at: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});

describe("getMilestone", () => {
  it("returns milestone by id", () => {
    const created = createMilestone(db, { clientName: "Acme", title: "Get test" });
    const result = getMilestone(db, created.id);
    expect(result).toEqual(created);
  });

  it("returns null for non-existent id", () => {
    const result = getMilestone(db, "non-existent");
    expect(result).toBe(null);
  });
});
