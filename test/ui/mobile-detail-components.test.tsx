// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ShowMore } from "../../electron-ui/ui/src/components/shared/show-more.js";
import { ChatFab } from "../../electron-ui/ui/src/components/shared/chat-fab.js";

afterEach(cleanup);

describe("ShowMore", () => {
  it("renders children with line clamp applied", () => {
    render(<ShowMore lineClamp={4}><p>Long text content</p></ShowMore>);
    expect(screen.getByText("Long text content")).toBeDefined();
    const container = screen.getByTestId("show-more");
    expect(container.querySelector("div")!.style.webkitLineClamp).toBe("4");
  });

  it("shows 'Show more' button by default", () => {
    render(<ShowMore><p>Content</p></ShowMore>);
    expect(screen.getByTestId("show-more-toggle").textContent).toBe("Show more");
  });

  it("toggles to 'Show less' when clicked", () => {
    render(<ShowMore><p>Content</p></ShowMore>);
    fireEvent.click(screen.getByTestId("show-more-toggle"));
    expect(screen.getByTestId("show-more-toggle").textContent).toBe("Show less");
  });

  it("removes line clamp when expanded", () => {
    render(<ShowMore lineClamp={3}><p>Content</p></ShowMore>);
    fireEvent.click(screen.getByTestId("show-more-toggle"));
    const container = screen.getByTestId("show-more");
    expect(container.querySelector("div")!.style.webkitLineClamp).toBe("");
  });

  it("defaults to 4-line clamp", () => {
    render(<ShowMore><p>Content</p></ShowMore>);
    const container = screen.getByTestId("show-more");
    expect(container.querySelector("div")!.style.webkitLineClamp).toBe("4");
  });
});

describe("ChatFab", () => {
  it("renders a floating chat button", () => {
    render(<ChatFab onClick={vi.fn()} />);
    expect(screen.getByTestId("chat-fab")).toBeDefined();
    expect(screen.getByLabelText("Open chat")).toBeDefined();
  });

  it("calls onClick when tapped", () => {
    const onClick = vi.fn();
    render(<ChatFab onClick={onClick} />);
    fireEvent.click(screen.getByTestId("chat-fab"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is positioned above the bottom tab bar", () => {
    render(<ChatFab onClick={vi.fn()} />);
    const fab = screen.getByTestId("chat-fab");
    expect(fab.className).toContain("bottom-[72px]");
  });

  it("uses accent background color", () => {
    render(<ChatFab onClick={vi.fn()} />);
    const fab = screen.getByTestId("chat-fab");
    expect(fab.className).toContain("bg-[var(--color-accent)]");
  });
});
