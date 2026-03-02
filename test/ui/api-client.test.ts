// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { apiClient } from "../../electron-ui/ui/src/api-client.js";

afterEach(() => vi.restoreAllMocks());

function mockFetch(data: unknown, status = 200) {
  return vi.spyOn(global, "fetch").mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

describe("apiClient", () => {
  it("getClients fetches /api/clients and returns string array", async () => {
    const spy = mockFetch(["Acme", "Corp"]);
    expect(await apiClient.getClients()).toEqual(["Acme", "Corp"]);
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/clients");
  });

  it("getMeetings fetches /api/meetings with filters as query params", async () => {
    const spy = mockFetch([]);
    expect(await apiClient.getMeetings({ client: "Acme", after: "2026-01-01" })).toEqual([]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("client=Acme"));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("after=2026-01-01"));
  });

  it("getArtifact returns artifact on 200", async () => {
    const artifact = { summary: "s", action_items: [], decisions: [], risks: [], topics: [] };
    mockFetch(artifact);
    expect(await apiClient.getArtifact("m1")).toEqual(artifact);
  });

  it("getArtifact returns null on 404", async () => {
    mockFetch({ error: "Not found" }, 404);
    expect(await apiClient.getArtifact("m1")).toBeNull();
  });

  it("chat posts JSON to /api/chat and returns response", async () => {
    const spy = mockFetch({ answer: "ok", sources: [], charCount: 0 });
    expect(await apiClient.chat({ meetingIds: ["m1"], question: "q?" })).toEqual({
      answer: "ok",
      sources: [],
      charCount: 0,
    });
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("conversationChat posts to /api/chat/conversation with messages array", async () => {
    const spy = mockFetch({ answer: "response", sources: ["Meeting A"], charCount: 100 });
    const result = await apiClient.conversationChat({
      meetingIds: ["m1"],
      messages: [{ role: "user", content: "What was decided?" }],
    });
    expect(result).toEqual({ answer: "response", sources: ["Meeting A"], charCount: 100 });
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/chat/conversation",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("search fetches /api/search with query params", async () => {
    const spy = mockFetch([]);
    expect(await apiClient.search({ query: "auth", client: "Acme", limit: 5 })).toEqual([]);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("q=auth"));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("client=Acme"));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("limit=5"));
  });

  it("search returns empty array when server responds with non-OK status", async () => {
    mockFetch({ error: "Search not available" }, 503);
    expect(await apiClient.search({ query: "test" })).toEqual([]);
  });
});
