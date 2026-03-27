// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { CompactResultsSidebar } from "../../electron-ui/ui/src/components/CompactResultsSidebar.js";
import type { EnrichedResult } from "../../electron-ui/ui/src/hooks/useSearchState.js";

afterEach(cleanup);

function makeResult(overrides: Partial<EnrichedResult> = {}): EnrichedResult {
  return {
    meetingId: "m1",
    displayScore: 0.85,
    date: "2026-03-12T10:00:00Z",
    title: "Sprint Planning",
    client: "Acme",
    series: "weekly",
    clusterTags: [],
    artifact: null,
    matchedDecisions: [],
    matchedActionItems: [],
    matchedRisks: [],
    totalDecisions: 0,
    totalActionItems: 0,
    totalRisks: 0,
    deepSearchSummary: null,
    ...overrides,
  };
}

describe("CompactResultsSidebar", () => {
  it("renders back header and result rows with title, date, and score", () => {
    const results = [
      makeResult({ meetingId: "m1", title: "Sprint Planning", date: "2026-03-12T10:00:00Z", displayScore: 0.85 }),
      makeResult({ meetingId: "m2", title: "Design Review", date: "2026-03-11T10:00:00Z", displayScore: 0.72 }),
    ];
    render(
      <CompactResultsSidebar
        enrichedResults={results}
        selectedResultId="m1"
        onSelect={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByText("Back to full view")).toBeDefined();
    expect(screen.getByText("Sprint Planning")).toBeDefined();
    expect(screen.getByText("Design Review")).toBeDefined();
    expect(screen.getByText("2026-03-12")).toBeDefined();
    expect(screen.getByText("2026-03-11")).toBeDefined();
    expect(screen.getByText("85")).toBeDefined();
    expect(screen.getByText("72")).toBeDefined();
  });

  it("highlights selected row with data-selected attribute", () => {
    const results = [
      makeResult({ meetingId: "m1", title: "Sprint Planning" }),
      makeResult({ meetingId: "m2", title: "Design Review" }),
    ];
    render(
      <CompactResultsSidebar
        enrichedResults={results}
        selectedResultId="m1"
        onSelect={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    const rows = screen.getAllByRole("option");
    expect(rows[0].getAttribute("data-selected")).toBe("true");
    expect(rows[1].getAttribute("data-selected")).toBe("false");
  });

  it("calls onSelect when a row is clicked", () => {
    const onSelect = vi.fn();
    const results = [
      makeResult({ meetingId: "m1", title: "Sprint Planning" }),
      makeResult({ meetingId: "m2", title: "Design Review" }),
    ];
    render(
      <CompactResultsSidebar
        enrichedResults={results}
        selectedResultId="m1"
        onSelect={onSelect}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Design Review"));
    expect(onSelect).toHaveBeenCalledWith("m2");
  });

  it("calls onBack when back header is clicked", () => {
    const onBack = vi.fn();
    render(
      <CompactResultsSidebar
        enrichedResults={[makeResult()]}
        selectedResultId="m1"
        onSelect={vi.fn()}
        onBack={onBack}
      />,
    );
    fireEvent.click(screen.getByText("Back to full view"));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("renders empty list when no results provided", () => {
    render(
      <CompactResultsSidebar
        enrichedResults={[]}
        selectedResultId={null}
        onSelect={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByText("Back to full view")).toBeDefined();
    expect(screen.queryAllByRole("option")).toEqual([]);
  });
});
