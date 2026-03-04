// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect } from "vitest";
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

  it("first panel defaults to 500px width", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        panels={[<div key="p1">main</div>, <div key="p2">detail</div>]}
      />,
    );
    const mainPanel = screen.getByTestId("panel-0");
    expect(mainPanel.style.width).toBe("500px");
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
