import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createThread, addThreadMeeting, getThreadChatContext } from "../core/threads.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import { storeArtifact } from "../core/extractor.js";

vi.mock("../core/embedder.js", () => ({
  embed: vi.fn().mockResolvedValue(new Float32Array(384).fill(0.1)),
}));

const stubVdbWithResults: VectorDb = {
  openTable: vi.fn().mockResolvedValue({
    search: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([
        { meeting_id: "m1", _distance: 0.15 },
        { meeting_id: "m2", _distance: 0.45 },
      ]),
    }),
  }),
} as unknown as VectorDb;

const stubVdbEmpty: VectorDb = {
  openTable: vi.fn().mockResolvedValue({
    search: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
    }),
  }),
} as unknown as VectorDb;

const stubSession = {} as InferenceSession & { _tokenizer: unknown };

let db: Database;
let threadId: string;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  db.prepare("INSERT OR IGNORE INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run("Acme", "[]", "[]");
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m1', 'Sprint Planning', '2026-03-01')").run();
  db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('m2', 'Retrospective', '2026-03-08')").run();
  storeArtifact(db, "m1", { summary: "Deployment failed.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  storeArtifact(db, "m2", { summary: "Discussed rollback.", decisions: [], proposed_features: [], action_items: [], open_questions: [], risk_items: [], additional_notes: [] });
  const thread = createThread(db, { client_name: "Acme", title: "Deployment issues", shorthand: "DEPLOY", description: "Track CI failures", criteria_prompt: "CI failures" });
  threadId = thread.id;
  addThreadMeeting(db, { thread_id: threadId, meeting_id: "m1", relevance_summary: "m1 relevant.", relevance_score: 90 });
  addThreadMeeting(db, { thread_id: threadId, meeting_id: "m2", relevance_summary: "m2 relevant.", relevance_score: 70 });
});

describe("getThreadChatContext", () => {
  it("returns systemContext containing thread title", async () => {
    const { systemContext, meetingIds } = await getThreadChatContext(db, stubVdbWithResults, stubSession, threadId, "What happened?", false);
    expect(systemContext).toContain("Deployment issues");
    expect(meetingIds).toHaveLength(2);
  });

  it("returns empty meetingIds and context with thread info when no associations", async () => {
    const emptyThread = createThread(db, { client_name: "Acme", title: "Empty thread", shorthand: "EMPTY", description: "", criteria_prompt: "" });
    const { systemContext, meetingIds } = await getThreadChatContext(db, stubVdbEmpty, stubSession, emptyThread.id, "Any updates?", false);
    expect(systemContext).toContain("Empty thread");
    expect(meetingIds).toHaveLength(0);
  });
});
