// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MilestoneCalendarView } from "../../electron-ui/ui/src/components/MilestoneCalendarView.js";
import type { Milestone } from "../../core/timelines.js";

afterEach(cleanup);

const MILESTONES: Milestone[] = [
  {
    id: "m1",
    client_name: "Acme",
    title: "Launch v2.0",
    description: "",
    target_date: "2026-03-15",
    status: "tracked",
    completed_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "m2",
    client_name: "Acme",
    title: "Security audit",
    description: "",
    target_date: null,
    status: "identified",
    completed_at: null,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
  },
];

describe("MilestoneCalendarView — month grid navigation", () => {
  it("renders prev/next month navigation buttons", () => {
    render(
      <MilestoneCalendarView
        milestones={[]}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDefined();
  });

  it("renders day-of-week headers", () => {
    render(
      <MilestoneCalendarView
        milestones={[]}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("Sun")).toBeDefined();
    expect(screen.getByText("Mon")).toBeDefined();
    expect(screen.getByText("Sat")).toBeDefined();
  });

  it("changes month title when Next month is clicked", () => {
    render(
      <MilestoneCalendarView
        milestones={[]}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    expect(screen.getByText("March 2026")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("April 2026")).toBeDefined();
  });

  it("changes month title when Previous month is clicked", () => {
    render(
      <MilestoneCalendarView
        milestones={[]}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    expect(screen.getByText("March 2026")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("February 2026")).toBeDefined();
  });
});

describe("MilestoneCalendarView — milestone pills", () => {
  it("renders pill for milestone on its target date cell", () => {
    render(
      <MilestoneCalendarView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    expect(screen.getByText("Launch v2.0")).toBeDefined();
  });

  it("renders tracked milestone pill with blue color class", () => {
    render(
      <MilestoneCalendarView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    const pills = screen.getAllByTestId("calendar-pill");
    const trackedPill = pills.find((p) => p.textContent?.includes("Launch v2.0"));
    expect(trackedPill).toBeDefined();
    expect(trackedPill!.className).toContain("bg-blue-500");
  });

  it("does not render unscheduled milestone in the month grid", () => {
    render(
      <MilestoneCalendarView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    const pills = screen.getAllByTestId("calendar-pill");
    const gridPills = pills.filter((p) => p.textContent?.includes("Security audit"));
    expect(gridPills.length).toBe(0);
  });
});

describe("MilestoneCalendarView — pill click and unscheduled section", () => {
  it("calls onSelectMilestone with milestone id when pill is clicked", () => {
    const onSelectMilestone = vi.fn();
    render(
      <MilestoneCalendarView
        milestones={MILESTONES}
        onSelectMilestone={onSelectMilestone}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    const pills = screen.getAllByTestId("calendar-pill");
    const pill = pills.find((p) => p.textContent?.includes("Launch v2.0"))!;
    fireEvent.click(pill);
    expect(onSelectMilestone).toHaveBeenCalledWith("m1");
  });

  it("renders Unscheduled section below the grid", () => {
    render(
      <MilestoneCalendarView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    expect(screen.getByText("Unscheduled")).toBeDefined();
  });

  it("renders unscheduled milestone in the Unscheduled section", () => {
    render(
      <MilestoneCalendarView
        milestones={MILESTONES}
        onSelectMilestone={vi.fn()}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    expect(screen.getByTestId("unscheduled-item-m2")).toBeDefined();
  });

  it("calls onSelectMilestone when unscheduled item is clicked", () => {
    const onSelectMilestone = vi.fn();
    render(
      <MilestoneCalendarView
        milestones={MILESTONES}
        onSelectMilestone={onSelectMilestone}
        selectedMilestoneId={null}
        initialMonth={{ year: 2026, month: 2 }}
      />,
    );
    fireEvent.click(screen.getByTestId("unscheduled-item-m2"));
    expect(onSelectMilestone).toHaveBeenCalledWith("m2");
  });
});
