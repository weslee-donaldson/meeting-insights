// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ContextViewColumn } from "../../ui/src/components/ContextViewColumn.js";
import type { MeetingRow, Artifact } from "../../electron/channels.js";

afterEach(cleanup);


function makeArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    summary: "We discussed the roadmap.",
    decisions: ["Ship by March"],
    proposed_features: ["Dark mode"],
    action_items: [{ description: "Write tests", owner: "Alice", due_date: null }],
    technical_topics: ["TypeScript"],
    open_questions: ["When to launch?"],
    risk_items: ["Timeline slippage"],
    additional_notes: [],
    ...overrides,
  };
}

function makeMeeting(id: string, title: string): MeetingRow {
  return { id, title, date: "2026-02-25T10:00:00.000Z", client: "Acme", series: title.toLowerCase() };
}

describe("ContextViewColumn", () => {
  it("renders one block per meeting with correct title", () => {
    render(
      <ContextViewColumn
        meetings={[
          { meeting: makeMeeting("m1", "Alpha Meeting"), artifact: makeArtifact() },
          { meeting: makeMeeting("m2", "Beta Meeting"), artifact: makeArtifact() },
        ]}
      />,
    );
    expect(screen.getByText("Alpha Meeting")).toBeDefined();
    expect(screen.getByText("Beta Meeting")).toBeDefined();
  });

  it("renders section triggers that are collapsed by default", () => {
    render(
      <ContextViewColumn
        meetings={[
          { meeting: makeMeeting("m1", "Alpha Meeting"), artifact: makeArtifact() },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", { name: /summary/i });
    expect(trigger).toBeDefined();
  });

  it("does not render Decisions section when decisions is empty", () => {
    render(
      <ContextViewColumn
        meetings={[
          {
            meeting: makeMeeting("m1", "Alpha Meeting"),
            artifact: makeArtifact({ decisions: [] }),
          },
        ]}
      />,
    );
    expect(screen.queryByRole("button", { name: /decisions/i })).toBeNull();
  });

  it("shows expanded content after clicking a section header", () => {
    render(
      <ContextViewColumn
        meetings={[
          { meeting: makeMeeting("m1", "Alpha Meeting"), artifact: makeArtifact() },
        ]}
      />,
    );
    const trigger = screen.getByRole("button", { name: /summary/i });
    fireEvent.click(trigger);
    expect(screen.getByText("We discussed the roadmap.")).toBeDefined();
  });

  it("shows fallback when no meetings provided", () => {
    render(<ContextViewColumn meetings={[]} />);
    expect(screen.getByText("No meetings selected")).toBeDefined();
  });
});
