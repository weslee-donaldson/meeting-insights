// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { ClientsColumn } from "../../ui/src/components/ClientsColumn.js";

afterEach(cleanup);


describe("ClientsColumn", () => {
  it("renders all client names", () => {
    render(
      <ClientsColumn
        clients={["Acme", "Beta Co"]}
        selected={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("Acme")).toBeDefined();
    expect(screen.getByText("Beta Co")).toBeDefined();
  });

  it("marks selected client with aria-selected=true", () => {
    render(
      <ClientsColumn
        clients={["Acme", "Beta Co"]}
        selected="Acme"
        onSelect={vi.fn()}
      />,
    );
    const btn = screen.getByRole("button", { name: /acme/i });
    expect(btn.getAttribute("aria-selected")).toBe("true");
  });

  it("calls onSelect with client name when clicked", () => {
    const onSelect = vi.fn();
    render(
      <ClientsColumn
        clients={["Acme", "Beta Co"]}
        selected={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /beta co/i }));
    expect(onSelect).toHaveBeenCalledWith("Beta Co");
  });
});
