// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DsCheckbox } from "../../electron-ui/ui/src/components/ui/ds-checkbox.js";

afterEach(cleanup);

describe("DsCheckbox", () => {
  it("renders unchecked state with transparent background and line border", () => {
    render(<DsCheckbox checked={false} />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toContain("bg-transparent");
    expect(cb.className).toContain("border-[var(--color-line)]");
    expect(cb.getAttribute("aria-checked")).toBe("false");
  });

  it("renders checked state with accent background and white check SVG", () => {
    render(<DsCheckbox checked={true} />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toContain("bg-[var(--color-accent)]");
    expect(cb.getAttribute("aria-checked")).toBe("true");
    expect(cb.querySelector("svg")).not.toBeNull();
  });

  it("renders disabled state with elevated background", () => {
    render(<DsCheckbox disabled checked={false} />);
    const cb = screen.getByRole("checkbox");
    expect(cb.className).toContain("bg-[var(--color-bg-elevated)]");
    expect((cb as HTMLButtonElement).disabled).toBe(true);
  });

  it("calls onChange with toggled value on click", () => {
    const onChange = vi.fn();
    render(<DsCheckbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
