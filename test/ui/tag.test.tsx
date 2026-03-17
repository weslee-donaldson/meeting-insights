// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tag } from "../../electron-ui/ui/src/components/ui/tag.js";

describe("Tag", () => {
  it("renders thread tag with elevated background and secondary text", () => {
    render(<Tag>observability</Tag>);
    const tag = screen.getByText("observability");
    expect(tag.className).toContain("bg-[var(--color-bg-elevated)]");
    expect(tag.className).toContain("text-[var(--color-text-secondary)]");
    expect(tag.className).toContain("text-[10px]");
    expect(tag.className).toContain("rounded-[3px]");
  });

  it("renders milestone tag with accent left border", () => {
    render(<Tag milestone>Recurly go-live</Tag>);
    const tag = screen.getByText("Recurly go-live");
    expect(tag.className).toContain("border-l-2");
    expect(tag.className).toContain("border-l-[var(--color-accent)]");
  });

  it("does not render accent border for non-milestone tags", () => {
    render(<Tag>build-err</Tag>);
    const tag = screen.getByText("build-err");
    expect(tag.className).not.toContain("border-l-2");
  });
});
