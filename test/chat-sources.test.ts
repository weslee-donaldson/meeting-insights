import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import { storeDetection } from "../core/client-detection.js";
import { createThread, addThreadMeeting, appendThreadMessage, getThreadMessages } from "../core/threads.js";
import { createInsight, addInsightMeeting, appendInsightMessage, getInsightMessages } from "../core/insights.js";
import type { LlmAdapter } from "../core/llm/adapter.js";
import { handleThreadChat, handleInsightChat, resolveMeetingSources } from "../electron-ui/electron/ipc-handlers.js";

const stubVdb = {} as Parameters<typeof handleThreadChat>[2];
const stubSession = {} as Parameters<typeof handleThreadChat>[3];

function makeArtifact() {
  return {
    summary: "Key decisions were made.",
    decisions: [],
    proposed_features: [],
    action_items: [],
    open_questions: [],
    risk_items: [],
    additional_notes: [],
  };
}

describe("resolveMeetingSources", () => {
  let db: ReturnType<typeof createDb>;
  let meetingId: string;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT OR IGNORE INTO clients (name, id) VALUES (?, ?)").run("Acme", "client-acme");

    meetingId = ingestMeeting(db, {
      title: "Architecture Review",
      timestamp: "2026-03-02T14:30:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "arch-review-1",
    });
    storeDetection(db, meetingId, [
      { client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "participant" },
    ]);
  });

  it("resolves meeting IDs to {id, label} with Title (date) format", () => {
    const result = resolveMeetingSources(db, [meetingId]);

    expect(result).toEqual([
      { id: meetingId, label: "Architecture Review (2026-03-02)" },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(resolveMeetingSources(db, [])).toEqual([]);
  });

  it("omits unknown meeting IDs", () => {
    const result = resolveMeetingSources(db, [meetingId, "nonexistent-id"]);

    expect(result).toEqual([
      { id: meetingId, label: "Architecture Review (2026-03-02)" },
    ]);
  });
});
