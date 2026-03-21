// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSearchScope } from "../../electron-ui/ui/src/hooks/useSearchScope.js";
import type { MeetingRow } from "../../electron-ui/electron/channels.js";

afterEach(cleanup);

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const MEETINGS: MeetingRow[] = [
  { id: "m1", title: "Sync 1", meeting_type: "sync", date: "2025-01-01", client_id: "c1", client_name: "Acme", attendees: 2, duration_minutes: 30, ignored: 0, actionItemCount: 1, raw_transcript: null, meeting_series: null, thread_tags: null },
  { id: "m2", title: "Sync 2", meeting_type: "sync", date: "2025-01-02", client_id: "c1", client_name: "Acme", attendees: 3, duration_minutes: 45, ignored: 0, actionItemCount: 0, raw_transcript: null, meeting_series: null, thread_tags: null },
];

beforeEach(() => {
  (window as unknown as Record<string, unknown>).api = {
    search: vi.fn().mockResolvedValue([]),
    deepSearch: vi.fn().mockResolvedValue([]),
  };
});

describe("useSearchScope", () => {
  it("returns all meetings when search query is empty", () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useSearchScope(MEETINGS, "", true, addToast),
      { wrapper: makeWrapper() },
    );
    expect(result.current.scopeMeetings).toEqual(MEETINGS);
    expect(result.current.searchScores).toBeUndefined();
  });

  it("returns empty scopeMeetings when search has no results", async () => {
    (window as unknown as Record<string, Record<string, unknown>>).api.search = vi.fn().mockResolvedValue([]);
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useSearchScope(MEETINGS, "nonexistent query", true, addToast),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.scopeMeetings).toEqual([]));
  });
});
