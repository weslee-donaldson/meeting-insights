import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import type { SearchResultRow } from "../electron-ui/electron/channels.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { DatabaseSync as Database } from "node:sqlite";

const systemConfig = JSON.parse(readFileSync("config/system.json", "utf8")) as { search?: { maxDistance?: number; limit?: number } };
const EXPECTED_MAX_DISTANCE = systemConfig.search?.maxDistance ?? 1.0;
const EXPECTED_LIMIT = systemConfig.search?.limit ?? 50;

const fakeResults: SearchResultRow[] = [
  { meeting_id: "m1", score: 0.92, client: "Acme", meeting_type: "DSU", date: "2026-02-24" },
];

const hybridVectorSearchMock = vi.fn().mockResolvedValue(fakeResults);

vi.mock("../core/hybrid-search.js", () => ({
  hybridVectorSearch: hybridVectorSearchMock,
}));

const { handleSearchMeetings } = await import("../electron-ui/electron/ipc-handlers.js");

const mockDb = {} as Database;
const mockVdb = {} as VectorDb;
const mockSession = {} as InferenceSession & { _tokenizer: unknown };

describe("handleSearchMeetings", () => {
  it("returns results from hybridVectorSearch", async () => {
    const result = await handleSearchMeetings(mockDb, mockVdb, mockSession, {
      query: "authentication",
      client: "Acme",
    });
    expect(result).toEqual(fakeResults);
  });

  it("passes db, vdb, session, query and options to hybridVectorSearch", async () => {
    hybridVectorSearchMock.mockClear();
    await handleSearchMeetings(mockDb, mockVdb, mockSession, {
      query: "auth",
      client: "Acme",
    });
    expect(hybridVectorSearchMock).toHaveBeenCalledWith(
      mockDb,
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ client: "Acme" }),
    );
  });

  it("uses SEARCH_LIMIT from config regardless of request limit field", async () => {
    hybridVectorSearchMock.mockClear();
    await handleSearchMeetings(mockDb, mockVdb, mockSession, { query: "auth" });
    expect(hybridVectorSearchMock).toHaveBeenCalledWith(
      mockDb,
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ limit: EXPECTED_LIMIT }),
    );
  });

  it("passes maxDistance from config to hybridVectorSearch", async () => {
    hybridVectorSearchMock.mockClear();
    await handleSearchMeetings(mockDb, mockVdb, mockSession, { query: "auth" });
    expect(hybridVectorSearchMock).toHaveBeenCalledWith(
      mockDb,
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ maxDistance: EXPECTED_MAX_DISTANCE }),
    );
  });
});
