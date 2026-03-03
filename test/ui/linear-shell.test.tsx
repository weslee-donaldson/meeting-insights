// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { LinearShell } from "../../electron-ui/ui/src/components/LinearShell.js";

afterEach(cleanup);

describe("LinearShell", () => {
  it("renders topBar, main, and detail content always", () => {
    render(
      <LinearShell
        topBar={<div>top-bar-content</div>}
        main={<div>main-content</div>}
        detail={<div>detail-content</div>}
      />,
    );
    expect(screen.getByText("top-bar-content")).toBeDefined();
    expect(screen.getByText("main-content")).toBeDefined();
    expect(screen.getByText("detail-content")).toBeDefined();
  });

  it("main panel defaults to 500px width", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
      />,
    );
    const mainPanel = screen.getByTestId("main-panel");
    expect(mainPanel.style.width).toBe("500px");
  });

  it("detail panel is always visible with flex-1 layout", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        main={<div>main</div>}
        detail={<div>detail-content</div>}
      />,
    );
    const detailPanel = screen.getByTestId("detail-panel");
    expect(detailPanel.className).toContain("flex-1");
    expect(screen.getByText("detail-content")).toBeDefined();
  });

  it("main resize handle is rendered", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
      />,
    );
    expect(screen.getByTestId("main-resize-handle")).toBeDefined();
  });

  it("dragging main handle rightward increases main width", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
      />,
    );
    const handle = screen.getByTestId("main-resize-handle");
    fireEvent.mouseDown(handle, { clientX: 200 });
    fireEvent.mouseMove(document, { clientX: 300 });
    const mainPanel = screen.getByTestId("main-panel");
    expect(parseInt(mainPanel.style.width)).toBeGreaterThan(200);
  });

  it("chat panel is absent when chatOpen is false", () => {
    render(
      <LinearShell
        topBar={<div>top</div>}
        main={<div>main</div>}
        detail={<div>detail</div>}
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
        main={<div>main</div>}
        detail={<div>detail</div>}
        chat={<div>chat-content</div>}
        chatOpen={true}
      />,
    );
    expect(screen.getByTestId("chat-panel")).toBeDefined();
    expect(screen.getByText("chat-content")).toBeDefined();
  });
});
