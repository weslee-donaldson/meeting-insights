// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ResponsiveShell } from "../../electron-ui/ui/src/components/ResponsiveShell.js";

afterEach(cleanup);

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
}

const topBar = <div data-testid="top-bar">Top</div>;
const listPanel = <div data-testid="list-panel">List</div>;
const detailPanel = <div data-testid="detail-panel">Detail</div>;
const chatPanel = <div data-testid="chat-content">Chat</div>;
const navRail = <div data-testid="nav-rail">Nav</div>;

describe("ResponsiveShell — Desktop", () => {
  beforeEach(() => setViewport(1440));

  it("delegates to LinearShell on desktop", () => {
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        navRail={navRail}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByTestId("top-bar")).toBeDefined();
    expect(screen.getByTestId("list-panel")).toBeDefined();
    expect(screen.getByTestId("detail-panel")).toBeDefined();
    expect(screen.getByTestId("nav-rail")).toBeDefined();
    expect(screen.queryByTestId("bottom-tab-bar")).toBeNull();
  });
});

describe("ResponsiveShell — Tablet", () => {
  beforeEach(() => setViewport(1024));

  it("renders tablet layout with bottom tab bar and split pane", () => {
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByTestId("responsive-shell-tablet")).toBeDefined();
    expect(screen.getByTestId("bottom-tab-bar")).toBeDefined();
    expect(screen.getByTestId("tablet-list-panel")).toBeDefined();
    expect(screen.getByTestId("tablet-detail-panel")).toBeDefined();
  });

  it("renders chat panel when chatOpen is true", () => {
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        chat={chatPanel}
        chatOpen={true}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByTestId("tablet-chat-panel")).toBeDefined();
    expect(screen.getByText("Chat")).toBeDefined();
  });

  it("does not render chat panel when chatOpen is false", () => {
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        chat={chatPanel}
        chatOpen={false}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("tablet-chat-panel")).toBeNull();
  });

  it("fires onNavigate when clicking a bottom tab", () => {
    const onNavigate = vi.fn();
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel]}
        currentView="meetings"
        onNavigate={onNavigate}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Threads" }));
    expect(onNavigate).toHaveBeenCalledWith("threads");
  });

  it("tablet list panel uses 280px width", () => {
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByTestId("tablet-list-panel").style.width).toBe("280px");
  });
});

describe("ResponsiveShell — Mobile", () => {
  beforeEach(() => setViewport(390));

  it("renders mobile layout with bottom tab bar", () => {
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByTestId("responsive-shell-mobile")).toBeDefined();
    expect(screen.getByTestId("bottom-tab-bar")).toBeDefined();
  });

  it("shows list panel by default", () => {
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.getByTestId("list-panel")).toBeDefined();
    expect(screen.queryByTestId("detail-panel")).toBeNull();
  });

  it("does not show breadcrumbs on list screen", () => {
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        currentView="meetings"
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("breadcrumb-bar")).toBeNull();
  });

  it("resets to list screen when switching views via tab bar", () => {
    const onNavigate = vi.fn();
    render(
      <ResponsiveShell
        topBar={topBar}
        panels={[listPanel, detailPanel]}
        currentView="meetings"
        onNavigate={onNavigate}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Threads" }));
    expect(onNavigate).toHaveBeenCalledWith("threads");
  });
});
