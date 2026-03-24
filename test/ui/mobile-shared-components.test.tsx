// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { MobileListHeader } from "../../electron-ui/ui/src/components/shared/mobile-list-header.js";
import { StatusDot } from "../../electron-ui/ui/src/components/shared/status-dot.js";
import { FilterChipButton } from "../../electron-ui/ui/src/components/shared/filter-chip-button.js";

afterEach(cleanup);

describe("MobileListHeader", () => {
  it("renders title and subtitle", () => {
    render(<MobileListHeader title="Action Items" subtitle="LLSA · 490 open" />);
    expect(screen.getByText("Action Items")).toBeDefined();
    expect(screen.getByText("LLSA · 490 open")).toBeDefined();
  });

  it("renders new button when onNew provided", () => {
    const onNew = vi.fn();
    render(<MobileListHeader title="Threads" onNew={onNew} newLabel="+ New" />);
    fireEvent.click(screen.getByLabelText("+ New"));
    expect(onNew).toHaveBeenCalledOnce();
  });

  it("does not render new button when onNew not provided", () => {
    render(<MobileListHeader title="Items" />);
    expect(screen.queryByLabelText("+ New")).toBeNull();
  });

  it("renders filter slot when provided", () => {
    render(
      <MobileListHeader
        title="Items"
        filterSlot={<button data-testid="filter">Priority</button>}
      />,
    );
    expect(screen.getByTestId("filter")).toBeDefined();
  });

  it("uses Space Grotesk for title", () => {
    render(<MobileListHeader title="Test" />);
    const h1 = screen.getByText("Test");
    expect(h1.style.fontFamily).toContain("Space Grotesk");
  });
});

describe("StatusDot", () => {
  it("renders a colored dot at default 10px", () => {
    render(<StatusDot color="green" />);
    const dot = screen.getByTestId("status-dot");
    expect(dot.style.width).toBe("10px");
    expect(dot.style.height).toBe("10px");
  });

  it("renders at custom size", () => {
    render(<StatusDot color="red" size={12} />);
    const dot = screen.getByTestId("status-dot");
    expect(dot.style.width).toBe("12px");
    expect(dot.style.height).toBe("12px");
  });

  it("uses success color for green", () => {
    render(<StatusDot color="green" />);
    const dot = screen.getByTestId("status-dot");
    expect(dot.className).toContain("bg-[var(--color-success)]");
  });

  it("uses danger color for red", () => {
    render(<StatusDot color="red" />);
    const dot = screen.getByTestId("status-dot");
    expect(dot.className).toContain("bg-[var(--color-danger)]");
  });
});

describe("FilterChipButton", () => {
  it("renders label text", () => {
    render(<FilterChipButton label="Priority" />);
    expect(screen.getByText("Priority")).toBeDefined();
  });

  it("applies active styling when active", () => {
    render(<FilterChipButton label="Priority" active />);
    const chip = screen.getByTestId("filter-chip");
    expect(chip.className).toContain("bg-[var(--color-tint)]");
    expect(chip.className).toContain("text-[var(--color-accent)]");
  });

  it("applies default styling when inactive", () => {
    render(<FilterChipButton label="Series" />);
    const chip = screen.getByTestId("filter-chip");
    expect(chip.className).toContain("text-[var(--color-text-secondary)]");
  });

  it("fires onClick when tapped", () => {
    const onClick = vi.fn();
    render(<FilterChipButton label="Owner" onClick={onClick} />);
    fireEvent.click(screen.getByText("Owner"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
