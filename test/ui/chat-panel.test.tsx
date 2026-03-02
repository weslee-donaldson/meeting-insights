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

  it("renders user bubble right-aligned and assistant bubble with markdown", async () => {
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
    await waitFor(() => screen.getByTestId("user-bubble"), { timeout: 2000 });
    const userBubble = screen.getByTestId("user-bubble");
    expect(userBubble.textContent).toBe("Tell me");
    expect(userBubble.className).toContain("self-end");
    await waitFor(() => screen.getByTestId("assistant-bubble"), { timeout: 2000 });
    const assistantBubble = screen.getByTestId("assistant-bubble");
    expect(assistantBubble.className).toContain("self-start");
    expect(screen.getByRole("heading", { level: 2, name: "Summary" })).toBeDefined();
    expect(screen.getByText("point one")).toBeDefined();
    expect(screen.getByText("bold text")).toBeDefined();
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

  it("displays sources beneath each assistant bubble", async () => {
    const onChat = vi.fn().mockResolvedValue({
      answer: "Some answer [M1]",
      sources: ["Meeting Alpha", "Meeting Beta"],
      charCount: 0,
    });
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText((_, el) => el?.textContent === "— Meeting Alpha"), { timeout: 2000 });
    expect(screen.getByText((_, el) => el?.textContent === "— Meeting Beta")).toBeDefined();
  });

  it("Copy as Markdown button copies the raw markdown answer", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText, write: vi.fn().mockResolvedValue(undefined) },
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
      value: { writeText, write: vi.fn().mockResolvedValue(undefined) },
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

  it("Copy as Rich Text writes HTML and plain text to clipboard", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn(), write },
      configurable: true,
      writable: true,
    });
    vi.stubGlobal("Blob", class MockBlob {
      content: string[];
      type: string;
      constructor(parts: string[], options: { type: string }) {
        this.content = parts;
        this.type = options.type;
      }
    });
    vi.stubGlobal("ClipboardItem", class MockClipboardItem {
      data: Record<string, unknown>;
      constructor(data: Record<string, unknown>) { this.data = data; }
    });
    const onChat = vi.fn().mockResolvedValue({ answer: "**bold** text", sources: [], charCount: 0 });
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("bold"), { timeout: 2000 });
    fireEvent.click(screen.getByRole("button", { name: "Copy as Rich Text" }));
    expect(write).toHaveBeenCalledTimes(1);
    const clipboardItem = write.mock.calls[0][0][0];
    expect(clipboardItem.data).toHaveProperty("text/html");
    expect(clipboardItem.data).toHaveProperty("text/plain");
  });

  it("shows thinking indicator while awaiting response", async () => {
    let resolveChat: (value: { answer: string; sources: string[]; charCount: number }) => void;
    const onChat = vi.fn().mockImplementation(() => new Promise((r) => { resolveChat = r; }));
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByTestId("thinking-indicator"), { timeout: 2000 });
    resolveChat!({ answer: "done", sources: [], charCount: 0 });
    await waitFor(() => expect(screen.queryByTestId("thinking-indicator")).toBeNull(), { timeout: 2000 });
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
