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

describe("SearchForm field toggles", () => {
  it("renders SEARCH IN label and all 7 field pills", () => {
    render(<SearchForm {...defaultProps()} />);
    expect(screen.getByText("SEARCH IN")).not.toBeNull();
    expect(screen.getByRole("button", { name: /toggle summary/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /toggle decisions/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /toggle action items/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /toggle risks/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /toggle features/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /toggle questions/i })).not.toBeNull();
    expect(screen.getByRole("button", { name: /toggle milestones/i })).not.toBeNull();
  });

  it("clicking an active pill calls toggleField with that field key", () => {
    const toggleField = vi.fn();
    render(<SearchForm {...defaultProps({ toggleField })} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle decisions/i }));
    expect(toggleField).toHaveBeenCalledWith("decisions");
  });

  it("clicking an inactive pill calls toggleField with that field key", () => {
    const toggleField = vi.fn();
    const fields = new Set(ALL_FIELDS);
    fields.delete("risk_items");
    render(<SearchForm {...defaultProps({ toggleField, searchFields: fields })} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle risks/i }));
    expect(toggleField).toHaveBeenCalledWith("risk_items");
  });

  it("prevents toggling off the last active field and calls onValidationError", () => {
    const toggleField = vi.fn();
    const onValidationError = vi.fn();
    const fields = new Set(["summary"]);
    render(<SearchForm {...defaultProps({ toggleField, searchFields: fields, onValidationError })} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle summary/i }));
    expect(toggleField).not.toHaveBeenCalled();
    expect(onValidationError).toHaveBeenCalledWith("Select at least one field");
  });

  it("active pills have aria-pressed true and inactive pills have aria-pressed false", () => {
    const fields = new Set(["summary", "decisions"]);
    render(<SearchForm {...defaultProps({ searchFields: fields })} />);
    expect(screen.getByRole("button", { name: /toggle summary/i }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /toggle action items/i }).getAttribute("aria-pressed")).toBe("false");
  });
});
