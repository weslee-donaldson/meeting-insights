// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TimelinesView } from "../../electron-ui/ui/src/components/TimelinesView.js";
import type { Milestone } from "../../core/timelines.js";

afterEach(cleanup);

const MILESTONES: (Milestone & { mention_count?: number; first_mentioned_at?: string | null })[] = [
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
    mention_count: 5,
    first_mentioned_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "m2",
    client_name: "Acme",
    title: "Security audit",
    description: "Annual security review",
    target_date: null,
    status: "identified",
    completed_at: null,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
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
    mention_count: 8,
    first_mentioned_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "m4",
    client_name: "Acme",
    title: "Q1 deliverable",
    description: "Missed deadline",
    target_date: "2026-02-28",
    status: "missed",
    completed_at: null,
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "m5",
    client_name: "Acme",
    title: "Legacy cleanup",
    description: "Deferred to next quarter",
    target_date: "2026-04-01",
    status: "deferred",
    completed_at: null,
    created_at: "2026-01-05T00:00:00Z",
    updated_at: "2026-02-15T00:00:00Z",
  },
];

describe("TimelinesView", () => {
  it("renders header with client name and New Milestone button", () => {
    render(
      <TimelinesView
        milestones={[]}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("Acme Timelines")).toBeDefined();
    expect(screen.getByRole("button", { name: "New Milestone" })).toBeDefined();
  });

  it("shows empty state when no milestones exist", () => {
    render(
      <TimelinesView
        milestones={[]}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("No milestones")).toBeDefined();
  });

  it("renders milestone rows with titles and status badges", () => {
    render(
      <TimelinesView
        milestones={MILESTONES}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("Launch v2.0")).toBeDefined();
    expect(screen.getByText("Security audit")).toBeDefined();
    expect(screen.getByText("API migration")).toBeDefined();
    expect(screen.getAllByText("tracked").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("identified").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("completed").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("missed").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("deferred").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onSelectMilestone when a milestone row is clicked", () => {
    const onSelect = vi.fn();
    render(
      <TimelinesView
        milestones={MILESTONES}
        clientName="Acme"
        onSelectMilestone={onSelect}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    fireEvent.click(screen.getByText("Launch v2.0"));
    expect(onSelect).toHaveBeenCalledWith("m1");
  });

  it("highlights selected milestone row", () => {
    render(
      <TimelinesView
        milestones={MILESTONES}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId="m1"
      />,
    );
    const row = screen.getByText("Launch v2.0").closest("button")!;
    expect(row.className).toContain("bg-secondary");
  });

  it("calls onCreateMilestone when New Milestone button is clicked", () => {
    const onCreate = vi.fn();
    render(
      <TimelinesView
        milestones={[]}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={onCreate}
        selectedMilestoneId={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "New Milestone" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("shows target date formatted as short date or Unscheduled", () => {
    render(
      <TimelinesView
        milestones={MILESTONES}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("Mar 15")).toBeDefined();
    expect(screen.getByText("Unscheduled")).toBeDefined();
    expect(screen.getByText("Jan 20")).toBeDefined();
  });

  it("shows mention count when available", () => {
    render(
      <TimelinesView
        milestones={MILESTONES}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("8")).toBeDefined();
  });

  it("renders status filter dropdown with all statuses", () => {
    render(
      <TimelinesView
        milestones={MILESTONES}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Filter by status" });
    expect(select).toBeDefined();
    const options = Array.from(select.querySelectorAll("option")).map((o: HTMLOptionElement) => o.textContent);
    expect(options).toEqual(["All", "identified", "tracked", "completed", "missed", "deferred"]);
  });

  it("filters milestones by selected status", () => {
    render(
      <TimelinesView
        milestones={MILESTONES}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Filter by status" });
    fireEvent.change(select, { target: { value: "tracked" } });
    expect(screen.getByText("Launch v2.0")).toBeDefined();
    expect(screen.queryByText("Security audit")).toBeNull();
    expect(screen.queryByText("API migration")).toBeNull();
    expect(screen.queryByText("Q1 deliverable")).toBeNull();
    expect(screen.queryByText("Legacy cleanup")).toBeNull();
  });

  it("shows Review badge on milestones with pending mentions", () => {
    const milestonesWithReview = [
      { ...MILESTONES[0], has_pending_review: true },
      ...MILESTONES.slice(1),
    ];
    render(
      <TimelinesView
        milestones={milestonesWithReview}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    const reviewBadges = screen.getAllByText("Review");
    expect(reviewBadges).toHaveLength(1);
  });

  it("renders status dots with correct colors", () => {
    render(
      <TimelinesView
        milestones={MILESTONES}
        clientName="Acme"
        onSelectMilestone={vi.fn()}
        onCreateMilestone={vi.fn()}
        selectedMilestoneId={null}
      />,
    );
    const dots = screen.getAllByTestId("status-dot");
    expect(dots).toHaveLength(5);
    expect(dots[0].className).toContain("bg-blue");
    expect(dots[1].className).toContain("bg-gray");
    expect(dots[2].className).toContain("bg-green");
    expect(dots[3].className).toContain("bg-red");
    expect(dots[4].className).toContain("bg-amber");
  });
});
