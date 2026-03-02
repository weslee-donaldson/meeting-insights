// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../../electron-ui/ui/src/components/Sidebar.js";

afterEach(cleanup);

describe("Sidebar", () => {
  it("renders all client names from the clients prop", () => {
    render(
      <Sidebar
        clients={["Acme", "Beta Co"]}
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("Acme")).toBeDefined();
    expect(screen.getByText("Beta Co")).toBeDefined();
  });

  it("clicking a client calls onSelect with that client name", () => {
    const onSelect = vi.fn();
    render(
      <Sidebar
        clients={["Acme", "Beta Co"]}
        selected={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /beta co/i }));
    expect(onSelect).toHaveBeenCalledWith("Beta Co");
  });

  it("selected client button has aria-selected=true", () => {
    render(
      <Sidebar
        clients={["Acme", "Beta Co"]}
        selected="Acme"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /acme/i }).getAttribute("aria-selected")).toBe("true");
  });

  it("non-selected clients have aria-selected=false", () => {
    render(
      <Sidebar
        clients={["Acme", "Beta Co"]}
        selected="Acme"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /beta co/i }).getAttribute("aria-selected")).toBe("false");
  });

  it("clicking an already-selected client calls onSelect with null to deselect", () => {
    const onSelect = vi.fn();
    render(
      <Sidebar
        clients={["Acme", "Beta Co"]}
        selected="Acme"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /acme/i }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
