// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { MobileListHeader } from "../../electron-ui/ui/src/components/shared/mobile-list-header.js";
import { FilterChipButton } from "../../electron-ui/ui/src/components/shared/filter-chip-button.js";
import { StatusDot } from "../../electron-ui/ui/src/components/shared/status-dot.js";
import { ListItemRow, MeetingAvatar } from "../../electron-ui/ui/src/components/shared/list-item-row.js";

afterEach(cleanup);

describe("Responsive Views — Thread List Mobile Layout", () => {
  it("renders MobileListHeader with thread count and new button", () => {
    render(
      <MobileListHeader
        title="Threads"
        subtitle="LLSA · 5 threads"
        onNew={vi.fn()}
        newLabel="+ New"
      />,
    );
    expect(screen.getByText("Threads")).toBeDefined();
    expect(screen.getByText("LLSA · 5 threads")).toBeDefined();
    expect(screen.getByLabelText("+ New")).toBeDefined();
  });

  it("renders thread row with touch target, title, shorthand, and meeting count", () => {
    render(
      <ListItemRow touchTarget onClick={vi.fn()}>
        <span className="flex-1 truncate font-medium">Recurly Migration</span>
        <span className="text-xs font-mono text-muted-foreground shrink-0">12</span>
        <span className="text-xs border rounded px-1">RCRL</span>
      </ListItemRow>,
    );
    const row = screen.getByRole("option");
    expect(row.className).toContain("min-h-[48px]");
    expect(screen.getByText("Recurly Migration")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
    expect(screen.getByText("RCRL")).toBeDefined();
  });
});

describe("Responsive Views — Insight List Mobile Layout", () => {
  it("renders insight row with RAG dot, period, badges", () => {
    render(
      <ListItemRow touchTarget onClick={vi.fn()}>
        <StatusDot color="green" size={10} />
        <span className="flex-1">Mar 10 – 16</span>
        <span className="text-xs border rounded px-1">Weekly</span>
        <span className="text-xs bg-green-100 text-green-800 rounded px-1">Final</span>
      </ListItemRow>,
    );
    const row = screen.getByRole("option");
    expect(row.className).toContain("min-h-[48px]");
    expect(screen.getByTestId("status-dot")).toBeDefined();
    expect(screen.getByText("Mar 10 – 16")).toBeDefined();
    expect(screen.getByText("Weekly")).toBeDefined();
    expect(screen.getByText("Final")).toBeDefined();
  });
});

describe("Responsive Views — Timeline List Mobile Layout", () => {
  it("renders milestone row with status dot, title, badge, date, mention count", () => {
    render(
      <ListItemRow touchTarget onClick={vi.fn()}>
        <StatusDot color="tracked" size={10} />
        <span className="flex-1 truncate">Recurly UAT</span>
        <span className="text-xs border rounded px-1">Tracked</span>
        <span className="text-xs text-muted-foreground tabular-nums">Mar 15</span>
        <span className="text-xs font-mono">3</span>
      </ListItemRow>,
    );
    const row = screen.getByRole("option");
    expect(row.className).toContain("min-h-[48px]");
    expect(screen.getByText("Recurly UAT")).toBeDefined();
    expect(screen.getByText("Tracked")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("renders status filter chips for timeline views", () => {
    render(
      <div className="flex gap-2">
        <FilterChipButton label="All" active />
        <FilterChipButton label="Tracked" />
        <FilterChipButton label="Completed" />
        <FilterChipButton label="Missed" />
      </div>,
    );
    const chips = screen.getAllByTestId("filter-chip");
    expect(chips.length).toBe(4);
    expect(chips[0].className).toContain("bg-[var(--color-tint)]");
    expect(chips[1].className).not.toContain("bg-[var(--color-tint)]");
  });
});

describe("Responsive Views — Action Items Mobile Layout", () => {
  it("renders action item with priority badge, owner, meeting source", () => {
    render(
      <ListItemRow touchTarget onClick={vi.fn()}>
        <input type="checkbox" />
        <span className="flex-1 truncate">Deploy fix to production</span>
        <span className="text-xs bg-red-600 text-white rounded px-1">CRITICAL</span>
        <span className="text-xs text-muted-foreground">Alice</span>
      </ListItemRow>,
    );
    const row = screen.getByRole("option");
    expect(row.className).toContain("min-h-[48px]");
    expect(screen.getByText("Deploy fix to production")).toBeDefined();
    expect(screen.getByText("CRITICAL")).toBeDefined();
    expect(screen.getByText("Alice")).toBeDefined();
  });

  it("renders MobileListHeader with action item count", () => {
    render(
      <MobileListHeader
        title="Action Items"
        subtitle="LLSA · 490 open"
        filterSlot={
          <>
            <FilterChipButton label="Priority" active />
            <FilterChipButton label="Series" />
            <FilterChipButton label="Owner" />
          </>
        }
      />,
    );
    expect(screen.getByText("Action Items")).toBeDefined();
    expect(screen.getByText("LLSA · 490 open")).toBeDefined();
    expect(screen.getAllByTestId("filter-chip").length).toBe(3);
  });
});
