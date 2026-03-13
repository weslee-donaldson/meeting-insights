// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { EditActionItemDialog } from "../../electron-ui/ui/src/components/EditActionItemDialog.js";

afterEach(cleanup);

function makeItem() {
  return {
    description: "Write docs",
    owner: "Bob",
    requester: "Alice",
    due_date: "2026-04-01",
    priority: "normal" as const,
  };
}

describe("EditActionItemDialog", () => {
  it("renders form fields populated with item data when open", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={makeItem()}
      />,
    );
    expect(screen.getByLabelText("Description")).toHaveProperty("value", "Write docs");
    expect(screen.getByLabelText("Owner")).toHaveProperty("value", "Bob");
    expect(screen.getByLabelText("Requester")).toHaveProperty("value", "Alice");
    expect(screen.getByLabelText("Due Date")).toHaveProperty("value", "2026-04-01");
    expect(screen.getByLabelText("Priority")).toHaveProperty("value", "normal");
  });

  it("calls onSave with updated fields when Save is clicked", () => {
    const onSave = vi.fn();
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={onSave}
        item={makeItem()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Updated docs" } });
    fireEvent.change(screen.getByLabelText("Priority"), { target: { value: "critical" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith({
      description: "Updated docs",
      owner: "Bob",
      requester: "Alice",
      due_date: "2026-04-01",
      priority: "critical",
    });
  });

  it("disables Save when description is empty", () => {
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={() => {}}
        item={makeItem()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "" } });
    expect(screen.getByText("Save").hasAttribute("disabled")).toBe(true);
  });

  it("clears due_date when input is emptied", () => {
    const onSave = vi.fn();
    render(
      <EditActionItemDialog
        open={true}
        onOpenChange={() => {}}
        onSave={onSave}
        item={makeItem()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Due Date"), { target: { value: "" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ due_date: null }),
    );
  });
});
