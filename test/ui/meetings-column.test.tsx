// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingsColumn } from "../../ui/src/components/MeetingsColumn.js";
import type { MeetingRow } from "../../electron/channels.js";

afterEach(cleanup);


function makeMeeting(overrides: Partial<MeetingRow>): MeetingRow {
  return {
    id: "test-id",
    title: "Test Meeting",
    date: "2026-02-25T10:00:00.000Z",
    client: "Acme",
    series: "test meeting",
    ...overrides,
  };
}

const dsuMeetings: MeetingRow[] = [
  makeMeeting({ id: "dsu-1", title: "Mandalore DSU", date: "2026-02-24T10:00:00.000Z", series: "mandalore dsu" }),
  makeMeeting({ id: "dsu-2", title: "Mandalore DSU", date: "2026-02-25T10:00:00.000Z", series: "mandalore dsu" }),
  makeMeeting({ id: "dsu-3", title: "Mandalore DSU", date: "2026-02-26T10:00:00.000Z", series: "mandalore dsu" }),
  makeMeeting({ id: "other-1", title: "Architecture Review", date: "2026-02-23T10:00:00.000Z", series: "architecture review" }),
];

describe("MeetingsColumn", () => {
  it("groups DSU meetings under one group and other title under its own group", () => {
    render(
      <MeetingsColumn
        meetings={dsuMeetings}
        selected={new Set()}
        onToggle={vi.fn()}
        onToggleGroup={vi.fn()}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(4);
    expect(screen.getAllByText("Select all")).toHaveLength(2);
  });

  it("calls onToggle when a checkbox changes", async () => {
    const onToggle = vi.fn();
    render(
      <MeetingsColumn
        meetings={dsuMeetings}
        selected={new Set()}
        onToggle={onToggle}
        onToggleGroup={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getAllByRole("checkbox")[0]);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("calls onToggleGroup when Select all is clicked", () => {
    const onToggleGroup = vi.fn();
    render(
      <MeetingsColumn
        meetings={dsuMeetings}
        selected={new Set()}
        onToggle={vi.fn()}
        onToggleGroup={onToggleGroup}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /select all/i })[0]);
    expect(onToggleGroup).toHaveBeenCalledOnce();
  });

  it("renders newest meeting first within a group", () => {
    render(
      <MeetingsColumn
        meetings={dsuMeetings}
        selected={new Set()}
        onToggle={vi.fn()}
        onToggleGroup={vi.fn()}
      />,
    );
    const dates = screen.getAllByText(/2026-02-\d+/);
    expect(dates[0].textContent).toContain("2026-02-26");
  });
});
