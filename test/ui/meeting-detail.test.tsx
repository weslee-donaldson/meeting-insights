// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { MeetingDetail } from "../../electron-ui/ui/src/components/MeetingDetail.js";
import type { MeetingRow, Artifact } from "../../electron-ui/electron/channels.js";

afterEach(cleanup);

function makeMeeting(overrides: Partial<MeetingRow> = {}): MeetingRow {
  return {
    id: "m1",
    title: "Alpha Meeting",
    date: "2026-02-25T10:00:00.000Z",
    client: "Acme",
    series: "alpha meeting",
    actionItemCount: 0,
    ...overrides,
  };
}

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

describe("MeetingDetail", () => {
  it("renders placeholder when meeting is null", () => {
    render(<MeetingDetail meeting={null} artifact={null} />);
    expect(screen.getByText("Select a meeting")).toBeDefined();
  });

  it("renders meeting title when meeting is set", () => {
    render(<MeetingDetail meeting={makeMeeting()} artifact={null} />);
    expect(screen.getByText("Alpha Meeting")).toBeDefined();
  });

  it("renders summary content visible by default when artifact is set", () => {
    render(<MeetingDetail meeting={makeMeeting()} artifact={makeArtifact()} />);
    expect(screen.getByText("We discussed the roadmap.")).toBeDefined();
  });
});
