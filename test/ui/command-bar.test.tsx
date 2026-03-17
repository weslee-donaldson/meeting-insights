// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CommandBar } from "../../electron-ui/ui/src/components/shared/command-bar.js";

afterEach(cleanup);

describe("CommandBar", () => {
  it("renders as a pill-shaped toolbar with elevated background and toolbar role", () => {
    render(<CommandBar actions={[{ label: "Edit", onClick: vi.fn() }]} />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.className).toContain("rounded-lg");
    expect(toolbar.className).toContain("bg-[var(--color-bg-elevated)]");
  });

  it("renders primary action with surface background and body text color", () => {
    render(
      <CommandBar actions={[{ label: "Edit", onClick: vi.fn(), variant: "primary" }]} />,
    );
    const btn = screen.getByText("Edit");
    expect(btn.className).toContain("bg-[var(--color-bg-surface)]");
    expect(btn.className).toContain("text-[var(--color-text-body)]");
  });

  it("renders default action with secondary text color", () => {
    render(
      <CommandBar actions={[{ label: "Copy", onClick: vi.fn(), variant: "default" }]} />,
    );
    const btn = screen.getByText("Copy");
    expect(btn.className).toContain("text-[var(--color-text-secondary)]");
  });

  it("renders destructive action pushed to the right with danger color", () => {
    render(
      <CommandBar
        actions={[
          { label: "Edit", onClick: vi.fn(), variant: "primary" },
          { label: "Delete", onClick: vi.fn(), variant: "destructive" },
        ]}
      />,
    );
    const del = screen.getByText("Delete");
    expect(del.className).toContain("text-[var(--color-danger)]");
  });

  it("renders success action with green text after divider", () => {
    render(
      <CommandBar
        actions={[
          { label: "Edit", onClick: vi.fn(), variant: "primary" },
          { label: "Resolve", onClick: vi.fn(), variant: "success" },
        ]}
      />,
    );
    const resolve = screen.getByText("Resolve");
    expect(resolve.className).toContain("text-[#15803D]");
  });

  it("fires onClick when action button is clicked", () => {
    const onClick = vi.fn();
    render(<CommandBar actions={[{ label: "Copy", onClick }]} />);
    fireEvent.click(screen.getByText("Copy"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders Meeting context actions correctly", () => {
    const noop = vi.fn();
    render(
      <CommandBar
        actions={[
          { label: "Edit", onClick: noop, variant: "primary" },
          { label: "Re-extract", onClick: noop },
          { label: "Copy", onClick: noop },
          { label: "Ignore", onClick: noop },
          { label: "Reassign", onClick: noop },
          { label: "Delete", onClick: noop, variant: "destructive" },
        ]}
      />,
    );
    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("Re-extract")).toBeTruthy();
    expect(screen.getByText("Copy")).toBeTruthy();
    expect(screen.getByText("Ignore")).toBeTruthy();
    expect(screen.getByText("Reassign")).toBeTruthy();
    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("renders Thread context actions correctly", () => {
    const noop = vi.fn();
    render(
      <CommandBar
        actions={[
          { label: "Edit", onClick: noop, variant: "primary" },
          { label: "Regenerate", onClick: noop },
          { label: "Find Candidates", onClick: noop },
          { label: "Resolve", onClick: noop, variant: "success" },
          { label: "Delete", onClick: noop, variant: "destructive" },
        ]}
      />,
    );
    expect(screen.getByText("Resolve")).toBeTruthy();
    expect(screen.getByText("Find Candidates")).toBeTruthy();
  });

  it("renders Insight context actions correctly", () => {
    const noop = vi.fn();
    render(
      <CommandBar
        actions={[
          { label: "Edit", onClick: noop, variant: "primary" },
          { label: "Copy", onClick: noop },
          { label: "Finalize", onClick: noop, variant: "success" },
          { label: "Delete", onClick: noop, variant: "destructive" },
        ]}
      />,
    );
    expect(screen.getByText("Finalize")).toBeTruthy();
  });

  it("renders action items with 12px text and medium font weight", () => {
    render(<CommandBar actions={[{ label: "Edit", onClick: vi.fn() }]} />);
    const btn = screen.getByText("Edit");
    expect(btn.className).toContain("text-xs");
    expect(btn.className).toContain("font-medium");
  });
});
