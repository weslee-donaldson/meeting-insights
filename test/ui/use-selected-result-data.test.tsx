// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSelectedResultData } from "../../electron-ui/ui/src/hooks/useSelectedResultData.js";

afterEach(cleanup);

const ARTIFACT = {
  summary: "Test summary",
  decisions: [],
  action_items: [],
  open_questions: [],
  risk_items: [],
  proposed_features: [],
  additional_notes: [],
};

const COMPLETIONS = [{ meeting_id: "m1", item_index: 0, note: "done", completed_at: "2026-03-01" }];

const ASSETS = [{ id: "a1", meeting_id: "m1", filename: "doc.pdf", mime_type: "application/pdf", file_size: 1024, created_at: "2026-03-01" }];

const THREAD_TAGS = [{ thread_id: "t1", title: "Thread 1", shorthand: "T1" }];

const MILESTONE_TAGS = [{ milestone_id: "ms1", title: "Milestone 1", target_date: "2026-06-01", status: "active" }];

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  (window as unknown as Record<string, unknown>).api = {
    getArtifact: vi.fn().mockResolvedValue(ARTIFACT),
    getCompletions: vi.fn().mockResolvedValue(COMPLETIONS),
    getMeetingAssets: vi.fn().mockResolvedValue(ASSETS),
    getMeetingThreads: vi.fn().mockResolvedValue(THREAD_TAGS),
    getMeetingMilestones: vi.fn().mockResolvedValue(MILESTONE_TAGS),
    notesCount: vi.fn().mockResolvedValue(3),
  };
});

describe("useSelectedResultData", () => {
  it("returns null data when meetingId is null", () => {
    const { result } = renderHook(
      () => useSelectedResultData(null),
      { wrapper: makeWrapper() },
    );
    expect(result.current).toEqual({
      artifact: null,
      artifactLoading: false,
      completions: [],
      assets: [],
      threadTags: [],
      milestoneTags: [],
      notesCount: 0,
    });
  });

  it("fetches all data for a given meetingId", async () => {
    const { result } = renderHook(
      () => useSelectedResultData("m1"),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.artifact).toEqual(ARTIFACT));
    expect(result.current).toEqual({
      artifact: ARTIFACT,
      artifactLoading: false,
      completions: COMPLETIONS,
      assets: ASSETS,
      threadTags: THREAD_TAGS,
      milestoneTags: MILESTONE_TAGS,
      notesCount: 3,
    });
  });

  it("calls each API with the correct meetingId", async () => {
    const { result } = renderHook(
      () => useSelectedResultData("m42"),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.artifact).toEqual(ARTIFACT));
    expect(window.api.getArtifact).toHaveBeenCalledWith("m42");
    expect(window.api.getCompletions).toHaveBeenCalledWith("m42");
    expect(window.api.getMeetingAssets).toHaveBeenCalledWith("m42");
    expect(window.api.getMeetingThreads).toHaveBeenCalledWith("m42");
    expect(window.api.getMeetingMilestones).toHaveBeenCalledWith("m42");
    expect(window.api.notesCount).toHaveBeenCalledWith("meeting", "m42");
  });

  it("shows artifactLoading true while artifact query is pending", () => {
    (window.api as Record<string, unknown>).getArtifact = vi.fn().mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(
      () => useSelectedResultData("m1"),
      { wrapper: makeWrapper() },
    );
    expect(result.current.artifactLoading).toBe(true);
    expect(result.current.artifact).toBe(null);
  });
});
