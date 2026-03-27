// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchForm } from "../../electron-ui/ui/src/components/SearchForm.js";
import { SearchResultsList } from "../../electron-ui/ui/src/components/SearchResultsList.js";
import type { EnrichedResult } from "../../electron-ui/ui/src/hooks/useSearchState.js";
import { useSearchState } from "../../electron-ui/ui/src/hooks/useSearchState.js";

afterEach(cleanup);

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

function SearchFormWithState({ selectedClient }: { selectedClient: string | null }) {
  const state = useSearchState({ selectedClient });
  return (
    <SearchForm
      typedSearchQuery={state.typedSearchQuery}
      setTypedSearchQuery={state.setTypedSearchQuery}
      searchFields={state.searchFields}
      toggleField={state.toggleField}
      dateAfter={state.dateAfter}
      setDateAfter={state.setDateAfter}
      dateBefore={state.dateBefore}
      setDateBefore={state.setDateBefore}
      deepSearchEnabled={state.deepSearchEnabled}
      setDeepSearchEnabled={state.setDeepSearchEnabled}
      formVisible={state.formVisible}
      setFormVisible={state.setFormVisible}
      groupBy={state.groupBy}
      setGroupBy={state.setGroupBy}
      sortBy={state.sortBy}
      setSortBy={state.setSortBy}
      collapsedSummary={state.collapsedSummary}
      searchQuery={state.searchQuery}
      onSubmit={state.submitSearch}
    />
  );
}

let searchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  searchMock = vi.fn().mockResolvedValue([]);
  (window as unknown as Record<string, unknown>).api = {
    search: searchMock,
    deepSearch: vi.fn().mockResolvedValue([]),
    artifactBatch: vi.fn().mockResolvedValue({}),
  };
});

describe("SearchForm -> useSearchState -> useSearch -> API param integration", () => {
  it("toggling a field pill off in SearchForm excludes it from the API search call", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SearchFormWithState selectedClient={null} />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: /toggle milestones/i }));

    const input = screen.getByRole("textbox", { name: /search query/i });
    fireEvent.change(input, { target: { value: "billing" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(searchMock).toHaveBeenCalled());
    expect(searchMock).toHaveBeenCalledWith({
      query: "billing",
      searchFields: ["summary", "decisions", "action_items", "risk_items", "proposed_features", "open_questions"],
    });
  });

  it("submitting with all fields sends all 7 searchFields to the API", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SearchFormWithState selectedClient="Acme" />
      </Wrapper>,
    );

    const input = screen.getByRole("textbox", { name: /search query/i });
    fireEvent.change(input, { target: { value: "budget" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(searchMock).toHaveBeenCalled());
    expect(searchMock).toHaveBeenCalledWith({
      query: "budget",
      client: "Acme",
      searchFields: ["summary", "decisions", "action_items", "risk_items", "proposed_features", "open_questions", "milestones"],
    });
  });

  it("toggling multiple fields off sends only remaining fields", async () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SearchFormWithState selectedClient={null} />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: /toggle risks/i }));
    fireEvent.click(screen.getByRole("button", { name: /toggle features/i }));
    fireEvent.click(screen.getByRole("button", { name: /toggle questions/i }));
    fireEvent.click(screen.getByRole("button", { name: /toggle milestones/i }));

    const input = screen.getByRole("textbox", { name: /search query/i });
    fireEvent.change(input, { target: { value: "revenue" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(searchMock).toHaveBeenCalled());
    expect(searchMock).toHaveBeenCalledWith({
      query: "revenue",
      searchFields: ["summary", "decisions", "action_items"],
    });
  });
});

function makeResult(overrides: Partial<EnrichedResult> = {}): EnrichedResult {
  return {
    meetingId: "m1",
    displayScore: 0.92,
    date: "2026-03-12T10:00:00.000Z",
    title: "Sprint Planning",
    client: "Acme",
    series: "sprint planning",
    clusterTags: ["onboarding"],
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

function defaultListProps(overrides: Partial<Parameters<typeof SearchResultsList>[0]> = {}) {
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
    searchQuery: "billing",
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    ...overrides,
  };
}

describe("enrichedResults -> SearchResultsList -> SearchResultCard integration", () => {
  it("renders WHY block when enrichedResult has deepSearchSummary", () => {
    render(
      <SearchResultsList
        {...defaultListProps({
          enrichedResults: [
            makeResult({
              meetingId: "m1",
              deepSearchSummary: "Discusses billing migration timeline in detail",
            }),
          ],
          searchDurationMs: 100,
        })}
      />,
    );
    expect(screen.getByTestId("why-block")).not.toBeNull();
    expect(screen.getByText("Discusses billing migration timeline in detail")).not.toBeNull();
    expect(screen.getByText("WHY")).not.toBeNull();
  });

  it("does not render WHY block when deepSearchSummary is null", () => {
    render(
      <SearchResultsList
        {...defaultListProps({
          enrichedResults: [makeResult({ meetingId: "m1", deepSearchSummary: null })],
          searchDurationMs: 100,
        })}
      />,
    );
    expect(screen.queryByTestId("why-block")).toBeNull();
  });

  it("renders group headers when groupBy is cluster", () => {
    render(
      <SearchResultsList
        {...defaultListProps({
          enrichedResults: [
            makeResult({ meetingId: "m1", clusterTags: ["billing"] }),
            makeResult({ meetingId: "m2", clusterTags: ["onboarding"] }),
          ],
          groupBy: "cluster",
          searchDurationMs: 50,
        })}
      />,
    );
    expect(screen.getByTestId("group-header-billing")).not.toBeNull();
    expect(screen.getByTestId("group-header-onboarding")).not.toBeNull();
  });

  it("renders group headers when groupBy is series", () => {
    render(
      <SearchResultsList
        {...defaultListProps({
          enrichedResults: [
            makeResult({ meetingId: "m1", series: "Sprint Planning" }),
            makeResult({ meetingId: "m2", series: "Design Review" }),
          ],
          groupBy: "series",
          searchDurationMs: 50,
        })}
      />,
    );
    expect(screen.getByTestId("group-header-Sprint Planning")).not.toBeNull();
    expect(screen.getByTestId("group-header-Design Review")).not.toBeNull();
  });

  it("renders group headers when groupBy is date (month grouping)", () => {
    render(
      <SearchResultsList
        {...defaultListProps({
          enrichedResults: [
            makeResult({ meetingId: "m1", date: "2026-03-12T10:00:00.000Z" }),
            makeResult({ meetingId: "m2", date: "2026-02-05T10:00:00.000Z" }),
          ],
          groupBy: "date",
          searchDurationMs: 50,
        })}
      />,
    );
    expect(screen.getByTestId("group-header-2026-03")).not.toBeNull();
    expect(screen.getByTestId("group-header-2026-02")).not.toBeNull();
  });

  it("sorts results by displayScore within groups (highest first)", () => {
    render(
      <SearchResultsList
        {...defaultListProps({
          enrichedResults: [
            makeResult({ meetingId: "m-low", displayScore: 0.3, title: "Low Score" }),
            makeResult({ meetingId: "m-high", displayScore: 0.95, title: "High Score" }),
            makeResult({ meetingId: "m-mid", displayScore: 0.6, title: "Mid Score" }),
          ],
          searchDurationMs: 50,
        })}
      />,
    );
    const cards = screen.getAllByRole("option");
    expect(cards[0].getAttribute("aria-label")).toContain("High Score");
    expect(cards[1].getAttribute("aria-label")).toContain("Mid Score");
    expect(cards[2].getAttribute("aria-label")).toContain("Low Score");
  });
});

function ChatMeetingIdsWiringHarness({ selectedClient }: { selectedClient: string | null }) {
  const state = useSearchState({ selectedClient });
  return (
    <div>
      <div data-testid="chat-meeting-count">{state.chatMeetingIds.length}</div>
      <div data-testid="chat-meeting-ids">{state.chatMeetingIds.join(",")}</div>
      <input
        data-testid="query-input"
        value={state.typedSearchQuery}
        onChange={(e) => state.setTypedSearchQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") state.submitSearch(); }}
      />
      <button data-testid="check-m1" onClick={() => state.toggleCheckedResultId("m1")}>Check m1</button>
      <button data-testid="check-m3" onClick={() => state.toggleCheckedResultId("m3")}>Check m3</button>
      <button data-testid="uncheck-m1" onClick={() => state.toggleCheckedResultId("m1")}>Uncheck m1</button>
      <button data-testid="select-m2" onClick={() => state.setSelectedResultId("m2")}>Select m2</button>
      <button data-testid="deselect" onClick={() => state.setSelectedResultId(null)}>Deselect</button>
    </div>
  );
}

describe("checkedResultIds -> chatMeetingIds -> computedActiveMeetingIds wiring", () => {
  it("chatMeetingIds defaults to top-N by score when no results are checked", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "sync", date: "2026-01-01", cluster_tags: [], series: "" },
      { meeting_id: "m2", score: 0.7, client: "Acme", meeting_type: "sync", date: "2026-01-02", cluster_tags: [], series: "" },
      { meeting_id: "m3", score: 0.5, client: "Acme", meeting_type: "sync", date: "2026-01-03", cluster_tags: [], series: "" },
    ]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <ChatMeetingIdsWiringHarness selectedClient={null} />
      </Wrapper>,
    );
    const input = screen.getByTestId("query-input");
    fireEvent.change(input, { target: { value: "billing" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(screen.getByTestId("chat-meeting-ids").textContent).toBe("m1,m2,m3"));
    expect(screen.getByTestId("chat-meeting-count").textContent).toBe("3");
  });

  it("checking specific results switches chatMeetingIds to checked set", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "sync", date: "2026-01-01", cluster_tags: [], series: "" },
      { meeting_id: "m2", score: 0.7, client: "Acme", meeting_type: "sync", date: "2026-01-02", cluster_tags: [], series: "" },
      { meeting_id: "m3", score: 0.5, client: "Acme", meeting_type: "sync", date: "2026-01-03", cluster_tags: [], series: "" },
    ]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <ChatMeetingIdsWiringHarness selectedClient={null} />
      </Wrapper>,
    );
    const qi = screen.getByTestId("query-input");
    fireEvent.change(qi, { target: { value: "billing" } });
    fireEvent.keyDown(qi, { key: "Enter" });
    await waitFor(() => expect(screen.getByTestId("chat-meeting-count").textContent).toBe("3"));

    fireEvent.click(screen.getByTestId("check-m1"));
    fireEvent.click(screen.getByTestId("check-m3"));
    expect(screen.getByTestId("chat-meeting-ids").textContent).toBe("m1,m3");
    expect(screen.getByTestId("chat-meeting-count").textContent).toBe("2");
  });

  it("unchecking all reverts chatMeetingIds to top-N by score", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "sync", date: "2026-01-01", cluster_tags: [], series: "" },
      { meeting_id: "m2", score: 0.7, client: "Acme", meeting_type: "sync", date: "2026-01-02", cluster_tags: [], series: "" },
    ]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <ChatMeetingIdsWiringHarness selectedClient={null} />
      </Wrapper>,
    );
    const qi = screen.getByTestId("query-input");
    fireEvent.change(qi, { target: { value: "billing" } });
    fireEvent.keyDown(qi, { key: "Enter" });
    await waitFor(() => expect(screen.getByTestId("chat-meeting-count").textContent).toBe("2"));

    fireEvent.click(screen.getByTestId("check-m1"));
    expect(screen.getByTestId("chat-meeting-ids").textContent).toBe("m1");

    fireEvent.click(screen.getByTestId("uncheck-m1"));
    expect(screen.getByTestId("chat-meeting-ids").textContent).toBe("m1,m2");
  });

  it("selecting a result for detail overrides chatMeetingIds to just that result", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "sync", date: "2026-01-01", cluster_tags: [], series: "" },
      { meeting_id: "m2", score: 0.7, client: "Acme", meeting_type: "sync", date: "2026-01-02", cluster_tags: [], series: "" },
    ]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <ChatMeetingIdsWiringHarness selectedClient={null} />
      </Wrapper>,
    );
    const qi = screen.getByTestId("query-input");
    fireEvent.change(qi, { target: { value: "billing" } });
    fireEvent.keyDown(qi, { key: "Enter" });
    await waitFor(() => expect(screen.getByTestId("chat-meeting-count").textContent).toBe("2"));

    fireEvent.click(screen.getByTestId("select-m2"));
    expect(screen.getByTestId("chat-meeting-ids").textContent).toBe("m2");
    expect(screen.getByTestId("chat-meeting-count").textContent).toBe("1");
  });

  it("deselecting a result reverts chatMeetingIds to checked set or top-N", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "sync", date: "2026-01-01", cluster_tags: [], series: "" },
      { meeting_id: "m2", score: 0.7, client: "Acme", meeting_type: "sync", date: "2026-01-02", cluster_tags: [], series: "" },
    ]);
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch: vi.fn().mockResolvedValue({}),
    };
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <ChatMeetingIdsWiringHarness selectedClient={null} />
      </Wrapper>,
    );
    const qi = screen.getByTestId("query-input");
    fireEvent.change(qi, { target: { value: "billing" } });
    fireEvent.keyDown(qi, { key: "Enter" });
    await waitFor(() => expect(screen.getByTestId("chat-meeting-count").textContent).toBe("2"));

    fireEvent.click(screen.getByTestId("check-m1"));
    fireEvent.click(screen.getByTestId("select-m2"));
    expect(screen.getByTestId("chat-meeting-ids").textContent).toBe("m2");

    fireEvent.click(screen.getByTestId("deselect"));
    expect(screen.getByTestId("chat-meeting-ids").textContent).toBe("m1");
    expect(screen.getByTestId("chat-meeting-count").textContent).toBe("1");
  });
});

function FullFlowHarness({ selectedClient }: { selectedClient: string | null }) {
  const state = useSearchState({ selectedClient });
  return (
    <div>
      <SearchForm
        typedSearchQuery={state.typedSearchQuery}
        setTypedSearchQuery={state.setTypedSearchQuery}
        searchFields={state.searchFields}
        toggleField={state.toggleField}
        dateAfter={state.dateAfter}
        setDateAfter={state.setDateAfter}
        dateBefore={state.dateBefore}
        setDateBefore={state.setDateBefore}
        deepSearchEnabled={state.deepSearchEnabled}
        setDeepSearchEnabled={state.setDeepSearchEnabled}
        formVisible={state.formVisible}
        setFormVisible={state.setFormVisible}
        groupBy={state.groupBy}
        setGroupBy={state.setGroupBy}
        sortBy={state.sortBy}
        setSortBy={state.setSortBy}
        collapsedSummary={state.collapsedSummary}
        searchQuery={state.searchQuery}
        onSubmit={state.submitSearch}
      />
      <SearchResultsList
        enrichedResults={state.enrichedResults}
        searchDurationMs={state.searchDurationMs}
        displayedCount={state.displayedCount}
        setDisplayedCount={state.setDisplayedCount}
        checkedResultIds={state.checkedResultIds}
        onToggleChecked={state.toggleCheckedResultId}
        onSelectAll={(ids: string[]) => ids.forEach((id) => state.toggleCheckedResultId(id))}
        onOpen={(id: string) => state.setSelectedResultId(id)}
        onSaveAsThread={vi.fn()}
        groupBy={state.groupBy}
        sortBy={state.sortBy}
        searchQuery={state.searchQuery}
        isLoading={state.searchFetching}
        isError={false}
        onRetry={state.submitSearch}
      />
      <div data-testid="flow-chat-ids">{state.chatMeetingIds.join(",")}</div>
      <div data-testid="flow-chat-count">{state.chatMeetingIds.length}</div>
      <div data-testid="flow-results-count">{state.enrichedResults.length}</div>
    </div>
  );
}

describe("Full data flow: query → API → results → check → chat → uncheck → revert", () => {
  it("end-to-end: type query, submit, verify API call, see result cards, check cards, verify chat context, uncheck, verify revert", async () => {
    const search = vi.fn().mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "Sprint Planning", date: "2026-03-12", cluster_tags: ["billing"], series: "sprint" },
      { meeting_id: "m2", score: 0.7, client: "Acme", meeting_type: "Design Review", date: "2026-03-11", cluster_tags: ["design"], series: "design" },
      { meeting_id: "m3", score: 0.5, client: "Acme", meeting_type: "Standup", date: "2026-03-10", cluster_tags: [], series: "standup" },
    ]);
    const artifactBatch = vi.fn().mockResolvedValue({
      m1: {
        decisions: [{ text: "Use billing API v2" }],
        action_items: [{ description: "Migrate billing endpoint", owner: "Alice" }],
        risk_items: [],
      },
      m2: null,
      m3: null,
    });
    (window as unknown as Record<string, unknown>).api = {
      search,
      deepSearch: vi.fn().mockResolvedValue([]),
      artifactBatch,
    };
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <FullFlowHarness selectedClient="Acme" />
      </Wrapper>,
    );

    expect(screen.getByTestId("empty-state-initial")).not.toBeNull();

    const input = screen.getByRole("textbox", { name: /search query/i });
    fireEvent.change(input, { target: { value: "billing" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(search).toHaveBeenCalled());
    expect(search).toHaveBeenCalledWith({
      query: "billing",
      client: "Acme",
      searchFields: expect.any(Array),
    });

    await waitFor(() => expect(screen.getByTestId("flow-results-count").textContent).toBe("3"));

    expect(screen.getByTestId("search-result-card-m1")).not.toBeNull();
    expect(screen.getByTestId("search-result-card-m2")).not.toBeNull();
    expect(screen.getByTestId("search-result-card-m3")).not.toBeNull();

    expect(screen.getByTestId("flow-chat-ids").textContent).toBe("m1,m2,m3");

    const m1Checkbox = screen.getByTestId("search-result-card-m1").querySelector('[data-testid="result-checkbox"]')!;
    const m3Checkbox = screen.getByTestId("search-result-card-m3").querySelector('[data-testid="result-checkbox"]')!;
    fireEvent.click(m1Checkbox);
    fireEvent.click(m3Checkbox);

    expect(screen.getByTestId("flow-chat-ids").textContent).toBe("m1,m3");
    expect(screen.getByTestId("flow-chat-count").textContent).toBe("2");

    fireEvent.click(m1Checkbox);
    fireEvent.click(m3Checkbox);

    expect(screen.getByTestId("flow-chat-ids").textContent).toBe("m1,m2,m3");
    expect(screen.getByTestId("flow-chat-count").textContent).toBe("3");
  });
});
