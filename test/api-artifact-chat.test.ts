import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { createApp } from "../api/server.js";

function makeArtifact() {
  return {
    summary: "Key decisions were made.",
    decisions: [{ text: "Go with approach A", decided_by: "" }],
    proposed_features: ["Dark mode"],
    action_items: [{ description: "Write spec", owner: "Bob", requester: "", due_date: "2026-03-01" }],
    architecture: ["TypeScript"],
    open_questions: ["When to ship?"],
    risk_items: ["Timeline risk"],
    additional_notes: [],
  };
}

describe("GET /api/meetings/:id/artifact", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    const llm = createLlmAdapter({ type: "stub" });

    meetingId = ingestMeeting(db, {
      title: "Artifact Meeting",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "artifact-meeting-1",
    });
    storeArtifact(db, meetingId, makeArtifact());

    app = createApp(db, ":memory:", llm);
  });

  it("should return artifact for meeting with stored artifact", async () => {
    const res = await app.request(`/api/meetings/${meetingId}/artifact`);
    expect(res.status).toBe(200);
    const body = await res.json() as { summary: string; decisions: string[] };
    expect(body).toEqual(makeArtifact());
  });

  it("should return 404 when no artifact exists for the meeting id", async () => {
    const res = await app.request("/api/meetings/unknown-id/artifact");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/chat", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    const llm = createLlmAdapter({ type: "stub" });

    meetingId = ingestMeeting(db, {
      title: "Chat Meeting",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "chat-meeting-1",
    });
    storeArtifact(db, meetingId, makeArtifact());

    app = createApp(db, ":memory:", llm);
  });

  it("should return answer, sources, and charCount from stub LLM", async () => {
    const res = await app.request("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingIds: [], question: "What was decided?" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { answer: string; sources: string[]; charCount: number };
    expect(body).toEqual({
      answer: expect.any(String),
      sources: expect.any(Array),
      charCount: expect.any(Number),
    });
  });
});

describe("POST /api/chat/conversation", () => {
  let app: ReturnType<typeof createApp>;
  let meetingId: string;

  beforeAll(() => {
    const db = createDb(":memory:");
    migrate(db);
    const llm = createLlmAdapter({ type: "stub" });

    meetingId = ingestMeeting(db, {
      title: "Conversation Meeting",
      timestamp: "2026-02-24T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "conv-meeting-1",
    });
    storeArtifact(db, meetingId, makeArtifact());

    app = createApp(db, ":memory:", llm);
  });

  it("returns answer from conversation handler with meeting context", async () => {
    const res = await app.request("/api/chat/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meetingIds: [meetingId],
        messages: [{ role: "user", content: "What was decided?" }],
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { answer: string; sources: string[]; charCount: number };
    expect(body).toEqual({
      answer: "Stub answer based on meeting context.",
      sources: ["Conversation Meeting"],
      charCount: expect.any(Number),
    });
  });
});
