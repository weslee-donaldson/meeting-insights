// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FilterBar } from "../../electron-ui/ui/src/components/shared/filter-bar.js";

afterEach(cleanup);

describe("FilterBar", () => {
  it("renders group and sort chips with a divider before filters", () => {
    const { container } = render(
      <FilterBar
        groupBy={{ label: "Group", value: "Series", options: ["Series", "Day"], onChange: vi.fn() }}
        sortBy={{ label: "Sort", value: "Newest", options: ["Newest", "Oldest"], onChange: vi.fn() }}
        filters={[
          { key: "series", label: "Series", value: "All", options: ["All", "DSU"], onChange: vi.fn() },
        ]}
      />,
    );
    expect(screen.getByText("Group:")).toBeTruthy();
    expect(screen.getByText("Sort:")).toBeTruthy();
    expect(screen.getByText("Series:")).toBeTruthy();
    const divider = container.querySelector(".w-px.h-5");
    expect(divider).not.toBeNull();
  });

  it("renders active filter chips with remove buttons", () => {
    const onRemove = vi.fn();
    render(
      <FilterBar
        activeFilters={[
          { key: "owner", label: "Owner", value: "Wesley Donaldson" },
          { key: "priority", label: "Priority", value: "Critical" },
        ]}
        onRemoveFilter={onRemove}
        onClearAll={vi.fn()}
      />,
    );
    expect(screen.getByText("Owner: Wesley Donaldson")).toBeTruthy();
    expect(screen.getByText("Priority: Critical")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Remove filter Owner: Wesley Donaldson"));
    expect(onRemove).toHaveBeenCalledWith("owner");
  });

  it("renders Clear all link when active filters present", () => {
    const onClearAll = vi.fn();
    render(
      <FilterBar
        activeFilters={[{ key: "owner", label: "Owner", value: "Test" }]}
        onRemoveFilter={vi.fn()}
        onClearAll={onClearAll}
      />,
    );
    const clearAll = screen.getByText("Clear all");
    expect(clearAll.className).toContain("text-[var(--color-accent)]");
    expect(clearAll.className).toContain("underline");
    fireEvent.click(clearAll);
    expect(onClearAll).toHaveBeenCalledOnce();
  });

  it("does not render active filters row when no active filters", () => {
    render(
      <FilterBar
        groupBy={{ label: "Group", value: "Series", options: ["Series"], onChange: vi.fn() }}
      />,
    );
    expect(screen.queryByText("Clear all")).toBeNull();
  });

  it("has toolbar role for accessibility", () => {
    render(
      <FilterBar
        groupBy={{ label: "Group", value: "Series", options: ["Series"], onChange: vi.fn() }}
      />,
    );
    expect(screen.getByRole("toolbar")).toBeTruthy();
  });
});
