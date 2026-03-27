// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

  it("Save as Thread passes checked meeting IDs when some are checked", async () => {
    const onSaveAsThread = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" }), makeResult({ meetingId: "m3" })],
          searchDurationMs: 50,
          checkedResultIds: new Set(["m1", "m3"]),
          onSaveAsThread,
        })}
      />,
    );
    await user.click(screen.getByText("Save as Thread"));
    expect(onSaveAsThread).toHaveBeenCalledWith(["m1", "m3"]);
  });

  it("Save as Thread passes top visible meeting IDs when none are checked", async () => {
    const onSaveAsThread = vi.fn();
    const user = userEvent.setup();
    const results = Array.from({ length: 8 }, (_, i) => makeResult({ meetingId: `m${i}` }));
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: results,
          displayedCount: 3,
          searchDurationMs: 50,
          checkedResultIds: new Set(),
          onSaveAsThread,
        })}
      />,
    );
    await user.click(screen.getByText("Save as Thread"));
    expect(onSaveAsThread).toHaveBeenCalledWith(["m0", "m1", "m2"]);
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

describe("SearchResultsList — empty states", () => {
  it("renders initial state with search icon and helper text when no query", () => {
    render(
      <SearchResultsList
        {...defaultProps({ searchQuery: "", enrichedResults: [] })}
      />,
    );
    expect(screen.getByText("Search across all meetings")).toBeDefined();
    expect(screen.getByText("Enter a query above to search decisions, action items, risks, and more.")).toBeDefined();
    expect(screen.getByTestId("empty-state-initial")).toBeDefined();
  });

  it("renders no-results state when query present but no results", () => {
    render(
      <SearchResultsList
        {...defaultProps({ searchQuery: "nonexistent", enrichedResults: [] })}
      />,
    );
    expect(screen.getByText("No meetings match your search")).toBeDefined();
    expect(screen.getByText("Try broadening your search, adjusting filters, or searching in more fields.")).toBeDefined();
    expect(screen.getByTestId("empty-state-no-results")).toBeDefined();
  });

  it("renders loading state with spinner text when isLoading and no results", () => {
    render(
      <SearchResultsList
        {...defaultProps({ searchQuery: "billing", enrichedResults: [], isLoading: true })}
      />,
    );
    expect(screen.getByText("Searching...")).toBeDefined();
    expect(screen.getByTestId("empty-state-loading")).toBeDefined();
  });

  it("renders error state with retry link when isError", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchResultsList
        {...defaultProps({
          searchQuery: "billing",
          enrichedResults: [],
          isError: true,
          onRetry,
        })}
      />,
    );
    expect(screen.getByText("Search failed.")).toBeDefined();
    const retryLink = screen.getByText("Try again.");
    await user.click(retryLink);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("loading state takes priority over no-results when isLoading", () => {
    render(
      <SearchResultsList
        {...defaultProps({ searchQuery: "billing", enrichedResults: [], isLoading: true })}
      />,
    );
    expect(screen.queryByText("No meetings match your search")).toBeNull();
    expect(screen.getByText("Searching...")).toBeDefined();
  });

  it("error state takes priority over loading when both isError and isLoading", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          searchQuery: "billing",
          enrichedResults: [],
          isError: true,
          isLoading: true,
        })}
      />,
    );
    expect(screen.getByText("Search failed.")).toBeDefined();
    expect(screen.queryByText("Searching...")).toBeNull();
  });
});

describe("SearchResultsList — grouping", () => {
  const clusterResults = [
    makeResult({ meetingId: "m1", clusterTags: ["billing"], displayScore: 0.92 }),
    makeResult({ meetingId: "m2", clusterTags: ["billing"], displayScore: 0.80 }),
    makeResult({ meetingId: "m3", clusterTags: ["onboarding"], displayScore: 0.95 }),
    makeResult({ meetingId: "m4", clusterTags: [], displayScore: 0.70 }),
  ];

  it("renders flat list with no group headers when groupBy is none", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: clusterResults,
          searchDurationMs: 100,
          groupBy: "none",
        })}
      />,
    );
    expect(screen.getAllByTestId(/^search-result-card-/)).toHaveLength(4);
    expect(screen.queryByTestId(/^group-header-/)).toBeNull();
  });

  it("groups by cluster tag with group headers and count", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: clusterResults,
          searchDurationMs: 100,
          groupBy: "cluster",
        })}
      />,
    );
    expect(screen.getByTestId("group-header-billing")).toBeDefined();
    expect(screen.getByTestId("group-header-onboarding")).toBeDefined();
    expect(screen.getByTestId("group-header-uncategorized")).toBeDefined();
    expect(screen.getByText("billing (2)")).toBeDefined();
    expect(screen.getByText("onboarding (1)")).toBeDefined();
    expect(screen.getByText("Uncategorized (1)")).toBeDefined();
  });

  it("groups by date (month) with formatted headers", () => {
    const dateResults = [
      makeResult({ meetingId: "m1", date: "2026-03-12T10:00:00.000Z", displayScore: 0.92 }),
      makeResult({ meetingId: "m2", date: "2026-03-05T10:00:00.000Z", displayScore: 0.80 }),
      makeResult({ meetingId: "m3", date: "2026-02-28T10:00:00.000Z", displayScore: 0.95 }),
    ];
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: dateResults,
          searchDurationMs: 100,
          groupBy: "date",
        })}
      />,
    );
    expect(screen.getByText("March 2026 (2)")).toBeDefined();
    expect(screen.getByText("February 2026 (1)")).toBeDefined();
  });

  it("groups by series with series name headers", () => {
    const seriesResults = [
      makeResult({ meetingId: "m1", series: "sprint planning", displayScore: 0.92 }),
      makeResult({ meetingId: "m2", series: "sprint planning", displayScore: 0.80 }),
      makeResult({ meetingId: "m3", series: "weekly sync", displayScore: 0.95 }),
    ];
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: seriesResults,
          searchDurationMs: 100,
          groupBy: "series",
        })}
      />,
    );
    expect(screen.getByText("sprint planning (2)")).toBeDefined();
    expect(screen.getByText("weekly sync (1)")).toBeDefined();
  });

  it("sorts within groups by score descending", () => {
    const scored = [
      makeResult({ meetingId: "low", clusterTags: ["billing"], displayScore: 0.50 }),
      makeResult({ meetingId: "high", clusterTags: ["billing"], displayScore: 0.99 }),
    ];
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: scored,
          searchDurationMs: 100,
          groupBy: "cluster",
        })}
      />,
    );
    const cards = screen.getAllByTestId(/^search-result-card-/);
    expect(cards[0].getAttribute("data-testid")).toBe("search-result-card-high");
    expect(cards[1].getAttribute("data-testid")).toBe("search-result-card-low");
  });

  it("renders Select all in group button that selects all ids in that group", async () => {
    const onSelectAll = vi.fn();
    const user = userEvent.setup();
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: clusterResults,
          searchDurationMs: 100,
          groupBy: "cluster",
          onSelectAll,
        })}
      />,
    );
    const selectButtons = screen.getAllByRole("button", { name: /Select all in group/ });
    expect(selectButtons.length).toBe(3);
    await user.click(selectButtons[0]);
    expect(onSelectAll).toHaveBeenCalledWith(["m1", "m2"]);
  });
});

describe("SearchResultsList — focus management and ARIA", () => {
  it("renders results container with role listbox and tabIndex 0", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" })],
          searchDurationMs: 100,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    expect(listbox.getAttribute("tabindex")).toBe("0");
  });

  it("renders focused card with #e0ddd8 outline when list receives focus", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" })],
          searchDurationMs: 100,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    const firstCard = screen.getByTestId("search-result-card-m1");
    expect(firstCard.style.outline).toBe("2px solid #e0ddd8");
  });

  it("calls onEscapeToSearch when Escape is pressed on the results list", () => {
    const onEscapeToSearch = vi.fn();
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" })],
          searchDurationMs: 100,
          onEscapeToSearch,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "Escape" });
    expect(onEscapeToSearch).toHaveBeenCalledOnce();
  });

  it("does not show focus outline on any card when list is not focused", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" })],
          searchDurationMs: 100,
        })}
      />,
    );
    const cards = screen.getAllByTestId(/^search-result-card-/);
    for (const card of cards) {
      expect(card.style.outline).toBe("");
    }
  });

  it("moves focus to next result on ArrowDown", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" }), makeResult({ meetingId: "m3" })],
          searchDurationMs: 100,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    const secondCard = screen.getByTestId("search-result-card-m2");
    expect(secondCard.style.outline).toBe("2px solid #e0ddd8");
    const firstCard = screen.getByTestId("search-result-card-m1");
    expect(firstCard.style.outline).toBe("");
  });

  it("moves focus to previous result on ArrowUp", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" }), makeResult({ meetingId: "m3" })],
          searchDurationMs: 100,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    const firstCard = screen.getByTestId("search-result-card-m1");
    expect(firstCard.style.outline).toBe("2px solid #e0ddd8");
  });

  it("does not move focus above index 0 on ArrowUp", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" })],
          searchDurationMs: 100,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    const firstCard = screen.getByTestId("search-result-card-m1");
    expect(firstCard.style.outline).toBe("2px solid #e0ddd8");
  });

  it("does not move focus below the last result on ArrowDown", () => {
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" })],
          displayedCount: 2,
          searchDurationMs: 100,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    const secondCard = screen.getByTestId("search-result-card-m2");
    expect(secondCard.style.outline).toBe("2px solid #e0ddd8");
  });

  it("opens focused result on Enter", () => {
    const onOpen = vi.fn();
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" })],
          searchDurationMs: 100,
          onOpen,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "Enter" });
    expect(onOpen).toHaveBeenCalledWith("m2");
  });

  it("toggles checked state of focused result on Space", () => {
    const onToggleChecked = vi.fn();
    render(
      <SearchResultsList
        {...defaultProps({
          enrichedResults: [makeResult({ meetingId: "m1" }), makeResult({ meetingId: "m2" })],
          searchDurationMs: 100,
          onToggleChecked,
        })}
      />,
    );
    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: " " });
    expect(onToggleChecked).toHaveBeenCalledWith("m1");
  });
});
