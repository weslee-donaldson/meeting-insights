// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ItemHistoryDialog } from "../../electron-ui/ui/src/components/ItemHistoryDialog.js";
import type { ItemHistoryEntry } from "../../electron-ui/electron/channels.js";

afterEach(cleanup);

function makeHistory(): ItemHistoryEntry[] {
  return [
    { canonical_id: "c1", meeting_id: "m1", item_type: "action_items", item_index: 0, item_text: "Deploy to prod", first_mentioned_at: "2026-01-10", meeting_title: "Monday Standup", meeting_date: "2026-01-10" },
    { canonical_id: "c1", meeting_id: "m2", item_type: "action_items", item_index: 0, item_text: "Deploy app to production", first_mentioned_at: "2026-01-10", meeting_title: "Wednesday Standup", meeting_date: "2026-01-12" },
    { canonical_id: "c1", meeting_id: "m3", item_type: "action_items", item_index: 0, item_text: "Deploy to production", first_mentioned_at: "2026-01-10", meeting_title: "Friday Standup", meeting_date: "2026-01-14" },
  ];
}

describe("ItemHistoryDialog", () => {
  it("renders item text and all meeting entries when open", () => {
    render(
      <ItemHistoryDialog open={true} onClose={vi.fn()} itemText="Deploy to prod" history={makeHistory()} />,
    );
    expect(screen.getByText("Deploy to prod")).toBeDefined();
    expect(screen.getByText("Monday Standup")).toBeDefined();
    expect(screen.getByText("Wednesday Standup")).toBeDefined();
    expect(screen.getByText("Friday Standup")).toBeDefined();
  });

  it("marks first entry with 'First mentioned' label", () => {
    render(
      <ItemHistoryDialog open={true} onClose={vi.fn()} itemText="Deploy to prod" history={makeHistory()} />,
    );
    expect(screen.getByText("First mentioned")).toBeDefined();
    expect(screen.queryAllByText("First mentioned").length).toBe(1);
  });

  it("renders nothing when open is false", () => {
    render(
      <ItemHistoryDialog open={false} onClose={vi.fn()} itemText="Deploy to prod" history={makeHistory()} />,
    );
    expect(screen.queryByText("Deploy to prod")).toBeNull();
  });

  it("clicking a meeting entry fires onSelectMeeting with meeting_id", () => {
    const onSelectMeeting = vi.fn();
    render(
      <ItemHistoryDialog open={true} onClose={vi.fn()} itemText="Deploy to prod" history={makeHistory()} onSelectMeeting={onSelectMeeting} />,
    );
    fireEvent.click(screen.getByText("Monday Standup"));
    expect(onSelectMeeting).toHaveBeenCalledWith("m1");
  });

  it("shows meeting dates for each entry", () => {
    render(
      <ItemHistoryDialog open={true} onClose={vi.fn()} itemText="Deploy to prod" history={makeHistory()} />,
    );
    expect(screen.getByText("2026-01-10")).toBeDefined();
    expect(screen.getByText("2026-01-12")).toBeDefined();
    expect(screen.getByText("2026-01-14")).toBeDefined();
  });
});
