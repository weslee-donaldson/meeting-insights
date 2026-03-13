import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "../core/db.js";
import { getAssets } from "../core/assets.js";

describe("assets", () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = new DatabaseSync(":memory:");
    migrate(db);
  });

  it("returns empty array for nonexistent meeting", () => {
    const result = getAssets(db, "nonexistent");
    expect(result).toEqual([]);
  });
});
