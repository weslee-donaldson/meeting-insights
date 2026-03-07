// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { NavRail } from "../../electron-ui/ui/src/components/NavRail.js";

afterEach(cleanup);

describe("NavRail", () => {
  it("renders Meetings, Action Items, and Threads items", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    expect(screen.getByText("Meetings")).toBeDefined();
    expect(screen.getByText("Action Items")).toBeDefined();
    expect(screen.getByText("Threads")).toBeDefined();
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

  it("active item has selected styling", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    const meetingsBtn = screen.getByRole("button", { name: "Meetings" });
    expect(meetingsBtn.className).toContain("text-foreground");
  });

  it("inactive item has muted styling", () => {
    render(<NavRail currentView="meetings" onNavigate={vi.fn()} />);
    const actionBtn = screen.getByRole("button", { name: "Action Items" });
    expect(actionBtn.className).toContain("text-muted-foreground");
  });

  it("clicking Threads fires onNavigate with threads", () => {
    const onNavigate = vi.fn();
    render(<NavRail currentView="meetings" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Threads"));
    expect(onNavigate).toHaveBeenCalledWith("threads");
  });
});
