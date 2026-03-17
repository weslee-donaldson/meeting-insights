// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { UnifiedSearch } from "../../electron-ui/ui/src/components/shared/unified-search.js";

afterEach(cleanup);

const defaultProps = {
  query: "",
  onQueryChange: vi.fn(),
  onSubmit: vi.fn(),
  clientName: null,
  onClientClear: vi.fn(),
  onClientClick: vi.fn(),
  deepEnabled: false,
  onDeepToggle: vi.fn(),
};

describe("UnifiedSearch", () => {
  it("renders search input with magnifying glass icon", () => {
    const { container } = render(<UnifiedSearch {...defaultProps} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search meetings, action items, threads...")).toBeTruthy();
  });

  it("renders search bar with rounded-10px border and elevated background", () => {
    const { container } = render(<UnifiedSearch {...defaultProps} />);
    const bar = container.firstElementChild!.firstElementChild!;
    expect(bar.className).toContain("rounded-[10px]");
    expect(bar.className).toContain("border-[1.5px]");
    expect(bar.className).toContain("bg-[var(--color-bg-elevated)]");
  });

  it("renders client chip inside search bar when clientName provided", () => {
    render(<UnifiedSearch {...defaultProps} clientName="LLSA" />);
    const chip = screen.getByText("LLSA");
    expect(chip.closest("button")!.className).toContain("bg-[var(--color-tint)]");
    expect(chip.closest("button")!.className).toContain("text-[var(--color-accent)]");
  });

  it("calls onClientClear when × icon on client chip is clicked", () => {
    const onClientClear = vi.fn();
    render(<UnifiedSearch {...defaultProps} clientName="LLSA" onClientClear={onClientClear} />);
    fireEvent.click(screen.getByLabelText("Remove LLSA filter"));
    expect(onClientClear).toHaveBeenCalledOnce();
  });

  it("renders Deep toggle button with accent dot when enabled", () => {
    const { container } = render(<UnifiedSearch {...defaultProps} deepEnabled={true} />);
    const deepBtn = screen.getByText("Deep").closest("button")!;
    expect(deepBtn.getAttribute("aria-pressed")).toBe("true");
    const dot = deepBtn.querySelector(".bg-\\[var\\(--color-accent\\)\\]");
    expect(dot).not.toBeNull();
  });

  it("calls onDeepToggle when Deep button clicked", () => {
    const onDeepToggle = vi.fn();
    render(<UnifiedSearch {...defaultProps} onDeepToggle={onDeepToggle} />);
    fireEvent.click(screen.getByText("Deep").closest("button")!);
    expect(onDeepToggle).toHaveBeenCalledWith(true);
  });

  it("renders context line below search bar", () => {
    render(<UnifiedSearch {...defaultProps} contextLine="Mar 2 – Mar 13, 2026 | 32 meetings" />);
    expect(screen.getByText("Mar 2 – Mar 13, 2026 | 32 meetings")).toBeTruthy();
  });

  it("calls onSubmit on Enter keypress", () => {
    const onSubmit = vi.fn();
    render(<UnifiedSearch {...defaultProps} query="test query" onSubmit={onSubmit} />);
    const input = screen.getByPlaceholderText("Search meetings, action items, threads...");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith("test query");
  });

  it("input text uses 13px primary color", () => {
    render(<UnifiedSearch {...defaultProps} />);
    const input = screen.getByPlaceholderText("Search meetings, action items, threads...");
    expect(input.className).toContain("text-[13px]");
    expect(input.className).toContain("text-[var(--color-text-primary)]");
  });
});
