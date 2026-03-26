// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { CreateInsightDialog } from "../../electron-ui/ui/src/components/CreateInsightDialog.js";

afterEach(cleanup);

describe("CreateInsightDialog", () => {
  it("renders period type toggle buttons and date input", () => {
    render(
      <CreateInsightDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText("Create Insight")).toBeDefined();
    expect(screen.getByRole("button", { name: "Day" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Week" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Month" })).toBeDefined();
    expect(screen.getByLabelText("Reference Date")).toBeDefined();
  });

  it("defaults to week period type with today's date", () => {
    render(
      <CreateInsightDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const weekBtn = screen.getByRole("button", { name: "Week" }) as HTMLButtonElement;
    expect(weekBtn.className).toContain("bg-primary");
  });

  it("shows computed period bounds when date is set", () => {
    render(
      <CreateInsightDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const dateInput = screen.getByLabelText("Reference Date") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-01-07" } });
    expect(screen.getByTestId("period-preview").textContent).toContain("Jan 5");
    expect(screen.getByTestId("period-preview").textContent).toContain("Jan 11");
  });

  it("switching to Day shows single-day period", () => {
    render(
      <CreateInsightDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const dateInput = screen.getByLabelText("Reference Date") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-01-15" } });
    fireEvent.click(screen.getByRole("button", { name: "Day" }));
    expect(screen.getByTestId("period-preview").textContent).toContain("Jan 15");
  });

  it("calls onSubmit with period_type, period_start, period_end and empty name on Create click", () => {
    const onSubmit = vi.fn();
    render(
      <CreateInsightDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    const dateInput = screen.getByLabelText("Reference Date") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-01-07" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "",
      period_type: "week",
      period_start: "2026-01-05",
      period_end: "2026-01-11",
    });
  });

  it("renders name input and passes value to onSubmit", () => {
    const onSubmit = vi.fn();
    render(
      <CreateInsightDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    const nameInput = screen.getByLabelText("Name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Leadership Weekly" } });
    const dateInput = screen.getByLabelText("Reference Date") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-01-07" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Leadership Weekly",
      period_type: "week",
      period_start: "2026-01-05",
      period_end: "2026-01-11",
    });
  });

  it("Create button is disabled when no date is selected", () => {
    render(
      <CreateInsightDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const dateInput = screen.getByLabelText("Reference Date") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "" } });
    const createBtn = screen.getByRole("button", { name: "Create" }) as HTMLButtonElement;
    expect(createBtn.disabled).toBe(true);
  });

  it("switching to Month shows full month bounds", () => {
    render(
      <CreateInsightDialog
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const dateInput = screen.getByLabelText("Reference Date") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2026-01-15" } });
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    expect(screen.getByTestId("period-preview").textContent).toContain("Jan 1");
    expect(screen.getByTestId("period-preview").textContent).toContain("Jan 31");
  });
});
