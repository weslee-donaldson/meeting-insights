// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useClients } from "../../electron-ui/ui/src/hooks/useClients.js";
import { useMeetings } from "../../electron-ui/ui/src/hooks/useMeetings.js";
import { useArtifact } from "../../electron-ui/ui/src/hooks/useArtifact.js";
import { useSearch } from "../../electron-ui/ui/src/hooks/useSearch.js";
import { useDeepSearch } from "../../electron-ui/ui/src/hooks/useDeepSearch.js";
import { useGlossary } from "../../electron-ui/ui/src/hooks/useGlossary.js";

afterEach(cleanup);


function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useClients", () => {
  it("returns clients from window.api.getClients", async () => {
    (window as unknown as Record<string, unknown>).api = {
      getClients: vi.fn().mockResolvedValue(["Acme", "Beta Co"]),
      getMeetings: vi.fn().mockResolvedValue([]),
      getArtifact: vi.fn().mockResolvedValue(null),
      chat: vi.fn(),
    };
    const { result } = renderHook(() => useClients(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(["Acme", "Beta Co"]);
  });
});

describe("useMeetings", () => {
  it("calls getMeetings with provided filters", async () => {
    const getMeetings = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = {
      getClients: vi.fn().mockResolvedValue([]),
      getMeetings,
      getArtifact: vi.fn().mockResolvedValue(null),
      chat: vi.fn(),
    };
    const { result } = renderHook(
      () => useMeetings({ client: "Acme" }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMeetings).toHaveBeenCalledWith({ client: "Acme" });
  });
});

describe("useSearch", () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>).api = {
      getClients: vi.fn().mockResolvedValue([]),
      getMeetings: vi.fn().mockResolvedValue([]),
      getArtifact: vi.fn().mockResolvedValue(null),
      chat: vi.fn(),
      search: vi.fn().mockResolvedValue([]),
    };
  });

  it("does not call search when query is shorter than 2 characters", async () => {
    const search = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = {
      ...(window as unknown as { api: object }).api,
      search,
    };
    renderHook(() => useSearch("a"), { wrapper: makeWrapper() });
    await new Promise((r) => setTimeout(r, 50));
    expect(search).not.toHaveBeenCalled();
  });

  it("calls search with query and client when query is at least 2 characters", async () => {
    const search = vi.fn().mockResolvedValue([{ meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "DSU", date: "2026-02-24" }]);
    (window as unknown as Record<string, unknown>).api = {
      ...(window as unknown as { api: object }).api,
      search,
    };
    const { result } = renderHook(() => useSearch("quarterly review", "Acme"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(search).toHaveBeenCalledWith({ query: "quarterly review", client: "Acme" });
    expect(result.current.data).toEqual([{ meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "DSU", date: "2026-02-24" }]);
  });

  it("calls search with date_after and date_before when provided", async () => {
    const search = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = {
      ...(window as unknown as { api: object }).api,
      search,
    };
    renderHook(() => useSearch("alpha", undefined, "2026-01-01", "2026-03-01"), { wrapper: makeWrapper() });
    await waitFor(() => expect(search).toHaveBeenCalled());
    expect(search).toHaveBeenCalledWith({ query: "alpha", date_after: "2026-01-01", date_before: "2026-03-01" });
  });

  it("passes searchFields to search request when provided", async () => {
    const search = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = {
      ...(window as unknown as { api: object }).api,
      search,
    };
    renderHook(() => useSearch("budget", undefined, undefined, undefined, { searchFields: ["summary", "decisions"] }), { wrapper: makeWrapper() });
    await waitFor(() => expect(search).toHaveBeenCalled());
    expect(search).toHaveBeenCalledWith({ query: "budget", searchFields: ["summary", "decisions"] });
  });

  it("uses keyPrefix in queryKey when provided", async () => {
    const search = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = {
      ...(window as unknown as { api: object }).api,
      search,
    };
    const wrapper = makeWrapper();
    const { result: r1 } = renderHook(() => useSearch("budget", undefined, undefined, undefined, { keyPrefix: "advSearch" }), { wrapper });
    await waitFor(() => expect(r1.current.isSuccess).toBe(true));
    expect(search).toHaveBeenCalledTimes(1);
  });
});

describe("useDeepSearch", () => {
  beforeEach(() => {
    (window as unknown as Record<string, unknown>).api = {
      deepSearch: vi.fn().mockResolvedValue([]),
    };
  });

  it("calls deepSearch with meetingIds and query when enabled", async () => {
    const deepSearch = vi.fn().mockResolvedValue([{ meeting_id: "m1", relevanceSummary: "Found", relevanceScore: 80 }]);
    (window as unknown as Record<string, unknown>).api = { deepSearch };
    const { result } = renderHook(
      () => useDeepSearch(["m1"], "auth", true),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deepSearch).toHaveBeenCalledWith({ meetingIds: ["m1"], query: "auth" });
    expect(result.current.data).toEqual([{ meeting_id: "m1", relevanceSummary: "Found", relevanceScore: 80 }]);
  });

  it("uses keyPrefix in queryKey when provided", async () => {
    const deepSearch = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = { deepSearch };
    const { result } = renderHook(
      () => useDeepSearch(["m1"], "auth", true, { keyPrefix: "advDeepSearch" }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deepSearch).toHaveBeenCalledTimes(1);
  });

  it("does not call deepSearch when enabled is false", async () => {
    const deepSearch = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = { deepSearch };
    renderHook(
      () => useDeepSearch(["m1"], "auth", false),
      { wrapper: makeWrapper() },
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(deepSearch).not.toHaveBeenCalled();
  });
});

describe("useArtifact", () => {
  it("does not call getArtifact when meetingId is undefined", async () => {
    const getArtifact = vi.fn().mockResolvedValue(null);
    (window as unknown as Record<string, unknown>).api = {
      getClients: vi.fn().mockResolvedValue([]),
      getMeetings: vi.fn().mockResolvedValue([]),
      getArtifact,
      chat: vi.fn(),
    };
    renderHook(() => useArtifact(undefined), { wrapper: makeWrapper() });
    await new Promise((r) => setTimeout(r, 50));
    expect(getArtifact).not.toHaveBeenCalled();
  });

  it("calls getArtifact when meetingId is defined", async () => {
    const getArtifact = vi.fn().mockResolvedValue(null);
    (window as unknown as Record<string, unknown>).api = {
      getClients: vi.fn().mockResolvedValue([]),
      getMeetings: vi.fn().mockResolvedValue([]),
      getArtifact,
      chat: vi.fn(),
    };
    const { result } = renderHook(() => useArtifact("some-id"), { wrapper: makeWrapper() });
    await waitFor(() => result.current.isSuccess);
    expect(getArtifact).toHaveBeenCalledWith("some-id");
  });
});

describe("useGlossary", () => {
  it("returns glossary entries when client name is provided", async () => {
    const glossary = [
      { term: "CSTAR", variants: ["C*", "sea star"], description: "Legacy order proxy" },
      { term: "Recurly", variants: ["recurrly"], description: "Billing platform" },
    ];
    const getGlossary = vi.fn().mockResolvedValue(glossary);
    (window as unknown as Record<string, unknown>).api = { getGlossary };
    const { result } = renderHook(() => useGlossary("TestCo"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getGlossary).toHaveBeenCalledWith("TestCo");
    expect(result.current.data).toEqual([
      { term: "CSTAR", variants: ["C*", "sea star"], description: "Legacy order proxy" },
      { term: "Recurly", variants: ["recurrly"], description: "Billing platform" },
    ]);
  });

  it("does not call getGlossary when client name is null", async () => {
    const getGlossary = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = { getGlossary };
    renderHook(() => useGlossary(null), { wrapper: makeWrapper() });
    await new Promise((r) => setTimeout(r, 50));
    expect(getGlossary).not.toHaveBeenCalled();
  });

  it("does not call getGlossary when client name is undefined", async () => {
    const getGlossary = vi.fn().mockResolvedValue([]);
    (window as unknown as Record<string, unknown>).api = { getGlossary };
    renderHook(() => useGlossary(undefined), { wrapper: makeWrapper() });
    await new Promise((r) => setTimeout(r, 50));
    expect(getGlossary).not.toHaveBeenCalled();
  });
});
