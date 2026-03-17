// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DensityToggle } from "../../electron-ui/ui/src/components/shared/density-toggle.js";

afterEach(cleanup);

describe("DensityToggle", () => {
  it("renders 3 radio buttons for comfortable, compact, and dense", () => {
    render(<DensityToggle value="comfortable" onChange={vi.fn()} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    expect(screen.getByLabelText("comfortable density")).toBeTruthy();
    expect(screen.getByLabelText("compact density")).toBeTruthy();
    expect(screen.getByLabelText("dense density")).toBeTruthy();
  });

  it("marks the active mode with surface background and primary text", () => {
    render(<DensityToggle value="compact" onChange={vi.fn()} />);
    const active = screen.getByRole("radio", { checked: true });
    expect(active.className).toContain("bg-[var(--color-bg-surface)]");
    expect(active.className).toContain("text-[var(--color-text-primary)]");
  });

  it("marks inactive modes with muted text", () => {
    render(<DensityToggle value="compact" onChange={vi.fn()} />);
    const inactive = screen.getAllByRole("radio").filter(
      (r) => r.getAttribute("aria-checked") === "false",
    );
    expect(inactive).toHaveLength(2);
    inactive.forEach((r) => {
      expect(r.className).toContain("text-[var(--color-text-muted)]");
    });
  });

  it("calls onChange with selected mode on click", () => {
    const onChange = vi.fn();
    render(<DensityToggle value="comfortable" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("dense density"));
    expect(onChange).toHaveBeenCalledWith("dense");
  });

  it("renders in elevated background pill", () => {
    const { container } = render(<DensityToggle value="comfortable" onChange={vi.fn()} />);
    const group = screen.getByRole("radiogroup");
    expect(group.className).toContain("bg-[var(--color-bg-elevated)]");
    expect(group.className).toContain("rounded-md");
  });

  it("renders SVG icons inside each button", () => {
    const { container } = render(<DensityToggle value="comfortable" onChange={vi.fn()} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(3);
  });
});
