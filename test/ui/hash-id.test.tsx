// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { HashId } from "../../electron-ui/ui/src/components/ui/hash-id.js";

afterEach(cleanup);

describe("HashId", () => {
  it("renders hash text with mono font and decorative color", () => {
    render(<HashId hash="3d1e0e" />);
    const btn = screen.getByTitle("Copy 3d1e0e");
    expect(btn.className).toContain("font-mono");
    expect(btn.className).toContain("text-[var(--color-line)]");
    expect(screen.getByText("3d1e0e")).toBeTruthy();
  });

  it("renders clipboard icon SVG", () => {
    const { container } = render(<HashId hash="abc123" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("copies hash to clipboard on click", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<HashId hash="3d1e0e" />);
    fireEvent.click(screen.getByTitle("Copy 3d1e0e"));
    expect(writeText).toHaveBeenCalledWith("3d1e0e");
  });
});
