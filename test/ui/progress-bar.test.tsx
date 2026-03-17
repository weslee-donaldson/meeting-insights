// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProgressBar } from "../../electron-ui/ui/src/components/ui/progress-bar.js";

afterEach(cleanup);

describe("ProgressBar", () => {
  it("renders fraction label with secondary text color when incomplete", () => {
    render(<ProgressBar current={2} total={15} />);
    const label = screen.getByText("2/15");
    expect(label.className).toContain("text-[var(--color-text-secondary)]");
  });

  it("renders accent-colored fill bar at correct width percentage", () => {
    const { container } = render(<ProgressBar current={2} total={15} />);
    const fill = container.querySelector("[style]");
    expect(fill?.getAttribute("style")).toContain("width: 13%");
    expect(fill?.className).toContain("bg-[var(--color-accent)]");
  });

  it("renders green fill bar and success text color at 100%", () => {
    render(<ProgressBar current={15} total={15} />);
    const label = screen.getByText("15/15");
    expect(label.className).toContain("text-[var(--color-success)]");
  });

  it("renders bar track with line color background", () => {
    const { container } = render(<ProgressBar current={5} total={10} />);
    const track = container.querySelector(".bg-\\[var\\(--color-line\\)\\]");
    expect(track).not.toBeNull();
  });
});
