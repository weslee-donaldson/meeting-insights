// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { InsightDetailView } from "../../electron-ui/ui/src/components/InsightDetailView.js";
import type { Insight, InsightMeeting } from "../../core/insights.js";

afterEach(cleanup);

const INSIGHT: Insight = {
  id: "i1",
  client_name: "Acme",
  period_type: "week",
  period_start: "2026-01-05",
  period_end: "2026-01-11",
  status: "draft",
  rag_status: "yellow",
  rag_rationale: "Some action items remain open",
  executive_summary: "Overall a productive week with minor blockers.",
  topic_details: JSON.stringify([
    { topic: "Feature Delivery", summary: "On track", status: "green", meeting_ids: ["m1"] },
    { topic: "Open Issues", summary: "Two blockers", status: "red", meeting_ids: ["m2"] },
  ]),
  generated_at: "2026-01-11T12:00:00Z",
  created_at: "2026-01-11T12:00:00Z",
  updated_at: "2026-01-11T12:00:00Z",
  meeting_count: 3,
};

const MEETINGS: InsightMeeting[] = [
  { insight_id: "i1", meeting_id: "m1", meeting_title: "Alpha Weekly", meeting_date: "2026-01-06", contribution_summary: "Discussed features" },
  { insight_id: "i1", meeting_id: "m2", meeting_title: "Beta Daily", meeting_date: "2026-01-07", contribution_summary: "Reviewed blockers" },
];

describe("InsightDetailView", () => {
  it("renders header with period label and RAG badge", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("Jan 5 – Jan 11")).toBeDefined();
    expect(screen.getByTestId("detail-rag-badge")).toBeDefined();
    expect(screen.getByTestId("detail-rag-badge").className).toContain("bg-yellow");
    expect(screen.getByText("Draft")).toBeDefined();
  });

  it("renders RAG rationale text", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("Some action items remain open")).toBeDefined();
  });

  it("renders executive summary section", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("Executive Summary")).toBeDefined();
    expect(screen.getByText("Overall a productive week with minor blockers.")).toBeDefined();
  });

  it("shows Final badge when insight status is final", () => {
    const finalInsight = { ...INSIGHT, status: "final" as const };
    render(
      <InsightDetailView
        insight={finalInsight}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("Final")).toBeDefined();
  });

  it("renders topic details with per-topic RAG badges", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("Topic Details")).toBeDefined();
    expect(screen.getByText("Feature Delivery")).toBeDefined();
    expect(screen.getByText("On track")).toBeDefined();
    expect(screen.getByText("Open Issues")).toBeDefined();
    expect(screen.getByText("Two blockers")).toBeDefined();
    const topicBadges = screen.getAllByTestId("topic-rag-badge");
    expect(topicBadges).toHaveLength(2);
    expect(topicBadges[0].className).toContain("bg-green");
    expect(topicBadges[1].className).toContain("bg-red");
  });

  it("renders source meetings with titles and contribution summaries", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("Source Meetings")).toBeDefined();
    expect(screen.getByText("Alpha Weekly")).toBeDefined();
    expect(screen.getByText("Discussed features")).toBeDefined();
    expect(screen.getByText("Beta Daily")).toBeDefined();
    expect(screen.getByText("Reviewed blockers")).toBeDefined();
  });

  it("shows no topics section when topic_details is empty array", () => {
    const noTopics = { ...INSIGHT, topic_details: "[]" };
    render(
      <InsightDetailView
        insight={noTopics}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.queryByText("Topic Details")).toBeNull();
  });

  it("renders Regenerate button that calls onRegenerate", () => {
    const onRegenerate = vi.fn();
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={onRegenerate}
        onFinalize={vi.fn()}
      />,
    );
    const btn = screen.getByRole("button", { name: "Regenerate" });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onRegenerate).toHaveBeenCalled();
  });

  it("renders Finalize button for draft insight that calls onFinalize", () => {
    const onFinalize = vi.fn();
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={onFinalize}
      />,
    );
    const btn = screen.getByRole("button", { name: "Finalize" });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onFinalize).toHaveBeenCalled();
  });

  it("renders Reopen button for final insight that calls onFinalize", () => {
    const onFinalize = vi.fn();
    const finalInsight = { ...INSIGHT, status: "final" as const };
    render(
      <InsightDetailView
        insight={finalInsight}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={onFinalize}
      />,
    );
    expect(screen.queryByRole("button", { name: "Finalize" })).toBeNull();
    const btn = screen.getByRole("button", { name: "Reopen" });
    fireEvent.click(btn);
    expect(onFinalize).toHaveBeenCalled();
  });

  it("renders Delete button that calls onDelete", () => {
    const onDelete = vi.fn();
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={onDelete}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    const btn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(btn);
    expect(onDelete).toHaveBeenCalled();
  });

  it("renders checkboxes for each meeting that toggle on click", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onRemoveMeetings={vi.fn()}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    fireEvent.click(checkboxes[0]);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
  });

  it("Remove Selected button calls onRemoveMeetings with unchecked meeting ids", () => {
    const onRemoveMeetings = vi.fn();
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onRemoveMeetings={onRemoveMeetings}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    const removeBtn = screen.getByRole("button", { name: "Remove Unchecked" });
    fireEvent.click(removeBtn);
    expect(onRemoveMeetings).toHaveBeenCalledWith(["m1"]);
  });

  it("Remove Unchecked button is hidden when all meetings are checked", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onRemoveMeetings={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Remove Unchecked" })).toBeNull();
  });

  it("shows no summary placeholder when executive_summary is empty", () => {
    const emptyInsight = { ...INSIGHT, executive_summary: "", rag_rationale: "" };
    render(
      <InsightDetailView
        insight={emptyInsight}
        meetings={[]}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("No summary yet. Generate to create one.")).toBeDefined();
  });

  it("shows Generate button when executive_summary is empty", () => {
    const emptyInsight = { ...INSIGHT, executive_summary: "" };
    const onRegenerate = vi.fn();
    render(
      <InsightDetailView
        insight={emptyInsight}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={onRegenerate}
        onFinalize={vi.fn()}
      />,
    );
    const btn = screen.getByRole("button", { name: "Generate" });
    expect(btn).toBeDefined();
    expect(screen.queryByRole("button", { name: "Regenerate" })).toBeNull();
    fireEvent.click(btn);
    expect(onRegenerate).toHaveBeenCalled();
  });

  it("shows empty state message when no source meetings exist", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={[]}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("Source Meetings")).toBeDefined();
    expect(screen.getByText(/No source meetings found/)).toBeDefined();
  });
});
