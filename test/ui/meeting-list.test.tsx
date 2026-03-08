// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingList } from "../../electron-ui/ui/src/components/MeetingList.js";
import type { GroupBy, SortBy } from "../../electron-ui/ui/src/components/MeetingList.js";
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

function defaultProps(overrides: Partial<{ groupBy: GroupBy; onGroupBy: (g: GroupBy) => void; sortBy: SortBy; onSortBy: (s: SortBy) => void }> = {}) {
  return {
    groupBy: "series" as GroupBy,
    onGroupBy: vi.fn(),
    sortBy: "date-desc" as SortBy,
    onSortBy: vi.fn(),
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

  it("clicking a row fires onSelect and onCheck with the meeting id", () => {
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
    fireEvent.click(screen.getByTestId("meeting-row-m1"));
    expect(onSelect).toHaveBeenCalledWith("m1");
    expect(onCheck).toHaveBeenCalledWith("m1");
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

  it("renders oldest meeting first when sortBy is date-asc", () => {
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ sortBy: "date-asc" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    const dates = screen.getAllByText(/Feb \d+, 2026/);
    expect(dates[0].textContent).toContain("Feb 23");
  });

  it("renders Sort: label and Newest/Oldest/Client buttons always", () => {
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
    expect(screen.getByText("Sort:")).toBeDefined();
    expect(screen.getByRole("button", { name: "Newest" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Oldest" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Client" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Relevance" })).toBeNull();
  });

  it("shows Relevance button when searchScores are provided", () => {
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        searchScores={new Map([["dsu-1", 0.3], ["dsu-2", 0.8]])}
      />,
    );
    expect(screen.getByRole("button", { name: "Relevance" })).toBeTruthy();
  });

  it("clicking a sort button calls onSortBy with that mode", () => {
    const onSortBy = vi.fn();
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ onSortBy })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Oldest" }));
    expect(onSortBy).toHaveBeenCalledWith("date-asc");
  });

  it("orders meetings by relevance score ascending when sortBy is relevance", () => {
    const meetings = [
      makeMeeting({ id: "low", title: "Low Relevance Meeting", date: "2026-02-26T10:00:00.000Z", series: "low relevance meeting" }),
      makeMeeting({ id: "high", title: "High Relevance Meeting", date: "2026-02-24T10:00:00.000Z", series: "high relevance meeting" }),
    ];
    const scores = new Map([["low", 1.2], ["high", 0.1]]);
    render(
      <MeetingList
        meetings={meetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ sortBy: "relevance" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        searchScores={scores}
      />,
    );
    // high (score 0.1) appears before low (score 1.2) in DOM order
    const rows = screen.getAllByTestId(/meeting-row-/);
    expect(rows[0].getAttribute("data-testid")).toBe("meeting-row-high");
    expect(rows[1].getAttribute("data-testid")).toBe("meeting-row-low");
  });

  it("orders meetings by client alphabetically when sortBy is client", () => {
    const meetings = [
      makeMeeting({ id: "z-client", title: "Meeting Z", date: "2026-02-26T10:00:00.000Z", client: "Zeta Corp", series: "meeting z" }),
      makeMeeting({ id: "a-client", title: "Meeting A", date: "2026-02-24T10:00:00.000Z", client: "Acme", series: "meeting a" }),
    ];
    render(
      <MeetingList
        meetings={meetings}
        selectedId={null}
        checked={new Set()}
        {...defaultProps({ sortBy: "client", groupBy: "day" })}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    const rows = screen.getAllByText(/Meeting [AZ]/);
    expect(rows[0].textContent).toBe("Meeting A");
  });

  it("renders Group by label before group-by buttons", () => {
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
    expect(screen.getByText("Group by:")).toBeDefined();
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
    expect(checkedRow.className).toContain("bg-secondary");
    expect(checkedRow.className).toContain("border-l-[var(--color-accent)]");
    const uncheckedRow = screen.getByTestId("meeting-row-m2");
    expect(uncheckedRow.className).not.toContain("bg-secondary");
    expect(uncheckedRow.className).toContain("border-l-transparent");
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

  describe("deep search overlay", () => {
    it("shows blocking overlay when deepSearchLoading is true", () => {
      render(
        <MeetingList
          meetings={dsuMeetings}
          selectedId={null}
          checked={new Set()}
          {...defaultProps()}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
          deepSearchLoading={true}
        />,
      );
      const overlay = screen.getByTestId("deep-search-overlay");
      expect(overlay).toBeDefined();
      expect(overlay.textContent).toContain("Deep searching 4 meetings");
    });

    it("does not show overlay when deepSearchLoading is false", () => {
      render(
        <MeetingList
          meetings={dsuMeetings}
          selectedId={null}
          checked={new Set()}
          {...defaultProps()}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
          deepSearchLoading={false}
        />,
      );
      expect(screen.queryByTestId("deep-search-overlay")).toBeNull();
    });
  });

  describe("deep search active results", () => {
    it("renders orange border and relevance summary when isDeepSearchActive", () => {
      const summaries = new Map([["dsu-1", "Discussed DLQ retry strategy."]]);
      render(
        <MeetingList
          meetings={[makeMeeting({ id: "dsu-1", title: "Mandalore DSU", date: "2026-02-24T10:00:00.000Z", series: "mandalore dsu" })]}
          selectedId={null}
          checked={new Set()}
          {...defaultProps()}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
          isDeepSearchActive={true}
          deepSearchSummaries={summaries}
        />,
      );
      const row = screen.getByTestId("meeting-row-dsu-1");
      expect(row.className).toContain("border-l-[var(--color-search-deep)]");
      expect(screen.getByText("Discussed DLQ retry strategy.")).toBeDefined();
    });

    it("does not show orange border when isDeepSearchActive is false", () => {
      render(
        <MeetingList
          meetings={[makeMeeting({ id: "dsu-1", title: "Mandalore DSU", date: "2026-02-24T10:00:00.000Z", series: "mandalore dsu" })]}
          selectedId={null}
          checked={new Set()}
          {...defaultProps()}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
          isDeepSearchActive={false}
          deepSearchSummaries={new Map([["dsu-1", "Some summary"]])}
        />,
      );
      const row = screen.getByTestId("meeting-row-dsu-1");
      expect(row.className).not.toContain("border-l-[var(--color-search-deep)]");
    });
  });

  it("shows no-results message when deep search returns empty", () => {
    render(
      <MeetingList
        meetings={[]}
        selectedId={null}
        checked={new Set()}
        {...defaultProps()}
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
        searchQuery="emmit package"
        deepSearchEmpty={true}
      />,
    );
    expect(screen.getByText(/no relevant results/i)).toBeDefined();
  });

  describe("+ Add Meeting button", () => {
    it("renders when onNewMeeting is provided", () => {
      render(
        <MeetingList
          meetings={dsuMeetings}
          selectedId={null}
          checked={new Set()}
          {...defaultProps()}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
          onNewMeeting={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "+ Add Meeting" })).toBeDefined();
    });

    it("not rendered when onNewMeeting is not provided", () => {
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
      expect(screen.queryByRole("button", { name: "+ Add Meeting" })).toBeNull();
    });

    it("clicking fires onNewMeeting", () => {
      const onNewMeeting = vi.fn();
      render(
        <MeetingList
          meetings={dsuMeetings}
          selectedId={null}
          checked={new Set()}
          {...defaultProps()}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
          onNewMeeting={onNewMeeting}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "+ Add Meeting" }));
      expect(onNewMeeting).toHaveBeenCalledOnce();
    });
  });

  describe("thread sort", () => {
    it("Thread sort button appears when meetings have thread_tags", () => {
      const meetings = [
        makeMeeting({ id: "m1", thread_tags: [{ thread_id: "t1", title: "Deploy", shorthand: "DEP" }] }),
      ];
      render(
        <MeetingList
          meetings={meetings}
          selectedId={null}
          checked={new Set()}
          {...defaultProps()}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
        />,
      );
      expect(screen.getByRole("button", { name: "Thread" })).toBeDefined();
    });

    it("Thread sort button hidden when no meetings have thread_tags", () => {
      const meetings = [makeMeeting({ id: "m1" })];
      render(
        <MeetingList
          meetings={meetings}
          selectedId={null}
          checked={new Set()}
          {...defaultProps()}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
        />,
      );
      expect(screen.queryByRole("button", { name: "Thread" })).toBeNull();
    });

    it("thread sort puts threaded meetings first", () => {
      const meetings = [
        makeMeeting({ id: "m1", title: "No thread" }),
        makeMeeting({ id: "m2", title: "Has thread", thread_tags: [{ thread_id: "t1", title: "Deploy", shorthand: "DEP" }] }),
      ];
      render(
        <MeetingList
          meetings={meetings}
          selectedId={null}
          checked={new Set()}
          {...defaultProps({ sortBy: "thread" })}
          onSelect={vi.fn()}
          onCheck={vi.fn()}
          onCheckGroup={vi.fn()}
        />,
      );
      const allText = screen.getAllByText(/Has thread|No thread/);
      expect(allText[0].textContent).toBe("Has thread");
      expect(allText[1].textContent).toBe("No thread");
    });
  });
});
