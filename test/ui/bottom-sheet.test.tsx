// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { BottomSheet } from "../../electron-ui/ui/src/components/ui/bottom-sheet.js";

afterEach(cleanup);

describe("BottomSheet", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    window.dispatchEvent(new Event("resize"));
  });

  it("renders nothing when open is false", () => {
    render(<BottomSheet open={false} onOpenChange={vi.fn()}><p>Content</p></BottomSheet>);
    expect(screen.queryByTestId("bottom-sheet")).toBeNull();
  });

  it("renders sheet with backdrop and handle when open on mobile", () => {
    render(<BottomSheet open={true} onOpenChange={vi.fn()}><p>Content</p></BottomSheet>);
    expect(screen.getByTestId("bottom-sheet")).toBeDefined();
    expect(screen.getByTestId("bottom-sheet-backdrop")).toBeDefined();
    expect(screen.getByTestId("bottom-sheet-handle")).toBeDefined();
    expect(screen.getByText("Content")).toBeDefined();
  });

  it("calls onOpenChange(false) when backdrop is clicked", () => {
    const onOpenChange = vi.fn();
    render(<BottomSheet open={true} onOpenChange={onOpenChange}><p>Content</p></BottomSheet>);
    fireEvent.click(screen.getByTestId("bottom-sheet-backdrop"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders with specified height percentage", () => {
    render(<BottomSheet open={true} onOpenChange={vi.fn()} height={60}><p>Content</p></BottomSheet>);
    const container = screen.getByTestId("bottom-sheet-container");
    expect(container.style.height).toBe("60vh");
  });

  it("defaults to 85vh height", () => {
    render(<BottomSheet open={true} onOpenChange={vi.fn()}><p>Content</p></BottomSheet>);
    const container = screen.getByTestId("bottom-sheet-container");
    expect(container.style.height).toBe("85vh");
  });

  it("renders title when provided", () => {
    render(<BottomSheet open={true} onOpenChange={vi.fn()} title="Notes"><p>Content</p></BottomSheet>);
    expect(screen.getByText("Notes")).toBeDefined();
  });

  it("scrolls content area", () => {
    render(<BottomSheet open={true} onOpenChange={vi.fn()}><p>Content</p></BottomSheet>);
    const contentArea = screen.getByText("Content").closest(".overflow-y-auto");
    expect(contentArea).not.toBeNull();
  });

  it("renders as Dialog on desktop viewport", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
    window.dispatchEvent(new Event("resize"));
    render(<BottomSheet open={true} onOpenChange={vi.fn()} title="Notes"><p>Desktop content</p></BottomSheet>);
    expect(screen.queryByTestId("bottom-sheet")).toBeNull();
    expect(screen.getByText("Desktop content")).toBeDefined();
  });

  it("closes on Escape key press in mobile mode", () => {
    const onOpenChange = vi.fn();
    render(<BottomSheet open={true} onOpenChange={onOpenChange}><p>Content</p></BottomSheet>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
