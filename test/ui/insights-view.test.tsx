// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { InsightsView } from "../../electron-ui/ui/src/components/InsightsView.js";
import type { Insight } from "../../core/insights.js";

afterEach(cleanup);

const INSIGHTS: Insight[] = [
  {
    id: "i1",
    client_name: "Acme",
    period_type: "week",
    period_start: "2026-01-05",
    period_end: "2026-01-11",
    status: "draft",
    rag_status: "green",
    rag_rationale: "All on track",
    executive_summary: "Great week",
    topic_details: "[]",
    generated_at: "2026-01-11T12:00:00Z",
    created_at: "2026-01-11T12:00:00Z",
    updated_at: "2026-01-11T12:00:00Z",
    meeting_count: 3,
  },
  {
    id: "i2",
    client_name: "Acme",
    period_type: "month",
    period_start: "2026-01-01",
    period_end: "2026-01-31",
    status: "final",
    rag_status: "yellow",
    rag_rationale: "Some open items",
    executive_summary: "Mixed month",
    topic_details: "[]",
    generated_at: "2026-01-31T12:00:00Z",
    created_at: "2026-01-31T12:00:00Z",
    updated_at: "2026-01-31T12:00:00Z",
    meeting_count: 10,
  },
  {
    id: "i3",
    client_name: "Acme",
    period_type: "day",
    period_start: "2026-01-15",
    period_end: "2026-01-15",
    status: "draft",
    rag_status: "red",
    rag_rationale: "Blocked",
    executive_summary: "Bad day",
    topic_details: "[]",
    generated_at: "2026-01-15T12:00:00Z",
    created_at: "2026-01-15T12:00:00Z",
    updated_at: "2026-01-15T12:00:00Z",
    meeting_count: 1,
  },
];

describe("InsightsView", () => {
  it("renders header with client name and New Insight button", () => {
    render(
      <InsightsView
        insights={[]}
        clientName="Acme"
        onSelectInsight={vi.fn()}
        onCreateInsight={vi.fn()}
        selectedInsightId={null}
      />,
    );
    expect(screen.getByText("Acme Insights")).toBeDefined();
    expect(screen.getByRole("button", { name: "New Insight" })).toBeDefined();
  });

  it("shows empty state when no insights exist", () => {
    render(
      <InsightsView
        insights={[]}
        clientName="Acme"
        onSelectInsight={vi.fn()}
        onCreateInsight={vi.fn()}
        selectedInsightId={null}
      />,
    );
    expect(screen.getByText("No insights")).toBeDefined();
  });

  it("renders insight rows with RAG badges and period labels", () => {
    render(
      <InsightsView
        insights={INSIGHTS}
        clientName="Acme"
        onSelectInsight={vi.fn()}
        onCreateInsight={vi.fn()}
        selectedInsightId={null}
      />,
    );
    expect(screen.getByText("Jan 5 – Jan 11")).toBeDefined();
    expect(screen.getByText("Jan 1 – Jan 31")).toBeDefined();
    expect(screen.getByText("Jan 15")).toBeDefined();
    expect(screen.getByText("week")).toBeDefined();
    expect(screen.getByText("month")).toBeDefined();
    expect(screen.getByText("day")).toBeDefined();
    expect(screen.getByText("Final")).toBeDefined();
  });

  it("calls onSelectInsight when an insight row is clicked", () => {
    const onSelect = vi.fn();
    render(
      <InsightsView
        insights={INSIGHTS}
        clientName="Acme"
        onSelectInsight={onSelect}
        onCreateInsight={vi.fn()}
        selectedInsightId={null}
      />,
    );
    fireEvent.click(screen.getByText("Jan 5 – Jan 11"));
    expect(onSelect).toHaveBeenCalledWith("i1");
  });

  it("highlights selected insight row", () => {
    render(
      <InsightsView
        insights={INSIGHTS}
        clientName="Acme"
        onSelectInsight={vi.fn()}
        onCreateInsight={vi.fn()}
        selectedInsightId="i1"
      />,
    );
    const row = screen.getByText("Jan 5 – Jan 11").closest("button")!;
    expect(row.className).toContain("bg-secondary");
  });

  it("calls onCreateInsight when New Insight button is clicked", () => {
    const onCreate = vi.fn();
    render(
      <InsightsView
        insights={[]}
        clientName="Acme"
        onSelectInsight={vi.fn()}
        onCreateInsight={onCreate}
        selectedInsightId={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "New Insight" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("renders RAG circle badges with correct colors", () => {
    render(
      <InsightsView
        insights={INSIGHTS}
        clientName="Acme"
        onSelectInsight={vi.fn()}
        onCreateInsight={vi.fn()}
        selectedInsightId={null}
      />,
    );
    const ragBadges = screen.getAllByTestId("rag-badge");
    expect(ragBadges).toHaveLength(3);
    expect(ragBadges[0].className).toContain("bg-green");
    expect(ragBadges[1].className).toContain("bg-yellow");
    expect(ragBadges[2].className).toContain("bg-red");
  });
});
