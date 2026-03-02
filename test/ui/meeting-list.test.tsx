// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingList } from "../../electron-ui/ui/src/components/MeetingList.js";
import type { MeetingRow } from "../../electron-ui/electron/channels.js";

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

describe("MeetingList", () => {
  it("groups meetings with same normalized title under one group", () => {
    render(
      <MeetingList
        meetings={dsuMeetings}
        selectedId={null}
        checked={new Set()}
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
        onSelect={onSelect}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    const titleEls = screen.getAllByText("Alpha Meeting");
    const rowTitle = titleEls.find(
      (el) => el.tagName === "DIV",
    )!;
    fireEvent.click(rowTitle);
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
        onSelect={vi.fn()}
        onCheck={vi.fn()}
        onCheckGroup={vi.fn()}
      />,
    );
    const dates = screen.getAllByText(/2026-02-\d+/);
    expect(dates[0].textContent).toContain("2026-02-26");
  });
});
