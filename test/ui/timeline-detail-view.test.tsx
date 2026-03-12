// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TimelineDetailView } from "../../electron-ui/ui/src/components/TimelineDetailView.js";
import type { Milestone, DateSlippageEntry, MilestoneMention, MilestoneActionItem } from "../../core/timelines.js";

afterEach(cleanup);

const MILESTONE: Milestone = {
  id: "m1",
  client_name: "Acme",
  title: "Launch v2.0",
  description: "Major product launch",
  target_date: "2026-03-15",
  status: "tracked",
  completed_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-15T00:00:00Z",
  ignored: 0,
};

describe("TimelineDetailView", () => {
  it("renders milestone title and status badge", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    expect(screen.getByText("Launch v2.0")).toBeDefined();
    expect(screen.getByText("tracked")).toBeDefined();
  });

  it("renders target date formatted", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    expect(screen.getByText("Mar 15, 2026")).toBeDefined();
  });

  it("renders description", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    expect(screen.getByText("Major product launch")).toBeDefined();
  });

  it("shows Unscheduled when no target date", () => {
    const noDate = { ...MILESTONE, target_date: null };
    render(<TimelineDetailView milestone={noDate} onDelete={vi.fn()} />);
    expect(screen.getByText("Unscheduled")).toBeDefined();
  });

  it("calls onDelete when delete is confirmed", () => {
    const onDelete = vi.fn();
    render(<TimelineDetailView milestone={MILESTONE} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText(/Are you sure/)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("does not call onDelete when delete is cancelled", () => {
    const onDelete = vi.fn();
    render(<TimelineDetailView milestone={MILESTONE} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("renders status dot with correct color", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    const dot = screen.getByTestId("detail-status-dot");
    expect(dot.className).toContain("bg-blue");
  });

  it("renders date slippage section when slippage data provided", () => {
    const slippage: DateSlippageEntry[] = [
      { mentioned_at: "2026-01-10", target_date_at_mention: "2026-03-15", meeting_title: "Planning Sync" },
      { mentioned_at: "2026-02-05", target_date_at_mention: "2026-04-01", meeting_title: "Status Update" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} slippage={slippage} />);
    expect(screen.getByText("Date History")).toBeDefined();
    expect(screen.getAllByText("Mar 15, 2026").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Apr 1, 2026")).toBeDefined();
  });

  it("does not render slippage section when slippage is empty", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} slippage={[]} />);
    expect(screen.queryByText("Date History")).toBeNull();
  });

  it("shows amber warning indicator when slippage detected", () => {
    const slippage: DateSlippageEntry[] = [
      { mentioned_at: "2026-01-10", target_date_at_mention: "2026-03-15", meeting_title: "Planning Sync" },
      { mentioned_at: "2026-02-05", target_date_at_mention: "2026-04-01", meeting_title: "Status Update" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} slippage={slippage} />);
    const warning = screen.getByTestId("slippage-warning");
    expect(warning.className).toContain("bg-amber");
    expect(warning.textContent).toBe("Target date has changed");
  });

  it("renders confirm and reject buttons for pending mentions", () => {
    const pendingMentions: MilestoneMention[] = [
      {
        milestone_id: "m1",
        meeting_id: "mtg1",
        mention_type: "status_update",
        excerpt: "We discussed the launch timeline",
        target_date_at_mention: "2026-03-15",
        mentioned_at: "2026-02-10",
        pending_review: 1,
        meeting_title: "Weekly Sync",
        meeting_date: "2026-02-10",
      },
    ];
    render(
      <TimelineDetailView
        milestone={MILESTONE}
        onDelete={vi.fn()}
        pendingMentions={pendingMentions}
        onConfirmMention={vi.fn()}
        onRejectMention={vi.fn()}
      />,
    );
    expect(screen.getByText("Review Pending Matches")).toBeDefined();
    expect(screen.getByText("Weekly Sync")).toBeDefined();
    expect(screen.getByRole("button", { name: "Confirm Match" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Reject Match" })).toBeDefined();
  });

  it("calls onConfirmMention when confirm clicked", () => {
    const onConfirmMention = vi.fn();
    const pendingMentions: MilestoneMention[] = [
      {
        milestone_id: "m1",
        meeting_id: "mtg1",
        mention_type: "status_update",
        excerpt: "Launch discussion",
        target_date_at_mention: null,
        mentioned_at: "2026-02-10",
        pending_review: 1,
        meeting_title: "Weekly Sync",
        meeting_date: "2026-02-10",
      },
    ];
    render(
      <TimelineDetailView
        milestone={MILESTONE}
        onDelete={vi.fn()}
        pendingMentions={pendingMentions}
        onConfirmMention={onConfirmMention}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm Match" }));
    expect(onConfirmMention).toHaveBeenCalledWith("m1", "mtg1");
  });

  it("calls onRejectMention when reject clicked", () => {
    const onRejectMention = vi.fn();
    const pendingMentions: MilestoneMention[] = [
      {
        milestone_id: "m1",
        meeting_id: "mtg1",
        mention_type: "status_update",
        excerpt: "Launch discussion",
        target_date_at_mention: null,
        mentioned_at: "2026-02-10",
        pending_review: 1,
        meeting_title: "Weekly Sync",
        meeting_date: "2026-02-10",
      },
    ];
    render(
      <TimelineDetailView
        milestone={MILESTONE}
        onDelete={vi.fn()}
        pendingMentions={pendingMentions}
        onRejectMention={onRejectMention}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reject Match" }));
    expect(onRejectMention).toHaveBeenCalledWith("m1", "mtg1");
  });

  it("does not render pending review section when no pending mentions", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} pendingMentions={[]} />);
    expect(screen.queryByText("Review Pending Matches")).toBeNull();
  });

  it("shows Edit button in view mode", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();
  });

  it("switches to edit mode with editable fields on Edit click", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Title")).toBeDefined();
    expect(screen.getByLabelText("Description")).toBeDefined();
    expect(screen.getByLabelText("Target date")).toBeDefined();
    expect(screen.getByLabelText("Status")).toBeDefined();
    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
  });

  it("populates edit fields with current milestone values", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} onUpdate={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Launch v2.0");
    expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toBe("tracked");
  });

  it("calls onUpdate with changed values on Save", () => {
    const onUpdate = vi.fn();
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Launch v3.0" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onUpdate).toHaveBeenCalledWith({
      title: "Launch v3.0",
      description: "Major product launch",
      targetDate: "2026-03-15",
      status: "tracked",
    });
  });

  it("returns to view mode on Cancel without calling onUpdate", () => {
    const onUpdate = vi.fn();
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Changed" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("renders mentions timeline when mentions provided", () => {
    const mentions: MilestoneMention[] = [
      { milestone_id: "m1", meeting_id: "mtg1", mention_type: "introduced", excerpt: "First mention", target_date_at_mention: null, mentioned_at: "2026-01-10", pending_review: 0, meeting_title: "Kickoff Meeting", meeting_date: "2026-01-10" },
      { milestone_id: "m1", meeting_id: "mtg2", mention_type: "updated", excerpt: "Second mention", target_date_at_mention: "2026-03-15", mentioned_at: "2026-02-05", pending_review: 0, meeting_title: "Progress Review", meeting_date: "2026-02-05" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} mentions={mentions} />);
    expect(screen.getByText("Mentions")).toBeDefined();
    expect(screen.getByText("Kickoff Meeting")).toBeDefined();
    expect(screen.getByText("Progress Review")).toBeDefined();
  });

  it("shows mention type badges", () => {
    const mentions: MilestoneMention[] = [
      { milestone_id: "m1", meeting_id: "mtg1", mention_type: "introduced", excerpt: "intro", target_date_at_mention: null, mentioned_at: "2026-01-10", pending_review: 0, meeting_title: "Meeting A", meeting_date: "2026-01-10" },
      { milestone_id: "m1", meeting_id: "mtg2", mention_type: "updated", excerpt: "update", target_date_at_mention: null, mentioned_at: "2026-02-05", pending_review: 0, meeting_title: "Meeting B", meeting_date: "2026-02-05" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} mentions={mentions} />);
    expect(screen.getByText("introduced")).toBeDefined();
    expect(screen.getByText("updated")).toBeDefined();
  });

  it("shows excerpt text", () => {
    const mentions: MilestoneMention[] = [
      { milestone_id: "m1", meeting_id: "mtg1", mention_type: "introduced", excerpt: "Discussed migration plan", target_date_at_mention: null, mentioned_at: "2026-01-10", pending_review: 0, meeting_title: "Planning", meeting_date: "2026-01-10" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} mentions={mentions} />);
    expect(screen.getByText("Discussed migration plan")).toBeDefined();
  });

  it("shows Pending indicator on pending mentions", () => {
    const mentions: MilestoneMention[] = [
      { milestone_id: "m1", meeting_id: "mtg1", mention_type: "introduced", excerpt: "some excerpt", target_date_at_mention: null, mentioned_at: "2026-01-10", pending_review: 1, meeting_title: "Some Meeting", meeting_date: "2026-01-10" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} mentions={mentions} />);
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("does not render mentions section when mentions is empty", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} mentions={[]} />);
    expect(screen.queryByText("Mentions")).toBeNull();
  });

  it("renders linked action items when actionItems provided", () => {
    const actionItems: MilestoneActionItem[] = [
      { milestone_id: "m1", meeting_id: "mtg1", item_index: 0, linked_at: "2026-01-01T00:00:00Z", meeting_title: "Planning Sync", meeting_date: "2026-01-01" },
      { milestone_id: "m1", meeting_id: "mtg2", item_index: 1, linked_at: "2026-01-02T00:00:00Z", meeting_title: "Design Review", meeting_date: "2026-01-02" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} actionItems={actionItems} />);
    expect(screen.getByText("Linked Action Items")).toBeDefined();
    expect(screen.getByText("Planning Sync")).toBeDefined();
    expect(screen.getByText("Design Review")).toBeDefined();
  });

  it("shows action item index and meeting title", () => {
    const actionItems: MilestoneActionItem[] = [
      { milestone_id: "m1", meeting_id: "mtg1", item_index: 2, linked_at: "2026-01-01T00:00:00Z", meeting_title: "Planning Sync", meeting_date: "2026-01-01" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} actionItems={actionItems} />);
    expect(screen.getByText("Planning Sync")).toBeDefined();
    expect(screen.getByText("#2")).toBeDefined();
  });

  it("shows unlink button for each action item", () => {
    const actionItems: MilestoneActionItem[] = [
      { milestone_id: "m1", meeting_id: "mtg1", item_index: 0, linked_at: "2026-01-01T00:00:00Z", meeting_title: "Planning Sync", meeting_date: "2026-01-01" },
      { milestone_id: "m1", meeting_id: "mtg2", item_index: 1, linked_at: "2026-01-02T00:00:00Z", meeting_title: "Design Review", meeting_date: "2026-01-02" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} actionItems={actionItems} />);
    expect(screen.getAllByRole("button", { name: "Unlink" }).length).toBe(2);
  });

  it("calls onUnlinkActionItem when unlink clicked", () => {
    const onUnlinkActionItem = vi.fn();
    const actionItems: MilestoneActionItem[] = [
      { milestone_id: "m1", meeting_id: "mtg1", item_index: 0, linked_at: "2026-01-01T00:00:00Z", meeting_title: "Planning Sync", meeting_date: "2026-01-01" },
    ];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} actionItems={actionItems} onUnlinkActionItem={onUnlinkActionItem} />);
    fireEvent.click(screen.getByRole("button", { name: "Unlink" }));
    expect(onUnlinkActionItem).toHaveBeenCalledWith("m1", "mtg1", 0);
  });

  it("does not render action items section when actionItems is empty", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} actionItems={[]} />);
    expect(screen.queryByText("Linked Action Items")).toBeNull();
  });

  it("renders Merge button when allMilestones provided", () => {
    const allMilestones = [{ id: "m2", title: "Security audit" }, { id: "m3", title: "API migration" }];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} allMilestones={allMilestones} />);
    expect(screen.getByRole("button", { name: "Merge into..." })).toBeDefined();
  });

  it("clicking Merge shows select with other milestones", () => {
    const allMilestones = [{ id: "m2", title: "Security audit" }, { id: "m3", title: "API migration" }];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} allMilestones={allMilestones} />);
    fireEvent.click(screen.getByRole("button", { name: "Merge into..." }));
    expect(screen.getByText("Security audit")).toBeDefined();
    expect(screen.getByText("API migration")).toBeDefined();
  });

  it("calls onMerge with target id when confirmed", () => {
    const onMerge = vi.fn();
    const allMilestones = [{ id: "m2", title: "Security audit" }, { id: "m3", title: "API migration" }];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} allMilestones={allMilestones} onMerge={onMerge} />);
    fireEvent.click(screen.getByRole("button", { name: "Merge into..." }));
    fireEvent.change(screen.getByLabelText("Target milestone"), { target: { value: "m2" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm Merge" }));
    expect(onMerge).toHaveBeenCalledWith("m2");
  });

  it("hides merge UI on Cancel", () => {
    const allMilestones = [{ id: "m2", title: "Security audit" }];
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} allMilestones={allMilestones} />);
    fireEvent.click(screen.getByRole("button", { name: "Merge into..." }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Confirm Merge")).toBeNull();
  });

  it("does not render Merge button when allMilestones is empty or undefined", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Merge into..." })).toBeNull();
  });
});
