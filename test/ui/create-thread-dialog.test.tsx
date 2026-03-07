// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { CreateThreadDialog } from "../../electron-ui/ui/src/components/CreateThreadDialog.js";

afterEach(cleanup);

describe("CreateThreadDialog", () => {
  it("renders form fields: Title, Shorthand, Description, Criteria Prompt", () => {
    render(<CreateThreadDialog open onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Title")).toBeDefined();
    expect(screen.getByLabelText("Shorthand")).toBeDefined();
    expect(screen.getByLabelText("Description")).toBeDefined();
    expect(screen.getByLabelText("Criteria Prompt")).toBeDefined();
  });

  it("Create button is disabled until title and shorthand are filled", () => {
    render(<CreateThreadDialog open onClose={vi.fn()} onSubmit={vi.fn()} />);
    const createBtn = screen.getByRole("button", { name: /create/i });
    expect(createBtn.hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Thread" } });
    expect(createBtn.hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByLabelText("Shorthand"), { target: { value: "MT" } });
    expect(createBtn.hasAttribute("disabled")).toBe(false);
  });

  it("shorthand is capped at 10 characters", () => {
    render(<CreateThreadDialog open onClose={vi.fn()} onSubmit={vi.fn()} />);
    const input = screen.getByLabelText("Shorthand") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "LONGSHORTHAND" } });
    expect(input.value.length).toBeLessThanOrEqual(10);
  });

  it("submit returns form data and calls onSubmit", () => {
    const onSubmit = vi.fn();
    render(<CreateThreadDialog open onClose={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Deploy" } });
    fireEvent.change(screen.getByLabelText("Shorthand"), { target: { value: "DEP" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Desc" } });
    fireEvent.change(screen.getByLabelText("Criteria Prompt"), { target: { value: "CI failures" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Deploy",
      shorthand: "DEP",
      description: "Desc",
      criteria_prompt: "CI failures",
    });
  });

  it("cancel button calls onClose", () => {
    const onClose = vi.fn();
    render(<CreateThreadDialog open onClose={onClose} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("edit mode pre-fills form fields and shows Save button", () => {
    render(
      <CreateThreadDialog
        open
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        thread={{ title: "Old", shorthand: "OLD", description: "D", criteria_prompt: "CP" }}
      />,
    );
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("Old");
    expect((screen.getByLabelText("Shorthand") as HTMLInputElement).value).toBe("OLD");
    expect(screen.getByRole("button", { name: /save/i })).toBeDefined();
  });
});
