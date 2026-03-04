import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createApp } from "../api/server.js";

describe("GET /api/debug", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    app = createApp(db, ":memory:");
  });

  it("should return 200 with db_path, client_count, and meeting_count", async () => {
    const res = await app.request("/api/debug");
    expect(res.status).toBe(200);
    const body = await res.json() as { db_path: string; client_count: number; meeting_count: number; vector_count: number | null };
    expect(body).toEqual({
      db_path: ":memory:",
      client_count: 0,
      meeting_count: 0,
      vector_count: null,
    });
  });
});
