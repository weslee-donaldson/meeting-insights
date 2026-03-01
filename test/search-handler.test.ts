import { describe, it, expect, vi } from "vitest";
import type { SearchResultRow } from "../electron/channels.js";
import type { VectorDb } from "../src/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

const fakeResults: SearchResultRow[] = [
  { meeting_id: "m1", score: 0.92, client: "Acme", meeting_type: "DSU", date: "2026-02-24" },
];

const searchMeetingsMock = vi.fn().mockResolvedValue(fakeResults);

vi.mock("../src/vector-search.js", () => ({
  searchMeetings: searchMeetingsMock,
}));

const { handleSearchMeetings } = await import("../electron/ipc-handlers.js");

const mockVdb = {} as VectorDb;
const mockSession = {} as InferenceSession & { _tokenizer: unknown };

describe("handleSearchMeetings", () => {
  it("returns results from searchMeetings", async () => {
    const result = await handleSearchMeetings(mockVdb, mockSession, {
      query: "authentication",
      client: "Acme",
      limit: 3,
    });
    expect(result).toEqual(fakeResults);
  });

  it("passes query and options to searchMeetings", async () => {
    searchMeetingsMock.mockClear();
    await handleSearchMeetings(mockVdb, mockSession, {
      query: "auth",
      client: "Acme",
      limit: 3,
    });
    expect(searchMeetingsMock).toHaveBeenCalledWith(
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ limit: 3, client: "Acme" }),
    );
  });

  it("defaults limit to 6 when not provided", async () => {
    searchMeetingsMock.mockClear();
    await handleSearchMeetings(mockVdb, mockSession, { query: "auth" });
    expect(searchMeetingsMock).toHaveBeenCalledWith(
      mockVdb,
      mockSession,
      "auth",
      expect.objectContaining({ limit: 6 }),
    );
  });
});
