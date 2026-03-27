// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SearchResultCard } from "../../electron-ui/ui/src/components/SearchResultCard.js";
import type { EnrichedResult } from "../../electron-ui/ui/src/hooks/useSearchState.js";

afterEach(cleanup);

function makeResult(overrides: Partial<EnrichedResult> = {}): EnrichedResult {
  return {
    meetingId: "m1",
    displayScore: 0.92,
    date: "2026-03-12T10:00:00.000Z",
    title: "Sprint Planning",
    client: "Acme",
    series: "sprint planning",
    clusterTags: ["onboarding", "billing"],
    artifact: {
      decisions: [{ text: "Use billing API v2" }],
      action_items: [
        { description: "Migrate billing endpoint", owner: "Alice", reporter: "Bob", due_date: "2026-03-20" },
      ],
      risk_items: [{ description: "API rate limits could block launch" }],
    },
    matchedDecisions: ["Use billing API v2"],
    matchedActionItems: ["Migrate billing endpoint"],
    matchedRisks: ["API rate limits could block launch"],
    totalDecisions: 1,
    totalActionItems: 1,
    totalRisks: 1,
    deepSearchSummary: null,
    ...overrides,
  };
}

function defaultProps(overrides: Partial<React.ComponentProps<typeof SearchResultCard>> = {}) {
  return {
    result: makeResult(),
    checked: false,
    onToggleChecked: vi.fn(),
    onOpen: vi.fn(),
    searchQuery: "billing",
    ...overrides,
  };
}

describe("SearchResultCard — header", () => {
  it("renders title and formatted date", () => {
    render(<SearchResultCard {...defaultProps()} />);
    expect(screen.getByText(/Sprint Planning/)).not.toBeNull();
    expect(screen.getByText(/Mar 12, 2026/)).not.toBeNull();
  });

  it("renders cluster tag pills", () => {
    render(<SearchResultCard {...defaultProps()} />);
    expect(screen.getByText("onboarding")).not.toBeNull();
    expect(screen.getByText("billing")).not.toBeNull();
  });

  it("renders display score in mono font", () => {
    render(<SearchResultCard {...defaultProps()} />);
    const scoreEl = screen.getByTestId("result-score");
    expect(scoreEl.textContent).toBe("0.92");
  });

  it("renders Open button that calls onOpen with meetingId", async () => {
    const onOpen = vi.fn();
    const user = (await import("@testing-library/user-event")).default.setup();
    render(<SearchResultCard {...defaultProps({ onOpen })} />);
    await user.click(screen.getByText("Open"));
    expect(onOpen).toHaveBeenCalledWith("m1");
  });

  it("renders unchecked checkbox with muted border", () => {
    render(<SearchResultCard {...defaultProps({ checked: false })} />);
    const checkbox = screen.getByTestId("result-checkbox");
    expect(checkbox.getAttribute("data-checked")).toBe("false");
  });

  it("applies green gradient color for score >= 0.9", () => {
    render(<SearchResultCard {...defaultProps({ result: makeResult({ displayScore: 0.95 }) })} />);
    const scoreEl = screen.getByTestId("result-score");
    expect(scoreEl.style.color).toBe("rgb(45, 138, 78)");
  });

  it("applies mid-green color for score 0.8-0.89", () => {
    render(<SearchResultCard {...defaultProps({ result: makeResult({ displayScore: 0.85 }) })} />);
    const scoreEl = screen.getByTestId("result-score");
    expect(scoreEl.style.color).toBe("rgb(90, 154, 62)");
  });

  it("applies yellow-green color for score 0.7-0.79", () => {
    render(<SearchResultCard {...defaultProps({ result: makeResult({ displayScore: 0.75 }) })} />);
    const scoreEl = screen.getByTestId("result-score");
    expect(scoreEl.style.color).toBe("rgb(122, 154, 62)");
  });

  it("applies low-green color for score below 0.7", () => {
    render(<SearchResultCard {...defaultProps({ result: makeResult({ displayScore: 0.55 }) })} />);
    const scoreEl = screen.getByTestId("result-score");
    expect(scoreEl.style.color).toBe("rgb(154, 170, 62)");
  });
});

describe("SearchResultCard — matched artifacts", () => {
  it("renders matched decisions with amber circle-check icon", () => {
    render(<SearchResultCard {...defaultProps()} />);
    const decisionsArea = screen.getByTestId("matched-decisions");
    expect(decisionsArea.textContent).toContain("Use billing API v2");
  });

  it("renders matched action items with description and inline owner/reporter/due", () => {
    render(<SearchResultCard {...defaultProps()} />);
    const actionsArea = screen.getByTestId("matched-action-items");
    expect(actionsArea.textContent).toContain("Migrate billing endpoint");
    expect(actionsArea.textContent).toContain("Owner: Alice");
    expect(actionsArea.textContent).toContain("Reporter: Bob");
    expect(actionsArea.textContent).toContain("2026-03-20");
  });

  it("renders matched risks with amber warning icon", () => {
    render(<SearchResultCard {...defaultProps()} />);
    const risksArea = screen.getByTestId("matched-risks");
    expect(risksArea.textContent).toContain("API rate limits could block launch");
  });

  it("renders artifact sections indented 24px from left", () => {
    render(<SearchResultCard {...defaultProps()} />);
    const artifactArea = screen.getByTestId("artifact-matches");
    expect(artifactArea.style.paddingLeft).toBe("24px");
  });

  it("does not render artifact sections when no matched items", () => {
    render(
      <SearchResultCard
        {...defaultProps({
          result: makeResult({
            matchedDecisions: [],
            matchedActionItems: [],
            matchedRisks: [],
          }),
        })}
      />,
    );
    expect(screen.queryByTestId("artifact-matches")).toBeNull();
  });
});

describe("SearchResultCard — WHY block", () => {
  it("renders WHY block when deepSearchSummary exists", () => {
    render(
      <SearchResultCard
        {...defaultProps({
          result: makeResult({ deepSearchSummary: "This meeting discussed billing migration timelines." }),
        })}
      />,
    );
    expect(screen.getByText("WHY")).not.toBeNull();
    expect(screen.getByText("This meeting discussed billing migration timelines.")).not.toBeNull();
  });

  it("does not render WHY block when deepSearchSummary is null", () => {
    render(
      <SearchResultCard
        {...defaultProps({
          result: makeResult({ deepSearchSummary: null }),
        })}
      />,
    );
    expect(screen.queryByText("WHY")).toBeNull();
  });

  it("applies amber left border and warm background to WHY block", () => {
    render(
      <SearchResultCard
        {...defaultProps({
          result: makeResult({ deepSearchSummary: "Relevant because billing was discussed." }),
        })}
      />,
    );
    const whyBlock = screen.getByTestId("why-block");
    expect(whyBlock.style.backgroundColor).toBe("rgb(253, 248, 240)");
    expect(whyBlock.style.borderLeft).toBe("2px solid rgb(230, 165, 74)");
  });
});
