// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TopBar } from "../../electron-ui/ui/src/components/TopBar.js";
import { themes } from "../../electron-ui/ui/src/theme.js";

afterEach(cleanup);

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const defaultProps = {
  clients: ["Acme", "Beta Co"],
  selectedClient: null,
  dateRange: { after: "", before: "" },
  searchQuery: "",
  onClientChange: vi.fn(),
  onDateChange: vi.fn(),
  onSearchQueryChange: vi.fn(),
  onReset: vi.fn(),
  onSelectSearchResults: vi.fn(),
  theme: "deep-sea" as const,
  setTheme: vi.fn(),
  themes,
};

describe("TopBar", () => {
  it("renders Reset button", () => {
    render(<TopBar {...defaultProps} />, { wrapper: makeWrapper() });
    expect(screen.getByRole("button", { name: /reset/i })).toBeDefined();
  });

  it("calls onReset when Reset is clicked", () => {
    const onReset = vi.fn();
    render(<TopBar {...defaultProps} onReset={onReset} />, { wrapper: makeWrapper() });
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("renders after and before date inputs", () => {
    render(<TopBar {...defaultProps} />, { wrapper: makeWrapper() });
    expect(screen.getByLabelText("After date")).toBeDefined();
    expect(screen.getByLabelText("Before date")).toBeDefined();
  });

  it("calls onDateChange with field=after and new value when after date changes", () => {
    const onDateChange = vi.fn();
    render(<TopBar {...defaultProps} onDateChange={onDateChange} />, { wrapper: makeWrapper() });
    fireEvent.change(screen.getByLabelText("After date"), {
      target: { value: "2026-02-01" },
    });
    expect(onDateChange).toHaveBeenCalledWith("after", "2026-02-01");
  });

  it("calls onDateChange with field=before and new value when before date changes", () => {
    const onDateChange = vi.fn();
    render(<TopBar {...defaultProps} onDateChange={onDateChange} />, { wrapper: makeWrapper() });
    fireEvent.change(screen.getByLabelText("Before date"), {
      target: { value: "2026-03-01" },
    });
    expect(onDateChange).toHaveBeenCalledWith("before", "2026-03-01");
  });

  it("renders theme cycle button with current theme aria-label", () => {
    render(<TopBar {...defaultProps} />, { wrapper: makeWrapper() });
    expect(screen.getByRole("button", { name: /theme: deep-sea/i })).toBeDefined();
  });

  it("calls setTheme with next theme when cycle button is clicked", () => {
    const setTheme = vi.fn();
    render(<TopBar {...defaultProps} setTheme={setTheme} />, { wrapper: makeWrapper() });
    fireEvent.click(screen.getByRole("button", { name: /theme:/i }));
    expect(setTheme).toHaveBeenCalledWith("daylight");
  });

});
