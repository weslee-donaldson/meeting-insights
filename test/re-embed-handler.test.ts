import { describe, it, expect, vi, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { ingestMeeting } from "../core/pipeline/ingest.js";
import { storeArtifact } from "../core/pipeline/extractor.js";
import { storeDetection } from "../core/clients/detection.js";
import type { VectorDb } from "../core/search/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

const mockStoreMeetingVector = vi.fn().mockResolvedValue(undefined);
const mockEmbedMeeting = vi.fn().mockResolvedValue(new Float32Array(384));
const mockBuildEmbeddingInput = vi.fn().mockReturnValue("summary text decisions");

vi.mock("../core/pipeline/meeting-pipeline.js", () => ({
  buildEmbeddingInput: mockBuildEmbeddingInput,
  embedMeeting: mockEmbedMeeting,
  storeMeetingVector: mockStoreMeetingVector,
}));

const mockToArray = vi.fn().mockResolvedValue([]);
const mockDelete = vi.fn().mockResolvedValue(undefined);
const mockTable = { query: () => ({ toArray: mockToArray }), add: vi.fn(), delete: mockDelete };
const mockCreateMeetingTable = vi.fn().mockResolvedValue(mockTable);

vi.mock("../core/search/vector-db.js", () => ({
  createMeetingTable: mockCreateMeetingTable,
}));

const { handleReEmbed, handleUpdateMeetingVector } = await import("../electron-ui/electron/ipc-handlers.js");

const mockVdb = {} as VectorDb;
const mockSession = {} as InferenceSession & { _tokenizer: unknown };

describe("handleReEmbed", () => {
  let db: ReturnType<typeof createDb>;
  let meetingId: string;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT OR IGNORE INTO clients (name, id) VALUES (?, ?)").run("Acme", "client-acme");

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
      { client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "participant" },
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

describe("handleUpdateMeetingVector", () => {
  let db: ReturnType<typeof createDb>;
  let meetingId: string;

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT OR IGNORE INTO clients (name, id) VALUES (?, ?)").run("Acme", "client-acme");

    meetingId = ingestMeeting(db, {
      title: "Architecture Solutioning",
      timestamp: "2026-01-10T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHello.",
      turns: [],
      sourceFilename: "arch-sol-update",
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
      { client_name: "Acme", client_id: "client-acme", confidence: 0.9, method: "participant" },
    ]);
  });

  it("deletes existing vector then stores new one for meeting with artifact", async () => {
    mockDelete.mockClear();
    mockStoreMeetingVector.mockClear();

    await handleUpdateMeetingVector(db, mockVdb, mockSession, meetingId);

    expect(mockDelete).toHaveBeenCalledWith(`meeting_id = '${meetingId}'`);
    expect(mockStoreMeetingVector).toHaveBeenCalledWith(
      mockTable,
      meetingId,
      expect.any(Float32Array),
      { client: "Acme", meeting_type: "Architecture Solutioning", date: "2026-01-10T10:00:00.000Z" },
    );
  });

  it("throws when meeting has no artifact", async () => {
    const noArtifactDb = createDb(":memory:");
    migrate(noArtifactDb);
    const id = ingestMeeting(noArtifactDb, {
      title: "No Artifact",
      timestamp: "2026-01-15T10:00:00.000Z",
      participants: [],
      rawTranscript: "A | 00:00\nHi.",
      turns: [],
      sourceFilename: "no-artifact-update",
    });

    await expect(handleUpdateMeetingVector(noArtifactDb, mockVdb, mockSession, id))
      .rejects.toThrow(`No artifact found for meeting ${id}`);
  });
});
