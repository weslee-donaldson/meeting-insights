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
    getCompletions: vi.fn().mockResolvedValue([]),
    completeActionItem: vi.fn().mockResolvedValue(undefined),
    deleteMeetings: vi.fn().mockResolvedValue(undefined),
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("App", () => {
  it("renders detail panel always visible", () => {
    render(<App />, { wrapper });
    const panel = screen.getByTestId("detail-panel");
    expect(panel.className).toContain("flex-1");
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
      expect((screen.getByRole("button", { name: "Day" }) as HTMLButtonElement).className).toContain("bg-primary");
    });
  });

  it("reset clears search input value", async () => {
    render(<App />, { wrapper });
    const input = screen.getByRole("textbox", { name: /search meetings/i });
    fireEvent.change(input, { target: { value: "foo" } });
    expect((input as HTMLInputElement).value).toBe("foo");
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("shows meeting title in detail panel after meeting row click", async () => {
    render(<App />, { wrapper });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(row);
    await waitFor(() => {
      expect(screen.queryByText("Select a meeting")).toBeNull();
    });
  });

  it("chat panel absent initially with no meeting selected", () => {
    render(<App />, { wrapper });
    expect(screen.queryByTestId("chat-panel")).toBeNull();
  });

  it("meeting list shows only search-matching meetings when query has 2+ chars", async () => {
    (window.api.getMeetings as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "m1", title: "Alpha Weekly", date: "2026-01-01", client: "Acme", series: "alpha weekly", actionItemCount: 2 },
      { id: "m2", title: "Beta Daily", date: "2026-01-02", client: "Beta", series: "beta daily", actionItemCount: 0 },
    ]);
    (window.api.search as ReturnType<typeof vi.fn>).mockResolvedValue([
      { meeting_id: "m1", score: 0.9, client: "Acme", meeting_type: "Alpha Weekly", date: "2026-01-01" },
    ]);
    render(<App />, { wrapper });
    const input = screen.getByRole("textbox", { name: /search meetings/i });
    fireEvent.change(input, { target: { value: "al" } });
    await waitFor(() => {
      expect(screen.getByTestId("meeting-row-m1")).toBeDefined();
      expect(screen.queryByTestId("meeting-row-m2")).toBeNull();
    });
  });

  it("shows success toast after deleting checked meetings", async () => {
    render(<App />, { wrapper });
    const row = await screen.findByTestId("meeting-row-m1");
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(screen.getByRole("button", { name: /Delete/i })).toBeDefined());
    fireEvent.click(screen.getByRole("button", { name: /Delete/i }));
    await waitFor(() => expect(screen.getByText("1 meeting(s) deleted")).toBeDefined());
    expect(row).toBeDefined();
  });
});
