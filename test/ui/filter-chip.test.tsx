// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FilterChip, ActiveFilterChip } from "../../electron-ui/ui/src/components/shared/filter-chip.js";

afterEach(cleanup);

describe("FilterChip", () => {
  it("renders label and value with correct styling", () => {
    render(<FilterChip label="Group" value="Series" options={["Series", "Day"]} onChange={vi.fn()} />);
    const labelEl = screen.getByText("Group:");
    expect(labelEl.className).toContain("text-[var(--color-text-secondary)]");
    const valueEl = screen.getByText("Series");
    expect(valueEl.className).toContain("font-semibold");
    expect(valueEl.className).toContain("text-[var(--color-text-primary)]");
  });

  it("renders with border, input background, and 11px text", () => {
    render(<FilterChip label="Sort" value="Newest" options={["Newest"]} onChange={vi.fn()} />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border-[var(--color-line)]");
    expect(btn.className).toContain("bg-[var(--color-bg-input)]");
    expect(btn.className).toContain("text-[11px]");
  });

  it("opens popover with options on click", () => {
    render(<FilterChip label="Group" value="Series" options={["Series", "Day", "Week"]} onChange={vi.fn()} />);
    expect(screen.queryByRole("listbox")).toBeNull();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("calls onChange with selected option and closes popover", () => {
    const onChange = vi.fn();
    render(<FilterChip label="Group" value="Series" options={["Series", "Day"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Day"));
    expect(onChange).toHaveBeenCalledWith("Day");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("highlights current value with accent color in dropdown", () => {
    render(<FilterChip label="Group" value="Series" options={["Series", "Day"]} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button"));
    const selected = screen.getByRole("option", { selected: true });
    expect(selected.className).toContain("text-[var(--color-accent)]");
  });
});

describe("ActiveFilterChip", () => {
  it("renders with tint background and accent text", () => {
    render(<ActiveFilterChip label="Owner: Wesley" onRemove={vi.fn()} />);
    const chip = screen.getByText("Owner: Wesley");
    expect(chip.closest("span")!.className).toContain("bg-[var(--color-tint)]");
    expect(chip.closest("span")!.className).toContain("text-[var(--color-accent)]");
  });

  it("renders at 10px font size with medium weight", () => {
    render(<ActiveFilterChip label="Priority: Critical" onRemove={vi.fn()} />);
    const chip = screen.getByText("Priority: Critical").closest("span")!;
    expect(chip.className).toContain("text-[10px]");
    expect(chip.className).toContain("font-medium");
  });

  it("calls onRemove when × button clicked", () => {
    const onRemove = vi.fn();
    render(<ActiveFilterChip label="Test" onRemove={onRemove} />);
    fireEvent.click(screen.getByLabelText("Remove filter Test"));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
