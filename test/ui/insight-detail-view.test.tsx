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
  rag_rationale: "",
  executive_summary: "Overall a productive week with minor blockers.",
  topic_details: JSON.stringify([
    { topic: "Feature Delivery", summary: "On track", status: "green" },
    { topic: "Open Issues", summary: "Two blockers", status: "red" },
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

function enterEditMode() {
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
}

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

  it("renders executive summary section in default view", () => {
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

  it("hides source meetings in default view", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.queryByText("Source Meetings")).toBeNull();
    expect(screen.queryByText("Alpha Weekly")).toBeNull();
  });

  it("shows Edit button in default view", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Regenerate" })).toBeNull();
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

  it("renders source meetings after clicking Edit", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
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

  it("renders Regenerate button in edit mode that calls onRegenerate", () => {
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
    enterEditMode();
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

  it("pre-selects all meetings in edit mode", () => {
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
    enterEditMode();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
  });

  it("renders checkboxes in edit mode that toggle on click", () => {
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
    enterEditMode();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
    fireEvent.click(checkboxes[0]);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
  });

  it("Remove Unchecked button calls onRemoveMeetings with unchecked meeting ids", () => {
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
    enterEditMode();
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
    enterEditMode();
    expect(screen.queryByRole("button", { name: "Remove Unchecked" })).toBeNull();
  });

  it("shows rich text editor when summary edit button is clicked", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onUpdateSummary={vi.fn()}
      />,
    );
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    const summaryEditBtn = editButtons.find((btn) => btn.closest("[class*='px-1.5']"));
    fireEvent.click(summaryEditBtn!);
    expect(screen.getByTestId("rich-text-editor")).toBeDefined();
    expect(screen.getByTestId("rte-toolbar")).toBeDefined();
    expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
  });

  it("cancel button exits summary editing mode", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onUpdateSummary={vi.fn()}
      />,
    );
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    const summaryEditBtn = editButtons.find((btn) => btn.closest("[class*='px-1.5']"));
    fireEvent.click(summaryEditBtn!);
    expect(screen.getByTestId("rich-text-editor")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByTestId("rich-text-editor")).toBeNull();
  });

  it("save button calls onUpdateSummary and exits editing mode", () => {
    const onUpdateSummary = vi.fn();
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onUpdateSummary={onUpdateSummary}
      />,
    );
    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    const summaryEditBtn = editButtons.find((btn) => btn.closest("[class*='px-1.5']"));
    fireEvent.click(summaryEditBtn!);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onUpdateSummary).toHaveBeenCalled();
    expect(screen.queryByTestId("rich-text-editor")).toBeNull();
  });

  it("renders markdown bold as HTML strong in default view", () => {
    const mdInsight = { ...INSIGHT, executive_summary: "Summary with **bold** text" };
    render(
      <InsightDetailView
        insight={mdInsight}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    const display = screen.getByTestId("summary-display");
    expect(display.innerHTML).toContain("<strong>bold</strong>");
  });

  it("renders markdown bullet lists in summary", () => {
    const mdInsight = { ...INSIGHT, executive_summary: "Verdict.\n\n- Item one\n- Item two" };
    render(
      <InsightDetailView
        insight={mdInsight}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    const display = screen.getByTestId("summary-display");
    expect(display.innerHTML).toContain("<ul>");
    expect(display.innerHTML).toContain("<li>");
    expect(screen.getByText("Item one")).toBeDefined();
    expect(screen.getByText("Item two")).toBeDefined();
  });

  it("does not render raw HTML tags from summary markdown", () => {
    const mdInsight = { ...INSIGHT, executive_summary: "Safe\n\n<script>alert('xss')</script>" };
    render(
      <InsightDetailView
        insight={mdInsight}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    const display = screen.getByTestId("summary-display");
    expect(display.innerHTML).not.toContain("<script>");
    expect(screen.getByText("Safe")).toBeDefined();
  });

  it("shows no summary placeholder when executive_summary is empty", () => {
    const emptyInsight = { ...INSIGHT, executive_summary: "" };
    render(
      <InsightDetailView
        insight={emptyInsight}
        meetings={[]}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    expect(screen.getByText("No summary yet. Click Edit to select meetings and generate.")).toBeDefined();
  });

  it("shows Generate button in edit mode when executive_summary is empty", () => {
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
    enterEditMode();
    const btn = screen.getByRole("button", { name: "Generate" });
    expect(btn).toBeDefined();
    expect(screen.queryByRole("button", { name: "Regenerate" })).toBeNull();
    fireEvent.click(btn);
    expect(onRegenerate).toHaveBeenCalled();
  });

  it("Back button returns to default view from edit mode", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
    expect(screen.getByText("Source Meetings")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.queryByText("Source Meetings")).toBeNull();
    expect(screen.getByText("Executive Summary")).toBeDefined();
  });

  it("renders group-by buttons in edit mode", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
    expect(screen.getByRole("button", { name: "Series" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Day" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Week" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Month" })).toBeDefined();
    expect(screen.queryByTestId("meeting-group-header")).toBeNull();
  });

  it("groups meetings by day when Day button is clicked", () => {
    const meetings: InsightMeeting[] = [
      { insight_id: "i1", meeting_id: "m1", meeting_title: "Alpha", meeting_date: "2026-01-06", contribution_summary: "s1" },
      { insight_id: "i1", meeting_id: "m2", meeting_title: "Beta", meeting_date: "2026-01-06", contribution_summary: "s2" },
      { insight_id: "i1", meeting_id: "m3", meeting_title: "Gamma", meeting_date: "2026-01-07", contribution_summary: "s3" },
    ];
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={meetings}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
    fireEvent.click(screen.getByRole("button", { name: "Day" }));
    const headers = screen.getAllByTestId("meeting-group-header");
    expect(headers).toHaveLength(2);
    expect(headers[0].textContent).toContain("Jan 7");
    expect(headers[1].textContent).toContain("Jan 6");
  });

  it("groups meetings by week when Week button is clicked", () => {
    const meetings: InsightMeeting[] = [
      { insight_id: "i1", meeting_id: "m1", meeting_title: "Alpha", meeting_date: "2026-01-05", contribution_summary: "s1" },
      { insight_id: "i1", meeting_id: "m2", meeting_title: "Beta", meeting_date: "2026-01-12", contribution_summary: "s2" },
    ];
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={meetings}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    const headers = screen.getAllByTestId("meeting-group-header");
    expect(headers).toHaveLength(2);
    expect(headers[0].textContent).toContain("Week of Jan 12");
    expect(headers[1].textContent).toContain("Week of Jan 5");
  });

  it("groups meetings by month when Month button is clicked", () => {
    const meetings: InsightMeeting[] = [
      { insight_id: "i1", meeting_id: "m1", meeting_title: "Alpha", meeting_date: "2026-01-06", contribution_summary: "s1" },
      { insight_id: "i1", meeting_id: "m2", meeting_title: "Beta", meeting_date: "2026-02-10", contribution_summary: "s2" },
    ];
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={meetings}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    const headers = screen.getAllByTestId("meeting-group-header");
    expect(headers).toHaveLength(2);
    expect(headers[0].textContent).toContain("February 2026");
    expect(headers[1].textContent).toContain("January 2026");
  });

  it("groups meetings by series when Series button is clicked", () => {
    const meetings: InsightMeeting[] = [
      { insight_id: "i1", meeting_id: "m1", meeting_title: "Alpha Weekly", meeting_date: "2026-01-06", contribution_summary: "s1" },
      { insight_id: "i1", meeting_id: "m2", meeting_title: "Alpha Weekly", meeting_date: "2026-01-13", contribution_summary: "s2" },
      { insight_id: "i1", meeting_id: "m3", meeting_title: "Beta Daily", meeting_date: "2026-01-07", contribution_summary: "s3" },
    ];
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={meetings}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
    fireEvent.click(screen.getByRole("button", { name: "Series" }));
    const headers = screen.getAllByTestId("meeting-group-header");
    expect(headers).toHaveLength(2);
    expect(headers[0].textContent).toContain("Alpha Weekly");
    expect(headers[1].textContent).toContain("Beta Daily");
  });

  it("per-group deselect all deselects only meetings in that group", () => {
    const meetings: InsightMeeting[] = [
      { insight_id: "i1", meeting_id: "m1", meeting_title: "Alpha", meeting_date: "2026-01-06", contribution_summary: "s1" },
      { insight_id: "i1", meeting_id: "m2", meeting_title: "Beta", meeting_date: "2026-01-07", contribution_summary: "s2" },
    ];
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={meetings}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onRemoveMeetings={vi.fn()}
      />,
    );
    enterEditMode();
    fireEvent.click(screen.getByRole("button", { name: "Day" }));
    const deselectBtns = screen.getAllByRole("button", { name: "Deselect all" });
    expect(deselectBtns).toHaveLength(2);
    fireEvent.click(deselectBtns[0]);
    const checkboxes = screen.getAllByRole("checkbox");
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
  });

  it("per-group select all re-selects only meetings in that group", () => {
    const meetings: InsightMeeting[] = [
      { insight_id: "i1", meeting_id: "m1", meeting_title: "Alpha", meeting_date: "2026-01-06", contribution_summary: "s1" },
      { insight_id: "i1", meeting_id: "m2", meeting_title: "Alpha", meeting_date: "2026-01-06", contribution_summary: "s2" },
      { insight_id: "i1", meeting_id: "m3", meeting_title: "Beta", meeting_date: "2026-01-07", contribution_summary: "s3" },
    ];
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={meetings}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onRemoveMeetings={vi.fn()}
      />,
    );
    enterEditMode();
    fireEvent.click(screen.getByRole("button", { name: "Day" }));
    const deselectBtns = screen.getAllByRole("button", { name: "Deselect all" });
    fireEvent.click(deselectBtns[0]);
    const selectBtn = screen.getByRole("button", { name: "Select all" });
    fireEvent.click(selectBtn);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.every((cb) => (cb as HTMLInputElement).checked)).toBe(true);
  });

  it("Show All Meetings button calls onShowAllMeetings", () => {
    const onShowAllMeetings = vi.fn();
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        onShowAllMeetings={onShowAllMeetings}
      />,
    );
    enterEditMode();
    const btn = screen.getByRole("button", { name: "Show All Meetings" });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onShowAllMeetings).toHaveBeenCalled();
  });

  it("hides Show All Meetings button when onShowAllMeetings is not provided", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
    expect(screen.queryByRole("button", { name: "Show All Meetings" })).toBeNull();
  });

  it("shows spinning icon and disables Regenerate button when isRegenerating is true", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        isRegenerating={true}
      />,
    );
    enterEditMode();
    const btn = screen.getByRole("button", { name: "Regenerating..." });
    expect(btn).toBeDefined();
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    expect(btn.querySelector(".animate-spin")).toBeDefined();
  });

  it("exits edit mode when isRegenerating transitions from true to false", () => {
    const { rerender } = render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        isRegenerating={true}
      />,
    );
    enterEditMode();
    expect(screen.getByText("Source Meetings")).toBeDefined();
    rerender(
      <InsightDetailView
        insight={INSIGHT}
        meetings={MEETINGS}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
        isRegenerating={false}
      />,
    );
    expect(screen.queryByText("Source Meetings")).toBeNull();
    expect(screen.getByText("Executive Summary")).toBeDefined();
  });

  it("shows empty state message in edit mode when no source meetings exist", () => {
    render(
      <InsightDetailView
        insight={INSIGHT}
        meetings={[]}
        onDelete={vi.fn()}
        onRegenerate={vi.fn()}
        onFinalize={vi.fn()}
      />,
    );
    enterEditMode();
    expect(screen.getByText("Source Meetings")).toBeDefined();
    expect(screen.getByText(/No source meetings found/)).toBeDefined();
  });
});
