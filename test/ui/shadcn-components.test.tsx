// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../../electron-ui/ui/src/components/ui/button.js";
import { Badge } from "../../electron-ui/ui/src/components/ui/badge.js";

describe("Button", () => {
  it("renders with default variant class", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn.className).toContain("bg-primary");
  });

  it("renders with secondary variant class", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole("button", { name: "Secondary" });
    expect(btn.className).toContain("bg-secondary");
  });

  it("renders with ghost variant class", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button", { name: "Ghost" });
    expect(btn.className).toContain("hover:bg-accent");
  });

  it("renders with destructive variant class", () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole("button", { name: "Delete" });
    expect(btn.className).toContain("bg-destructive");
  });

  it("includes active press feedback class", () => {
    render(<Button>Press me</Button>);
    const btn = screen.getByRole("button", { name: "Press me" });
    expect(btn.className).toContain("active:scale-[0.97]");
  });
});

describe("Badge", () => {
  it("renders critical priority variant with danger background and white text", () => {
    render(<Badge variant="critical">CRITICAL</Badge>);
    const badge = screen.getByText("CRITICAL");
    expect(badge.className).toContain("bg-[var(--color-danger)]");
    expect(badge.className).toContain("text-white");
  });

  it("renders high priority variant with orange background", () => {
    render(<Badge variant="high">HIGH</Badge>);
    const badge = screen.getByText("HIGH");
    expect(badge.className).toContain("bg-[#EA580C]");
    expect(badge.className).toContain("text-white");
  });

  it("renders medium priority variant with accent background", () => {
    render(<Badge variant="medium">MEDIUM</Badge>);
    const badge = screen.getByText("MEDIUM");
    expect(badge.className).toContain("bg-[var(--color-accent)]");
    expect(badge.className).toContain("text-white");
  });

  it("renders low priority variant with elevated background and secondary text", () => {
    render(<Badge variant="low">LOW</Badge>);
    const badge = screen.getByText("LOW");
    expect(badge.className).toContain("bg-[var(--color-bg-elevated)]");
    expect(badge.className).toContain("text-[var(--color-text-secondary)]");
  });

  it("renders open status variant with green background", () => {
    render(<Badge variant="open">open</Badge>);
    const badge = screen.getByText("open");
    expect(badge.className).toContain("bg-[#DCFCE7]");
    expect(badge.className).toContain("text-[#15803D]");
  });

  it("renders draft status variant with tint background and accent text", () => {
    render(<Badge variant="draft">draft</Badge>);
    const badge = screen.getByText("draft");
    expect(badge.className).toContain("bg-[var(--color-tint)]");
    expect(badge.className).toContain("text-[var(--color-accent)]");
  });

  it("renders client variant with tint background and accent text", () => {
    render(<Badge variant="client">LLSA</Badge>);
    const badge = screen.getByText("LLSA");
    expect(badge.className).toContain("bg-[var(--color-tint)]");
    expect(badge.className).toContain("text-[var(--color-accent)]");
  });

  it("renders outline variant with border", () => {
    render(<Badge variant="outline">Outlined</Badge>);
    const badge = screen.getByText("Outlined");
    expect(badge.className).toContain("border");
  });

  it("renders with default size using 10px text and rounded corners", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.className).toContain("text-[10px]");
    expect(badge.className).toContain("rounded");
  });

  it("applies font-bold and tracking-wide to all variants", () => {
    render(<Badge variant="critical">URGENT</Badge>);
    const badge = screen.getByText("URGENT");
    expect(badge.className).toContain("font-bold");
    expect(badge.className).toContain("tracking-wide");
  });
});
