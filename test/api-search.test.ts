import { describe, it, expect, beforeAll, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createLlmAdapter } from "../core/llm-adapter.js";

vi.mock("../core/vector-search.js", () => ({
  searchMeetings: vi.fn().mockResolvedValue([
    { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "dsu", date: "2026-02-24" },
  ]),
}));

describe("GET /api/search", () => {
  let app: Awaited<ReturnType<typeof import("../api/server.js").createApp>>;

  beforeAll(async () => {
    const db = createDb(":memory:");
    migrate(db);
    const llm = createLlmAdapter({ type: "stub" });
    const { createApp } = await import("../api/server.js");
    const mockSession = {} as Parameters<typeof createApp>[3] extends { session: infer S } ? S : never;
    const mockVdb = {} as Parameters<typeof createApp>[3] extends { vdb: infer V } ? V : never;
    app = createApp(db, ":memory:", llm, { vdb: mockVdb, session: mockSession });
  });

  it("should return search results from searchMeetings for a valid query", async () => {
    const res = await app.request("/api/search?q=auth&client=Acme&limit=3");
    expect(res.status).toBe(200);
    const body = await res.json() as { meeting_id: string; score: number }[];
    expect(body).toEqual([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "dsu", date: "2026-02-24" },
    ]);
  });

  it("should return 400 when query is less than 2 characters", async () => {
    const res = await app.request("/api/search?q=x");
    expect(res.status).toBe(400);
  });

  it("should return 503 when no searchDeps are configured", async () => {
    const db = createDb(":memory:");
    migrate(db);
    const llm = createLlmAdapter({ type: "stub" });
    const { createApp } = await import("../api/server.js");
    const appNoSearch = createApp(db, ":memory:", llm);
    const res = await appNoSearch.request("/api/search?q=auth");
    expect(res.status).toBe(503);
  });
});
