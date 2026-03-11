// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MilestoneGanttView } from "../../electron-ui/ui/src/components/MilestoneGanttView.js";
import type { Milestone } from "../../core/timelines.js";

afterEach(cleanup);

const MILESTONES: Array<Milestone & { first_mentioned_at?: string | null }> = [
  {
    id: "m1",
    client_name: "Acme",
    title: "Launch v2.0",
    description: "Major product launch",
    target_date: "2026-03-15",
    status: "tracked",
    completed_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
    first_mentioned_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "m2",
    client_name: "Acme",
    title: "Security audit",
    description: "Annual security review",
    target_date: "2026-04-30",
    status: "identified",
    completed_at: null,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
    first_mentioned_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "m3",
    client_name: "Acme",
    title: "API migration",
    description: "Migrate to new API",
    target_date: "2026-01-20",
    status: "completed",
    completed_at: "2026-01-18T00:00:00Z",
    created_at: "2025-12-01T00:00:00Z",
    updated_at: "2026-01-18T00:00:00Z",
    first_mentioned_at: "2025-12-01T00:00:00Z",
  },
];

describe("MilestoneGanttView", () => {
  it("renders month column headers covering milestone date range", () => {
    render(
      <MilestoneGanttView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("Dec 2025")).toBeDefined();
    expect(screen.getByText("Jan 2026")).toBeDefined();
    expect(screen.getByText("Feb 2026")).toBeDefined();
    expect(screen.getByText("Mar 2026")).toBeDefined();
    expect(screen.getByText("Apr 2026")).toBeDefined();
  });

  it("renders milestone titles in left column", () => {
    render(
      <MilestoneGanttView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("Launch v2.0")).toBeDefined();
    expect(screen.getByText("Security audit")).toBeDefined();
    expect(screen.getByText("API migration")).toBeDefined();
  });

  it("renders gantt bars for milestones with target dates", () => {
    render(
      <MilestoneGanttView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    const bars = screen.getAllByTestId("gantt-bar");
    expect(bars.length).toBe(3);
  });

  it("applies status color classes to gantt bars", () => {
    render(
      <MilestoneGanttView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    const bars = screen.getAllByTestId("gantt-bar");
    const classNames = bars.map((b) => b.className);
    expect(classNames.some((c) => c.includes("bg-blue"))).toBe(true);
    expect(classNames.some((c) => c.includes("bg-gray"))).toBe(true);
    expect(classNames.some((c) => c.includes("bg-green"))).toBe(true);
  });

  it("renders today marker element", () => {
    render(
      <MilestoneGanttView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByTestId("today-marker")).toBeDefined();
  });

  it("calls onSelectMilestone with milestone id when bar is clicked", () => {
    const onSelect = vi.fn();
    render(
      <MilestoneGanttView
        milestones={MILESTONES}
        onSelectMilestone={onSelect}
        selectedMilestoneId={null}
      />,
    );
    const bars = screen.getAllByTestId("gantt-bar");
    fireEvent.click(bars[0]);
    expect(onSelect).toHaveBeenCalledWith(expect.any(String));
  });

  it("calls onSelectMilestone with correct id for specific bar", () => {
    const onSelect = vi.fn();
    render(
      <MilestoneGanttView
        milestones={[MILESTONES[0]]}
        onSelectMilestone={onSelect}
        selectedMilestoneId={null}
      />,
    );
    const bar = screen.getByTestId("gantt-bar");
    fireEvent.click(bar);
    expect(onSelect).toHaveBeenCalledWith("m1");
  });

  it("renders status badges in left column", () => {
    render(
      <MilestoneGanttView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getAllByText("tracked").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("identified").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("completed").length).toBeGreaterThanOrEqual(1);
  });

  it("highlights selected milestone row", () => {
    render(
      <MilestoneGanttView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId="m1"
      />,
    );
    const titleEls = screen.getAllByText("Launch v2.0");
    const row = titleEls[0].closest("[data-testid='gantt-row']")!;
    expect(row.className).toContain("bg-secondary");
  });

  it("shows empty state when no milestones", () => {
    render(
      <MilestoneGanttView
        milestones={[]}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("No milestones")).toBeDefined();
  });
});
