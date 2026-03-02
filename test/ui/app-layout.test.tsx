// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { AppLayout } from "../../electron-ui/ui/src/components/AppLayout.js";

afterEach(cleanup);


vi.mock("react-resizable-panels", () => ({
  Group: ({ children }: { children: React.ReactNode }) => <div data-panel-group>{children}</div>,
  Panel: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Separator: () => <div data-panel-separator />,
}));

const defaultProps = {
  contextCollapsed: false,
  chatCollapsed: false,
  onCollapseContext: vi.fn(),
  onCollapseChat: vi.fn(),
  clientsPanel: <div>clients</div>,
  meetingsPanel: <div>meetings</div>,
  contextPanel: <div>context content</div>,
  chatPanel: <div>chat content</div>,
};

describe("AppLayout", () => {
  it("renders all four panel regions when not collapsed", () => {
    render(<AppLayout {...defaultProps} />);
    expect(screen.getByTestId("clients-panel")).toBeDefined();
    expect(screen.getByTestId("meetings-panel")).toBeDefined();
    expect(screen.getByTestId("context-panel")).toBeDefined();
    expect(screen.getByTestId("chat-panel")).toBeDefined();
  });

  it("collapse context button fires onCollapseContext", () => {
    const onCollapseContext = vi.fn();
    render(<AppLayout {...defaultProps} onCollapseContext={onCollapseContext} />);
    fireEvent.click(screen.getByLabelText("Collapse context panel"));
    expect(onCollapseContext).toHaveBeenCalledOnce();
  });

  it("collapse chat button fires onCollapseChat", () => {
    const onCollapseChat = vi.fn();
    render(<AppLayout {...defaultProps} onCollapseChat={onCollapseChat} />);
    fireEvent.click(screen.getByLabelText("Collapse chat panel"));
    expect(onCollapseChat).toHaveBeenCalledOnce();
  });

  it("hides context panel when contextCollapsed is true", () => {
    render(<AppLayout {...defaultProps} contextCollapsed={true} />);
    expect(screen.queryByTestId("context-panel")).toBeNull();
  });

  it("hides chat panel when chatCollapsed is true", () => {
    render(<AppLayout {...defaultProps} chatCollapsed={true} />);
    expect(screen.queryByTestId("chat-panel")).toBeNull();
  });
});
