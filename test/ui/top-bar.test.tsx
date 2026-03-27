// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { TopBar } from "../../electron-ui/ui/src/components/TopBar.js";
import { themes } from "../../electron-ui/ui/src/theme.js";

afterEach(cleanup);

const defaultProps = {
  clients: ["Acme", "Beta Co"],
  selectedClient: "Acme" as string | null,
  dateRange: { after: "", before: "" },
  searchQuery: "",
  onClientChange: vi.fn(),
  onDateChange: vi.fn(),
  onSearchQueryChange: vi.fn(),
  onReset: vi.fn(),
  onSubmitSearch: vi.fn(),
  theme: "stone-light" as const,
  setTheme: vi.fn(),
  themes,
};

describe("TopBar", () => {
  it("renders Reset button in workspace banner", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByLabelText("Reset")).toBeDefined();
  });

  it("calls onReset when Reset is clicked", () => {
    const onReset = vi.fn();
    render(<TopBar {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByLabelText("Reset"));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("renders after and before date inputs", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByLabelText("After date")).toBeDefined();
    expect(screen.getByLabelText("Before date")).toBeDefined();
  });

  it("calls onDateChange with field=after and new value when after date changes", () => {
    const onDateChange = vi.fn();
    render(<TopBar {...defaultProps} onDateChange={onDateChange} />);
    fireEvent.change(screen.getByLabelText("After date"), {
      target: { value: "2026-02-01" },
    });
    expect(onDateChange).toHaveBeenCalledWith("after", "2026-02-01");
  });

  it("calls onDateChange with field=before and new value when before date changes", () => {
    const onDateChange = vi.fn();
    render(<TopBar {...defaultProps} onDateChange={onDateChange} />);
    fireEvent.change(screen.getByLabelText("Before date"), {
      target: { value: "2026-03-01" },
    });
    expect(onDateChange).toHaveBeenCalledWith("before", "2026-03-01");
  });

  it("renders theme cycle button with current theme aria-label", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByRole("button", { name: /theme: stone-light/i })).toBeDefined();
  });

  it("calls setTheme with next theme when cycle button is clicked", () => {
    const setTheme = vi.fn();
    render(<TopBar {...defaultProps} setTheme={setTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /theme:/i }));
    expect(setTheme).toHaveBeenCalledWith("stone-dark");
  });

  it("renders client dropdown with selected client", () => {
    render(<TopBar {...defaultProps} />);
    const select = screen.getByRole("combobox", { name: "Client" }) as HTMLSelectElement;
    expect(select.value).toBe("Acme");
  });

  it("renders scoped search placeholder with client name", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByPlaceholderText("Search within Acme…")).toBeDefined();
  });

  it("shows empty state when no client selected", () => {
    render(<TopBar {...defaultProps} selectedClient={null} />);
    expect(screen.getByText("Select a workspace")).toBeDefined();
  });

  it("hides date inputs when hideDateFilters is true", () => {
    render(<TopBar {...defaultProps} hideDateFilters />);
    expect(screen.queryByLabelText("After date")).toBeNull();
    expect(screen.queryByLabelText("Before date")).toBeNull();
  });

  it("hides Deep Search toggle when hideDeepToggle is true", () => {
    render(<TopBar {...defaultProps} onDeepSearchToggle={vi.fn()} deepSearchEnabled={false} hideDeepToggle />);
    expect(screen.queryByLabelText("Deep Search")).toBeNull();
  });
});
