// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { MeetingDetail } from "../../electron-ui/ui/src/components/MeetingDetail.js";
import type { MeetingRow, Artifact, ActionItemCompletion } from "../../electron-ui/electron/channels.js";

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
    decisions: [{ text: "Ship by March", decided_by: "" }],
    proposed_features: ["Dark mode"],
    action_items: [{ description: "Write tests", owner: "Alice", requester: "", due_date: null }],
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

  it("ignore button calls onIgnore when clicked", () => {
    const onIgnore = vi.fn();
    render(<MeetingDetail meeting={makeMeeting()} artifact={null} onIgnore={onIgnore} />);
    fireEvent.click(screen.getByRole("button", { name: "Ignore meeting" }));
    expect(onIgnore).toHaveBeenCalledOnce();
  });

  it("re-extract button calls onReExtract when clicked", () => {
    const onReExtract = vi.fn();
    render(<MeetingDetail meeting={makeMeeting()} artifact={makeArtifact()} onReExtract={onReExtract} />);
    fireEvent.click(screen.getByRole("button", { name: "Re-extract" }));
    expect(onReExtract).toHaveBeenCalledOnce();
  });

  it("clicking action item checkbox calls onComplete with its index and empty note", () => {
    const onComplete = vi.fn();
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Write tests", owner: "Alice", requester: "", due_date: null },
            { description: "Review PR", owner: "Bob", requester: "", due_date: null },
          ],
        })}
        completions={[]}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Complete item 0" }));
    expect(onComplete).toHaveBeenCalledWith(0, "");
  });

  it("completed item renders inline with strikethrough and checkmark", () => {
    const completions: ActionItemCompletion[] = [
      { id: "m1:0", meeting_id: "m1", item_index: 0, completed_at: "2026-03-01T00:00:00Z", note: "done" },
    ];
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Write tests", owner: "Alice", requester: "", due_date: null },
            { description: "Review PR", owner: "Bob", requester: "", due_date: null },
          ],
        })}
        completions={completions}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Write tests")).toBeDefined();
    expect(screen.getByText("Review PR")).toBeDefined();
    const completedItem = screen.getByText("Write tests");
    expect(completedItem.className).toContain("line-through");
  });

  it("clicking a completed item description opens note dialog pre-filled with existing note", () => {
    const completions: ActionItemCompletion[] = [
      { id: "m1:0", meeting_id: "m1", item_index: 0, completed_at: "2026-03-01T00:00:00Z", note: "existing note" },
    ];
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({ action_items: [{ description: "Write tests", owner: "Alice", requester: "", due_date: null }] })}
        completions={completions}
        onComplete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Write tests"));
    expect(screen.getByRole("textbox", { name: "Completion note" })).toBeDefined();
    expect((screen.getByRole("textbox", { name: "Completion note" }) as HTMLTextAreaElement).value).toBe("existing note");
  });

  it("saving note from dialog calls onComplete with updated note", () => {
    const onComplete = vi.fn();
    const completions: ActionItemCompletion[] = [
      { id: "m1:0", meeting_id: "m1", item_index: 0, completed_at: "2026-03-01T00:00:00Z", note: "old note" },
    ];
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({ action_items: [{ description: "Write tests", owner: "Alice", requester: "", due_date: null }] })}
        completions={completions}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByText("Write tests"));
    const textarea = screen.getByRole("textbox", { name: "Completion note" });
    fireEvent.change(textarea, { target: { value: "new note" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onComplete).toHaveBeenCalledWith(0, "new note");
  });

  it("canceling note dialog does not call onComplete", () => {
    const onComplete = vi.fn();
    const completions: ActionItemCompletion[] = [
      { id: "m1:0", meeting_id: "m1", item_index: 0, completed_at: "2026-03-01T00:00:00Z", note: "old note" },
    ];
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({ action_items: [{ description: "Write tests", owner: "Alice", requester: "", due_date: null }] })}
        completions={completions}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByText("Write tests"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("action items header shows count text and progress bar", () => {
    const completions: ActionItemCompletion[] = [
      { id: "m1:0", meeting_id: "m1", item_index: 0, completed_at: "2026-03-01T00:00:00Z", note: "" },
    ];
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Task A", owner: null, requester: "", due_date: null },
            { description: "Task B", owner: null, requester: "", due_date: null },
            { description: "Task C", owner: null, requester: "", due_date: null },
          ],
        })}
        completions={completions}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("1 / 3")).toBeDefined();
    const progress = screen.getByRole("progressbar");
    expect(progress.style.width).toBe("33%");
  });

  it("Mark all complete button calls onComplete for each active item with shared note", () => {
    const onComplete = vi.fn();
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Task A", owner: null, requester: "", due_date: null },
            { description: "Task B", owner: null, requester: "", due_date: null },
          ],
        })}
        completions={[]}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mark all complete" }));
    const textarea = screen.getByRole("textbox", { name: "Completion note" });
    fireEvent.change(textarea, { target: { value: "bulk done" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onComplete).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledWith(0, "bulk done");
    expect(onComplete).toHaveBeenCalledWith(1, "bulk done");
  });

  it("copy action items button writes checklist to clipboard", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true });
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Write tests", owner: "Alice", requester: "", due_date: "2026-03-01" },
            { description: "Review PR", owner: "Bob", requester: "", due_date: null },
            { description: "Deploy app", owner: null, requester: "", due_date: null },
          ],
        })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy action items" }));
    expect(writeText).toHaveBeenCalledWith(
      "- [ ] Write tests (Alice, 2026-03-01)\n- [ ] Review PR (Bob)\n- [ ] Deploy app",
    );
  });

  it("renders artifact skeleton when artifactLoading is true", () => {
    render(<MeetingDetail meeting={makeMeeting()} artifact={null} artifactLoading={true} />);
    expect(screen.getByTestId("artifact-skeleton")).toBeDefined();
  });

  it("renders requester badge on action items when requester is present", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [{ description: "Draft spec", owner: "Alice", requester: "Bob", due_date: null }],
        })}
      />,
    );
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders decided_by in decisions text when decided_by is present", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          decisions: [{ text: "Use TypeScript", decided_by: "CTO" }],
        })}
      />,
    );
    fireEvent.click(screen.getByText("Decisions"));
    expect(screen.getByText("Use TypeScript (CTO)")).toBeDefined();
  });

  it("section content has left padding for visual hierarchy", () => {
    render(<MeetingDetail meeting={makeMeeting()} artifact={makeArtifact()} />);
    const summaryText = screen.getByText("We discussed the roadmap.");
    const contentContainer = summaryText.closest("[class*='pl-']");
    expect(contentContainer).not.toBeNull();
  });
});
