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
});
