// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSearchState } from "../../electron-ui/ui/src/hooks/useSearchState.js";

afterEach(cleanup);

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  (window as unknown as Record<string, unknown>).api = {
    search: vi.fn().mockResolvedValue([]),
    deepSearch: vi.fn().mockResolvedValue([]),
    artifactBatch: vi.fn().mockResolvedValue({}),
  };
});

const ALL_FIELDS = new Set([
  "summary", "decisions", "action_items", "risk_items",
  "proposed_features", "open_questions", "milestones",
]);

describe("useSearchState skeleton", () => {
  it("returns initial state with all defaults", () => {
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    expect(result.current.searchQuery).toBe("");
    expect(result.current.typedSearchQuery).toBe("");
    expect(result.current.searchFields).toEqual(ALL_FIELDS);
    expect(result.current.dateAfter).toBe("");
    expect(result.current.dateBefore).toBe("");
    expect(result.current.deepSearchEnabled).toBe(false);
    expect(result.current.formVisible).toBe(true);
    expect(result.current.groupBy).toBe("none");
    expect(result.current.sortBy).toBe("relevance");
    expect(result.current.checkedResultIds).toEqual(new Set());
    expect(result.current.selectedResultId).toBe(null);
    expect(result.current.searchDurationMs).toBe(null);
    expect(result.current.displayedCount).toBe(20);
  });

  it("toggleField removes a field that is present", () => {
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.toggleField("summary"));
    const expected = new Set(ALL_FIELDS);
    expected.delete("summary");
    expect(result.current.searchFields).toEqual(expected);
  });

  it("toggleField adds back a field that was removed", () => {
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.toggleField("summary"));
    act(() => result.current.toggleField("summary"));
    expect(result.current.searchFields).toEqual(ALL_FIELDS);
  });

  it("setters update their corresponding state", () => {
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setTypedSearchQuery("billing"));
    expect(result.current.typedSearchQuery).toBe("billing");

    act(() => result.current.setDateAfter("2025-01-01"));
    expect(result.current.dateAfter).toBe("2025-01-01");

    act(() => result.current.setDateBefore("2025-12-31"));
    expect(result.current.dateBefore).toBe("2025-12-31");

    act(() => result.current.setDeepSearchEnabled(true));
    expect(result.current.deepSearchEnabled).toBe(true);

    act(() => result.current.setFormVisible(false));
    expect(result.current.formVisible).toBe(false);

    act(() => result.current.setGroupBy("cluster"));
    expect(result.current.groupBy).toBe("cluster");

    act(() => result.current.setSortBy("date-newest"));
    expect(result.current.sortBy).toBe("date-newest");

    act(() => result.current.setSelectedResultId("m1"));
    expect(result.current.selectedResultId).toBe("m1");

    act(() => result.current.toggleCheckedResultId("m1"));
    expect(result.current.checkedResultIds).toEqual(new Set(["m1"]));

    act(() => result.current.toggleCheckedResultId("m1"));
    expect(result.current.checkedResultIds).toEqual(new Set());
  });

  it("submitSearch sets searchQuery from typedSearchQuery and records start time", () => {
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setTypedSearchQuery("billing migration"));
    act(() => result.current.submitSearch());
    expect(result.current.searchQuery).toBe("billing migration");
  });

  it("displayedCount resets when searchQuery changes", () => {
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setDisplayedCount(40));
    expect(result.current.displayedCount).toBe(40);
    act(() => result.current.setTypedSearchQuery("new query"));
    act(() => result.current.submitSearch());
    expect(result.current.displayedCount).toBe(20);
  });

  it("displayedCount resets when groupBy changes", () => {
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setDisplayedCount(40));
    act(() => result.current.setGroupBy("date"));
    expect(result.current.displayedCount).toBe(20);
  });

  it("displayedCount resets when sortBy changes", () => {
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setDisplayedCount(40));
    act(() => result.current.setSortBy("date-oldest"));
    expect(result.current.displayedCount).toBe(20);
  });
});

describe("useSearchState search wiring", () => {
  it("calls window.api.search with searchView prefix and searchFields on submit", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.8, client: "Acme", meeting_type: "sync", date: "2025-06-01", cluster_tags: ["billing"], series: "Weekly" },
    ]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const { result } = renderHook(
      () => useSearchState({ selectedClient: "Acme" }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setTypedSearchQuery("billing"));
    act(() => result.current.submitSearch());
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => expect(search).toHaveBeenCalled());
    expect(search).toHaveBeenCalledWith({
      query: "billing",
      client: "Acme",
      searchFields: ["summary", "decisions", "action_items", "risk_items", "proposed_features", "open_questions", "milestones"],
    });
    await waitFor(() => expect(result.current.searchResults).toEqual([
      { meeting_id: "m1", score: 0.8, client: "Acme", meeting_type: "sync", date: "2025-06-01", cluster_tags: ["billing"], series: "Weekly" },
    ]));
    expect(result.current.searchFetching).toBe(false);
  });

  it("passes subset of searchFields when fields are toggled off", async () => {
    const search = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.toggleField("milestones"));
    act(() => result.current.toggleField("open_questions"));
    act(() => result.current.setTypedSearchQuery("budget"));
    act(() => result.current.submitSearch());
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => expect(search).toHaveBeenCalled());
    expect(search).toHaveBeenCalledWith({
      query: "budget",
      searchFields: ["summary", "decisions", "action_items", "risk_items", "proposed_features"],
    });
  });

  it("does not call search when query is less than 2 characters", async () => {
    const search = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setTypedSearchQuery("b"));
    act(() => result.current.submitSearch());
    await new Promise((r) => setTimeout(r, 50));
    expect(search).not.toHaveBeenCalled();
  });

  it("exposes hybridMeetingIds from search results", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "sync", date: "2025-06-01", cluster_tags: [], series: "" },
      { meeting_id: "m2", score: 0.7, client: "Acme", meeting_type: "sync", date: "2025-06-02", cluster_tags: [], series: "" },
    ]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setTypedSearchQuery("billing"));
    act(() => result.current.submitSearch());
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => expect(result.current.hybridMeetingIds).toEqual(["m1", "m2"]));
  });

  it("computes searchDurationMs when results arrive", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "sync", date: "2025-06-01", cluster_tags: [], series: "" },
    ]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const { result } = renderHook(
      () => useSearchState({ selectedClient: null }),
      { wrapper: makeWrapper() },
    );
    act(() => result.current.setTypedSearchQuery("billing"));
    act(() => result.current.submitSearch());
    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => expect(result.current.searchResults).toHaveLength(1));
    expect(result.current.searchDurationMs).toEqual(expect.any(Number));
    expect(result.current.searchDurationMs! >= 0).toBe(true);
  });
});
