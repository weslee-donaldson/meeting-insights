// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent } from "@testing-library/react";
import { CreateMilestoneDialog } from "../../electron-ui/ui/src/components/CreateMilestoneDialog.js";

afterEach(cleanup);

describe("CreateMilestoneDialog", () => {
  it("renders form fields: Title, Description, Target Date", () => {
    render(<CreateMilestoneDialog open onOpenChange={vi.fn()} onSubmit={vi.fn()} clientName="Acme" />);
    expect(screen.getByLabelText("Title")).toBeDefined();
    expect(screen.getByLabelText("Description")).toBeDefined();
    expect(screen.getByLabelText("Target Date")).toBeDefined();
  });

  it("Create button is disabled until title is filled", () => {
    render(<CreateMilestoneDialog open onOpenChange={vi.fn()} onSubmit={vi.fn()} clientName="Acme" />);
    const createBtn = screen.getByRole("button", { name: /create/i });
    expect(createBtn.hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Launch v2" } });
    expect(createBtn.hasAttribute("disabled")).toBe(false);
  });

  it("submitting returns form data and calls onSubmit", () => {
    const onSubmit = vi.fn();
    render(<CreateMilestoneDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} clientName="Acme" />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Launch v2" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Go-live milestone" } });
    fireEvent.change(screen.getByLabelText("Target Date"), { target: { value: "2026-06-01" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(onSubmit).toHaveBeenCalledWith({
      clientName: "Acme",
      title: "Launch v2",
      description: "Go-live milestone",
      targetDate: "2026-06-01",
    });
  });

  it("cancel button calls onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(<CreateMilestoneDialog open onOpenChange={onOpenChange} onSubmit={vi.fn()} clientName="Acme" />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("clears form fields after submit", () => {
    const onSubmit = vi.fn();
    const { rerender } = render(<CreateMilestoneDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} clientName="Acme" />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Launch v2" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Desc" } });
    fireEvent.change(screen.getByLabelText("Target Date"), { target: { value: "2026-06-01" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    rerender(<CreateMilestoneDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} clientName="Acme" />);
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Description") as HTMLTextAreaElement).value).toBe("");
    expect((screen.getByLabelText("Target Date") as HTMLInputElement).value).toBe("");
  });
});
