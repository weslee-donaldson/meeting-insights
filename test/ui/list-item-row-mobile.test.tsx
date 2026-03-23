// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ListItemRow, MeetingAvatar } from "../../electron-ui/ui/src/components/shared/list-item-row.js";

afterEach(cleanup);

describe("ListItemRow — touchTarget", () => {
  it("adds 48px min-height when touchTarget is true", () => {
    render(
      <ListItemRow touchTarget onClick={vi.fn()}>
        <span>Row content</span>
      </ListItemRow>,
    );
    const row = screen.getByRole("option");
    expect(row.className).toContain("min-h-[48px]");
  });

  it("does not add min-height when touchTarget is false", () => {
    render(
      <ListItemRow onClick={vi.fn()}>
        <span>Row content</span>
      </ListItemRow>,
    );
    const row = screen.getByRole("option");
    expect(row.className).not.toContain("min-h-[48px]");
  });

  it("applies larger padding and gap for touch", () => {
    render(
      <ListItemRow touchTarget onClick={vi.fn()}>
        <span>Row content</span>
      </ListItemRow>,
    );
    const row = screen.getByRole("option");
    expect(row.className).toContain("py-3");
    expect(row.className).toContain("gap-3");
  });
});

describe("MeetingAvatar", () => {
  it("renders initials from meeting title", () => {
    render(<MeetingAvatar title="Alpha Weekly" />);
    const avatar = screen.getByTestId("meeting-avatar");
    expect(avatar.textContent).toBe("AW");
  });

  it("renders single initial for single-word title", () => {
    render(<MeetingAvatar title="Standup" />);
    const avatar = screen.getByTestId("meeting-avatar");
    expect(avatar.textContent).toBe("S");
  });

  it("uses a colored background derived from title", () => {
    render(<MeetingAvatar title="Alpha Weekly" />);
    const avatar = screen.getByTestId("meeting-avatar");
    expect(avatar.style.backgroundColor).not.toBe("");
  });

  it("renders as 32x32 rounded-full", () => {
    render(<MeetingAvatar title="Test" />);
    const avatar = screen.getByTestId("meeting-avatar");
    expect(avatar.className).toContain("w-8");
    expect(avatar.className).toContain("h-8");
    expect(avatar.className).toContain("rounded-full");
  });
});
