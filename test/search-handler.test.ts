import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import type { SearchResultRow } from "../electron-ui/electron/channels.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { DatabaseSync as Database } from "node:sqlite";

const systemConfig = JSON.parse(readFileSync("config/system.json", "utf8")) as { search?: { maxDistance?: number; limit?: number; displayLimit?: number; chatContextLimit?: number } };
const EXPECTED_MAX_DISTANCE = systemConfig.search?.maxDistance ?? 1.0;
const EXPECTED_LIMIT = systemConfig.search?.limit ?? 50;
const EXPECTED_DISPLAY_LIMIT = systemConfig.search?.displayLimit ?? 20;
const EXPECTED_CHAT_CONTEXT_LIMIT = systemConfig.search?.chatContextLimit ?? 10;

const fakeRawResults = [
  { meeting_id: "m1", score: 0.92, client: "Acme", meeting_type: "DSU", date: "2026-02-24" },
];

const fakeResults: SearchResultRow[] = [
  { meeting_id: "m1", score: 0.92, client: "Acme", meeting_type: "DSU", date: "2026-02-24", cluster_tags: ["sprint"], series: "daily standup" },
];

const hybridSearchMock = vi.fn().mockResolvedValue(fakeRawResults);

vi.mock("../core/hybrid-search.js", () => ({
  hybridSearch: hybridSearchMock,
}));

const { handleSearchMeetings } = await import("../electron-ui/electron/ipc-handlers.js");
const { DISPLAY_LIMIT, CHAT_CONTEXT_LIMIT } = await import("../electron-ui/electron/handlers/config.js");

const mockDb = {
  prepare: vi.fn().mockImplementation((sql: string) => ({
    all: (..._args: unknown[]) => {
      if (sql.includes("meeting_clusters")) {
        return [{ meeting_id: "m1", generated_tags: JSON.stringify(["sprint"]) }];
      }
      if (sql.includes("meetings")) {
        return [{ id: "m1", title: "Daily Standup" }];
      }
      return [];
    },
  })),
} as unknown as Database;
const mockVdb = {} as VectorDb;
const mockSession = {} as InferenceSession & { _tokenizer: unknown };

describe("handleSearchMeetings", () => {
  it("returns results from hybridSearch", async () => {
    const result = await handleSearchMeetings(mockDb, mockVdb, mockSession, {
      query: "authentication",
      client: "Acme",
    });
    expect(result).toEqual(fakeResults);
  });

  it("passes db, vdb, session, query and options to hybridSearch", async () => {
    hybridSearchMock.mockClear();
    await handleSearchMeetings(mockDb, mockVdb, mockSession, {
      query: "auth",
      client: "Acme",
    });
    expect(hybridSearchMock).toHaveBeenCalledWith(
      mockDb,
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ client: "Acme" }),
    );
  });

  it("uses SEARCH_LIMIT from config regardless of request limit field", async () => {
    hybridSearchMock.mockClear();
    await handleSearchMeetings(mockDb, mockVdb, mockSession, { query: "auth" });
    expect(hybridSearchMock).toHaveBeenCalledWith(
      mockDb,
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ limit: EXPECTED_LIMIT }),
    );
  });

  it("passes maxDistance from config to hybridSearch", async () => {
    hybridSearchMock.mockClear();
    await handleSearchMeetings(mockDb, mockVdb, mockSession, { query: "auth" });
    expect(hybridSearchMock).toHaveBeenCalledWith(
      mockDb,
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ maxDistance: EXPECTED_MAX_DISTANCE }),
    );
  });
});

describe("config limits", () => {
  it("exports DISPLAY_LIMIT matching system.json", () => {
    expect(DISPLAY_LIMIT).toBe(EXPECTED_DISPLAY_LIMIT);
  });

  it("exports CHAT_CONTEXT_LIMIT matching system.json", () => {
    expect(CHAT_CONTEXT_LIMIT).toBe(EXPECTED_CHAT_CONTEXT_LIMIT);
  });
});
