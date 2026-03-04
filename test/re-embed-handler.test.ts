import { describe, it, expect, vi, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/ingest.js";
import { storeArtifact } from "../core/extractor.js";
import { storeDetection } from "../core/client-detection.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

const mockStoreMeetingVector = vi.fn().mockResolvedValue(undefined);
const mockEmbedMeeting = vi.fn().mockResolvedValue(new Float32Array(384));
const mockBuildEmbeddingInput = vi.fn().mockReturnValue("summary text decisions");

vi.mock("../core/meeting-pipeline.js", () => ({
  buildEmbeddingInput: mockBuildEmbeddingInput,
  embedMeeting: mockEmbedMeeting,
  storeMeetingVector: mockStoreMeetingVector,
}));

const mockToArray = vi.fn().mockResolvedValue([]);
const mockTable = { query: () => ({ toArray: mockToArray }), add: vi.fn() };
const mockCreateMeetingTable = vi.fn().mockResolvedValue(mockTable);

vi.mock("../core/vector-db.js", () => ({
  createMeetingTable: mockCreateMeetingTable,
}));

const { handleReEmbed } = await import("../electron-ui/electron/ipc-handlers.js");

const mockVdb = {} as VectorDb;
const mockSession = {} as InferenceSession & { _tokenizer: unknown };

describe("handleReEmbed", () => {
  let db: ReturnType<typeof createDb>;
  let meetingId: string;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT OR IGNORE INTO clients (name) VALUES (?)").run("Acme");

    meetingId = ingestMeeting(db, {
      title: "Architecture Solutioning",
      timestamp: "2026-01-10T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "arch-sol-1",
    });
    storeArtifact(db, meetingId, {
      summary: "Discussed blue-green deployment strategy",
      decisions: [],
      proposed_features: [],
      action_items: [],
      open_questions: [],
      risk_items: [],
      additional_notes: [],
    });
    storeDetection(db, meetingId, [
      { client_name: "Acme", confidence: 0.9, method: "participant" },
    ]);
  });

  it("embeds meetings with artifacts that have no existing vector", async () => {
    mockToArray.mockResolvedValue([]);
    mockStoreMeetingVector.mockClear();

    const result = await handleReEmbed(db, mockVdb, mockSession);

    expect(result).toEqual({ embedded: 1, skipped: 0 });
    expect(mockStoreMeetingVector).toHaveBeenCalledWith(
      mockTable,
      meetingId,
      expect.any(Float32Array),
      { client: "Acme", meeting_type: "Architecture Solutioning", date: "2026-01-10T10:00:00.000Z" },
    );
  });

  it("skips meetings whose vector already exists in LanceDB", async () => {
    mockToArray.mockResolvedValue([{ meeting_id: meetingId }]);
    mockStoreMeetingVector.mockClear();

    const result = await handleReEmbed(db, mockVdb, mockSession);

    expect(result).toEqual({ embedded: 0, skipped: 1 });
    expect(mockStoreMeetingVector).not.toHaveBeenCalled();
  });
});
