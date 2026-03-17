// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { LinearShell } from "../../electron-ui/ui/src/components/LinearShell.js";

afterEach(cleanup);

describe("LinearShell", () => {
  it("renders topBar and all panels passed in", () => {
    render(
      <LinearShell
        topBar={<div>top-bar-content</div>}
        panels={[<div key="p1">panel-one</div>, <div key="p2">panel-two</div>]}
      />,
    );
    expect(screen.getByText("top-bar-content")).toBeDefined();
    expect(screen.getByText("panel-one")).toBeDefined();
    expect(screen.getByText("panel-two")).toBeDefined();
  });

  it("renders navRail when provided", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>]}
        navRail={<div>nav-rail-content</div>}
      />,
    );
    expect(screen.getByText("nav-rail-content")).toBeDefined();
  });

  it("renders only panels passed in — single panel", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="only">only-panel</div>]}
      />,
    );
    expect(screen.getByText("only-panel")).toBeDefined();
    expect(screen.queryByTestId("main-resize-handle")).toBeNull();
  });

  it("renders resize handle between panels when 2 panels passed", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">p1</div>, <div key="p2">p2</div>]}
      />,
    );
    expect(screen.getByTestId("main-resize-handle")).toBeDefined();
  });

  it("single panel has no fixed width style (fills available space)", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="only">only</div>]}
      />,
    );
    const panel = screen.getByTestId("panel-0");
    expect(panel.style.width).toBe("");
  });

  it("first panel defaults to 300px width", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
      />,
    );
    const mainPanel = screen.getByTestId("panel-0");
    expect(mainPanel.style.width).toBe("300px");
  });

  it("dragging main handle rightward increases first panel width", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
      />,
    );
    const handle = screen.getByTestId("main-resize-handle");
    fireEvent.mouseDown(handle, { clientX: 200 });
    fireEvent.mouseMove(document, { clientX: 300 });
    const mainPanel = screen.getByTestId("panel-0");
    expect(parseInt(mainPanel.style.width)).toBeGreaterThan(200);
  });

  it("chat panel is absent when chatOpen is false", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
        chat={<div>chat-content</div>}
        chatOpen={false}
      />,
    );
    expect(screen.queryByTestId("chat-panel")).toBeNull();
  });

  it("chat panel is present when chatOpen is true", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
        chat={<div>chat-content</div>}
        chatOpen={true}
      />,
    );
    expect(screen.getByTestId("chat-panel")).toBeDefined();
    expect(screen.getByText("chat-content")).toBeDefined();
  });
});

describe("LinearShell 3-zone layout", () => {
  it("wraps navRail in a 56px-wide fixed container", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">sidebar</div>, <div key="p2">detail</div>]}
        navRail={<div>nav</div>}
      />,
    );
    const navContainer = screen.getByText("nav").parentElement!;
    expect(navContainer.style.width).toBe("56px");
  });

  it("defaults first panel (sidebar) to 300px when two panels are present", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">sidebar</div>, <div key="p2">detail</div>]}
      />,
    );
    expect(screen.getByTestId("panel-0").style.width).toBe("300px");
  });

  it("sidebar panel has surface bg and border-right styling", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">sidebar</div>, <div key="p2">detail</div>]}
      />,
    );
    const sidebar = screen.getByTestId("panel-0");
    expect(sidebar.className).toContain("bg-[var(--color-bg-surface)]");
    expect(sidebar.className).toContain("border-r");
  });

  it("chat panel defaults to 380px width", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">sidebar</div>, <div key="p2">detail</div>]}
        chat={<div>chat</div>}
        chatOpen={true}
      />,
    );
    expect(screen.getByTestId("chat-panel").style.width).toBe("380px");
  });

  it("chat panel has surface bg and border-left styling", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">sidebar</div>, <div key="p2">detail</div>]}
        chat={<div>chat</div>}
        chatOpen={true}
      />,
    );
    const chatPanel = screen.getByTestId("chat-panel");
    expect(chatPanel.className).toContain("bg-[var(--color-bg-surface)]");
    expect(chatPanel.className).toContain("border-l");
  });
});

describe("LinearShell localStorage persistence", () => {
  const store: Record<string, string> = {};
  const lsMock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
  };

  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    vi.stubGlobal("localStorage", lsMock);
    lsMock.getItem.mockClear();
    lsMock.setItem.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("restores panel width from localStorage for a given viewId", () => {
    store["mtninsights:columns:test-view"] = JSON.stringify({ panel0: 700, chat: 400 });
    render(
      <LinearShell
        viewId="test-view"
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
      />,
    );
    expect(screen.getByTestId("panel-0").style.width).toBe("700px");
  });

  it("restores chat width from localStorage", () => {
    store["mtninsights:columns:test-view"] = JSON.stringify({ panel0: 500, chat: 450 });
    render(
      <LinearShell
        viewId="test-view"
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
        chat={<div>chat</div>}
        chatOpen={true}
      />,
    );
    expect(screen.getByTestId("chat-panel").style.width).toBe("450px");
  });

  it("saves panel width to localStorage after drag ends", async () => {
    render(
      <LinearShell
        viewId="persist-view"
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
      />,
    );
    const handle = screen.getByTestId("main-resize-handle");
    fireEvent.mouseDown(handle, { clientX: 300 });
    fireEvent.mouseMove(document, { clientX: 400 });
    fireEvent.mouseUp(document);
    await new Promise((r) => setTimeout(r, 400));
    const stored = JSON.parse(store["mtninsights:columns:persist-view"]);
    expect(stored.panel0).toBe(400);
  });

  it("uses default widths when localStorage has invalid data", () => {
    store["mtninsights:columns:bad"] = "not-json";
    render(
      <LinearShell
        viewId="bad"
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
      />,
    );
    expect(screen.getByTestId("panel-0").style.width).toBe("300px");
  });
});
