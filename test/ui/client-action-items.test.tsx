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

  it("renders owner and requester inline for each item", () => {
    const { container } = render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    const text = container.textContent ?? "";
    expect(text).toContain("Alice");   // owner of item 0 and requester of item 1
    expect(text).toContain("Charlie"); // owner of item 1
    expect(text).toContain("Bob");     // requester of item 0
  });

  it("renders meeting source link with title", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onPreviewMeeting={vi.fn()} />);
    const links = screen.getAllByText("Weekly Sync").filter((el) => el.tagName === "BUTTON");
    expect(links).toHaveLength(1);
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
    const link = screen.getAllByText("Weekly Sync").find((el) => el.tagName === "BUTTON")!;
    fireEvent.click(link);
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

  it("renders filter dropdowns for series, priority, owner, and requester", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    const seriesFilter = screen.getByTestId("action-series-filter") as HTMLSelectElement;
    const priorityFilter = screen.getByTestId("action-priority-filter") as HTMLSelectElement;
    const ownerFilter = screen.getByTestId("action-owner-filter") as HTMLSelectElement;
    const requesterFilter = screen.getByTestId("action-requester-filter") as HTMLSelectElement;
    expect(Array.from(seriesFilter.querySelectorAll("option")).map((o) => o.textContent)).toEqual(["All Series", "Planning", "Weekly Sync"]);
    expect(Array.from(priorityFilter.querySelectorAll("option")).map((o) => o.textContent)).toEqual(["All Priorities", "Critical", "Normal"]);
    expect(Array.from(ownerFilter.querySelectorAll("option")).map((o) => o.textContent)).toEqual(["All Owners", "Alice", "Charlie"]);
    expect(Array.from(requesterFilter.querySelectorAll("option")).map((o) => o.textContent)).toEqual(["All Requesters", "Alice", "Bob"]);
  });

  it("filters items by series", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    fireEvent.change(screen.getByTestId("action-series-filter"), { target: { value: "Weekly Sync" } });
    expect(screen.getByText("Fix the broken build")).toBeDefined();
    expect(screen.queryByText("Write documentation")).toBeNull();
  });

  it("filters items by priority", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    fireEvent.change(screen.getByTestId("action-priority-filter"), { target: { value: "normal" } });
    expect(screen.queryByText("Fix the broken build")).toBeNull();
    expect(screen.getByText("Write documentation")).toBeDefined();
  });

  it("filters items by owner", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    fireEvent.change(screen.getByTestId("action-owner-filter"), { target: { value: "Alice" } });
    expect(screen.getByText("Fix the broken build")).toBeDefined();
    expect(screen.queryByText("Write documentation")).toBeNull();
  });

  it("filters items by requester", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    fireEvent.change(screen.getByTestId("action-requester-filter"), { target: { value: "Bob" } });
    expect(screen.getByText("Fix the broken build")).toBeDefined();
    expect(screen.queryByText("Write documentation")).toBeNull();
  });

  it("completed item description appears in completed section when expanded", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} onComplete={vi.fn()} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: /Completed/i }));
    expect(screen.getByTestId("completed-items-list").textContent).toContain("Fix the broken build");
  });

  it("renders group-by pill buttons with label and four options", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    const groupBar = screen.getByTestId("action-group-by");
    expect(groupBar.textContent).toContain("Group:");
    const buttons = Array.from(groupBar.querySelectorAll("button")).map((b) => b.textContent);
    expect(buttons).toEqual(["Priority", "Series", "Owner", "Requester"]);
  });

  it("default groups by priority with Critical and Normal section headers", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    const groups = screen.getAllByTestId("action-group");
    expect(groups).toHaveLength(2);
    expect(groups[0].textContent).toContain("Critical");
    expect(groups[0].textContent).toContain("Fix the broken build");
    expect(groups[1].textContent).toContain("Normal");
    expect(groups[1].textContent).toContain("Write documentation");
  });

  it("groups items by series with section headers when Series pill clicked", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    fireEvent.click(screen.getByRole("button", { name: "Series" }));
    const groups = screen.getAllByTestId("action-group");
    expect(groups).toHaveLength(2);
    expect(groups[0].textContent).toContain("Planning");
    expect(groups[0].textContent).toContain("Write documentation");
    expect(groups[1].textContent).toContain("Weekly Sync");
    expect(groups[1].textContent).toContain("Fix the broken build");
  });

  it("groups items by owner with section headers when Owner pill clicked", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    fireEvent.click(screen.getByRole("button", { name: "Owner" }));
    const groups = screen.getAllByTestId("action-group");
    expect(groups).toHaveLength(2);
    expect(groups[0].textContent).toContain("Alice");
    expect(groups[0].textContent).toContain("Fix the broken build");
    expect(groups[1].textContent).toContain("Charlie");
    expect(groups[1].textContent).toContain("Write documentation");
  });

  it("groups items by requester with section headers when Requester pill clicked", () => {
    render(<ClientActionItemsView clientName="Acme" items={ITEMS} />);
    fireEvent.click(screen.getByRole("button", { name: "Requester" }));
    const groups = screen.getAllByTestId("action-group");
    expect(groups).toHaveLength(2);
    expect(groups[0].textContent).toContain("Alice");
    expect(groups[0].textContent).toContain("Write documentation");
    expect(groups[1].textContent).toContain("Bob");
    expect(groups[1].textContent).toContain("Fix the broken build");
  });
});
