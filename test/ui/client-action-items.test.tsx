// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ClientActionItemsView } from "../../electron-ui/ui/src/components/ClientActionItemsView.js";
import type { ClientActionItem } from "../../electron-ui/electron/channels.js";

afterEach(cleanup);

const ITEMS: ClientActionItem[] = [
  {
    meeting_id: "m1",
    meeting_title: "Weekly Sync",
    meeting_date: "2026-01-01",
    item_index: 0,
    description: "Fix the broken build",
    owner: "Alice",
    requester: "Bob",
    due_date: null,
    priority: "critical",
  },
  {
    meeting_id: "m2",
    meeting_title: "Planning",
    meeting_date: "2026-01-02",
    item_index: 1,
    description: "Write documentation",
    owner: "Charlie",
    requester: "Alice",
    due_date: null,
    priority: "normal",
  },
];

describe("ClientActionItemsView", () => {
  it("renders client name and item count in header", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    expect(screen.getByText(/Acme/)).toBeDefined();
    expect(screen.getByText(/2 open items/)).toBeDefined();
  });

  it("renders item descriptions", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    expect(screen.getByText("Fix the broken build")).toBeDefined();
    expect(screen.getByText("Write documentation")).toBeDefined();
  });

  it("renders CRITICAL badge for critical items", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    expect(screen.getByText("CRITICAL")).toBeDefined();
  });

  it("renders owner for each item", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Charlie")).toBeDefined();
  });

  it("renders meeting source link with title", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onPreviewMeeting={vi.fn()} />);
    expect(screen.getByText("Weekly Sync")).toBeDefined();
  });

  it("renders placeholder when no client selected", () => {
    render(<ClientActionItemsView clientName={null} items={[]} />);
    expect(screen.getByText("Select a client to view action items")).toBeDefined();
  });

  it("shows 0 open items when items is empty for known client", () => {
    render(<ClientActionItemsView clientName="Acme" items={[]} />);
    expect(screen.getByText(/0 open items/)).toBeDefined();
  });

  it("clicking meeting source link calls onPreviewMeeting with meeting id", () => {
    const spy = vi.fn();
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onPreviewMeeting={spy} />);
    fireEvent.click(screen.getByText("Weekly Sync"));
    expect(spy).toHaveBeenCalledWith("m1");
  });

  it("renders a checkbox for each item", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
  });

  it("clicking checkbox calls onComplete with meetingId and itemIndex", () => {
    const spy = vi.fn();
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onComplete={spy} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(spy).toHaveBeenCalledWith("m1", 0);
  });

  it("checking an item moves it to the completed section", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onComplete={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText("Completed")).toBeDefined();
    expect(screen.getByTestId("completed-section")).toBeDefined();
  });

  it("completed section is collapsed by default after first completion", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onComplete={vi.fn()} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    const section = screen.getByTestId("completed-section");
    expect(section.getAttribute("data-open")).toBe("false");
  });

  it("clicking Completed header toggles the section open", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onComplete={vi.fn()} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: /Completed/i }));
    expect(screen.getByTestId("completed-section").getAttribute("data-open")).toBe("true");
  });

  it("completed item description appears in completed section when expanded", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onComplete={vi.fn()} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: /Completed/i }));
    expect(screen.getByTestId("completed-items-list").textContent).toContain("Fix the broken build");
  });
});
