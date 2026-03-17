// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SectionHeader } from "../../electron-ui/ui/src/components/shared/section-header.js";

afterEach(cleanup);

describe("SectionHeader", () => {
  it("renders collapsed by default with muted label and right-rotated chevron", () => {
    render(<SectionHeader label="Decisions" count="2 items" />);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    const label = screen.getByText("Decisions");
    expect(label.className).toContain("text-[var(--color-text-muted)]");
    expect(label.className).toContain("uppercase");
    expect(label.style.fontWeight).toBe("600");
  });

  it("renders expanded state with primary label color", () => {
    render(
      <SectionHeader label="Action Items" defaultExpanded>
        <div>content</div>
      </SectionHeader>,
    );
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    const label = screen.getByText("Action Items");
    expect(label.className).toContain("text-[var(--color-text-primary)]");
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("toggles between expanded and collapsed on click", () => {
    render(
      <SectionHeader label="Summary" count="5 items">
        <div>body</div>
      </SectionHeader>,
    );
    expect(screen.queryByText("body")).toBeNull();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("body")).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("body")).toBeNull();
  });

  it("renders count text in secondary color", () => {
    render(<SectionHeader label="Risks" count="3 items" />);
    const count = screen.getByText("3 items");
    expect(count.className).toContain("text-[var(--color-text-secondary)]");
    expect(count.className).toContain("text-[11px]");
  });

  it("renders progress bar when expanded and progress prop provided", () => {
    const { container } = render(
      <SectionHeader label="Items" progress={{ current: 2, total: 15 }} defaultExpanded>
        <div>content</div>
      </SectionHeader>,
    );
    const progressBar = container.querySelector(".bg-\\[var\\(--color-accent\\)\\]");
    expect(progressBar).not.toBeNull();
  });

  it("renders rule line separator", () => {
    const { container } = render(<SectionHeader label="Test" />);
    const rule = container.querySelector(".h-px.bg-\\[var\\(--color-line\\)\\]");
    expect(rule).not.toBeNull();
  });

  it("uses Space Grotesk font family for the label", () => {
    render(<SectionHeader label="Summary" />);
    const label = screen.getByText("Summary");
    expect(label.style.fontFamily).toContain("Space Grotesk");
  });
});
