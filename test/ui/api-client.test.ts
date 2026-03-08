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

  it("conversationChat serializes includeTranscripts flag in request body", async () => {
    const spy = mockFetch({ answer: "response", sources: [], charCount: 10 });
    await apiClient.conversationChat({
      meetingIds: ["m1"],
      messages: [{ role: "user", content: "What?" }],
      includeTranscripts: true,
    });
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string) as Record<string, unknown>;
    expect(body.includeTranscripts).toBe(true);
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

  it("getDefaultClient fetches /api/default-client and returns name or null", async () => {
    const spy = mockFetch("LLSA");
    expect(await apiClient.getDefaultClient()).toBe("LLSA");
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/default-client");
  });

  it("reassignClient posts to /api/meetings/:id/client", async () => {
    const spy = mockFetch(null, 204);
    await apiClient.reassignClient("m1", "Acme");
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/meetings/m1/client",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("setIgnored posts to /api/meetings/:id/ignored", async () => {
    const spy = mockFetch(null, 204);
    await apiClient.setIgnored("m1", true);
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/meetings/m1/ignored",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("getClientActionItems fetches /api/clients/:name/action-items", async () => {
    const items = [{ meeting_id: "m1", meeting_title: "Weekly", meeting_date: "2026-01-01", item_index: 0, description: "Write tests", owner: "Alice", requester: "Bob", due_date: null, priority: "critical" }];
    const spy = mockFetch(items);
    expect(await apiClient.getClientActionItems("Acme")).toEqual(items);
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/clients/Acme/action-items");
  });

  it("getTemplates fetches /api/templates and returns string array", async () => {
    const spy = mockFetch(["jira-epic", "jira-ticket"]);
    expect(await apiClient.getTemplates()).toEqual(["jira-epic", "jira-ticket"]);
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/templates");
  });

  it("deepSearch throws with error message when server responds with non-OK status", async () => {
    mockFetch({ error: "[api_error] credit balance too low" }, 502);
    await expect(apiClient.deepSearch({ meetingIds: ["m1"], query: "test" }))
      .rejects.toThrow("[api_error] credit balance too low");
  });

  it("deepSearch returns results on 200", async () => {
    mockFetch([{ meeting_id: "m1", relevanceSummary: "Found", relevanceScore: 80 }]);
    const result = await apiClient.deepSearch({ meetingIds: ["m1"], query: "test" });
    expect(result).toEqual([{ meeting_id: "m1", relevanceSummary: "Found", relevanceScore: 80 }]);
  });

  it("chat throws with error message when server responds with non-OK status", async () => {
    mockFetch({ error: "credit balance too low" }, 502);
    await expect(apiClient.chat({ meetingIds: ["m1"], question: "q?" }))
      .rejects.toThrow("credit balance too low");
  });

  it("conversationChat throws with error message when server responds with non-OK status", async () => {
    mockFetch({ error: "credit balance too low" }, 502);
    await expect(apiClient.conversationChat({
      meetingIds: ["m1"],
      messages: [{ role: "user", content: "What?" }],
    })).rejects.toThrow("credit balance too low");
  });

  it("reExtract throws with error message when server responds with non-OK status", async () => {
    mockFetch({ error: "credit balance too low" }, 502);
    await expect(apiClient.reExtract("m1")).rejects.toThrow("credit balance too low");
  });

  it("createMeeting throws with error message when server responds with non-OK status", async () => {
    mockFetch({ error: "credit balance too low" }, 502);
    await expect(apiClient.createMeeting({
      clientName: "Acme", date: "2026-03-05", title: "Test", rawTranscript: "hi",
    })).rejects.toThrow("credit balance too low");
  });

  it("createMeeting posts to /api/meetings and returns meetingId", async () => {
    const spy = mockFetch({ meetingId: "new-id" }, 201);
    const result = await apiClient.createMeeting({
      clientName: "Acme",
      date: "2026-03-10",
      title: "Manual Meeting",
      rawTranscript: "Alice | 00:00\nHello.",
      format: "krisp",
    });
    expect(result).toEqual({ meetingId: "new-id" });
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/meetings",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("listThreads fetches /api/threads with client query param", async () => {
    const spy = mockFetch([{ id: "t1", title: "Deployment issues" }]);
    expect(await apiClient.listThreads("Acme")).toEqual([{ id: "t1", title: "Deployment issues" }]);
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/threads?client=Acme");
  });

  it("createThread posts to /api/threads and returns thread", async () => {
    const spy = mockFetch({ id: "t1", title: "New thread" });
    const result = await apiClient.createThread({ client_name: "Acme", title: "New thread", shorthand: "NT", description: "", criteria_prompt: "" });
    expect(result).toEqual({ id: "t1", title: "New thread" });
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("updateThread puts to /api/threads/:id and returns updated thread", async () => {
    const spy = mockFetch({ id: "t1", title: "Updated" });
    const result = await apiClient.updateThread("t1", { title: "Updated" });
    expect(result).toEqual({ id: "t1", title: "Updated" });
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads/t1",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("deleteThread deletes /api/threads/:id", async () => {
    const spy = mockFetch({});
    await apiClient.deleteThread("t1");
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads/t1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("getThreadMeetings fetches /api/threads/:id/meetings", async () => {
    const spy = mockFetch([{ meeting_id: "m1", relevance_score: 90 }]);
    expect(await apiClient.getThreadMeetings("t1")).toEqual([{ meeting_id: "m1", relevance_score: 90 }]);
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/threads/t1/meetings");
  });

  it("getThreadCandidates fetches /api/threads/:id/candidates", async () => {
    const spy = mockFetch(["m1", "m2"]);
    expect(await apiClient.getThreadCandidates("t1")).toEqual(["m1", "m2"]);
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/threads/t1/candidates");
  });

  it("evaluateThreadCandidates posts to /api/threads/:id/evaluate", async () => {
    const spy = mockFetch({ added: 2, updated: 0, errors: [] });
    const result = await apiClient.evaluateThreadCandidates("t1", ["m1", "m2"], false);
    expect(result).toEqual({ added: 2, updated: 0, errors: [] });
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads/t1/evaluate",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("removeThreadMeeting deletes /api/threads/:threadId/meetings/:meetingId", async () => {
    const spy = mockFetch({});
    await apiClient.removeThreadMeeting("t1", "m1");
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads/t1/meetings/m1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("addThreadMeeting posts to /api/threads/:threadId/meetings", async () => {
    const spy = mockFetch({});
    await apiClient.addThreadMeeting("t1", "m1", "Linked from chat", 100);
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads/t1/meetings",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("regenerateThreadSummary posts to /api/threads/:id/regenerate-summary", async () => {
    const spy = mockFetch({ summary: "Stub summary." });
    const result = await apiClient.regenerateThreadSummary("t1");
    expect(result).toEqual({ summary: "Stub summary." });
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads/t1/regenerate-summary",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("getThreadMessages fetches /api/threads/:id/messages", async () => {
    const spy = mockFetch([{ id: "msg1", role: "user", content: "Hello" }]);
    expect(await apiClient.getThreadMessages("t1")).toEqual([{ id: "msg1", role: "user", content: "Hello" }]);
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/threads/t1/messages");
  });

  it("threadChat posts to /api/threads/:id/chat and returns answer", async () => {
    const spy = mockFetch({ answer: "Stub answer.", sources: ["m1"] });
    const result = await apiClient.threadChat({ threadId: "t1", message: "What happened?" });
    expect(result).toEqual({ answer: "Stub answer.", sources: ["m1"] });
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads/t1/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("clearThreadMessages deletes /api/threads/:id/messages", async () => {
    const spy = mockFetch({});
    await apiClient.clearThreadMessages("t1");
    expect(spy).toHaveBeenCalledWith(
      "http://localhost:3000/api/threads/t1/messages",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("getMeetingThreads fetches /api/meetings/:id/threads", async () => {
    const spy = mockFetch([{ id: "t1", title: "Deployment issues" }]);
    expect(await apiClient.getMeetingThreads("m1")).toEqual([{ id: "t1", title: "Deployment issues" }]);
    expect(spy).toHaveBeenCalledWith("http://localhost:3000/api/meetings/m1/threads");
  });
});
