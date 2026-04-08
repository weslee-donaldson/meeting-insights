// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, waitFor, cleanup, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSystemHealth } from "../../electron-ui/ui/src/hooks/useSystemHealth.js";
import type { HealthStatus } from "../../electron-ui/ui/src/hooks/useSystemHealth.js";

afterEach(cleanup);

const healthyStatus: HealthStatus = {
  status: "healthy",
  error_groups: [],
  meetings_without_artifact: 0,
  last_error_at: null,
};

const criticalStatus: HealthStatus = {
  status: "critical",
  error_groups: [
    {
      error_type: "api_error",
      severity: "critical",
      count: 5,
      latest_message: "[api_error] 402",
      latest_meeting_filename: "standup.json",
      provider: "openai",
      resolution_hint: "Check your LLM provider account billing and API key validity",
    },
  ],
  meetings_without_artifact: 5,
  last_error_at: "2026-04-07 10:00:00",
};

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useSystemHealth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns healthy health data when API returns healthy", async () => {
    (window as unknown as Record<string, unknown>).api = {
      getHealth: vi.fn().mockResolvedValue(healthyStatus),
      acknowledgeHealthErrors: vi.fn().mockResolvedValue(undefined),
    };

    const { result } = renderHook(() => useSystemHealth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.health).toEqual(healthyStatus);
  });

  it("returns critical health data when API returns critical", async () => {
    (window as unknown as Record<string, unknown>).api = {
      getHealth: vi.fn().mockResolvedValue(criticalStatus),
      acknowledgeHealthErrors: vi.fn().mockResolvedValue(undefined),
    };

    const { result } = renderHook(() => useSystemHealth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.health?.status).toBe("critical");
  });

  it("acknowledgeAll calls acknowledgeHealthErrors with no args", async () => {
    const acknowledgeHealthErrors = vi.fn().mockResolvedValue(undefined);
    (window as unknown as Record<string, unknown>).api = {
      getHealth: vi.fn().mockResolvedValue(healthyStatus),
      acknowledgeHealthErrors,
    };

    const { result } = renderHook(() => useSystemHealth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.acknowledgeAll();
    });

    expect(acknowledgeHealthErrors).toHaveBeenCalledWith(undefined);
  });

  it("acknowledgeErrors calls acknowledgeHealthErrors with provided IDs", async () => {
    const acknowledgeHealthErrors = vi.fn().mockResolvedValue(undefined);
    (window as unknown as Record<string, unknown>).api = {
      getHealth: vi.fn().mockResolvedValue(healthyStatus),
      acknowledgeHealthErrors,
    };

    const { result } = renderHook(() => useSystemHealth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.acknowledgeErrors(["id1"]);
    });

    expect(acknowledgeHealthErrors).toHaveBeenCalledWith(["id1"]);
  });

  it("isError is true and health is undefined when API rejects", async () => {
    (window as unknown as Record<string, unknown>).api = {
      getHealth: vi.fn().mockRejectedValue(new Error("Network error")),
      acknowledgeHealthErrors: vi.fn().mockResolvedValue(undefined),
    };

    const { result } = renderHook(() => useSystemHealth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.health).toBeUndefined();
  });
});
