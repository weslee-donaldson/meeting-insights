// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SearchPage } from "../../electron-ui/ui/src/pages/SearchPage.js";
import type { EnrichedResult } from "../../electron-ui/ui/src/hooks/useSearchState.js";

afterEach(cleanup);

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
    ...overrides,
  };
}

describe("SearchPage", () => {
  it("returns exactly 1 panel containing SearchForm and SearchResultsList", () => {
    const panels = SearchPage(defaultProps());
    expect(panels).toHaveLength(1);
  });

  it("renders SearchForm query input inside the panel", () => {
    const panels = SearchPage(defaultProps());
    render(<div>{panels}</div>);
    expect(screen.getByRole("textbox", { name: /search query/i })).not.toBeNull();
  });

  it("renders SearchResultsList testid inside the panel", () => {
    const panels = SearchPage(defaultProps());
    render(<div>{panels}</div>);
    expect(screen.getByTestId("search-results-list")).not.toBeNull();
  });
});
