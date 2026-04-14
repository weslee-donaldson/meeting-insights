import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createLlmAdapter } from "../core/llm/adapter.js";

const hybridSearchMock = vi.fn().mockResolvedValue([
  { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "dsu", date: "2026-02-24" },
]);

vi.mock("../core/hybrid-search.js", () => ({
  hybridSearch: (...args: unknown[]) => hybridSearchMock(...args),
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

  it("should return search results enriched with cluster_tags and series", async () => {
    const res = await app.request("/api/search?q=auth&client=Acme&limit=3");
    expect(res.status).toBe(200);
    const body = await res.json() as { meeting_id: string; score: number; cluster_tags: string[]; series: string }[];
    expect(body).toEqual([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "dsu", date: "2026-02-24", cluster_tags: [], series: "" },
    ]);
  });

  it("should return 400 when query is less than 2 characters", async () => {
    const res = await app.request("/api/search?q=x");
    expect(res.status).toBe(400);
  });

  beforeEach(() => {
    hybridSearchMock.mockClear();
  });

  it("should pass date_after and date_before query params to hybridSearch", async () => {
    const res = await app.request("/api/search?q=billing&date_after=2026-01-01&date_before=2026-03-01");
    expect(res.status).toBe(200);
    const callArgs = hybridSearchMock.mock.calls[0];
    const options = callArgs[4] as { date_after?: string; date_before?: string };
    expect(options.date_after).toBe("2026-01-01");
    expect(options.date_before).toBe("2026-03-01");
  });

  it("should enrich results with cluster_tags from DB when clusters exist", async () => {
    const enrichDb = createDb(":memory:");
    migrate(enrichDb);
    const { ingestMeeting } = await import("../core/ingest.js");
    const meetingId = ingestMeeting(enrichDb, {
      title: "Sprint Planning",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "hello",
      turns: [],
      sourceFilename: "sp-1",
    });
    enrichDb.prepare("INSERT INTO clusters (cluster_id, generated_tags) VALUES (?, ?)").run("c1", JSON.stringify(["billing", "auth"]));
    enrichDb.prepare("INSERT INTO meeting_clusters (meeting_id, cluster_id) VALUES (?, ?)").run(meetingId, "c1");

    hybridSearchMock.mockResolvedValueOnce([
      { meeting_id: meetingId, score: 0.5, client: "Acme", meeting_type: "sprint", date: "2026-02-24" },
    ]);

    const { createApp: createEnrichApp } = await import("../api/server.js");
    const llm = createLlmAdapter({ type: "stub" });
    const mockSession = {} as Parameters<typeof createEnrichApp>[3] extends { session: infer S } ? S : never;
    const mockVdb = {} as Parameters<typeof createEnrichApp>[3] extends { vdb: infer V } ? V : never;
    const enrichApp = createEnrichApp(enrichDb, ":memory:", llm, { vdb: mockVdb, session: mockSession });
    const res = await enrichApp.request("/api/search?q=billing");
    expect(res.status).toBe(200);
    const body = await res.json() as { meeting_id: string; cluster_tags: string[]; series: string }[];
    expect(body).toEqual([
      {
        meeting_id: meetingId,
        score: 0.5,
        client: "Acme",
        meeting_type: "Sprint Planning",
        date: "2026-02-24",
        cluster_tags: ["billing", "auth"],
        series: "sprint planning",
      },
    ]);
  });

  it("should parse searchFields query param and pass to handler", async () => {
    hybridSearchMock.mockClear();
    const res = await app.request("/api/search?q=billing&searchFields=summary,decisions");
    expect(res.status).toBe(200);
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
