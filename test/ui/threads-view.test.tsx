// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ThreadsView } from "../../electron-ui/ui/src/components/ThreadsView.js";
import type { Thread } from "../../core/threads.js";

afterEach(cleanup);

function makeThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: "t1",
    client_name: "Acme",
    title: "Deploy issues",
    shorthand: "DEPLOY",
    description: "CI/CD failures",
    status: "open",
    summary: "",
    criteria_prompt: "",
    keywords: "",
    criteria_changed_at: "2026-03-01T00:00:00.000Z",
    created_at: "2026-03-01T00:00:00.000Z",
    updated_at: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ThreadsView", () => {
  it("renders thread list with titles and shorthand badges", () => {
    const threads = [
      makeThread({ id: "t1", title: "Deploy issues", shorthand: "DEPLOY" }),
      makeThread({ id: "t2", title: "Auth bugs", shorthand: "AUTH" }),
    ];
    render(
      <ThreadsView
        threads={threads}
        clientName="Acme"
        onSelectThread={vi.fn()}
        onCreateThread={vi.fn()}
        selectedThreadId={null}
      />,
    );
    expect(screen.getByText("Deploy issues")).toBeDefined();
    expect(screen.getByText("Auth bugs")).toBeDefined();
    expect(screen.getByText("DEPLOY")).toBeDefined();
    expect(screen.getByText("AUTH")).toBeDefined();
  });

  it("renders New Thread button", () => {
    render(
      <ThreadsView
        threads={[]}
        clientName="Acme"
        onSelectThread={vi.fn()}
        onCreateThread={vi.fn()}
        selectedThreadId={null}
      />,
    );
    expect(screen.getByRole("button", { name: /new thread/i })).toBeDefined();
  });

  it("clicking a thread fires onSelectThread with thread id", () => {
    const onSelect = vi.fn();
    render(
      <ThreadsView
        threads={[makeThread()]}
        clientName="Acme"
        onSelectThread={onSelect}
        onCreateThread={vi.fn()}
        selectedThreadId={null}
      />,
    );
    fireEvent.click(screen.getByText("Deploy issues"));
    expect(onSelect).toHaveBeenCalledWith("t1");
  });

  it("clicking New Thread fires onCreateThread", () => {
    const onCreate = vi.fn();
    render(
      <ThreadsView
        threads={[]}
        clientName="Acme"
        onSelectThread={vi.fn()}
        onCreateThread={onCreate}
        selectedThreadId={null}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /new thread/i }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("filters threads by status when filter is set", () => {
    const threads = [
      makeThread({ id: "t1", title: "Open thread", status: "open" }),
      makeThread({ id: "t2", title: "Resolved thread", status: "resolved" }),
    ];
    render(
      <ThreadsView
        threads={threads}
        clientName="Acme"
        onSelectThread={vi.fn()}
        onCreateThread={vi.fn()}
        selectedThreadId={null}
        statusFilter="open"
      />,
    );
    expect(screen.getByText("Open thread")).toBeDefined();
    expect(screen.queryByText("Resolved thread")).toBeNull();
  });

  it("renders meeting count next to thread title", () => {
    const threads = [
      makeThread({ id: "t1", title: "Deploy issues", meeting_count: 5 }),
      makeThread({ id: "t2", title: "Auth bugs", meeting_count: 12 }),
    ];
    render(
      <ThreadsView
        threads={threads}
        clientName="Acme"
        onSelectThread={vi.fn()}
        onCreateThread={vi.fn()}
        selectedThreadId={null}
      />,
    );
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
  });

  it("hides meeting count when zero or undefined", () => {
    const threads = [
      makeThread({ id: "t1", title: "No meetings", meeting_count: 0 }),
      makeThread({ id: "t2", title: "Unknown count", meeting_count: undefined }),
    ];
    render(
      <ThreadsView
        threads={threads}
        clientName="Acme"
        onSelectThread={vi.fn()}
        onCreateThread={vi.fn()}
        selectedThreadId={null}
      />,
    );
    expect(screen.queryByText("0")).toBeNull();
  });

  it("shows empty state when no threads match", () => {
    render(
      <ThreadsView
        threads={[]}
        clientName="Acme"
        onSelectThread={vi.fn()}
        onCreateThread={vi.fn()}
        selectedThreadId={null}
      />,
    );
    expect(screen.getByText(/no threads/i)).toBeDefined();
  });
});
