// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "../../electron-ui/ui/src/App.js";
import type { HealthStatus } from "../../core/system-health.js";

afterEach(cleanup);

const criticalHealth: HealthStatus = {
  status: "critical",
  error_groups: [
    {
      error_type: "api_error",
      severity: "critical",
      count: 3,
      latest_message: "[api_error] 402 Insufficient funds",
      latest_meeting_filename: "standup.json",
      provider: "openai",
      resolution_hint: "Check your LLM provider account billing and API key validity",
    },
  ],
  meetings_without_artifact: 3,
  last_error_at: "2026-04-07 10:00:00",
};

const healthyHealth: HealthStatus = {
  status: "healthy",
  error_groups: [],
  meetings_without_artifact: 0,
  last_error_at: null,
};

function makeApi(health: HealthStatus | Error) {
  return {
    getClients: vi.fn().mockResolvedValue([]),
    getMeetings: vi.fn().mockResolvedValue([]),
    getArtifact: vi.fn().mockResolvedValue(null),
    chat: vi.fn().mockResolvedValue({ answer: "", sources: [], charCount: 0 }),
    conversationChat: vi.fn().mockResolvedValue({ answer: "", sources: [], charCount: 0 }),
    search: vi.fn().mockResolvedValue([]),
    getCompletions: vi.fn().mockResolvedValue([]),
    completeActionItem: vi.fn().mockResolvedValue(undefined),
    deleteMeetings: vi.fn().mockResolvedValue(undefined),
    getMentionStats: vi.fn().mockResolvedValue([]),
    getItemHistory: vi.fn().mockResolvedValue([]),
    getDefaultClient: vi.fn().mockResolvedValue(null),
    getClientActionItems: vi.fn().mockResolvedValue([]),
    getTemplates: vi.fn().mockResolvedValue([]),
    uncompleteActionItem: vi.fn().mockResolvedValue(undefined),
    reExtract: vi.fn().mockResolvedValue(undefined),
    reEmbedMeeting: vi.fn().mockResolvedValue(undefined),
    createMeeting: vi.fn().mockResolvedValue({ meetingId: "new" }),
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
    threadChat: vi.fn().mockResolvedValue({ answer: "", sources: [] }),
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
    insightChat: vi.fn().mockResolvedValue({ answer: "", sources: [] }),
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
    milestoneChat: vi.fn().mockResolvedValue({ answer: "", sources: [] }),
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
    meetingChat: vi.fn().mockResolvedValue({ answer: "", sources: [] }),
    clearMeetingMessages: vi.fn().mockResolvedValue(undefined),
    getGlossary: vi.fn().mockResolvedValue([]),
    notesList: vi.fn().mockResolvedValue([]),
    notesCreate: vi.fn().mockResolvedValue({}),
    notesUpdate: vi.fn().mockResolvedValue({}),
    notesDelete: vi.fn().mockResolvedValue(undefined),
    notesCount: vi.fn().mockResolvedValue(0),
    linkMilestoneActionItem: vi.fn().mockResolvedValue(undefined),
    setIgnored: vi.fn().mockResolvedValue(undefined),
    reassignClient: vi.fn().mockResolvedValue(undefined),
    editActionItem: vi.fn().mockResolvedValue(undefined),
    createActionItem: vi.fn().mockResolvedValue(undefined),
    updateArtifactSection: vi.fn().mockResolvedValue(undefined),
    getHealth: health instanceof Error
      ? vi.fn().mockRejectedValue(health)
      : vi.fn().mockResolvedValue(health),
    acknowledgeHealthErrors: vi.fn().mockResolvedValue(undefined),
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("App health banner integration", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
  });

  it("shows red banner when health is critical", async () => {
    (window as unknown as Record<string, unknown>).api = makeApi(criticalHealth);
    render(<App />, { wrapper });
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.some(a => a.className.includes("bg-red-600"))).toBe(true);
    });
  });

  it("does not show banner when health is healthy", async () => {
    (window as unknown as Record<string, unknown>).api = makeApi(healthyHealth);
    render(<App />, { wrapper });
    await waitFor(() => {
      expect(screen.queryAllByRole("alert").length).toBe(0);
    }, { timeout: 2000 });
  });

  it("shows gray banner when health endpoint is unreachable", async () => {
    (window as unknown as Record<string, unknown>).api = makeApi(new Error("Network error"));
    render(<App />, { wrapper });
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.some(a => a.className.includes("bg-gray-600"))).toBe(true);
    });
  });

  it("calls acknowledgeHealthErrors when dismiss is clicked", async () => {
    const api = makeApi(criticalHealth);
    (window as unknown as Record<string, unknown>).api = api;
    render(<App />, { wrapper });
    await waitFor(() => {
      const alerts = screen.queryAllByRole("alert");
      expect(alerts.some(a => a.className.includes("bg-red-600"))).toBe(true);
    });
    const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissBtn);
    expect(api.acknowledgeHealthErrors).toHaveBeenCalled();
  });
});
