// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "../../electron-ui/ui/src/App.js";

afterEach(cleanup);

beforeAll(() => {
  (window as unknown as Record<string, unknown>).api = {
    getClients: vi.fn().mockResolvedValue(["Acme"]),
    getMeetings: vi.fn().mockResolvedValue([
      { id: "m1", title: "Alpha Weekly", date: "2026-01-01", client: "Acme", series: "alpha weekly", actionItemCount: 2 },
    ]),
    getArtifact: vi.fn().mockResolvedValue(null),
    chat: vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 }),
    search: vi.fn().mockResolvedValue([]),
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("App", () => {
  it("renders LinearShell with detail panel closed initially", () => {
    render(<App />, { wrapper });
    const panel = screen.getByTestId("detail-panel");
    expect((panel as HTMLElement).style.width).toBe("0px");
  });

  it("shows Select a meeting placeholder in detail", () => {
    render(<App />, { wrapper });
    expect(screen.getByText("Select a meeting")).toBeDefined();
  });

  it("renders group-by selector and switches groupBy state on click", async () => {
    render(<App />, { wrapper });
    const dayBtn = screen.getByRole("button", { name: "Day" });
    expect(dayBtn).toBeDefined();
    fireEvent.click(dayBtn);
    await waitFor(() => {
      expect((screen.getByRole("button", { name: "Day" }) as HTMLButtonElement).style.fontWeight).toBe("600");
    });
  });

  it("opens detail panel after meeting row click", async () => {
    render(<App />, { wrapper });
    const dateEl = await screen.findByText("2026-01-01");
    const row = dateEl.closest("[style*='cursor']") as HTMLElement;
    fireEvent.click(row);
    await waitFor(() => {
      const panel = screen.getByTestId("detail-panel");
      expect((panel as HTMLElement).style.width).toBe("480px");
    });
  });
});
