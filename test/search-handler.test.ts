import { describe, it, expect, vi } from "vitest";
import type { SearchResultRow } from "../electron-ui/electron/channels.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

const fakeResults: SearchResultRow[] = [
  { meeting_id: "m1", score: 0.92, client: "Acme", meeting_type: "DSU", date: "2026-02-24" },
];

const searchMeetingsMock = vi.fn().mockResolvedValue(fakeResults);

vi.mock("../core/vector-search.js", () => ({
  searchMeetings: searchMeetingsMock,
}));

const { handleSearchMeetings } = await import("../electron-ui/electron/ipc-handlers.js");

const mockVdb = {} as VectorDb;
const mockSession = {} as InferenceSession & { _tokenizer: unknown };

describe("handleSearchMeetings", () => {
  it("returns results from searchMeetings", async () => {
    const result = await handleSearchMeetings(mockVdb, mockSession, {
      query: "authentication",
      client: "Acme",
    });
    expect(result).toEqual(fakeResults);
  });

  it("passes query and client options to searchMeetings", async () => {
    searchMeetingsMock.mockClear();
    await handleSearchMeetings(mockVdb, mockSession, {
      query: "auth",
      client: "Acme",
    });
    expect(searchMeetingsMock).toHaveBeenCalledWith(
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ client: "Acme" }),
    );
  });

  it("uses SEARCH_LIMIT from config (50) regardless of request limit field", async () => {
    searchMeetingsMock.mockClear();
    await handleSearchMeetings(mockVdb, mockSession, { query: "auth" });
    expect(searchMeetingsMock).toHaveBeenCalledWith(
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ limit: 50 }),
    );
  });

  it("passes maxDistance from config to searchMeetings", async () => {
    searchMeetingsMock.mockClear();
    await handleSearchMeetings(mockVdb, mockSession, { query: "auth" });
    expect(searchMeetingsMock).toHaveBeenCalledWith(
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ maxDistance: 1.0 }),
    );
  });
});
