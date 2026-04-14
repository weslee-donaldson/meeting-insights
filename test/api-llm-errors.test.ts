import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/pipeline/ingest.js";
import { storeArtifact } from "../core/pipeline/extractor.js";
import { createApp } from "../api/server.js";
import type { LlmAdapter } from "../core/llm/adapter.js";

const failLlm: LlmAdapter = {
  async complete() { throw new Error("[api_error] credit balance too low"); },
  async converse() { throw new Error("[api_error] credit balance too low"); },
};

describe("API LLM error handling", () => {
  let failApp: ReturnType<typeof createApp>;
  let noLlmApp: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    meetingId = ingestMeeting(db, {
      title: "Test Meeting",
      timestamp: "2026-03-05T10:00:00Z",
      participants: [],
      turns: [{ speaker_name: "Alice", timestamp: "10:00", text: "hello" }],
      rawTranscript: "Alice | 10:00\nhello",
      sourceFilename: "llm-error-test.txt",
    });
    storeArtifact(db, meetingId, {
      summary: "Test summary.",
      decisions: [],
      proposed_features: [],
      action_items: [],
      open_questions: [],
      risk_items: [],
      additional_notes: [],
    });
    failApp = createApp(db, ":memory:", failLlm);
    noLlmApp = createApp(db, ":memory:");
  });

  describe("POST /api/chat", () => {
    it("returns 502 with error when LLM throws", async () => {
      const res = await failApp.request("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingIds: [meetingId], question: "What happened?" }),
      });
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({ error: "[api_error] credit balance too low" });
    });

    it("returns 503 when LLM is not configured", async () => {
      const res = await noLlmApp.request("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingIds: [meetingId], question: "What happened?" }),
      });
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "LLM not available" });
    });
  });

  describe("POST /api/chat/conversation", () => {
    it("returns 502 with error when LLM throws", async () => {
      const res = await failApp.request("/api/chat/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingIds: [meetingId],
          messages: [{ role: "user", content: "What happened?" }],
          includeTranscripts: false,
        }),
      });
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({ error: "[api_error] credit balance too low" });
    });

    it("returns 503 when LLM is not configured", async () => {
      const res = await noLlmApp.request("/api/chat/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingIds: [meetingId],
          messages: [{ role: "user", content: "What happened?" }],
          includeTranscripts: false,
        }),
      });
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "LLM not available" });
    });
  });

  describe("POST /api/meetings (create)", () => {
    it("returns 502 with error when handler throws", async () => {
      const res = await failApp.request("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: "Acme", date: "2026-03-05", title: "Test", rawTranscript: "Alice | 10:00\nhi" }),
      });
      expect(res.status).toBe(502);
      const body = await res.json() as { error: string };
      expect(typeof body.error).toBe("string");
      expect(body.error.length).toBeGreaterThan(0);
    });

    it("returns 503 when LLM is not configured", async () => {
      const res = await noLlmApp.request("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: "Acme", date: "2026-03-05", title: "Test", rawTranscript: "hi" }),
      });
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "LLM not available" });
    });
  });

  describe("POST /api/meetings/:id/re-extract", () => {
    it("returns 502 with error when LLM throws", async () => {
      const res = await failApp.request(`/api/meetings/${meetingId}/re-extract`, {
        method: "POST",
      });
      expect(res.status).toBe(502);
      expect(await res.json()).toEqual({ error: "[api_error] credit balance too low" });
    });

    it("returns 503 when LLM is not configured", async () => {
      const res = await noLlmApp.request(`/api/meetings/${meetingId}/re-extract`, {
        method: "POST",
      });
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "LLM not available" });
    });
  });
});
