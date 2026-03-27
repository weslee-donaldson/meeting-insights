// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchResultsList } from "../../electron-ui/ui/src/components/SearchResultsList.js";
import type { EnrichedResult } from "../../electron-ui/ui/src/hooks/useSearchState.js";

afterEach(cleanup);

function makeResult(overrides: Partial<EnrichedResult> = {}): EnrichedResult {
  return {
    meetingId: "m1",
    displayScore: 0.92,
    date: "2026-03-12T10:00:00.000Z",
    title: "Sprint Planning",
    client: "Acme",
    series: "sprint planning",
    clusterTags: ["onboarding", "billing"],
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

function defaultProps(overrides: Partial<Parameters<typeof SearchResultsList>[0]> = {}) {
  return {
    enrichedResults: [] as EnrichedResult[],
    searchDurationMs: null as number | null,
    displayedCount: 20,
    setDisplayedCount: vi.fn(),
    checkedResultIds: new Set<string>(),
    onToggleChecked: vi.fn(),
    onSelectAll: vi.fn(),
    onOpen: vi.fn(),
    onSaveAsThread: vi.fn(),
    groupBy: "none" as const,
    sortBy: "relevance" as const,
    searchQuery: "billing migration",
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    ...overrides,
  };
}

describe("SearchResultsList — results header", () => {
  it("renders result count and search duration", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult(), makeResult({ meetingId: "m2" })],
          searchDurationMs: 300,
        })}
      />,
    );
    expect(screen.getByText("2 results")).toBeDefined();
    expect(screen.getByText("in 0.3s")).toBeDefined();
  });

  it("renders Select all outline button that calls onSelectAll with all visible ids", async () => {
    const onSelectAll = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" })],
          searchDurationMs: 100,
          onSelectAll,
        })}
      />,
    );
    const btn = screen.getByRole("button", { name: "Select all" });
    expect(btn.className).toContain("border");
    await user.click(btn);
    expect(onSelectAll).toHaveBeenCalledWith(["m1", "m2"]);
  });

  it("renders Save as Thread text link that calls onSaveAsThread", async () => {
    const onSaveAsThread = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult()],
          searchDurationMs: 50,
          onSaveAsThread,
        })}
      />,
    );
    const link = screen.getByText("Save as Thread");
    await user.click(link);
    expect(onSaveAsThread).toHaveBeenCalledOnce();
  });

  it("does not render header when there are no results and no query", () => {
    render(
      <SearchResultsList
        {...defaultProps({ searchQuery: "", enrichedResults: [] })}
      />,
    );
    expect(screen.queryByText(/results/)).toBeNull();
  });

  it("uses design-token styles for count and duration text", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult()],
          searchDurationMs: 1200,
        })}
      />,
    );
    const count = screen.getByText("1 results");
    expect(count.className).toContain("font-semibold");
    const duration = screen.getByText("in 1.2s");
    expect(duration.className).toContain("text-[var(--color-text-muted)]");
  });
});

describe("SearchResultsList — card list + pagination", () => {
  it("renders SearchResultCards up to displayedCount", () => {
    const results = Array.from({ length: 5 }, (_, i) =>
      makeResult({ meetingId: `m${i}` }),
    );
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: results,
          displayedCount: 3,
          searchDurationMs: 100,
        })}
      />,
    );
    expect(screen.getAllByTestId(/^search-result-card-/)).toHaveLength(3);
  });

  it("shows partial pagination with Load more link", () => {
    const results = Array.from({ length: 14 }, (_, i) =>
      makeResult({ meetingId: `m${i}` }),
    );
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: results,
          displayedCount: 5,
          searchDurationMs: 100,
        })}
      />,
    );
    expect(screen.getByText("Showing 5 of 14")).toBeDefined();
    const loadMore = screen.getByText("Load more");
    expect(loadMore.className).toContain("var(--color-accent)");
  });

  it("calls setDisplayedCount with incremented value on Load more click", async () => {
    const setDisplayedCount = vi.fn();
    const user = userEvent.setup();
    const results = Array.from({ length: 14 }, (_, i) =>
      makeResult({ meetingId: `m${i}` }),
    );
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: results,
          displayedCount: 5,
          searchDurationMs: 100,
          setDisplayedCount,
        })}
      />,
    );
    await user.click(screen.getByText("Load more"));
    expect(setDisplayedCount).toHaveBeenCalledWith(25);
  });

  it("shows all-loaded state when displayedCount >= total", () => {
    const results = Array.from({ length: 14 }, (_, i) =>
      makeResult({ meetingId: `m${i}` }),
    );
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: results,
          displayedCount: 20,
          searchDurationMs: 100,
        })}
      />,
    );
    expect(screen.getByText("Showing all 14 results")).toBeDefined();
  });

  it("shows loading state for pagination when isLoading and has results", () => {
    const results = Array.from({ length: 14 }, (_, i) =>
      makeResult({ meetingId: `m${i}` }),
    );
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: results,
          displayedCount: 5,
          searchDurationMs: 100,
          isLoading: true,
        })}
      />,
    );
    expect(screen.getByText("Showing 5 of 14")).toBeDefined();
    expect(screen.getByText("Loading...")).toBeDefined();
    expect(screen.queryByText("Load more")).toBeNull();
  });
});
