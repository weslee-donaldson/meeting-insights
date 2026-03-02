// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatPanel } from "../../electron-ui/ui/src/components/ChatPanel.js";

afterEach(cleanup);

describe("ChatPanel", () => {
  it("renders context bar with meeting count and char count", () => {
    render(
      <ChatPanel
        activeMeetingIds={["m1", "m2"]}
        charCount={5000}
        onChat={vi.fn()}
      />,
    );
    expect(screen.getByText((_, el) => el?.textContent === "2 meetings")).toBeDefined();
    expect(screen.getByText((_, el) => el?.textContent === "5,000 chars")).toBeDefined();
  });

  it("submit calls onChat with the typed question", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 });
    render(
      <ChatPanel
        activeMeetingIds={["m1"]}
        charCount={100}
        onChat={onChat}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "What was decided?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    expect(onChat).toHaveBeenCalledWith("What was decided?");
  });

  it("renders markdown heading and list items from the response", async () => {
    const onChat = vi.fn().mockResolvedValue({
      answer: "## Summary\n- point one\n\n**bold text**",
      sources: [],
      charCount: 0,
    });
    render(
      <ChatPanel
        activeMeetingIds={["m1"]}
        charCount={100}
        onChat={onChat}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tell me" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByRole("heading", { level: 2, name: "Summary" }), { timeout: 2000 });
    expect(screen.getByText("point one")).toBeDefined();
    expect(screen.getByText("bold text")).toBeDefined();
  });

  it("copy button calls navigator.clipboard.writeText with the answer", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    const onChat = vi.fn().mockResolvedValue({ answer: "The answer.", sources: [], charCount: 0 });
    render(
      <ChatPanel
        activeMeetingIds={["m1"]}
        charCount={100}
        onChat={onChat}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("The answer."), { timeout: 2000 });
    fireEvent.click(screen.getByRole("button", { name: /copy to clipboard/i }));
    expect(writeText).toHaveBeenCalledWith("The answer.");
  });

  it("history clears when activeMeetingIds changes", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "Old answer.", sources: [], charCount: 0 });
    const { rerender } = render(
      <ChatPanel
        activeMeetingIds={["m1"]}
        charCount={100}
        onChat={onChat}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("Old answer."), { timeout: 2000 });
    rerender(
      <ChatPanel
        activeMeetingIds={["m2"]}
        charCount={100}
        onChat={onChat}
      />,
    );
    expect(screen.queryByText("Old answer.")).toBeNull();
  });
});
