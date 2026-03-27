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

describe("SearchForm date pickers and options row", () => {
  it("renders From and to date inputs", () => {
    render(<SearchForm {...defaultProps()} />);
    expect(screen.getByLabelText("From date")).not.toBeNull();
    expect(screen.getByLabelText("To date")).not.toBeNull();
  });

  it("changing From date calls setDateAfter", () => {
    const setDateAfter = vi.fn();
    render(<SearchForm {...defaultProps({ setDateAfter })} />);
    fireEvent.change(screen.getByLabelText("From date"), { target: { value: "2026-01-15" } });
    expect(setDateAfter).toHaveBeenCalledWith("2026-01-15");
  });

  it("changing To date calls setDateBefore", () => {
    const setDateBefore = vi.fn();
    render(<SearchForm {...defaultProps({ setDateBefore })} />);
    fireEvent.change(screen.getByLabelText("To date"), { target: { value: "2026-03-01" } });
    expect(setDateBefore).toHaveBeenCalledWith("2026-03-01");
  });

  it("renders Deep checkbox and clicking it calls setDeepSearchEnabled", () => {
    const setDeepSearchEnabled = vi.fn();
    render(<SearchForm {...defaultProps({ setDeepSearchEnabled })} />);
    const checkbox = screen.getByRole("checkbox", { name: /deep/i });
    expect(checkbox).not.toBeNull();
    fireEvent.click(checkbox);
    expect(setDeepSearchEnabled).toHaveBeenCalledWith(true);
  });

  it("Deep checkbox reflects deepSearchEnabled prop", () => {
    render(<SearchForm {...defaultProps({ deepSearchEnabled: true })} />);
    const checkbox = screen.getByRole("checkbox", { name: /deep/i }) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("renders Group dropdown with current value and options", () => {
    render(<SearchForm {...defaultProps()} />);
    const groupBtn = screen.getByRole("button", { name: /group/i });
    expect(groupBtn.textContent).toContain("None");
    fireEvent.click(groupBtn);
    expect(screen.getByRole("option", { name: "Cluster" })).not.toBeNull();
    expect(screen.getByRole("option", { name: "Date" })).not.toBeNull();
    expect(screen.getByRole("option", { name: "Series" })).not.toBeNull();
  });

  it("selecting a Group option calls setGroupBy", () => {
    const setGroupBy = vi.fn();
    render(<SearchForm {...defaultProps({ setGroupBy })} />);
    fireEvent.click(screen.getByRole("button", { name: /group/i }));
    fireEvent.click(screen.getByRole("option", { name: "Cluster" }));
    expect(setGroupBy).toHaveBeenCalledWith("cluster");
  });

  it("renders Sort dropdown with current value and options", () => {
    render(<SearchForm {...defaultProps()} />);
    const sortBtn = screen.getByRole("button", { name: /sort/i });
    expect(sortBtn.textContent).toContain("Relevance");
    fireEvent.click(sortBtn);
    expect(screen.getByRole("option", { name: "Date (newest)" })).not.toBeNull();
    expect(screen.getByRole("option", { name: "Date (oldest)" })).not.toBeNull();
  });

  it("selecting a Sort option calls setSortBy", () => {
    const setSortBy = vi.fn();
    render(<SearchForm {...defaultProps({ setSortBy })} />);
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    fireEvent.click(screen.getByRole("option", { name: "Date (newest)" }));
    expect(setSortBy).toHaveBeenCalledWith("date-newest");
  });
});

describe("SearchForm collapsed state", () => {
  it("renders collapsed summary with Show button when formVisible is false", () => {
    render(<SearchForm {...defaultProps({ formVisible: false, searchQuery: "billing migration", collapsedSummary: "Summary, Decisions" })} />);
    expect(screen.getByText("\"billing migration\"")).not.toBeNull();
    expect(screen.getByText("in Summary, Decisions")).not.toBeNull();
    expect(screen.getByRole("button", { name: /show/i })).not.toBeNull();
  });

  it("clicking Show button calls setFormVisible with true", () => {
    const setFormVisible = vi.fn();
    render(<SearchForm {...defaultProps({ formVisible: false, setFormVisible })} />);
    fireEvent.click(screen.getByRole("button", { name: /show/i }));
    expect(setFormVisible).toHaveBeenCalledWith(true);
  });

  it("shows Deep indicator when deepSearchEnabled is true in collapsed state", () => {
    render(<SearchForm {...defaultProps({ formVisible: false, deepSearchEnabled: true, searchQuery: "test" })} />);
    expect(screen.getByText("Deep")).not.toBeNull();
  });

  it("does not show Deep indicator when deepSearchEnabled is false in collapsed state", () => {
    render(<SearchForm {...defaultProps({ formVisible: false, deepSearchEnabled: false, searchQuery: "test" })} />);
    expect(screen.queryByText("Deep")).toBeNull();
  });

  it("does not render expanded form elements when collapsed", () => {
    render(<SearchForm {...defaultProps({ formVisible: false })} />);
    expect(screen.queryByText("SEARCH IN")).toBeNull();
    expect(screen.queryByLabelText("From date")).toBeNull();
    expect(screen.queryByRole("button", { name: /hide/i })).toBeNull();
  });
});

describe("SearchForm responsive classes", () => {
  it("field pills container has flex-wrap for mobile pill wrapping", () => {
    const { container } = render(<SearchForm {...defaultProps()} />);
    const pillsContainer = container.querySelector("[data-testid='search-field-pills']");
    expect(pillsContainer).not.toBeNull();
    expect(pillsContainer!.className).toContain("flex-wrap");
  });

  it("options row has flex-wrap for mobile stacking", () => {
    const { container } = render(<SearchForm {...defaultProps()} />);
    const optionsRow = container.querySelector("[data-testid='search-options-row']");
    expect(optionsRow).not.toBeNull();
    expect(optionsRow!.className).toContain("flex-wrap");
  });

  it("date inputs have search-form-date-input class for responsive width", () => {
    render(<SearchForm {...defaultProps()} />);
    const fromInput = screen.getByLabelText("From date");
    const toInput = screen.getByLabelText("To date");
    expect(fromInput.className).toContain("search-form-date-input");
    expect(toInput.className).toContain("search-form-date-input");
  });
});
