import { describe, it, expect } from "vitest";
import { CHANNELS } from "../electron-ui/electron/channels.js";
import type { SearchRequest, SearchResultRow } from "../electron-ui/electron/channels.js";

describe("CHANNELS", () => {
  it("should have 7 unique non-empty channel strings", () => {
    const values = Object.values(CHANNELS);
    expect(values).toHaveLength(7);
    expect(new Set(values).size).toBe(7);
    for (const v of values) {
      expect(typeof v).toBe("string");
      expect(v.length).toBeGreaterThan(0);
    }
  });

  it("should define GET_CLIENTS channel", () => {
    expect(CHANNELS.GET_CLIENTS).toBe("get-clients");
  });

  it("should define GET_MEETINGS channel", () => {
    expect(CHANNELS.GET_MEETINGS).toBe("get-meetings");
  });

  it("should define GET_ARTIFACT channel", () => {
    expect(CHANNELS.GET_ARTIFACT).toBe("get-artifact");
  });

  it("should define CHAT channel", () => {
    expect(CHANNELS.CHAT).toBe("chat");
  });

  it("should define SEARCH_MEETINGS channel", () => {
    expect(CHANNELS.SEARCH_MEETINGS).toBe("search-meetings");
  });

  it("should define DELETE_MEETINGS channel", () => {
    expect(CHANNELS.DELETE_MEETINGS).toBe("delete-meetings");
  });

  it("should define RE_EXTRACT channel", () => {
    expect(CHANNELS.RE_EXTRACT).toBe("re-extract");
  });

  it("SearchRequest has correct shape", () => {
    const req: SearchRequest = { query: "auth", client: "Acme", limit: 6 };
    expect(req.query).toBe("auth");
    expect(req.limit).toBe(6);
  });

  it("SearchResultRow has correct shape", () => {
    const row: SearchResultRow = {
      meeting_id: "abc",
      score: 0.9,
      client: "Acme",
      meeting_type: "DSU",
      date: "2026-01-01",
    };
    expect(row.meeting_id).toBe("abc");
    expect(row.score).toBe(0.9);
  });
});
