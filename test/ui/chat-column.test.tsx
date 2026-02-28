// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { ChatColumn } from "../../ui/src/components/ChatColumn.js";

afterEach(cleanup);

const contextInfo = { meetingCount: 3, charCount: 12400 };

describe("ChatColumn", () => {
  it("renders context size indicator with correct counts", () => {
    render(<ChatColumn contextInfo={contextInfo} onChat={vi.fn()} />);
    expect(screen.getByText(/3 meetings/)).toBeDefined();
    expect(screen.getByText(/12,400 characters/)).toBeDefined();
  });

  it("calls onChat with trimmed question and clears input on submit", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "42", sources: [], charCount: 0 });
    render(<ChatColumn contextInfo={contextInfo} onChat={onChat} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "  What happened?  " } });
    fireEvent.click(screen.getByLabelText("Send"));
    expect(onChat).toHaveBeenCalledWith("What happened?");
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toBe(""));
  });

  it("renders Q/A pair after response", async () => {
    const onChat = vi.fn().mockResolvedValue({
      answer: "The decision was to ship.",
      sources: ["Alpha DSU"],
      charCount: 100,
    });
    render(<ChatColumn contextInfo={contextInfo} onChat={onChat} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "What was decided?" },
    });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => expect(screen.getByText("The decision was to ship.")).toBeDefined());
    expect(screen.getByText(/alpha dsu/i)).toBeDefined();
  });

  it("accumulates multiple Q/A pairs without clearing", async () => {
    const onChat = vi
      .fn()
      .mockResolvedValueOnce({ answer: "Answer one.", sources: [], charCount: 0 })
      .mockResolvedValueOnce({ answer: "Answer two.", sources: [], charCount: 0 });
    render(<ChatColumn contextInfo={contextInfo} onChat={onChat} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Q1" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("Answer one."));

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Q2" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("Answer two."));

    expect(screen.getByText("Answer one.")).toBeDefined();
    expect(screen.getByText("Answer two.")).toBeDefined();
  });

  it("submits question on Enter key (non-shifted)", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "Yes.", sources: [], charCount: 0 });
    render(<ChatColumn contextInfo={contextInfo} onChat={onChat} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Q via enter" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onChat).toHaveBeenCalledWith("Q via enter");
  });
});
