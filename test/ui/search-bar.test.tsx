// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchBar } from "../../electron-ui/ui/src/components/SearchBar.js";

afterEach(cleanup);

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const mockResult = {
  meeting_id: "m1",
  score: 0.92,
  client: "Acme",
  meeting_type: "DSU",
  date: "2026-02-24T10:00:00Z",
};

describe("SearchBar", () => {
  it("renders search input", () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><SearchBar onSelectResults={vi.fn()} /></Wrapper>);
    expect(screen.getByRole("textbox", { name: /search meetings/i })).toBeDefined();
  });

  it("does not show results when query is less than 2 characters", async () => {
    (window as unknown as Record<string, unknown>).api = {
      search: vi.fn().mockResolvedValue([mockResult]),
    };
    const Wrapper = makeWrapper();
    render(<Wrapper><SearchBar onSelectResults={vi.fn()} /></Wrapper>);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a" } });
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("shows results from search when query is at least 2 characters", async () => {
    (window as unknown as Record<string, unknown>).api = {
      search: vi.fn().mockResolvedValue([mockResult]),
    };
    const Wrapper = makeWrapper();
    render(<Wrapper><SearchBar onSelectResults={vi.fn()} /></Wrapper>);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "qu" } });
    await waitFor(() => expect(screen.getByRole("listbox")).toBeDefined(), { timeout: 2000 });
    expect(screen.getByText("DSU")).toBeDefined();
  });

  it("calls onSelectResults with the clicked result", async () => {
    const onSelectResults = vi.fn();
    (window as unknown as Record<string, unknown>).api = {
      search: vi.fn().mockResolvedValue([mockResult]),
    };
    const Wrapper = makeWrapper();
    render(<Wrapper><SearchBar onSelectResults={onSelectResults} /></Wrapper>);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "qu" } });
    await waitFor(() => screen.getByRole("listbox"), { timeout: 2000 });
    fireEvent.mouseDown(screen.getByRole("option"));
    expect(onSelectResults).toHaveBeenCalledWith([mockResult]);
  });
});
