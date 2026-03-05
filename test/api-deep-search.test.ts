import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { createApp } from "../api/server.js";

describe("POST /api/deep-search", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "DLQ Triage",
      timestamp: "2026-03-05T10:00:00Z",
      participants: [],
      turns: [{ speaker_name: "Alice", timestamp: "10:00:00", text: "hello" }],
      rawTranscript: "Alice | 10:00:00\nhello",
      sourceFilename: "deep-search-test.txt",
    });
    storeArtifact(db, meetingId, {
      summary: "Discussed the DLQ issue.",
      decisions: [],
      proposed_features: [],
      action_items: [],
      open_questions: [],
      risk_items: [],
      additional_notes: [],
    });
    const llm = createLlmAdapter({ type: "stub" });
    app = createApp(db, ":memory:", llm);
  });

  it("returns 200 with deep search results when LLM is available", async () => {
    const res = await app.request("/api/deep-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingIds: [meetingId], query: "DLQ issue" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { meeting_id: string; relevanceSummary: string; relevanceScore: number }[];
    expect(body).toEqual([
      {
        meeting_id: meetingId,
        relevanceSummary: expect.any(String),
        relevanceScore: expect.any(Number),
      },
    ]);
  });

  it("returns 503 when LLM is not configured", async () => {
    const db = createDb(":memory:");
    migrate(db);
    const noLlmApp = createApp(db, ":memory:");
    const res = await noLlmApp.request("/api/deep-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingIds: [], query: "test" }),
    });
    expect(res.status).toBe(503);
  });
});
