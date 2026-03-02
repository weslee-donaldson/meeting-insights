// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ScrollArea } from "../../electron-ui/ui/src/components/ui/scroll-area.js";

afterEach(cleanup);

describe("ScrollArea", () => {
  it("renders children inside a scrollable viewport", () => {
    render(
      <ScrollArea className="max-h-[100px]">
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    expect(screen.getByText("Scrollable content")).toBeDefined();
  });

  it("applies custom className to root element", () => {
    const { container } = render(
      <ScrollArea className="max-h-[200px] w-full">
        <span>Content</span>
      </ScrollArea>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("max-h-[200px]");
    expect(root.className).toContain("overflow-hidden");
  });

  it("contains a viewport element for scrollable content", () => {
    const { container } = render(
      <ScrollArea>
        <div data-testid="inner">Inside</div>
      </ScrollArea>,
    );
    const viewport = container.querySelector("[data-radix-scroll-area-viewport]");
    expect(viewport).not.toBeNull();
    expect(screen.getByTestId("inner")).toBeDefined();
  });
});
