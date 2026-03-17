// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CountPill } from "../../electron-ui/ui/src/components/ui/count-pill.js";

afterEach(cleanup);

describe("CountPill", () => {
  it("renders numeric count with rounded pill styling", () => {
    render(<CountPill count={18} />);
    const pill = screen.getByText("18");
    expect(pill.className).toContain("rounded-[10px]");
    expect(pill.className).toContain("text-[11px]");
    expect(pill.className).toContain("font-semibold");
  });

  it("uses elevated background and body text color", () => {
    render(<CountPill count={92} />);
    const pill = screen.getByText("92");
    expect(pill.className).toContain("bg-[var(--color-bg-elevated)]");
    expect(pill.className).toContain("text-[var(--color-text-body)]");
  });
});
