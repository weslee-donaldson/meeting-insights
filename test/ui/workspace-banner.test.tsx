// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { WorkspaceBanner } from "../../electron-ui/ui/src/components/shared/workspace-banner.js";

afterEach(cleanup);

const defaultProps = {
  clientName: "LLSA" as string | null,
  clients: ["LLSA", "TerraQuantum"],
  onClientChange: vi.fn(),
  stats: { meetings: 32, actionItems: 490, threads: 3 },
  searchQuery: "",
  onSearchQueryChange: vi.fn(),
  onSubmitSearch: vi.fn(),
  dateRange: { after: "", before: "" },
  onDateChange: vi.fn(),
  deepSearchEnabled: false,
  onDeepSearchToggle: vi.fn(),
  onReset: vi.fn(),
};

describe("WorkspaceBanner", () => {
  it("renders client avatar with initial letter", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    expect(screen.getByText("L")).toBeDefined();
  });

  it("renders client name in dropdown", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    const select = screen.getByRole("combobox", { name: "Client" }) as HTMLSelectElement;
    expect(select.value).toBe("LLSA");
  });

  it("renders summary stats", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    expect(screen.getByText("32 meetings · 490 action items · 3 threads")).toBeDefined();
  });

  it("renders scoped search with client-specific placeholder", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    expect(screen.getByPlaceholderText("Search within LLSA…")).toBeDefined();
  });

  it("renders From/To date inputs", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    expect(screen.getByLabelText("After date")).toBeDefined();
    expect(screen.getByLabelText("Before date")).toBeDefined();
  });

  it("renders Deep search toggle", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    expect(screen.getByLabelText("Deep Search")).toBeDefined();
  });

  it("calls onSubmitSearch when Enter pressed in search", () => {
    const onSubmitSearch = vi.fn();
    render(<WorkspaceBanner {...defaultProps} searchQuery="test" onSubmitSearch={onSubmitSearch} />);
    fireEvent.keyDown(screen.getByLabelText("Search meetings"), { key: "Enter" });
    expect(onSubmitSearch).toHaveBeenCalledWith("test");
  });

  it("calls onClientChange when client dropdown changes", () => {
    const onClientChange = vi.fn();
    render(<WorkspaceBanner {...defaultProps} onClientChange={onClientChange} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Client" }), { target: { value: "TerraQuantum" } });
    expect(onClientChange).toHaveBeenCalledWith("TerraQuantum");
  });

  it("shows empty state when no client selected", () => {
    render(<WorkspaceBanner {...defaultProps} clientName={null} />);
    expect(screen.getByText("Select a workspace")).toBeDefined();
  });

  it("calls onReset when Reset clicked", () => {
    const onReset = vi.fn();
    render(<WorkspaceBanner {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByLabelText("Reset"));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("row 1 has tint background", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    const avatar = screen.getByText("L").closest("div")!;
    const row1 = avatar.parentElement!;
    expect(row1.className).toContain("bg-[var(--color-tint)]");
  });

  it("avatar uses accent background", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    const avatar = screen.getByText("L").closest("div")!;
    expect(avatar.className).toContain("bg-[var(--color-accent)]");
  });
});
