// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SearchForm } from "../../electron-ui/ui/src/components/SearchForm.js";

afterEach(cleanup);

const ALL_FIELDS = new Set([
  "summary", "decisions", "action_items", "risk_items",
  "proposed_features", "open_questions", "milestones",
]);

function defaultProps(overrides: Partial<React.ComponentProps<typeof SearchForm>> = {}) {
  return {
    typedSearchQuery: "",
    setTypedSearchQuery: vi.fn(),
    searchFields: new Set(ALL_FIELDS),
    toggleField: vi.fn(),
    dateAfter: "",
    setDateAfter: vi.fn(),
    dateBefore: "",
    setDateBefore: vi.fn(),
    deepSearchEnabled: false,
    setDeepSearchEnabled: vi.fn(),
    formVisible: true,
    setFormVisible: vi.fn(),
    groupBy: "none" as const,
    setGroupBy: vi.fn(),
    sortBy: "relevance" as const,
    setSortBy: vi.fn(),
    collapsedSummary: "All fields",
    searchQuery: "",
    onSubmit: vi.fn(),
    ...overrides,
  };
}

describe("SearchForm expanded", () => {
  it("renders Search title and Hide button when formVisible is true", () => {
    render(<SearchForm {...defaultProps()} />);
    expect(screen.getByText("Search")).not.toBeNull();
    expect(screen.getByRole("button", { name: /hide/i })).not.toBeNull();
  });

  it("renders query input with search icon placeholder", () => {
    render(<SearchForm {...defaultProps()} />);
    const input = screen.getByRole("textbox", { name: /search query/i });
    expect(input).not.toBeNull();
  });

  it("typing in query input calls setTypedSearchQuery", () => {
    const setTypedSearchQuery = vi.fn();
    render(<SearchForm {...defaultProps({ setTypedSearchQuery })} />);
    fireEvent.change(screen.getByRole("textbox", { name: /search query/i }), {
      target: { value: "billing" },
    });
    expect(setTypedSearchQuery).toHaveBeenCalledWith("billing");
  });

  it("pressing Enter in query input calls onSubmit", () => {
    const onSubmit = vi.fn();
    render(<SearchForm {...defaultProps({ onSubmit })} />);
    fireEvent.keyDown(screen.getByRole("textbox", { name: /search query/i }), {
      key: "Enter",
    });
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("clicking Hide button calls setFormVisible with false", () => {
    const setFormVisible = vi.fn();
    render(<SearchForm {...defaultProps({ setFormVisible })} />);
    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(setFormVisible).toHaveBeenCalledWith(false);
  });
});
