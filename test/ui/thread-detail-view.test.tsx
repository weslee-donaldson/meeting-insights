// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ThreadDetailView } from "../../electron-ui/ui/src/components/ThreadDetailView.js";
import type { Thread, ThreadMeeting } from "../../core/threads.js";

afterEach(cleanup);

function makeThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: "t1",
    client_name: "Acme",
    title: "Deploy issues",
    shorthand: "DEPLOY",
    description: "CI/CD failures",
    status: "open",
    summary: "Pipeline keeps failing on main.",
    criteria_prompt: "deployment",
    keywords: "",
    criteria_changed_at: "2026-03-01T00:00:00.000Z",
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeMeeting(overrides: Partial<ThreadMeeting> = {}): ThreadMeeting {
  return {
    thread_id: "t1",
    meeting_id: "m1",
    meeting_title: "Sprint Planning",
    meeting_date: "2026-03-01T10:00:00.000Z",
    relevance_summary: "Discussed deployment pipeline failures.",
    relevance_score: 85,
    evaluated_at: "2026-03-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("ThreadDetailView", () => {
  it("renders thread title, shorthand badge, and summary", () => {
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
      />,
    );
    expect(screen.getByText("Deploy issues")).toBeDefined();
    expect(screen.getByText("DEPLOY")).toBeDefined();
    expect(screen.getByText("Pipeline keeps failing on main.")).toBeDefined();
  });

  it("renders meetings sorted by relevance score descending", () => {
    const meetings = [
      makeMeeting({ meeting_id: "m1", meeting_title: "Low relevance", relevance_score: 30 }),
      makeMeeting({ meeting_id: "m2", meeting_title: "High relevance", relevance_score: 90 }),
    ];
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={meetings}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
      />,
    );
    const items = screen.getAllByRole("button").filter((b) => b.textContent?.includes("relevance"));
    expect(items.length).toBe(2);
  });

  it("shows empty state when no summary", () => {
    render(
      <ThreadDetailView
        thread={makeThread({ summary: "" })}
        meetings={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/no summary/i)).toBeDefined();
  });

  it("Find Candidates button fires onFindCandidates", () => {
    const onFind = vi.fn();
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={onFind}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /find candidates/i }));
    expect(onFind).toHaveBeenCalled();
  });

  it("Regenerate button fires onRegenerateSummary", () => {
    const onRegen = vi.fn();
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[makeMeeting()]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={onRegen}
        onMeetingClick={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /regenerate/i }));
    expect(onRegen).toHaveBeenCalled();
  });

  it("renders candidate list when candidates provided", () => {
    const candidates = [
      { meeting_id: "c1", title: "Candidate A", date: "2026-03-02T10:00:00.000Z", similarity: 0.85 },
      { meeting_id: "c2", title: "Candidate B", date: "2026-03-03T10:00:00.000Z", similarity: 0.72 },
    ];
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[]}
        candidates={candidates}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
        onEvaluateCandidates={vi.fn()}
      />,
    );
    expect(screen.getByText("Candidate A")).toBeDefined();
    expect(screen.getByText("Candidate B")).toBeDefined();
    expect(screen.getByText(/evaluate selected/i)).toBeDefined();
  });

  it("unchecking a candidate excludes it from evaluation", () => {
    const candidates = [
      { meeting_id: "c1", title: "Candidate A", date: "2026-03-02T10:00:00.000Z", similarity: 0.85 },
      { meeting_id: "c2", title: "Candidate B", date: "2026-03-03T10:00:00.000Z", similarity: 0.72 },
    ];
    const onEvaluate = vi.fn();
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[]}
        candidates={candidates}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
        onEvaluateCandidates={onEvaluate}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox").filter((cb) => !cb.closest("[data-override]"));
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByText(/evaluate selected/i));
    expect(onEvaluate).toHaveBeenCalledWith(["c1"], false);
  });

  it("evaluate fires with override flag when override checkbox checked", () => {
    const candidates = [
      { meeting_id: "c1", title: "Candidate A", date: "2026-03-02T10:00:00.000Z", similarity: 0.85 },
    ];
    const onEvaluate = vi.fn();
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[]}
        candidates={candidates}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
        onEvaluateCandidates={onEvaluate}
      />,
    );
    const overrideCheckbox = screen.getByRole("checkbox", { name: /override existing/i });
    fireEvent.click(overrideCheckbox);
    fireEvent.click(screen.getByText(/evaluate selected/i));
    expect(onEvaluate).toHaveBeenCalledWith(["c1"], true);
  });

  it("resolve button fires onResolve with resolved status for open thread", () => {
    const onResolve = vi.fn();
    render(
      <ThreadDetailView
        thread={makeThread({ status: "open" })}
        meetings={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
        onResolve={onResolve}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /resolve/i }));
    expect(onResolve).toHaveBeenCalledWith("resolved");
  });

  it("reopen button fires onResolve with open status for resolved thread", () => {
    const onResolve = vi.fn();
    render(
      <ThreadDetailView
        thread={makeThread({ status: "resolved" })}
        meetings={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
        onResolve={onResolve}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /reopen/i }));
    expect(onResolve).toHaveBeenCalledWith("open");
  });

  it("renders full relevance summary on second line below meeting title", () => {
    const longSummary = "The meeting extensively discussed blue-green deployment issues and rollback strategies for the CI pipeline";
    const meetings = [makeMeeting({ relevance_summary: longSummary })];
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={meetings}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
      />,
    );
    expect(screen.getByText(longSummary)).toBeDefined();
  });

  it("Deselect all deselects all candidates and Select all reselects them", () => {
    const candidates = [
      { meeting_id: "c1", title: "Candidate A", date: "2026-03-02T10:00:00.000Z", similarity: 0.85 },
      { meeting_id: "c2", title: "Candidate B", date: "2026-03-03T10:00:00.000Z", similarity: 0.72 },
    ];
    const onCandidateCheck = vi.fn();
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[]}
        candidates={candidates}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
        onEvaluateCandidates={vi.fn()}
        onCandidateCheck={onCandidateCheck}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /deselect all/i }));
    expect(onCandidateCheck).toHaveBeenCalledWith(new Set());
    const candidateCheckboxes = screen.getAllByRole("checkbox").filter((cb) => !cb.closest("[data-override]"));
    expect(candidateCheckboxes.every((cb) => !(cb as HTMLInputElement).checked)).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /select all/i }));
    expect(onCandidateCheck).toHaveBeenCalledWith(new Set(["c1", "c2"]));
  });

  it("toggling candidate checkbox calls onCandidateCheck with updated set", () => {
    const candidates = [
      { meeting_id: "c1", title: "Candidate A", date: "2026-03-02T10:00:00.000Z", similarity: 0.85 },
      { meeting_id: "c2", title: "Candidate B", date: "2026-03-03T10:00:00.000Z", similarity: 0.72 },
    ];
    const onCandidateCheck = vi.fn();
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[]}
        candidates={candidates}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
        onEvaluateCandidates={vi.fn()}
        onCandidateCheck={onCandidateCheck}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox").filter((cb) => !cb.closest("[data-override]"));
    fireEvent.click(checkboxes[1]);
    expect(onCandidateCheck).toHaveBeenCalledWith(new Set(["c1"]));
  });

  it("renders candidate group-by buttons and groups candidates by day when clicked", () => {
    const candidates = [
      { meeting_id: "c1", title: "Morning standup", date: "2026-03-02T10:00:00.000Z", similarity: 0.85 },
      { meeting_id: "c2", title: "Afternoon retro", date: "2026-03-02T14:00:00.000Z", similarity: 0.72 },
      { meeting_id: "c3", title: "Planning", date: "2026-03-03T10:00:00.000Z", similarity: 0.60 },
    ];
    render(
      <ThreadDetailView
        thread={makeThread()}
        meetings={[]}
        candidates={candidates}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
        onEvaluateCandidates={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Day" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Week" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Month" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Day" }));
    expect(screen.getByText(/Mon, Mar 2/)).toBeDefined();
    expect(screen.getByText(/Tue, Mar 3/)).toBeDefined();
  });

  it("shows stale criteria badge when criteria newer than evaluations", () => {
    const thread = makeThread({ criteria_changed_at: "2026-03-10T00:00:00.000Z" });
    const meetings = [makeMeeting({ evaluated_at: "2026-03-01T00:00:00.000Z" })];
    render(
      <ThreadDetailView
        thread={thread}
        meetings={meetings}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onFindCandidates={vi.fn()}
        onRemoveMeeting={vi.fn()}
        onRegenerateSummary={vi.fn()}
        onMeetingClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/criteria changed/i)).toBeDefined();
  });
});
