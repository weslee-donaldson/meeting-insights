// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchForm } from "../../electron-ui/ui/src/components/SearchForm.js";
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
