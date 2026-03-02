// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingList } from "../../electron-ui/ui/src/components/MeetingList.js";
import type { GroupBy } from "../../electron-ui/ui/src/components/MeetingList.js";
import type { MeetingRow } from "../../electron-ui/electron/channels.js";

afterEach(cleanup);

function makeMeeting(overrides: Partial<MeetingRow>): MeetingRow {
  return {
    id: "test-id",
    title: "Test Meeting",
    date: "2026-02-25T10:00:00.000Z",
    client: "Acme",
    series: "test meeting",
    actionItemCount: 0,
    ...overrides,
  };
}

function defaultProps(overrides: Partial<{ groupBy: GroupBy; onGroupBy: (g: GroupBy) => void }> = {}) {
  return {
    groupBy: "series" as GroupBy,
    onGroupBy: vi.fn(),
    ...overrides,
  };
}

const dsuMeetings: MeetingRow[] = [
  makeMeeting({ id: "dsu-1", title: "Mandalore DSU", date: "2026-02-24T10:00:00.000Z", series: "mandalore dsu" }),
  makeMeeting({ id: "dsu-2", title: "Mandalore DSU", date: "2026-02-25T10:00:00.000Z", series: "mandalore dsu" }),
  makeMeeting({ id: "dsu-3", title: "Mandalore DSU", date: "2026-02-26T10:00:00.000Z", series: "mandalore dsu" }),
  makeMeeting({ id: "other-1", title: "Architecture Review", date: "2026-02-23T10:00:00.000Z", series: "architecture review" }),
];

describe("MeetingList", () => {
  it("groups meetings with same normalized title under one group", () => {
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(4);
    expect(screen.getAllByText("Select all")).toHaveLength(2);
  });

  it("clicking a row fires onSelect with the meeting id", () => {
    const onSelect = vi.fn();
    render(
      <MeetingList
        meetings={[makeMeeting({ id: "m1", title: "Alpha Meeting" })]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={onSelect}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("meeting-row-m1"));
    expect(onSelect).toHaveBeenCalledWith("m1");
  });

  it("clicking a checkbox fires onCheck with the meeting id and does not fire onSelect", async () => {
    const onSelect = vi.fn();
    const onCheck = vi.fn();
    render(
      <MeetingList
        meetings={[makeMeeting({ id: "m1", title: "Alpha Meeting" })]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={onSelect}
        onCheck={onCheck}
        onCheckGroup={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("checkbox"));
    expect(onCheck).toHaveBeenCalledWith("m1");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("group toggle button fires onCheckGroup with ids in the group", () => {
    const onCheckGroup = vi.fn();
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={onCheckGroup}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /select all/i })[0]);
    expect(onCheckGroup).toHaveBeenCalledOnce();
  });

  it("renders newest meeting first within a group", () => {
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    const dates = screen.getAllByText(/Feb \d+, 2026/);
    expect(dates[0].textContent).toContain("Feb 26");
  });

  it("renders four group-by selector buttons", () => {
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Series" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Day" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Week" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Month" })).toBeTruthy();
  });

  it("clicking a group-by button calls onGroupBy with that mode", () => {
    const onGroupBy = vi.fn();
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ onGroupBy })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Day" }));
    expect(onGroupBy).toHaveBeenCalledWith("day");
  });

  it("active group-by button matches groupBy prop", () => {
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "week" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    const weekBtn = screen.getByRole("button", { name: "Week" }) as HTMLButtonElement;
    expect(weekBtn.className).toContain("bg-primary");
  });

  it("groups two meetings on the same day under one day group", () => {
    const dayMeetings = [
      makeMeeting({ id: "d1", title: "Morning Sync", date: "2026-02-27T09:00:00.000Z" }),
      makeMeeting({ id: "d2", title: "Afternoon Sync", date: "2026-02-27T14:00:00.000Z" }),
      makeMeeting({ id: "d3", title: "Friday Review", date: "2026-02-28T10:00:00.000Z" }),
    ];
    render(
      <MeetingList
        meetings={dayMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "day" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("button", { name: /select all/i })).toHaveLength(2);
  });

  it("day group label is formatted as weekday month day year", () => {
    render(
      <MeetingList
        meetings={[makeMeeting({ id: "d1", date: "2026-02-27T09:00:00.000Z" })]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "day" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getByText(/Friday, Feb 27, 2026/)).toBeTruthy();
  });

  it("day group shows stat line with meeting and action item counts", () => {
    const dayMeetings = [
      makeMeeting({ id: "d1", date: "2026-02-27T09:00:00.000Z", actionItemCount: 3 }),
      makeMeeting({ id: "d2", date: "2026-02-27T14:00:00.000Z", actionItemCount: 2 }),
    ];
    render(
      <MeetingList
        meetings={dayMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "day" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getByText("2 meetings · 5 action items")).toBeTruthy();
  });

  it("groups meetings in same ISO week under one week group", () => {
    const weekMeetings = [
      makeMeeting({ id: "w1", date: "2026-02-23T09:00:00.000Z" }),
      makeMeeting({ id: "w2", date: "2026-02-25T09:00:00.000Z" }),
      makeMeeting({ id: "w3", date: "2026-03-02T09:00:00.000Z" }),
    ];
    render(
      <MeetingList
        meetings={weekMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "week" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("button", { name: /select all/i })).toHaveLength(2);
  });

  it("week group label starts with 'Week of'", () => {
    render(
      <MeetingList
        meetings={[makeMeeting({ id: "w1", date: "2026-02-25T09:00:00.000Z" })]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "week" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getByText(/Week of Feb 23, 2026/)).toBeTruthy();
  });

  it("groups meetings in the same month under one month group", () => {
    const monthMeetings = [
      makeMeeting({ id: "m1", date: "2026-02-05T09:00:00.000Z" }),
      makeMeeting({ id: "m2", date: "2026-02-20T09:00:00.000Z" }),
      makeMeeting({ id: "m3", date: "2026-03-01T09:00:00.000Z" }),
    ];
    render(
      <MeetingList
        meetings={monthMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "month" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("button", { name: /select all/i })).toHaveLength(2);
  });

  it("month group label is formatted as 'Month Year'", () => {
    render(
      <MeetingList
        meetings={[makeMeeting({ id: "m1", date: "2026-02-15T09:00:00.000Z" })]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "month" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getByText("February 2026")).toBeTruthy();
  });

  it("month group shows stat line", () => {
    render(
      <MeetingList
        meetings={[makeMeeting({ id: "m1", date: "2026-02-15T09:00:00.000Z", actionItemCount: 1 })]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ groupBy: "month" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.getByText("1 meeting · 1 action item")).toBeTruthy();
  });

  it("shows loading indicator while search is in flight", () => {
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        searchLoading={true}
        searchQuery="al"
      />,
    );
    expect(screen.getByText("Searching…")).toBeDefined();
  });

  it("shows no-results message when search returns empty", () => {
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        searchLoading={false}
        searchQuery="qwerty"
      />,
    );
    expect(screen.getByText("No results for 'qwerty'")).toBeDefined();
  });

  it("renders skeleton rows when loading is true", () => {
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        searchLoading={false}
        searchQuery=""
        loading={true}
        {...defaultProps()}
      />,
    );
    expect(screen.getByTestId("meeting-list-skeleton")).toBeDefined();
  });
});
