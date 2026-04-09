// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "../../electron-ui/ui/src/App.js";

afterEach(cleanup);

const SPLIT_RESULT = {
  source_meeting_id: "m1",
  segments: [
    { meeting_id: "seg1", segment_index: 1, title: "Alpha Weekly (Part 1)", duration_minutes: 30 },
    { meeting_id: "seg2", segment_index: 2, title: "Alpha Weekly (Part 2)", duration_minutes: 30 },
  ],
};

beforeAll(() => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
  (window as unknown as Record<string, unknown>).api = {
    getClients: vi.fn().mockResolvedValue(["Acme"]),
    getMeetings: vi.fn().mockResolvedValue([
      { id: "m1", title: "Alpha Weekly", date: "2026-01-01", client: "Acme", series: "alpha weekly", actionItemCount: 2 },
    ]),
    getArtifact: vi.fn().mockResolvedValue(null),
    chat: vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 }),
    conversationChat: vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 }),
    search: vi.fn().mockResolvedValue([]),
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
    createThread: vi.fn().mockResolvedValue({}),
    updateThread: vi.fn().mockResolvedValue({}),
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
    createInsight: vi.fn().mockResolvedValue({}),
    updateInsight: vi.fn().mockResolvedValue({}),
    deleteInsight: vi.fn().mockResolvedValue(undefined),
    getInsightMeetings: vi.fn().mockResolvedValue([]),
    discoverInsightMeetings: vi.fn().mockResolvedValue([]),
    generateInsight: vi.fn().mockResolvedValue({}),
    getInsightMessages: vi.fn().mockResolvedValue([]),
    insightChat: vi.fn().mockResolvedValue({ answer: "ok", sources: [] }),
    clearInsightMessages: vi.fn().mockResolvedValue(undefined),
    removeInsightMeeting: vi.fn().mockResolvedValue(undefined),
    listMilestones: vi.fn().mockResolvedValue([]),
    createMilestone: vi.fn().mockResolvedValue({}),
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
    getMeetingLineage: vi.fn().mockResolvedValue({ source: null, children: [], segment_index: null }),
    splitMeeting: vi.fn().mockResolvedValue(SPLIT_RESULT),
    reassignClient: vi.fn().mockResolvedValue(undefined),
    setIgnored: vi.fn().mockResolvedValue(undefined),
    editActionItem: vi.fn().mockResolvedValue(undefined),
    updateArtifactSection: vi.fn().mockResolvedValue(undefined),
    createActionItem: vi.fn().mockResolvedValue(undefined),
    notesList: vi.fn().mockResolvedValue([]),
    notesCreate: vi.fn().mockResolvedValue({}),
    notesUpdate: vi.fn().mockResolvedValue({}),
    notesDelete: vi.fn().mockResolvedValue(undefined),
    notesCount: vi.fn().mockResolvedValue(0),
    getGlossary: vi.fn().mockResolvedValue([]),
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("App split integration", () => {
  it("shows Split button in toolbar after selecting a meeting with no source lineage", async () => {
    render(<App />, { wrapper });
    await screen.findByRole("textbox", { name: /search meetings/i });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(row);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Split" })).toBeDefined();
    });
  });

  it("opens SplitMeetingDialog when Split button is clicked", async () => {
    render(<App />, { wrapper });
    await screen.findByRole("textbox", { name: /search meetings/i });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(row);
    await waitFor(() => screen.getByRole("button", { name: "Split" }));
    fireEvent.click(screen.getByRole("button", { name: "Split" }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeDefined();
    });
  });
});
