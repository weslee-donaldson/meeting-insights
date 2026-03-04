// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { MeetingDetail } from "../../electron-ui/ui/src/components/MeetingDetail.js";
import type { MeetingRow, Artifact, ActionItemCompletion, MentionStat } from "../../electron-ui/electron/channels.js";

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
    open_questions: ["When to launch?"],
    risk_items: [{ category: "engineering" as const, description: "Timeline slippage" }],
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

  it("reassign client button opens dialog with client select", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={null}
        clients={["Acme", "Beta Co"]}
        onReassignClient={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reassign client" }));
    expect(screen.getByText("Reassign Client")).toBeDefined();
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.options).toHaveLength(2);
    expect(select.options[0].text).toBe("Acme");
    expect(select.options[1].text).toBe("Beta Co");
  });

  it("selecting a client in dialog and clicking save calls onReassignClient", () => {
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
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Beta Co" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onReassignClient).toHaveBeenCalledWith("Beta Co");
  });

  it("ignore button calls onIgnore when clicked", () => {
    const onIgnore = vi.fn();
    render(<MeetingDetail meeting={makeMeeting()} artifact={null} onIgnore={onIgnore} />);
    fireEvent.click(screen.getByRole("button", { name: "Ignore meeting" }));
    expect(onIgnore).toHaveBeenCalledOnce();
  });

  it("icon buttons have title tooltips", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact()}
        onReassignClient={vi.fn()}
        clients={["Acme"]}
        onIgnore={vi.fn()}
        onReExtract={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Reassign client" }).getAttribute("title")).toBe("Reassign client");
    expect(screen.getByRole("button", { name: "Ignore meeting" }).getAttribute("title")).toBe("Ignore meeting");
    expect(screen.getByRole("button", { name: "Re-extract" }).getAttribute("title")).toBe("Re-extract");
  });

  it("re-extract button calls onReExtract when clicked", () => {
    const onReExtract = vi.fn();
    render(<MeetingDetail meeting={makeMeeting()} artifact={makeArtifact()} onReExtract={onReExtract} />);
    fireEvent.click(screen.getByRole("button", { name: "Re-extract" }));
    expect(onReExtract).toHaveBeenCalledOnce();
  });

  it("re-extract button is disabled and spinner shown when reExtractPending is true", () => {
    render(<MeetingDetail meeting={makeMeeting()} artifact={makeArtifact()} onReExtract={vi.fn()} reExtractPending={true} />);
    const btn = screen.getByRole("button", { name: "Re-extract" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.querySelector(".animate-spin")).not.toBeNull();
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

  it("clicking checkmark on completed item calls onUncomplete with item index", () => {
    const onUncomplete = vi.fn();
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
        onUncomplete={onUncomplete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Uncomplete item 0" }));
    expect(onUncomplete).toHaveBeenCalledWith(0);
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
    const bobs = screen.getAllByText("Bob");
    expect(bobs.length).toBeGreaterThanOrEqual(1);
  });

  it("renders decided_by as badge in decisions when decided_by is present", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          decisions: [{ text: "Use TypeScript", decided_by: "CTO" }],
        })}
      />,
    );
    fireEvent.click(screen.getByText("Decisions"));
    expect(screen.getByText("Use TypeScript")).toBeDefined();
    const ctoBadge = screen.getAllByText("CTO").find((el) => el.tagName === "SPAN" && el.className.includes("rounded-full"));
    expect(ctoBadge).toBeDefined();
  });

  it("action items person filter dropdown filters by selected person", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Write tests", owner: "Alice", requester: "", due_date: null },
            { description: "Review PR", owner: "Bob", requester: "Alice", due_date: null },
            { description: "Deploy app", owner: "Charlie", requester: "", due_date: null },
          ],
        })}
      />,
    );
    expect(screen.getByText("Write tests")).toBeDefined();
    expect(screen.getByText("Review PR")).toBeDefined();
    expect(screen.getByText("Deploy app")).toBeDefined();
    fireEvent.change(screen.getByRole("combobox", { name: "Filter action items by person" }), { target: { value: "Alice" } });
    expect(screen.getByText("Write tests")).toBeDefined();
    expect(screen.getByText("Review PR")).toBeDefined();
    expect(screen.queryByText("Deploy app")).toBeNull();
  });

  it("decisions person filter dropdown filters by selected person", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          decisions: [
            { text: "Use TypeScript", decided_by: "CTO" },
            { text: "Ship by March", decided_by: "PM" },
            { text: "Add dark mode", decided_by: "CTO" },
          ],
        })}
      />,
    );
    fireEvent.click(screen.getByText("Decisions"));
    expect(screen.getByText("Use TypeScript")).toBeDefined();
    expect(screen.getByText("Ship by March")).toBeDefined();
    expect(screen.getByText("Add dark mode")).toBeDefined();
    fireEvent.change(screen.getByRole("combobox", { name: "Filter decisions by person" }), { target: { value: "PM" } });
    expect(screen.queryByText("Use TypeScript")).toBeNull();
    expect(screen.getByText("Ship by March")).toBeDefined();
    expect(screen.queryByText("Add dark mode")).toBeNull();
  });

  it("section content has left padding for visual hierarchy", () => {
    render(<MeetingDetail meeting={makeMeeting()} artifact={makeArtifact()} />);
    const summaryText = screen.getByText("We discussed the roadmap.");
    const contentContainer = summaryText.closest("[class*='pl-']");
    expect(contentContainer).not.toBeNull();
  });

  it("renders multi-meeting header with count when meetings array has 2+ entries", () => {
    render(
      <MeetingDetail
        meeting={null}
        meetings={[makeMeeting({ id: "m1", title: "Alpha" }), makeMeeting({ id: "m2", title: "Beta" })]}
        artifact={makeArtifact()}
      />,
    );
    expect(screen.getByText("2 meetings selected")).toBeDefined();
    expect(screen.getByText(/Alpha/)).toBeDefined();
    expect(screen.getByText(/Beta/)).toBeDefined();
  });

  it("multi-mode hides single-meeting action buttons", () => {
    render(
      <MeetingDetail
        meeting={null}
        meetings={[makeMeeting({ id: "m1" }), makeMeeting({ id: "m2" })]}
        artifact={makeArtifact()}
        onReExtract={vi.fn()}
        onIgnore={vi.fn()}
        onReassignClient={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Re-extract" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ignore meeting" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Reassign client" })).toBeNull();
  });

  it("multi-mode renders action items without completion checkboxes", () => {
    render(
      <MeetingDetail
        meeting={null}
        meetings={[makeMeeting({ id: "m1" }), makeMeeting({ id: "m2" })]}
        artifact={makeArtifact({ action_items: [{ description: "Write tests", owner: "Alice", requester: "", due_date: null }] })}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Write tests")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Complete item 0" })).toBeNull();
  });

  it("shows empty state when meeting is null and meetings is empty", () => {
    render(<MeetingDetail meeting={null} meetings={[]} artifact={null} />);
    expect(screen.getByText("Select a meeting")).toBeDefined();
  });

  it("expand/collapse toggle opens all sections then collapses all", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact()}
      />,
    );
    expect(screen.queryByText("Ship by March")).toBeNull();
    const toggleBtn = screen.getByRole("button", { name: "Expand all" });
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Ship by March")).toBeDefined();
    expect(screen.getByRole("button", { name: "Collapse all" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    expect(screen.queryByText("We discussed the roadmap.")).toBeNull();
    expect(screen.getByRole("button", { name: "Expand all" })).toBeDefined();
  });

  it("renders mention badge for action items with mention_count > 1", () => {
    const mentionStats: MentionStat[] = [
      { canonical_id: "c1", item_type: "action_items", item_index: 0, mention_count: 3, first_mentioned_at: "2026-01-15" },
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
        mentionStats={mentionStats}
      />,
    );
    expect(screen.getByText("3x")).toBeDefined();
    expect(screen.queryAllByText(/\dx/).length).toBe(1);
  });

  it("completed action items are sorted to the bottom of the list", () => {
    const completions: ActionItemCompletion[] = [
      { id: "m1:1", meeting_id: "m1", item_index: 1, completed_at: "2026-03-01T00:00:00Z", note: "" },
    ];
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "First task", owner: null, requester: "", due_date: null },
            { description: "Second task", owner: null, requester: "", due_date: null },
            { description: "Third task", owner: null, requester: "", due_date: null },
          ],
        })}
        completions={completions}
        onComplete={vi.fn()}
        onUncomplete={vi.fn()}
      />,
    );
    const items = screen.getAllByRole("listitem").filter(
      (li) => li.textContent?.includes("task"),
    );
    expect(items[0].textContent).toContain("First task");
    expect(items[1].textContent).toContain("Third task");
    expect(items[2].textContent).toContain("Second task");
  });

  it("critical action items render destructive badge", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Fix broken build", owner: "Carol", requester: "", due_date: null, priority: "critical" },
            { description: "Write docs", owner: "Dave", requester: "", due_date: null, priority: "normal" },
          ],
        })}
      />,
    );
    const criticalBadge = screen.getByText("CRITICAL");
    expect(criticalBadge).toBeDefined();
    expect(criticalBadge.className).toContain("destructive");
    expect(screen.queryAllByText("CRITICAL").length).toBe(1);
  });

  it("critical action items sort before normal uncompleted items", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [
            { description: "Normal task", owner: null, requester: "", due_date: null, priority: "normal" },
            { description: "Critical task", owner: null, requester: "", due_date: null, priority: "critical" },
          ],
        })}
        completions={[]}
        onComplete={vi.fn()}
      />,
    );
    const items = screen.getAllByRole("listitem").filter((li) => li.textContent?.includes("task"));
    expect(items[0].textContent).toContain("Critical task");
    expect(items[1].textContent).toContain("Normal task");
  });

  it("risk items render category badge", () => {
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          risk_items: [
            { category: "relationship" as const, description: "Trust issue" },
            { category: "architecture" as const, description: "Tech debt risk" },
          ],
        })}
      />,
    );
    fireEvent.click(screen.getByText("Risks"));
    expect(screen.getByText("Trust issue")).toBeDefined();
    expect(screen.getByText("Tech debt risk")).toBeDefined();
    expect(screen.getByText("relationship")).toBeDefined();
    expect(screen.getByText("architecture")).toBeDefined();
  });

  it("mention badge click fires onMentionClick with canonical_id", () => {
    const onMentionClick = vi.fn();
    const mentionStats: MentionStat[] = [
      { canonical_id: "c1", item_type: "action_items", item_index: 0, mention_count: 3, first_mentioned_at: "2026-01-15" },
    ];
    render(
      <MeetingDetail
        meeting={makeMeeting()}
        artifact={makeArtifact({
          action_items: [{ description: "Write tests", owner: "Alice", requester: "", due_date: null }],
        })}
        mentionStats={mentionStats}
        onMentionClick={onMentionClick}
      />,
    );
    fireEvent.click(screen.getByText("3x"));
    expect(onMentionClick).toHaveBeenCalledWith("c1", "Write tests");
  });
});
