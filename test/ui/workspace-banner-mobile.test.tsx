// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { WorkspaceBanner } from "../../electron-ui/ui/src/components/shared/workspace-banner.js";

afterEach(cleanup);

const defaultProps = {
  clientName: "Acme" as string | null,
  clients: ["Acme", "Beta Co"],
  onClientChange: vi.fn(),
  searchQuery: "",
  onSearchQueryChange: vi.fn(),
  onSubmitSearch: vi.fn(),
  dateRange: { after: "", before: "" },
  onDateChange: vi.fn(),
  onReset: vi.fn(),
};

describe("WorkspaceBanner — Mobile", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    window.dispatchEvent(new Event("resize"));
  });

  it("renders compact mobile header with client name, search icon, and filter icon", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    expect(screen.getByTestId("mobile-banner")).toBeDefined();
    expect(screen.getByLabelText("Open search")).toBeDefined();
    expect(screen.getByLabelText("Open filters")).toBeDefined();
  });

  it("expands search to full-width input when search icon tapped", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open search"));
    expect(screen.getByTestId("mobile-search-expanded")).toBeDefined();
    expect(screen.getByLabelText("Search meetings")).toBeDefined();
  });

  it("collapses search when Cancel tapped", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open search"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByTestId("mobile-banner")).toBeDefined();
    expect(screen.queryByTestId("mobile-search-expanded")).toBeNull();
  });

  it("collapses search on Escape key", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open search"));
    fireEvent.keyDown(screen.getByLabelText("Search meetings"), { key: "Escape" });
    expect(screen.getByTestId("mobile-banner")).toBeDefined();
  });

  it("opens filter sheet when filter icon tapped", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Open filters"));
    expect(screen.getByText("Filters")).toBeDefined();
    expect(screen.getByLabelText("After date")).toBeDefined();
    expect(screen.getByLabelText("Before date")).toBeDefined();
  });

  it("renders client selector as native select on mobile", () => {
    render(<WorkspaceBanner {...defaultProps} />);
    expect(screen.getByLabelText("Client")).toBeDefined();
  });

  it("shows client selector when no client selected", () => {
    render(<WorkspaceBanner {...defaultProps} clientName={null} />);
    const select = screen.getByLabelText("Client");
    expect(select.tagName).toBe("SELECT");
  });
});
