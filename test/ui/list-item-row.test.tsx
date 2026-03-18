// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ListItemRow } from "../../electron-ui/ui/src/components/shared/list-item-row.js";
import { GroupHeader } from "../../electron-ui/ui/src/components/shared/group-header.js";

afterEach(cleanup);

describe("ListItemRow", () => {
  it("renders selected state with tint background and accent left border", () => {
    render(<ListItemRow selected>Selected</ListItemRow>);
    const row = screen.getByRole("option");
    expect(row.className).toContain("bg-[var(--color-tint)]");
    expect(row.className).toContain("border-l-[var(--color-accent)]");
    expect(row.getAttribute("aria-selected")).toBe("true");
  });

  it("renders default state with transparent border and hover style", () => {
    render(<ListItemRow>Default</ListItemRow>);
    const row = screen.getByRole("option");
    expect(row.className).toContain("border-l-transparent");
    expect(row.className).toContain("hover:bg-[var(--color-bg-elevated)]");
    expect(row.getAttribute("aria-selected")).toBe("false");
  });

  it("fires onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ListItemRow onClick={onClick}>Clickable</ListItemRow>);
    fireEvent.click(screen.getByRole("option"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders children as content slot", () => {
    render(
      <ListItemRow>
        <span>Fri, Mar 13</span>
        <span>observability</span>
      </ListItemRow>,
    );
    expect(screen.getByText("Fri, Mar 13")).toBeTruthy();
    expect(screen.getByText("observability")).toBeTruthy();
  });
});

describe("GroupHeader", () => {
  it("renders series group with primary text and uppercase styling", () => {
    render(<GroupHeader label="Pre-Mortem for Commerce" />);
    const label = screen.getByText("Pre-Mortem for Commerce");
    expect(label.className).toContain("text-[var(--color-text-primary)]");
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("tracking-[0.04em]");
    expect(label.className).toContain("text-[11px]");
  });

  it("renders priority group with danger color", () => {
    render(<GroupHeader label="Critical" variant="priority" />);
    const label = screen.getByText("Critical");
    expect(label.className).toContain("text-[var(--color-danger)]");
  });

  it("renders date group with meta text", () => {
    render(<GroupHeader label="Mar 12" variant="date" meta="Day" />);
    expect(screen.getByText("Mar 12")).toBeTruthy();
    expect(screen.getByText("Day")).toBeTruthy();
  });

  it("renders label and meta text", () => {
    render(<GroupHeader label="Test" meta="3 meetings" />);
    expect(screen.getByText("Test")).toBeTruthy();
    expect(screen.getByText("3 meetings")).toBeTruthy();
  });
});
