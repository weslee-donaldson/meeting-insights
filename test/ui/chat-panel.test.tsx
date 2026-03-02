// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent, waitFor, createEvent } from "@testing-library/react";
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

  it("Copy as Markdown button copies the raw markdown answer", async () => {
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
    fireEvent.click(screen.getByRole("button", { name: "Copy as Markdown" }));
    expect(writeText).toHaveBeenCalledWith("The answer.");
  });

  it("Copy for Jira button converts heading, list, bold, and code to Jira wiki markup", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    const rawMarkdown = "## Heading\n- item one\n\n**bold text**\n\n```js\nconsole.log(1)\n```";
    const onChat = vi.fn().mockResolvedValue({ answer: rawMarkdown, sources: [], charCount: 0 });
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByRole("heading", { level: 2, name: "Heading" }), { timeout: 2000 });
    fireEvent.click(screen.getByRole("button", { name: "Copy for Jira" }));
    expect(writeText).toHaveBeenCalledWith(
      "h2. Heading\n* item one\n\n*bold text*\n\n{code:js}\nconsole.log(1)\n{code}",
    );
  });

  it("pasting an image file adds it to the attachment list", () => {
    vi.stubGlobal("URL", { createObjectURL: vi.fn().mockReturnValue("blob:mock"), revokeObjectURL: vi.fn() });
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={vi.fn()} />,
    );
    const textarea = screen.getByRole("textbox");
    const file = new File([""], "screenshot.png", { type: "image/png" });
    const pasteEvent = createEvent.paste(textarea);
    Object.defineProperty(pasteEvent, "clipboardData", { value: { files: [file] } });
    fireEvent(textarea, pasteEvent);
    expect(screen.getByText("screenshot.png")).toBeDefined();
  });

  it("clicking remove on an attachment clears it from the list", () => {
    vi.stubGlobal("URL", { createObjectURL: vi.fn().mockReturnValue("blob:mock"), revokeObjectURL: vi.fn() });
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={vi.fn()} />,
    );
    const textarea = screen.getByRole("textbox");
    const file = new File([""], "screenshot.png", { type: "image/png" });
    const pasteEvent = createEvent.paste(textarea);
    Object.defineProperty(pasteEvent, "clipboardData", { value: { files: [file] } });
    fireEvent(textarea, pasteEvent);
    fireEvent.click(screen.getByRole("button", { name: "Remove screenshot.png" }));
    expect(screen.queryByText("screenshot.png")).toBeNull();
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
