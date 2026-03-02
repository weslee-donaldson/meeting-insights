// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
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

  it("copy summary button writes title + date + summary + decisions as markdown to clipboard", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true });
    render(<MeetingDetail meeting={makeMeeting()} artifact={makeArtifact()} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy summary" }));
    expect(writeText).toHaveBeenCalledWith(
      "# Alpha Meeting\nDate: 2026-02-25\n\n## Summary\nWe discussed the roadmap.\n\n## Decisions\n- Ship by March",
    );
  });

  it("reassign client button opens picker with client options", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={null}
        clients={["Acme", "Beta Co"]}
        onReassignClient={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reassign client" }));
    expect(screen.getByRole("button", { name: "Acme" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Beta Co" })).toBeDefined();
  });

  it("selecting a client from picker calls onReassignClient", () => {
    const onReassignClient = vi.fn();
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={null}
        clients={["Acme", "Beta Co"]}
        onReassignClient={onReassignClient}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reassign client" }));
    fireEvent.click(screen.getByRole("button", { name: "Acme" }));
    expect(onReassignClient).toHaveBeenCalledWith("Acme");
  });

  it("re-extract button calls onReExtract when clicked", () => {
    const onReExtract = vi.fn();
    render(<MeetingDetail meeting={makeMeeting()} artifact={makeArtifact()} onReExtract={onReExtract} />);
    fireEvent.click(screen.getByRole("button", { name: "Re-extract" }));
    expect(onReExtract).toHaveBeenCalledOnce();
  });

  it("copy action items button writes checklist to clipboard", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true });
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Write tests", owner: "Alice", due_date: "2026-03-01" },
            { description: "Review PR", owner: "Bob", due_date: null },
            { description: "Deploy app", owner: null, due_date: null },
          ],
        })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy action items" }));
    expect(writeText).toHaveBeenCalledWith(
      "- [ ] Write tests (Alice, 2026-03-01)\n- [ ] Review PR (Bob)\n- [ ] Deploy app",
    );
  });
});
