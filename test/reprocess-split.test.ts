import { describe, it, expect, vi, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { SplitResult } from "../core/meeting-split.js";

const mockStoreMeetingVector = vi.fn().mockResolvedValue(undefined);
const mockEmbedMeeting = vi.fn().mockResolvedValue(new Float32Array(384));
const mockBuildEmbeddingInput = vi.fn().mockReturnValue("summary");

vi.mock("../core/meeting-pipeline.js", () => ({
  buildEmbeddingInput: mockBuildEmbeddingInput,
  embedMeeting: mockEmbedMeeting,
  storeMeetingVector: mockStoreMeetingVector,
}));

const mockToArray = vi.fn().mockResolvedValue([]);
const mockTable = { query: () => ({ toArray: mockToArray }), add: vi.fn(), delete: vi.fn() };
const mockItemTable = { query: () => ({ toArray: vi.fn().mockResolvedValue([]) }), add: vi.fn(), delete: vi.fn() };
const mockCreateMeetingTable = vi.fn().mockResolvedValue(mockTable);
const mockCreateItemTable = vi.fn().mockResolvedValue(mockItemTable);

vi.mock("../core/vector-db.js", () => ({
  createMeetingTable: mockCreateMeetingTable,
  createItemTable: mockCreateItemTable,
}));

const { reprocessSplitSegments } = await import("../core/meeting-split.js");
const { splitMeeting } = await import("../core/meeting-split.js");

const VALID_TRANSCRIPT =
  "Alice | 00:00\nWelcome\n\n" +
  "Bob | 00:15\nThanks\n\n" +
  "Alice | 00:30\nGood meeting\n\n" +
  "Bob | 01:00\nAgreed\n\n" +
  "Alice | 01:28\nBye\n\n";

const mockVdb = {} as VectorDb;
const mockSession = {} as InferenceSession & { _tokenizer: unknown };

describe("reprocessSplitSegments", () => {
  let db: ReturnType<typeof createDb>;
  let splitResult: SplitResult;

  beforeAll(async () => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT OR IGNORE INTO clients (name, id, aliases, known_participants) VALUES (?, ?, ?, ?)").run(
      "Acme", "client-acme", "[]", "[]",
    );
    const meetingId = ingestMeeting(db, {
      title: "Weekly Standup",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: VALID_TRANSCRIPT,
      sourceFilename: "reprocess-split-test.md",
    });
    splitResult = await splitMeeting(db, meetingId, [60, 30]);
  });

  it("stores an artifact row for each segment", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    const results = await reprocessSplitSegments(db, splitResult, { llm, session: mockSession, vdb: mockVdb });
    for (const seg of splitResult.segments) {
      const artifact = db.prepare("SELECT meeting_id FROM artifacts WHERE meeting_id = ?").get(seg.meeting_id);
      expect(artifact).toBeTruthy();
    }
    expect(results.every((r) => r.status === "ok")).toBe(true);
  });

  it("runs without error and each segment has a client_detections query result", async () => {
    const db2 = createDb(":memory:");
    migrate(db2);
    const id = ingestMeeting(db2, {
      title: "Test",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: VALID_TRANSCRIPT,
      sourceFilename: "reprocess-detection-test.md",
    });
    const result = await splitMeeting(db2, id, [60, 30]);
    const llm = createLlmAdapter({ type: "stub" });
    const results = await reprocessSplitSegments(db2, result, { llm, session: mockSession, vdb: mockVdb });
    expect(results.every((r) => r.status === "ok")).toBe(true);
  });

  it("failure in one segment does not abort processing of others", async () => {
    const db3 = createDb(":memory:");
    migrate(db3);
    const id = ingestMeeting(db3, {
      title: "Fail Test",
      timestamp: "2024-01-01",
      participants: [],
      turns: [],
      rawTranscript: VALID_TRANSCRIPT,
      sourceFilename: "reprocess-fail-test.md",
    });
    const result = await splitMeeting(db3, id, [60, 30]);
    const stub = createLlmAdapter({ type: "stub" });
    let callCount = 0;
    const failingLlm: typeof stub = {
      complete: vi.fn().mockImplementation(async (capability: string, content: string) => {
        callCount++;
        if (callCount === 1) throw new Error("LLM failure");
        return stub.complete(capability as Parameters<typeof stub.complete>[0], content);
      }),
    };
    const results = await reprocessSplitSegments(db3, result, { llm: failingLlm, session: mockSession, vdb: mockVdb });
    expect(results[0].status).toBe("failed");
    expect(results[1].status).toBe("ok");
  });
});
