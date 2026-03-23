// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { BreadcrumbBar } from "../../electron-ui/ui/src/components/BreadcrumbBar.js";

afterEach(cleanup);

describe("BreadcrumbBar", () => {
  it("renders nothing when segments is empty", () => {
    const { container } = render(<BreadcrumbBar segments={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders segment labels with chevron separators", () => {
    render(
      <BreadcrumbBar
        segments={[
          { label: "Meetings", onClick: vi.fn() },
          { label: "LLSA", onClick: vi.fn() },
          { label: "Detail" },
        ]}
      />,
    );
    expect(screen.getByText("Meetings")).toBeDefined();
    expect(screen.getByText("LLSA")).toBeDefined();
    expect(screen.getByText("Detail")).toBeDefined();
    const nav = screen.getByTestId("breadcrumb-bar");
    const chevrons = nav.querySelectorAll("svg");
    expect(chevrons.length).toBe(2);
  });

  it("renders last segment as a highlighted pill (not a button)", () => {
    render(
      <BreadcrumbBar
        segments={[
          { label: "Meetings", onClick: vi.fn() },
          { label: "Detail" },
        ]}
      />,
    );
    const detail = screen.getByText("Detail");
    expect(detail.tagName).toBe("SPAN");
    expect(detail.className).toContain("bg-[var(--color-bg-elevated)]");
  });

  it("renders ancestor segments as clickable buttons with accent color", () => {
    render(
      <BreadcrumbBar
        segments={[
          { label: "Meetings", onClick: vi.fn() },
          { label: "Detail" },
        ]}
      />,
    );
    const meetings = screen.getByText("Meetings");
    expect(meetings.tagName).toBe("BUTTON");
    expect(meetings.className).toContain("text-[var(--color-accent)]");
  });

  it("fires onClick when clicking an ancestor segment", () => {
    const onClick = vi.fn();
    render(
      <BreadcrumbBar
        segments={[
          { label: "Meetings", onClick },
          { label: "Detail" },
        ]}
      />,
    );
    fireEvent.click(screen.getByText("Meetings"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports horizontal scroll overflow", () => {
    render(
      <BreadcrumbBar
        segments={[
          { label: "Meetings", onClick: vi.fn() },
          { label: "Detail" },
        ]}
      />,
    );
    const nav = screen.getByTestId("breadcrumb-bar");
    expect(nav.className).toContain("overflow-x-auto");
  });
});
