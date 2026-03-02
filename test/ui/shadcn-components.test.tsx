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
});

describe("Badge", () => {
  it("renders with default variant class", () => {
    render(<Badge>Acme</Badge>);
    const badge = screen.getByText("Acme");
    expect(badge.className).toContain("bg-primary");
  });

  it("renders with secondary variant class", () => {
    render(<Badge variant="secondary">Tag</Badge>);
    const badge = screen.getByText("Tag");
    expect(badge.className).toContain("bg-secondary");
  });

  it("renders with outline variant class", () => {
    render(<Badge variant="outline">Outlined</Badge>);
    const badge = screen.getByText("Outlined");
    expect(badge.className).toContain("border");
  });
});
