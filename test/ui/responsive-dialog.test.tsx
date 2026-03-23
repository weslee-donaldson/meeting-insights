// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ResponsiveDialog } from "../../electron-ui/ui/src/components/ui/responsive-dialog.js";

afterEach(cleanup);

describe("ResponsiveDialog — Mobile", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 390 });
    window.dispatchEvent(new Event("resize"));
  });

  it("renders as BottomSheet on mobile", () => {
    render(
      <ResponsiveDialog open={true} onOpenChange={vi.fn()} title="Notes">
        <p>Sheet content</p>
      </ResponsiveDialog>,
    );
    expect(screen.getByTestId("bottom-sheet")).toBeDefined();
    expect(screen.getByText("Notes")).toBeDefined();
    expect(screen.getByText("Sheet content")).toBeDefined();
  });

  it("renders nothing when closed on mobile", () => {
    render(
      <ResponsiveDialog open={false} onOpenChange={vi.fn()} title="Notes">
        <p>Sheet content</p>
      </ResponsiveDialog>,
    );
    expect(screen.queryByTestId("bottom-sheet")).toBeNull();
  });

  it("closes on backdrop click in mobile mode", () => {
    const onOpenChange = vi.fn();
    render(
      <ResponsiveDialog open={true} onOpenChange={onOpenChange} title="Notes">
        <p>Sheet content</p>
      </ResponsiveDialog>,
    );
    fireEvent.click(screen.getByTestId("bottom-sheet-backdrop"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("ResponsiveDialog — Desktop", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1440 });
    window.dispatchEvent(new Event("resize"));
  });

  it("renders as Dialog on desktop", () => {
    render(
      <ResponsiveDialog open={true} onOpenChange={vi.fn()} title="Notes">
        <p>Dialog content</p>
      </ResponsiveDialog>,
    );
    expect(screen.queryByTestId("bottom-sheet")).toBeNull();
    expect(screen.getByText("Dialog content")).toBeDefined();
  });

  it("renders title via DialogTitle on desktop", () => {
    render(
      <ResponsiveDialog open={true} onOpenChange={vi.fn()} title="Notes">
        <p>Dialog content</p>
      </ResponsiveDialog>,
    );
    expect(screen.getByText("Notes")).toBeDefined();
  });
});
