// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "../../electron-ui/ui/src/App.js";

afterEach(cleanup);

const ARTIFACT_M1 = {
  summary: "Alpha summary.",
  decisions: [{ text: "Use TypeScript", decided_by: "Alice" }],
  proposed_features: ["Dark mode"],
  action_items: [{ description: "Write tests", owner: "Alice", requester: "", due_date: null }],
  open_questions: [],
  risk_items: [],
  additional_notes: [],
};

const ARTIFACT_M2 = {
  summary: "Beta summary.",
  decisions: [{ text: "use typescript", decided_by: "Bob" }],
  proposed_features: ["Dark mode"],
  action_items: [{ description: "Review PR", owner: "Bob", requester: "", due_date: null }],
  open_questions: [],
  risk_items: [],
  additional_notes: [],
};

beforeAll(() => {
  (window as unknown as Record<string, unknown>).api = {
    getClients: vi.fn().mockResolvedValue(["Acme"]),
    getMeetings: vi.fn().mockResolvedValue([
      { id: "m1", title: "Alpha Weekly", date: "2026-01-01", client: "Acme", series: "alpha weekly", actionItemCount: 2 },
      { id: "m2", title: "Beta Daily", date: "2026-01-02", client: "Acme", series: "beta daily", actionItemCount: 1 },
    ]),
    getArtifact: vi.fn().mockImplementation((id: string) => {
      if (id === "m1") return Promise.resolve(ARTIFACT_M1);
      if (id === "m2") return Promise.resolve(ARTIFACT_M2);
      return Promise.resolve(null);
    }),
    chat: vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 }),
    conversationChat: vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 }),
    search: vi.fn().mockResolvedValue([]),
    getCompletions: vi.fn().mockResolvedValue([]),
    completeActionItem: vi.fn().mockResolvedValue(undefined),
    deleteMeetings: vi.fn().mockResolvedValue(undefined),
    getMentionStats: vi.fn().mockResolvedValue([]),
    getItemHistory: vi.fn().mockResolvedValue([]),
    getDefaultClient: vi.fn().mockResolvedValue("Acme"),
    getClientActionItems: vi.fn().mockResolvedValue([
      { meeting_id: "m1", meeting_title: "Alpha Weekly", meeting_date: "2026-01-01", item_index: 0, description: "Deploy fix", owner: "Alice", requester: "Bob", due_date: null, priority: "critical" },
    ]),
    getTemplates: vi.fn().mockResolvedValue(["jira-ticket"]),
    uncompleteActionItem: vi.fn().mockResolvedValue(undefined),
    reExtract: vi.fn().mockResolvedValue(undefined),
    reEmbedMeeting: vi.fn().mockResolvedValue(undefined),
    createMeeting: vi.fn().mockResolvedValue({ meetingId: "new-meeting-123" }),
    deepSearch: vi.fn().mockResolvedValue([]),
    listThreads: vi.fn().mockResolvedValue([]),
    createThread: vi.fn().mockResolvedValue({ id: "t1", client_name: "Acme", title: "Test", shorthand: "TEST", description: "", status: "open", summary: "", criteria_prompt: "", criteria_changed_at: "2026-01-01", created_at: "2026-01-01", updated_at: "2026-01-01" }),
    updateThread: vi.fn().mockResolvedValue({ id: "t1", client_name: "Acme", title: "Updated", shorthand: "TEST", description: "", status: "open", summary: "", criteria_prompt: "", criteria_changed_at: "2026-01-01", created_at: "2026-01-01", updated_at: "2026-01-01" }),
    deleteThread: vi.fn().mockResolvedValue(undefined),
    getThreadMeetings: vi.fn().mockResolvedValue([]),
    getThreadCandidates: vi.fn().mockResolvedValue([]),
    evaluateThreadCandidates: vi.fn().mockResolvedValue({ added: 0, updated: 0, errors: [] }),
    removeThreadMeeting: vi.fn().mockResolvedValue(undefined),
    addThreadMeeting: vi.fn().mockResolvedValue(undefined),
    regenerateThreadSummary: vi.fn().mockResolvedValue({ summary: "" }),
    getThreadMessages: vi.fn().mockResolvedValue([]),
    threadChat: vi.fn().mockResolvedValue({ answer: "ok", sources: [] }),
    clearThreadMessages: vi.fn().mockResolvedValue(undefined),
    getMeetingThreads: vi.fn().mockResolvedValue([]),
    listInsights: vi.fn().mockResolvedValue([]),
    createInsight: vi.fn().mockResolvedValue({ id: "i1", client_name: "Acme", period_type: "week", period_start: "2026-01-01", period_end: "2026-01-07", status: "draft", rag_status: "green", rag_rationale: "", executive_summary: "", topic_details: "[]", generated_at: "", created_at: "2026-01-01", updated_at: "2026-01-01" }),
    updateInsight: vi.fn().mockResolvedValue({ id: "i1", client_name: "Acme", period_type: "week", period_start: "2026-01-01", period_end: "2026-01-07", status: "draft", rag_status: "green", rag_rationale: "", executive_summary: "", topic_details: "[]", generated_at: "", created_at: "2026-01-01", updated_at: "2026-01-01" }),
    deleteInsight: vi.fn().mockResolvedValue(undefined),
    getInsightMeetings: vi.fn().mockResolvedValue([]),
    discoverInsightMeetings: vi.fn().mockResolvedValue([]),
    generateInsight: vi.fn().mockResolvedValue({ id: "i1", client_name: "Acme", period_type: "week", period_start: "2026-01-01", period_end: "2026-01-07", status: "draft", rag_status: "yellow", rag_rationale: "Some open items", executive_summary: "Summary", topic_details: "[]", generated_at: "2026-01-01", created_at: "2026-01-01", updated_at: "2026-01-01" }),
    getInsightMessages: vi.fn().mockResolvedValue([]),
    insightChat: vi.fn().mockResolvedValue({ answer: "ok", sources: [] }),
    clearInsightMessages: vi.fn().mockResolvedValue(undefined),
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("App", () => {
  it("renders detail panel always visible", () => {
    render(<App />, { wrapper });
    const panel = screen.getByTestId("panel-1");
    expect(panel.className).toContain("flex-1");
  });

  it("shows Select a meeting placeholder in detail", () => {
    render(<App />, { wrapper });
    expect(screen.getByText("Select a meeting")).toBeDefined();
  });

  it("renders group-by selector and switches groupBy state on click", async () => {
    render(<App />, { wrapper });
    const dayBtn = screen.getByRole("button", { name: "Day" });
    expect(dayBtn).toBeDefined();
    fireEvent.click(dayBtn);
    await waitFor(() => {
      expect((screen.getByRole("button", { name: "Day" }) as HTMLButtonElement).className).toContain("bg-primary");
    });
  });

  it("reset clears search input value", async () => {
    render(<App />, { wrapper });
    const input = screen.getByRole("textbox", { name: /search meetings/i });
    fireEvent.change(input, { target: { value: "foo" } });
    expect((input as HTMLInputElement).value).toBe("foo");
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("shows meeting title in detail panel after meeting row click", async () => {
    render(<App />, { wrapper });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(row);
    await waitFor(() => {
      expect(screen.queryByText("Select a meeting")).toBeNull();
    });
  });

  it("chat panel absent initially with no meeting selected", () => {
    render(<App />, { wrapper });
    expect(screen.queryByTestId("chat-panel")).toBeNull();
  });

  it("meeting list shows only search-matching meetings when query has 2+ chars", async () => {
    (window.api.getMeetings as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "m1", title: "Alpha Weekly", date: "2026-01-01", client: "Acme", series: "alpha weekly", actionItemCount: 2 },
      { id: "m2", title: "Beta Daily", date: "2026-01-02", client: "Beta", series: "beta daily", actionItemCount: 0 },
    ]);
    (window.api.search as ReturnType<typeof vi.fn>).mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "Alpha Weekly", date: "2026-01-01" },
    ]);
    (window.api.deepSearch as ReturnType<typeof vi.fn>).mockResolvedValue([
      { meeting_id: "m1", relevanceSummary: "Relevant", relevanceScore: 85 },
    ]);
    render(<App />, { wrapper });
    const input = screen.getByRole("textbox", { name: /search meetings/i });
    fireEvent.change(input, { target: { value: "al" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByTestId("meeting-row-m1")).toBeDefined();
      expect(screen.queryByTestId("meeting-row-m2")).toBeNull();
    });
  });

  it("shows confirmation dialog when Delete button clicked", async () => {
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    const checkboxes = screen.getAllByRole("checkbox").filter((el) => !el.getAttribute("aria-label")?.includes("Deep"));
    fireEvent.click(checkboxes[0]);
    await waitFor(() => expect(screen.getByRole("button", { name: /Delete 1/i })).toBeDefined());
    fireEvent.click(screen.getByRole("button", { name: /Delete 1/i }));
    await waitFor(() => expect(screen.getByText("Permanently delete 1 meeting(s)?")).toBeDefined());
  });

  it("canceling confirmation dialog does not call deleteMeetings", async () => {
    const deleteFn = vi.fn().mockResolvedValue(undefined);
    (window as unknown as Record<string, unknown>).api = { ...(window as unknown as Record<string, { deleteMeetings: unknown }>).api, deleteMeetings: deleteFn };
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    const checkboxes = screen.getAllByRole("checkbox").filter((el) => !el.getAttribute("aria-label")?.includes("Deep"));
    fireEvent.click(checkboxes[0]);
    await waitFor(() => screen.getByRole("button", { name: /Delete 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /Delete 1/i }));
    await waitFor(() => screen.getByText("Permanently delete 1 meeting(s)?"));
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it("shows success toast after confirming delete", async () => {
    render(<App />, { wrapper });
    const row = await screen.findByTestId("meeting-row-m1");
    const checkboxes = screen.getAllByRole("checkbox").filter((el) => !el.getAttribute("aria-label")?.includes("Deep"));
    fireEvent.click(checkboxes[0]);
    await waitFor(() => screen.getByRole("button", { name: /Delete 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /Delete 1/i }));
    await waitFor(() => screen.getByText("Permanently delete 1 meeting(s)?"));
    fireEvent.click(screen.getByRole("button", { name: /Delete permanently/i }));
    await waitFor(() => expect(screen.getByText("1 meeting(s) deleted")).toBeDefined());
    expect(row).toBeDefined();
  });

  it("shows success toast after re-extract completes", async () => {
    render(<App />, { wrapper });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(row);
    await waitFor(() => screen.getByRole("button", { name: "Re-extract" }));
    fireEvent.click(screen.getByRole("button", { name: "Re-extract" }));
    await waitFor(() => expect(screen.getByText("Re-extraction complete")).toBeDefined());
  });

  it("shows error toast when re-extract fails", async () => {
    (window.api.reExtract as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("LLM failed"));
    render(<App />, { wrapper });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(row);
    await waitFor(() => screen.getByRole("button", { name: "Re-extract" }));
    fireEvent.click(screen.getByRole("button", { name: "Re-extract" }));
    await waitFor(() => expect(screen.getByText("Re-extraction failed")).toBeDefined());
  });

  it("calls reEmbedMeeting and shows indexing toast after successful re-extract", async () => {
    render(<App />, { wrapper });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(row);
    await waitFor(() => screen.getByRole("button", { name: "Re-extract" }));
    fireEvent.click(screen.getByRole("button", { name: "Re-extract" }));
    await waitFor(() => expect(window.api.reEmbedMeeting).toHaveBeenCalledWith("m1"));
    await waitFor(() => expect(screen.getByText("Search index updated")).toBeDefined());
  });

  it("shows search index failed toast when reEmbedMeeting fails", async () => {
    (window.api.reEmbedMeeting as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("no search"));
    render(<App />, { wrapper });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(row);
    await waitFor(() => screen.getByRole("button", { name: "Re-extract" }));
    fireEvent.click(screen.getByRole("button", { name: "Re-extract" }));
    await waitFor(() => expect(screen.getByText("Search index update failed")).toBeDefined());
  });

  it("renders NavRail with Meetings and Action Items buttons", () => {
    render(<App />, { wrapper });
    expect(screen.getByRole("button", { name: "Meetings" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Action Items" })).toBeDefined();
  });

  it("clicking Action Items nav hides meeting list and shows action items view", async () => {
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByRole("button", { name: "Action Items" }));
    expect(screen.queryByTestId("meeting-row-m1")).toBeNull();
    expect(screen.getByTestId("client-action-items-view")).toBeDefined();
  });

  it("action-items view shows client action items fetched from api", async () => {
    render(<App />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Action Items" }));
    await waitFor(() => {
      expect(screen.getByText("Deploy fix")).toBeDefined();
    });
  });

  it("in action-items view with preview, activeMeetingIds uses previewMeetingId for chat", async () => {
    render(<App />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Action Items" }));
    await waitFor(() => screen.getByText("Deploy fix"));
    fireEvent.click(screen.getByText("Alpha Weekly"));
    await waitFor(() => {
      expect(screen.getByTestId("chat-panel")).toBeDefined();
    });
  });

  it("preview MeetingDetail in action-items view has onComplete wired (complete buttons rendered)", async () => {
    render(<App />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Action Items" }));
    await waitFor(() => screen.getByText("Deploy fix"));
    fireEvent.click(screen.getByText("Alpha Weekly"));
    await waitFor(() => {
      expect(screen.getByLabelText("Complete item 0")).toBeDefined();
    });
  });

  it("completing item from action-items view calls completeActionItem with meetingId and index", async () => {
    render(<App />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Action Items" }));
    await waitFor(() => screen.getByText("Deploy fix"));
    const checkboxes = screen.getAllByRole("checkbox").filter((el) => !el.getAttribute("aria-label")?.includes("Deep"));
    fireEvent.click(checkboxes[0]);
    await waitFor(() => {
      expect(window.api.completeActionItem).toHaveBeenCalledWith("m1", 0, "");
    });
  });

  it("checking 2 meetings shows merged multi-meeting detail header", async () => {
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    const checkboxes = screen.getAllByRole("checkbox").filter((el) => !el.getAttribute("aria-label")?.includes("Deep"));
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    await waitFor(() => {
      expect(screen.getByText("2 meetings selected")).toBeDefined();
    });
  });

  it("Relevance sort button appears and sort switches to relevance when search returns results", async () => {
    (window.api.search as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { meeting_id: "m1", score: 0.3, client: "Acme", meeting_type: "Weekly", date: "2026-01-01" },
    ]);
    render(<App />, { wrapper });
    const input = screen.getByRole("textbox", { name: /search meetings/i });
    fireEvent.change(input, { target: { value: "deployment issue" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Relevance" })).toBeTruthy();
    });
  });

  it("sort resets to Newest when search query is cleared", async () => {
    (window.api.search as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { meeting_id: "m1", score: 0.3, client: "Acme", meeting_type: "Weekly", date: "2026-01-01" },
    ]);
    render(<App />, { wrapper });
    const input = screen.getByRole("textbox", { name: /search meetings/i });
    fireEvent.change(input, { target: { value: "deployment issue" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => screen.getByRole("button", { name: "Relevance" }));
    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Relevance" })).toBeNull();
    });
  });

  it("+ Add Meeting button opens NewMeetingDialog", async () => {
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByRole("button", { name: "+ Add Meeting" }));
    await waitFor(() => expect(screen.getByText("New Meeting")).toBeDefined());
  });

  it("shows Meeting imported toast after createMeeting resolves", async () => {
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByRole("button", { name: "+ Add Meeting" }));
    await waitFor(() => screen.getByText("New Meeting"));
    fireEvent.change(screen.getByPlaceholderText("e.g. Weekly Sync"), { target: { value: "Test Meeting" } });
    fireEvent.change(screen.getByPlaceholderText("Paste transcript here..."), { target: { value: "Some transcript" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(screen.getByText("Meeting imported")).toBeDefined());
  });

  it("clicking Meetings nav clears search query", async () => {
    render(<App />, { wrapper });
    const input = screen.getByRole("textbox", { name: /search meetings/i });
    fireEvent.change(input, { target: { value: "DLQ" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect((input as HTMLInputElement).value).toBe("DLQ");
    fireEvent.click(screen.getByRole("button", { name: "Action Items" }));
    fireEvent.click(screen.getByRole("button", { name: "Meetings" }));
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("shows error toast when deep search fails with LLM error", async () => {
    (window.api.search as ReturnType<typeof vi.fn>).mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "Alpha Weekly", date: "2026-01-01" },
    ]);
    (window.api.deepSearch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("[api_error] credit balance too low"),
    );
    render(<App />, { wrapper });
    const input = screen.getByRole("textbox", { name: /search meetings/i });
    fireEvent.change(input, { target: { value: "test query" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText(/Deep search failed/i)).toBeDefined();
    });
    expect(screen.getByTestId("meeting-row-m1")).toBeDefined();
    expect(screen.queryByText(/no relevant results/i)).toBeNull();
  });

  it("clicking Threads nav renders ThreadsView with client header", async () => {
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByLabelText("Threads"));
    await waitFor(() => expect(screen.getByText("Acme Threads")).toBeDefined());
    expect(window.api.listThreads).toHaveBeenCalled();
  });

  it("shows thread chat panel when selected thread has meetings", async () => {
    (window.api.listThreads as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "t1", client_name: "Acme", title: "Test Thread", shorthand: "TT", description: "", status: "open", summary: "A summary", criteria_prompt: "", keywords: "", criteria_changed_at: "2026-01-01", created_at: "2026-01-01", updated_at: "2026-01-01", meeting_count: 1 },
    ]);
    (window.api.getThreadMeetings as ReturnType<typeof vi.fn>).mockResolvedValue([
      { meeting_id: "m1", meeting_title: "Alpha Weekly", relevance_score: 80, relevance_summary: "Relevant", evaluated_at: "2026-01-01" },
    ]);
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByLabelText("Threads"));
    await screen.findByText("Test Thread");
    fireEvent.click(screen.getByText("Test Thread"));
    await screen.findByText("A summary");
    await waitFor(() => expect(screen.getByPlaceholderText(/Ask a question/)).toBeDefined());
  });

  it("hides thread chat panel when selected thread has no meetings", async () => {
    (window.api.listThreads as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "t1", client_name: "Acme", title: "Empty Thread", shorthand: "ET", description: "", status: "open", summary: "", criteria_prompt: "", keywords: "", criteria_changed_at: "2026-01-01", created_at: "2026-01-01", updated_at: "2026-01-01", meeting_count: 0 },
    ]);
    (window.api.getThreadMeetings as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByLabelText("Threads"));
    await waitFor(() => expect(screen.getByText("Acme Threads")).toBeDefined());
    await waitFor(() => expect(screen.getByText("Empty Thread")).toBeDefined());
    fireEvent.click(screen.getByText("Empty Thread"));
    await waitFor(() => expect(screen.getByText(/No summary yet/)).toBeDefined());
    expect(screen.queryByPlaceholderText(/Ask a question/)).toBeNull();
  });

  it("clicking Insights nav renders insights placeholder view", async () => {
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByLabelText("Insights"));
    await waitFor(() => expect(screen.queryByTestId("meeting-row-m1")).toBeNull());
  });

  it("shows Meeting import failed toast when createMeeting rejects", async () => {
    (window.api.createMeeting as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("LLM failed"));
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByRole("button", { name: "+ Add Meeting" }));
    await waitFor(() => screen.getByText("New Meeting"));
    fireEvent.change(screen.getByPlaceholderText("e.g. Weekly Sync"), { target: { value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText("Paste transcript here..."), { target: { value: "text" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(screen.getByText("Meeting import failed")).toBeDefined());
  });
});
