// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TimelineDetailView } from "../../electron-ui/ui/src/components/TimelineDetailView.js";
import type { Milestone } from "../../core/timelines.js";

afterEach(cleanup);

const MILESTONE: Milestone = {
  id: "m1",
  client_name: "Acme",
  title: "Launch v2.0",
  description: "Major product launch",
  target_date: "2026-03-15",
  status: "tracked",
  completed_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-15T00:00:00Z",
};

describe("TimelineDetailView", () => {
  it("renders milestone title and status badge", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    expect(screen.getByText("Launch v2.0")).toBeDefined();
    expect(screen.getByText("tracked")).toBeDefined();
  });

  it("renders target date formatted", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    expect(screen.getByText("Mar 15, 2026")).toBeDefined();
  });

  it("renders description", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    expect(screen.getByText("Major product launch")).toBeDefined();
  });

  it("shows Unscheduled when no target date", () => {
    const noDate = { ...MILESTONE, target_date: null };
    render(<TimelineDetailView milestone={noDate} onDelete={vi.fn()} />);
    expect(screen.getByText("Unscheduled")).toBeDefined();
  });

  it("calls onDelete when delete is confirmed", () => {
    const onDelete = vi.fn();
    render(<TimelineDetailView milestone={MILESTONE} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText(/Are you sure/)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("does not call onDelete when delete is cancelled", () => {
    const onDelete = vi.fn();
    render(<TimelineDetailView milestone={MILESTONE} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("renders status dot with correct color", () => {
    render(<TimelineDetailView milestone={MILESTONE} onDelete={vi.fn()} />);
    const dot = screen.getByTestId("detail-status-dot");
    expect(dot.className).toContain("bg-blue");
  });
});
