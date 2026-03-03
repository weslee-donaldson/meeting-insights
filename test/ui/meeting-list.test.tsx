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
    expect(screen.getAllByRole("button", { name: /select all in group/i })).toHaveLength(2);
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

  it("select all button fires onCheckGroup with group ids", () => {
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
    fireEvent.click(screen.getAllByRole("button", { name: /select all in group/i })[0]);
    expect(onCheckGroup).toHaveBeenCalledOnce();
  });

  it("ignore all button fires onIgnoreGroup with group ids", () => {
    const onIgnoreGroup = vi.fn();
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        onIgnoreGroup={onIgnoreGroup}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /ignore all/i })[0]);
    expect(onIgnoreGroup).toHaveBeenCalledWith(["dsu-3", "dsu-2", "dsu-1"]);
  });

  it("renders newest meeting first within a group by default", () => {
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

  it("renders oldest meeting first when sortAsc is true", () => {
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        sortAsc={true}
      />,
    );
    const dates = screen.getAllByText(/Feb \d+, 2026/);
    expect(dates[0].textContent).toContain("Feb 23");
  });

  it("renders sort toggle button that calls onSortToggle", () => {
    const onSortToggle = vi.fn();
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        onSortToggle={onSortToggle}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /sort/i }));
    expect(onSortToggle).toHaveBeenCalledOnce();
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
    expect(screen.getAllByRole("button", { name: /select all in group/i })).toHaveLength(2);
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
    expect(screen.getAllByRole("button", { name: /select all in group/i })).toHaveLength(2);
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
    expect(screen.getAllByRole("button", { name: /select all in group/i })).toHaveLength(2);
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

  it("shows filter empty state when meetings are empty and hasFilters is true", () => {
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        hasFilters={true}
      />,
    );
    expect(screen.getByText("No meetings match your filters")).toBeDefined();
  });

  it("shows no meetings yet state when meetings are empty and hasFilters is false", () => {
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        hasFilters={false}
      />,
    );
    expect(screen.getByText("No meetings yet")).toBeDefined();
  });

  it("delete button is absent when checkedCount is 0", () => {
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        checkedCount={0}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
  });

  it("delete button shows count and calls onDelete when clicked", () => {
    const onDelete = vi.fn();
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set(["dsu-1", "dsu-2"])}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        checkedCount={2}
        onDelete={onDelete}
      />,
    );
    const btn = screen.getByRole("button", { name: /delete 2/i });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("select all toggles to deselect all when all group meetings are checked", () => {
    const onCheckGroup = vi.fn();
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set(["dsu-1", "dsu-2", "dsu-3"])}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={onCheckGroup}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: /deselect all in group/i })[0]);
    expect(onCheckGroup).toHaveBeenCalledWith([]);
  });

  it("highlights checked meeting rows with elevated background", () => {
    render(
      <MeetingList
        meetings={[makeMeeting({ id: "m1", title: "Alpha Meeting" }), makeMeeting({ id: "m2", title: "Beta Meeting", series: "beta meeting" })]}
        selectedId={null}
        checked={new Set(["m1"])}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    const checkedRow = screen.getByTestId("meeting-row-m1");
    expect(checkedRow.style.background).toBe("var(--color-bg-elevated)");
    expect(checkedRow.style.borderLeft).toBe("2px solid var(--color-accent)");
    const uncheckedRow = screen.getByTestId("meeting-row-m2");
    expect(uncheckedRow.style.background).toBe("transparent");
    expect(uncheckedRow.style.borderLeft).toBe("2px solid transparent");
  });

  it("does not render client badge in meeting rows", () => {
    render(
      <MeetingList
        meetings={[makeMeeting({ id: "m1", title: "Alpha Meeting", client: "Acme" })]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    expect(screen.queryByText("Acme")).toBeNull();
  });
});
