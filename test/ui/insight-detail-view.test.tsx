// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
});
