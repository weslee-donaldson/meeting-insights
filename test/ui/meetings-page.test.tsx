// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, beforeEach, it, expect, vi } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MeetingsPage } from "../../electron-ui/ui/src/pages/MeetingsPage.js";
import { LinearShell } from "../../electron-ui/ui/src/components/LinearShell.js";

afterEach(cleanup);

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  (window as unknown as Record<string, unknown>).api = {
    getGlossary: vi.fn().mockResolvedValue([]),
  };
});

function makeProps() {
  return {
    scopeMeetings: [],
    selectedMeetingId: null,
    checkedMeetingIds: new Set<string>(),
    groupBy: "series" as const,
    onGroupBy: vi.fn(),
    sortBy: "date-desc" as const,
    onSortBy: vi.fn(),
    searchScores: undefined,
    onSelect: vi.fn(),
    onCheck: vi.fn(),
    onCheckGroup: vi.fn(),
    searchFetching: false,
    searchQuery: "",
    meetingsLoading: false,
    hasFilters: false,
    onDelete: vi.fn(),
    onNewMeeting: vi.fn(),
    newMeetingIds: new Set<string>(),
    deepSearchSummaries: undefined,
    isDeepSearchActive: false,
    deepSearchLoading: false,
    deepSearchEmpty: false,
    isMultiMode: false,
    checkedMeetings: [],
    selectedMeeting: null,
    artifact: null,
    artifactLoading: false,
    clients: [],
    onReExtract: undefined,
    reExtractPending: false,
    onReassignClient: undefined,
    onIgnore: undefined,
    completions: [],
    onComplete: undefined,
    onUncomplete: undefined,
    mergedCompletions: [],
    onMultiComplete: undefined,
    onMultiUncomplete: undefined,
    mentionStats: [],
    onMentionClick: undefined,
    onThreadClick: vi.fn(),
    onMilestoneClick: vi.fn(),
  };
}

describe("MeetingsPage", () => {
  it("returns exactly 2 panels for 3-zone layout (sidebar + detail)", () => {
    const panels = MeetingsPage(makeProps());
    expect(panels).toHaveLength(2);
  });

  it("renders within LinearShell with sidebar at 300px default and detail flex", () => {
    const panels = MeetingsPage(makeProps());
    render(
      <QueryClientProvider client={queryClient}>
        <LinearShell
          topBar={<div>top</div>}
          panels={panels}
          viewId="meetings"
        />
      </QueryClientProvider>,
    );
    const sidebar = screen.getByTestId("panel-0");
    expect(sidebar.style.width).toBe("300px");
    expect(sidebar.className).toContain("bg-[var(--color-bg-surface)]");
    expect(sidebar.className).toContain("border-r");
    const detail = screen.getByTestId("panel-1");
    expect(detail.className).toContain("flex-1");
  });
});
