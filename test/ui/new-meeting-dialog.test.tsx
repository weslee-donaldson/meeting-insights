// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NewMeetingDialog } from "../../electron-ui/ui/src/components/NewMeetingDialog.js";

afterEach(cleanup);

const CLIENTS = ["Acme", "Beta"];

describe("NewMeetingDialog", () => {
  it("renders client dropdown, date input, title input, transcript textarea, Cancel and Import buttons", () => {
    render(<NewMeetingDialog open={true} onOpenChange={vi.fn()} clients={CLIENTS} onSubmit={vi.fn()} />);
    expect(screen.getByText("Client")).toBeDefined();
    expect(screen.getByText("Date")).toBeDefined();
    expect(screen.getByText("Meeting title")).toBeDefined();
    expect(screen.getByText("Transcript")).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Import" })).toBeDefined();
  });

  it("Import button is disabled when title is empty", () => {
    render(<NewMeetingDialog open={true} onOpenChange={vi.fn()} clients={CLIENTS} onSubmit={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Import" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("Import button is enabled when title and transcript are filled", () => {
    render(<NewMeetingDialog open={true} onOpenChange={vi.fn()} clients={CLIENTS} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Weekly Sync"), { target: { value: "Test Meeting" } });
    fireEvent.change(screen.getByPlaceholderText("Paste transcript here..."), { target: { value: "Some transcript" } });
    expect((screen.getByRole("button", { name: "Import" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("clicking Import calls onSubmit with form values and calls onOpenChange(false)", () => {
    const onSubmit = vi.fn();
    const onOpenChange = vi.fn();
    render(<NewMeetingDialog open={true} onOpenChange={onOpenChange} clients={CLIENTS} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Weekly Sync"), { target: { value: "My Meeting" } });
    fireEvent.change(screen.getByPlaceholderText("Paste transcript here..."), { target: { value: "Hello world" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(onSubmit).toHaveBeenCalledWith({
      clientName: "Acme",
      date: expect.any(String),
      title: "My Meeting",
      rawTranscript: "Hello world",
      format: "webvtt",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders format selector with WebVTT selected by default", () => {
    render(<NewMeetingDialog open={true} onOpenChange={vi.fn()} clients={CLIENTS} onSubmit={vi.fn()} />);
    expect(screen.getByText("Transcript format")).toBeDefined();
    expect(screen.getByRole("button", { name: "WebVTT" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Krisp" })).toBeDefined();
  });

  it("switching format to Krisp passes krisp in onSubmit payload", () => {
    const onSubmit = vi.fn();
    render(<NewMeetingDialog open={true} onOpenChange={vi.fn()} clients={CLIENTS} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Krisp" }));
    fireEvent.change(screen.getByPlaceholderText("e.g. Weekly Sync"), { target: { value: "Test" } });
    fireEvent.change(screen.getByPlaceholderText("Paste transcript here..."), { target: { value: "text" } });
    fireEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ format: "krisp" }));
  });
});
