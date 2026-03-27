// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
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

beforeEach(() => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
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
    search: vi.fn().mockResolvedValue([{ meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "weekly", date: "2026-01-01", cluster_tags: [], series: "alpha weekly" }]),
    getCompletions: vi.fn().mockResolvedValue([]),
    completeActionItem: vi.fn().mockResolvedValue(undefined),
    deleteMeetings: vi.fn().mockResolvedValue(undefined),
    getMentionStats: vi.fn().mockResolvedValue([]),
    getItemHistory: vi.fn().mockResolvedValue([]),
    getDefaultClient: vi.fn().mockResolvedValue("Acme"),
    getClientActionItems: vi.fn().mockResolvedValue([]),
    getTemplates: vi.fn().mockResolvedValue([]),
    uncompleteActionItem: vi.fn().mockResolvedValue(undefined),
    reExtract: vi.fn().mockResolvedValue(undefined),
    reEmbedMeeting: vi.fn().mockResolvedValue(undefined),
    createMeeting: vi.fn().mockResolvedValue({ meetingId: "new-meeting-123" }),
    deepSearch: vi.fn().mockResolvedValue([]),
    listThreads: vi.fn().mockResolvedValue([]),
    createThread: vi.fn().mockResolvedValue({ id: "t1", client_name: "Acme", title: "Test", shorthand: "TEST", description: "", status: "open", summary: "", criteria_prompt: "", criteria_changed_at: "2026-01-01", created_at: "2026-01-01", updated_at: "2026-01-01" }),
    updateThread: vi.fn().mockResolvedValue(undefined),
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
    updateInsight: vi.fn().mockResolvedValue(undefined),
    deleteInsight: vi.fn().mockResolvedValue(undefined),
    getInsightMeetings: vi.fn().mockResolvedValue([]),
    discoverInsightMeetings: vi.fn().mockResolvedValue([]),
    generateInsight: vi.fn().mockResolvedValue(undefined),
    getInsightMessages: vi.fn().mockResolvedValue([]),
    insightChat: vi.fn().mockResolvedValue({ answer: "ok", sources: [] }),
    clearInsightMessages: vi.fn().mockResolvedValue(undefined),
    removeInsightMeeting: vi.fn().mockResolvedValue(undefined),
    listMilestones: vi.fn().mockResolvedValue([]),
    createMilestone: vi.fn().mockResolvedValue(undefined),
    updateMilestone: vi.fn().mockResolvedValue(undefined),
    deleteMilestone: vi.fn().mockResolvedValue(undefined),
    getMilestoneMentions: vi.fn().mockResolvedValue([]),
    confirmMilestoneMention: vi.fn().mockResolvedValue(undefined),
    rejectMilestoneMention: vi.fn().mockResolvedValue(undefined),
    mergeMilestones: vi.fn().mockResolvedValue(undefined),
    getMilestoneActionItems: vi.fn().mockResolvedValue([]),
    unlinkMilestoneActionItem: vi.fn().mockResolvedValue(undefined),
    milestoneChat: vi.fn().mockResolvedValue({ answer: "ok", sources: [] }),
    getMilestoneMessages: vi.fn().mockResolvedValue([]),
    clearMilestoneMessages: vi.fn().mockResolvedValue(undefined),
    getDateSlippage: vi.fn().mockResolvedValue([]),
    getMeetingMilestones: vi.fn().mockResolvedValue([]),
    getMeetingAssets: vi.fn().mockResolvedValue([]),
    uploadAsset: vi.fn().mockResolvedValue(undefined),
    deleteAsset: vi.fn().mockResolvedValue(undefined),
    getAssetData: vi.fn().mockResolvedValue(null),
    renameMeeting: vi.fn().mockResolvedValue(undefined),
    artifactBatch: vi.fn().mockResolvedValue({}),
    getTranscript: vi.fn().mockResolvedValue(""),
    getMeetingMessages: vi.fn().mockResolvedValue([]),
    meetingChat: vi.fn().mockResolvedValue({ answer: "ok", sources: [] }),
    clearMeetingMessages: vi.fn().mockResolvedValue(undefined),
    notesList: vi.fn().mockResolvedValue([]),
    notesCount: vi.fn().mockResolvedValue(0),
    notesCreate: vi.fn().mockResolvedValue(undefined),
    notesUpdate: vi.fn().mockResolvedValue(undefined),
    notesDelete: vi.fn().mockResolvedValue(undefined),
    updateArtifactSection: vi.fn().mockResolvedValue(undefined),
    editActionItem: vi.fn().mockResolvedValue(undefined),
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("Search regression guards", () => {
  it("meetings view typing updates input and search API is called on Enter", async () => {
    render(<App />, { wrapper });
    const input = await screen.findByRole("textbox", { name: /search meetings/i });
    await screen.findByTestId("meeting-row-m1");

    fireEvent.change(input, { target: { value: "Alpha" } });
    expect((input as HTMLInputElement).value).toBe("Alpha");

    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(window.api.search).toHaveBeenCalledWith(
        expect.objectContaining({ query: "Alpha" }),
      );
    });
  });

  it("meetings view multi-select chat passes undefined contextMode (full context)", async () => {
    render(<App />, { wrapper });
    await screen.findByRole("textbox", { name: /search meetings/i });
    await screen.findByTestId("meeting-row-m1");
    const checkboxes = screen.getAllByRole("checkbox").filter((el) => !el.getAttribute("aria-label")?.includes("Deep"));
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByText("2 meetings selected")).not.toBeNull();
    });

    const chatInput = screen.getByPlaceholderText("Ask a question about these meetings…");
    fireEvent.change(chatInput, { target: { value: "Summarize both" } });
    fireEvent.click(screen.getByLabelText("Send"));

    await waitFor(() => {
      const calls = (window.api.conversationChat as ReturnType<typeof vi.fn>).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0].contextMode).toBeUndefined();
    });
  });

  it("TopBar client filter change re-fetches meetings with new client", async () => {
    (window.api.getClients as ReturnType<typeof vi.fn>).mockResolvedValue(["Acme", "Globex"]);
    (window.api.getMeetings as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "m1", title: "Alpha Weekly", date: "2026-01-01", client: "Acme", series: "alpha weekly", actionItemCount: 2 },
    ]);
    render(<App />, { wrapper });
    await screen.findByTestId("meeting-row-m1");

    (window.api.getMeetings as ReturnType<typeof vi.fn>).mockClear();
    (window.api.getMeetings as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "m3", title: "Globex Standup", date: "2026-01-03", client: "Globex", series: "standup", actionItemCount: 0 },
    ]);
    fireEvent.change(screen.getByRole("combobox", { name: "Client" }), { target: { value: "Globex" } });

    await waitFor(() => {
      expect(window.api.getMeetings).toHaveBeenCalledWith(
        expect.objectContaining({ client: "Globex" }),
      );
    });
  });
});
