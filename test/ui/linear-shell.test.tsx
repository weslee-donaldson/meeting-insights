// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { LinearShell } from "../../electron-ui/ui/src/components/LinearShell.js";

afterEach(cleanup);

describe("LinearShell", () => {
  it("renders topBar, sidebar, and main content always", () => {
    render(
      <LinearShell
        topBar={<div>top-bar-content</div>}
        sidebar={<div>sidebar-content</div>}
        main={<div>main-content</div>}
        detail={<div>detail-content</div>}
        detailOpen={false}
      />,
    );
    expect(screen.getByText("top-bar-content")).toBeDefined();
    expect(screen.getByText("sidebar-content")).toBeDefined();
    expect(screen.getByText("main-content")).toBeDefined();
  });

  it("detail panel has width 0 when detailOpen is false", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail-content</div>}
        detailOpen={false}
      />,
    );
    const detailPanel = screen.getByTestId("detail-panel");
    expect(detailPanel.style.width).toBe("0px");
  });

  it("detail panel has 480px width when detailOpen is true", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail-content</div>}
        detailOpen={true}
      />,
    );
    const detailPanel = screen.getByTestId("detail-panel");
    expect(detailPanel.style.width).toBe("480px");
  });

  it("sidebar resize handle is rendered", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
        detailOpen={false}
      />,
    );
    expect(screen.getByTestId("sidebar-resize-handle")).toBeDefined();
  });

  it("dragging sidebar handle rightward increases sidebar width", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
        detailOpen={false}
      />,
    );
    const handle = screen.getByTestId("sidebar-resize-handle");
    fireEvent.mouseDown(handle, { clientX: 240 });
    fireEvent.mouseMove(document, { clientX: 300 });
    const sidebarPanel = screen.getByTestId("sidebar-panel");
    expect(parseInt(sidebarPanel.style.width)).toBeGreaterThan(240);
  });

  it("detail resize handle is absent when detailOpen is false", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
        detailOpen={false}
      />,
    );
    expect(screen.queryByTestId("detail-resize-handle")).toBeNull();
  });

  it("detail resize handle is present when detailOpen is true", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
        detailOpen={true}
      />,
    );
    expect(screen.getByTestId("detail-resize-handle")).toBeDefined();
  });

  it("dragging detail handle leftward increases detail width", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
        detailOpen={true}
      />,
    );
    const handle = screen.getByTestId("detail-resize-handle");
    fireEvent.mouseDown(handle, { clientX: 480 });
    fireEvent.mouseMove(document, { clientX: 420 });
    const detailPanel = screen.getByTestId("detail-panel");
    expect(parseInt(detailPanel.style.width)).toBeGreaterThan(480);
  });

  it("chat panel is absent when chatOpen is false", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
        detailOpen={false}
        chat={<div>chat-content</div>}
        chatOpen={false}
      />,
    );
    expect(screen.queryByTestId("chat-panel")).toBeNull();
  });

  it("chat panel is present and renders content when chatOpen is true", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        sidebar={<div>sidebar</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
        detailOpen={false}
        chat={<div>chat-content</div>}
        chatOpen={true}
      />,
    );
    expect(screen.getByTestId("chat-panel")).toBeDefined();
    expect(screen.getByText("chat-content")).toBeDefined();
  });
});
