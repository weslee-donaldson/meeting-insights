// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchPage } from "../../electron-ui/ui/src/pages/SearchPage.js";
import type { EnrichedResult } from "../../electron-ui/ui/src/hooks/useSearchState.js";

afterEach(cleanup);

function makeResult(overrides: Partial<EnrichedResult> = {}): EnrichedResult {
  return {
    meetingId: "m1",
    displayScore: 0.85,
    date: "2026-03-12T10:00:00Z",
    title: "Sprint Planning",
    client: "Acme",
    series: "weekly",
    clusterTags: [],
    artifact: null,
    matchedDecisions: [],
    matchedActionItems: [],
    matchedRisks: [],
    totalDecisions: 0,
    totalActionItems: 0,
    totalRisks: 0,
    deepSearchSummary: null,
    ...overrides,
  };
}

function defaultProps(overrides: Partial<Parameters<typeof SearchPage>[0]> = {}) {
  return {
    typedSearchQuery: "",
    setTypedSearchQuery: vi.fn(),
    searchFields: new Set(["summary", "decisions", "action_items", "risk_items", "proposed_features", "open_questions", "milestones"]),
    toggleField: vi.fn(),
    dateAfter: "",
    setDateAfter: vi.fn(),
    dateBefore: "",
    setDateBefore: vi.fn(),
    deepSearchEnabled: false,
    setDeepSearchEnabled: vi.fn(),
    formVisible: true,
    setFormVisible: vi.fn(),
    groupBy: "none" as const,
    setGroupBy: vi.fn(),
    sortBy: "relevance" as const,
    setSortBy: vi.fn(),
    collapsedSummary: "All fields",
    searchQuery: "",
    onSubmit: vi.fn(),
    enrichedResults: [] as EnrichedResult[],
    searchDurationMs: null as number | null,
    displayedCount: 20,
    setDisplayedCount: vi.fn(),
    checkedResultIds: new Set<string>(),
    onToggleChecked: vi.fn(),
    onSelectAll: vi.fn(),
    onOpen: vi.fn(),
    onSaveAsThread: vi.fn(),
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    selectedResultId: null as string | null,
    onSelectResult: vi.fn(),
    onBackToFullView: vi.fn(),
    onOpenInMeetings: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  (window as unknown as Record<string, unknown>).api = {
    getArtifact: vi.fn().mockResolvedValue(null),
    getCompletions: vi.fn().mockResolvedValue([]),
    getMeetingAssets: vi.fn().mockResolvedValue([]),
    getMeetingThreads: vi.fn().mockResolvedValue([]),
    getMeetingMilestones: vi.fn().mockResolvedValue([]),
    notesCount: vi.fn().mockResolvedValue(0),
  };
});

function renderInQueryProvider(element: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>{element}</QueryClientProvider>,
  );
}

describe("SearchPage", () => {
  it("returns exactly 1 panel containing SearchForm and SearchResultsList when no result selected", () => {
    const panels = SearchPage(defaultProps());
    expect(panels).toHaveLength(1);
  });

  it("renders SearchForm query input inside the panel", () => {
    const panels = SearchPage(defaultProps());
    renderInQueryProvider(<div>{panels}</div>);
    expect(screen.getByRole("textbox", { name: /search query/i })).not.toBeNull();
  });

  it("renders SearchResultsList testid inside the panel", () => {
    const panels = SearchPage(defaultProps());
    renderInQueryProvider(<div>{panels}</div>);
    expect(screen.getByTestId("search-results-list")).not.toBeNull();
  });

  it("returns 2 panels when selectedResultId is set", () => {
    const results = [
      makeResult({ meetingId: "m1", title: "Sprint Planning" }),
      makeResult({ meetingId: "m2", title: "Design Review" }),
    ];
    const panels = SearchPage(defaultProps({
      enrichedResults: results,
      selectedResultId: "m1",
    }));
    expect(panels).toHaveLength(2);
  });

  it("renders CompactResultsSidebar as panel 0 when selectedResultId is set", () => {
    const results = [
      makeResult({ meetingId: "m1", title: "Sprint Planning" }),
      makeResult({ meetingId: "m2", title: "Design Review" }),
    ];
    const panels = SearchPage(defaultProps({
      enrichedResults: results,
      selectedResultId: "m1",
    }));
    renderInQueryProvider(<div>{panels}</div>);
    expect(screen.getByText("Back to full view")).not.toBeNull();
    expect(screen.getByText("Sprint Planning")).not.toBeNull();
    expect(screen.getByText("Design Review")).not.toBeNull();
  });

  it("renders MeetingDetail as panel 1 when selectedResultId is set", () => {
    const results = [makeResult({ meetingId: "m1", title: "Sprint Planning" })];
    const panels = SearchPage(defaultProps({
      enrichedResults: results,
      selectedResultId: "m1",
    }));
    renderInQueryProvider(<div>{panels}</div>);
    expect(screen.getByText("Select a meeting")).not.toBeNull();
  });
});
