// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
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
});
