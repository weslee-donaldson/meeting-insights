// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useClients } from "../../electron-ui/ui/src/hooks/useClients.js";
import { useMeetings } from "../../electron-ui/ui/src/hooks/useMeetings.js";
import { useArtifact } from "../../electron-ui/ui/src/hooks/useArtifact.js";
import { useSearch } from "../../electron-ui/ui/src/hooks/useSearch.js";

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
