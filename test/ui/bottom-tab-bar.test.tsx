// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { BottomTabBar } from "../../electron-ui/ui/src/components/BottomTabBar.js";

afterEach(cleanup);

describe("BottomTabBar", () => {
  it("renders all 5 navigation items", () => {
    render(<BottomTabBar currentView="meetings" onNavigate={vi.fn()} />);
    expect(screen.getByText("Meetings")).toBeDefined();
    expect(screen.getByText("Items")).toBeDefined();
    expect(screen.getByText("Threads")).toBeDefined();
    expect(screen.getByText("Insights")).toBeDefined();
    expect(screen.getByText("Timelines")).toBeDefined();
  });

  it("active item uses accent color", () => {
    render(<BottomTabBar currentView="meetings" onNavigate={vi.fn()} />);
    const btn = screen.getByRole("button", { name: "Meetings" });
    expect(btn.className).toContain("text-[var(--color-accent)]");
  });

  it("inactive item uses muted color", () => {
    render(<BottomTabBar currentView="meetings" onNavigate={vi.fn()} />);
    const btn = screen.getByRole("button", { name: "Threads" });
    expect(btn.className).toContain("text-[var(--color-text-muted)]");
  });

  it("clicking a tab fires onNavigate with the correct view", () => {
    const onNavigate = vi.fn();
    render(<BottomTabBar currentView="meetings" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Threads"));
    expect(onNavigate).toHaveBeenCalledWith("threads");
  });

  it("clicking each view fires the expected value", () => {
    const onNavigate = vi.fn();
    render(<BottomTabBar currentView="meetings" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Items"));
    expect(onNavigate).toHaveBeenCalledWith("action-items");
    fireEvent.click(screen.getByText("Insights"));
    expect(onNavigate).toHaveBeenCalledWith("insights");
    fireEvent.click(screen.getByText("Timelines"));
    expect(onNavigate).toHaveBeenCalledWith("timelines");
  });

  it("renders with 56px height", () => {
    render(<BottomTabBar currentView="meetings" onNavigate={vi.fn()} />);
    const nav = screen.getByTestId("bottom-tab-bar");
    expect(nav.style.height).toBe("56px");
  });

  it("renders icons with 20px size", () => {
    render(<BottomTabBar currentView="meetings" onNavigate={vi.fn()} />);
    const svg = screen.getByRole("button", { name: "Meetings" }).querySelector("svg")!;
    expect(svg.classList.contains("w-[20px]")).toBe(true);
  });
});
