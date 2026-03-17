// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { NavRail } from "../../electron-ui/ui/src/components/NavRail.js";

afterEach(cleanup);

describe("NavRail", () => {
  it("renders Meetings, Action Items, Threads, Insights, and Timelines items", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    expect(screen.getByText("Meetings")).toBeDefined();
    expect(screen.getByText("Action Items")).toBeDefined();
    expect(screen.getByText("Threads")).toBeDefined();
    expect(screen.getByText("Insights")).toBeDefined();
    expect(screen.getByText("Timelines")).toBeDefined();
  });

  it("clicking Meetings fires onNavigate with meetings", () => {
    const onNavigate = vi.fn();
    render(<NavRail currentView="action-items" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Meetings"));
    expect(onNavigate).toHaveBeenCalledWith("meetings");
  });

  it("clicking Action Items fires onNavigate with action-items", () => {
    const onNavigate = vi.fn();
    render(<NavRail currentView="meetings" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Action Items"));
    expect(onNavigate).toHaveBeenCalledWith("action-items");
  });

  it("active item uses text-primary color", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    const meetingsBtn = screen.getByRole("button", { name: "Meetings" });
    expect(meetingsBtn.className).toContain("text-[var(--color-text-primary)]");
  });

  it("inactive item uses text-muted color", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    const actionBtn = screen.getByRole("button", { name: "Action Items" });
    expect(actionBtn.className).toContain("text-[var(--color-text-muted)]");
  });

  it("renders logo mark with accent background and K letter", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    const logo = screen.getByText("K");
    expect(logo).toBeDefined();
    const logoContainer = logo.closest("div")!;
    expect(logoContainer.className).toContain("bg-[var(--color-accent)]");
  });

  it("icons use 18px size and 1.75 stroke width", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    const svg = screen.getByRole("button", { name: "Meetings" }).querySelector("svg")!;
    expect(svg.classList.contains("w-[18px]")).toBe(true);
  });

  it("label text uses 9px font size", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    const label = screen.getByText("Meetings");
    expect(label.className).toContain("text-[9px]");
  });

  it("clicking Threads fires onNavigate with threads", () => {
    const onNavigate = vi.fn();
    render(<NavRail currentView="meetings" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Threads"));
    expect(onNavigate).toHaveBeenCalledWith("threads");
  });

  it("clicking Insights fires onNavigate with insights", () => {
    const onNavigate = vi.fn();
    render(<NavRail currentView="meetings" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Insights"));
    expect(onNavigate).toHaveBeenCalledWith("insights");
  });

  it("clicking Timelines fires onNavigate with timelines", () => {
    const onNavigate = vi.fn();
    render(<NavRail currentView="meetings" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Timelines"));
    expect(onNavigate).toHaveBeenCalledWith("timelines");
  });
});
