// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, cleanup, screen, fireEvent, waitFor, createEvent } from "@testing-library/react";
import { ChatPanel } from "../../electron-ui/ui/src/components/ChatPanel.js";
import type { ThreadMessage } from "../../core/threads.js";

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

  it("submit calls onChat with full message history array", async () => {
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
    expect(onChat).toHaveBeenCalledWith([{ role: "user", content: "What was decided?" }], undefined, false, "");
  });

  it("sends full message history including prior exchanges on second question", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "First answer.", sources: [], charCount: 0 });
    render(
      <ChatPanel
        activeMeetingIds={["m1"]}
        charCount={100}
        onChat={onChat}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Q1" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("First answer."), { timeout: 2000 });
    onChat.mockResolvedValue({ answer: "Second answer.", sources: [], charCount: 0 });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Q2" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("Second answer."), { timeout: 2000 });
    expect(onChat).toHaveBeenLastCalledWith([
      { role: "user", content: "Q1" },
      { role: "assistant", content: "First answer." },
      { role: "user", content: "Q2" },
    ], undefined, false, "");
  });

  it("include full transcripts checkbox renders unchecked by default", () => {
    render(<ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={vi.fn()} />);
    const checkbox = screen.getByRole("checkbox", { name: "Include full transcripts" });
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    expect(screen.getByText("Include full transcripts")).toBeDefined();
  });

  it("when include full transcripts is checked, onChat is called with includeTranscripts: true", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 });
    render(<ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Include full transcripts" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    expect(onChat).toHaveBeenCalledWith([{ role: "user", content: "q?" }], undefined, true, "");
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

  it("pasting HTML content converts to markdown in the textarea", () => {
    render(<ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={vi.fn()} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    const pasteEvent = createEvent.paste(textarea);
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: {
        files: [],
        types: ["text/html", "text/plain"],
        getData: (type: string) =>
          type === "text/html"
            ? "<h2>Title</h2><ul><li>Item one</li><li>Item two</li></ul>"
            : "Title\nItem one\nItem two",
      },
    });
    fireEvent(textarea, pasteEvent);
    expect(textarea.value).toContain("## Title");
    expect(textarea.value).toContain("Item one");
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

  it("renders template dropdown with Default option and template names when templates prop provided", () => {
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={vi.fn()} templates={["jira-epic", "jira-ticket"]} />,
    );
    const select = screen.getByRole("combobox", { name: "Output template" });
    expect(select).toBeDefined();
    expect(screen.getByRole("option", { name: "Default" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Jira Epic" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Jira Ticket" })).toBeDefined();
  });

  it("selecting a template passes it as 4th arg to onChat", () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 });
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} templates={["jira-ticket"]} />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Output template" }), { target: { value: "jira-ticket" } });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Make a ticket" } });
    fireEvent.click(screen.getByLabelText("Send"));
    expect(onChat).toHaveBeenCalledWith([{ role: "user", content: "Make a ticket" }], undefined, false, "jira-ticket");
  });

  it("template selection resets to Default when activeMeetingIds changes", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 });
    const { rerender } = render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} templates={["jira-ticket"]} />,
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Output template" }), { target: { value: "jira-ticket" } });
    expect((screen.getByRole("combobox", { name: "Output template" }) as HTMLSelectElement).value).toBe("jira-ticket");
    rerender(
      <ChatPanel activeMeetingIds={["m2"]} charCount={100} onChat={onChat} templates={["jira-ticket"]} />,
    );
    expect((screen.getByRole("combobox", { name: "Output template" }) as HTMLSelectElement).value).toBe("");
  });

  it("passes updated template to onChat after template change", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "Ticket answer.", sources: [], charCount: 0 });
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} templates={["jira-ticket", "jira-epic"]} />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q1" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("Ticket answer."), { timeout: 2000 });
    expect(onChat.mock.calls[0][3]).toBe("");
    fireEvent.change(screen.getByRole("combobox", { name: "Output template" }), { target: { value: "jira-epic" } });
    onChat.mockResolvedValueOnce({ answer: "Epic answer.", sources: [], charCount: 0 });
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q2" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("Epic answer."), { timeout: 2000 });
    expect(onChat.mock.calls[1][3]).toBe("jira-epic");
    expect(screen.getByText("Ticket answer.")).toBeTruthy();
  });

  it("user bubble has break-words class for word wrapping", async () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 });
    render(<ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "test" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByTestId("user-bubble"), { timeout: 2000 });
    expect(screen.getByTestId("user-bubble").className).toContain("break-words");
  });

  it("send and attach buttons are vertically centered to input", () => {
    const onChat = vi.fn().mockResolvedValue({ answer: "ok", sources: [], charCount: 0 });
    render(<ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} />);
    const sendButton = screen.getByLabelText("Send");
    const buttonColumn = sendButton.closest("div.flex.flex-col")!;
    expect(buttonColumn.className).toContain("self-center");
    expect(buttonColumn.className).not.toContain("self-end");
  });

  it("shows error message as assistant bubble when onChat rejects", async () => {
    const onChat = vi.fn().mockRejectedValue(new Error("[api_error] credit balance too low"));
    render(
      <ChatPanel activeMeetingIds={["m1"]} charCount={100} onChat={onChat} />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "q?" } });
    fireEvent.click(screen.getByLabelText("Send"));
    await waitFor(() => screen.getByText("Error: credit balance too low"), { timeout: 2000 });
    const bubble = screen.getByTestId("assistant-bubble");
    expect(bubble.textContent).toContain("Error: credit balance too low");
  });

  it("renders persistedMessages instead of local state when provided", () => {
    const persisted: ThreadMessage[] = [
      { id: "msg1", thread_id: "t1", role: "user", content: "Hello thread", sources: null, context_stale: false, stale_details: null, created_at: "2026-03-01T10:00:00.000Z" },
      { id: "msg2", thread_id: "t1", role: "assistant", content: "Thread response", sources: null, context_stale: false, stale_details: null, created_at: "2026-03-01T10:01:00.000Z" },
    ];
    render(
      <ChatPanel
        activeMeetingIds={[]}
        charCount={0}
        onChat={vi.fn()}
        persistedMessages={persisted}
        onSendMessage={vi.fn()}
      />,
    );
    expect(screen.getByText("Hello thread")).toBeDefined();
    expect(screen.getByText("Thread response")).toBeDefined();
  });

  it("onSendMessage fires in persisted mode instead of onChat", () => {
    const onSend = vi.fn();
    const onChat = vi.fn();
    render(
      <ChatPanel
        activeMeetingIds={[]}
        charCount={0}
        onChat={onChat}
        persistedMessages={[]}
        onSendMessage={onSend}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Thread question" } });
    fireEvent.click(screen.getByLabelText("Send"));
    expect(onSend).toHaveBeenCalledWith("Thread question", false);
    expect(onChat).not.toHaveBeenCalled();
  });

  it("clear button fires onClearMessages in persisted mode", () => {
    const onClear = vi.fn();
    const persisted: ThreadMessage[] = [
      { id: "msg1", thread_id: "t1", role: "user", content: "Hello", sources: null, context_stale: false, stale_details: null, created_at: "2026-03-01T10:00:00.000Z" },
    ];
    render(
      <ChatPanel
        activeMeetingIds={[]}
        charCount={0}
        onChat={vi.fn()}
        persistedMessages={persisted}
        onSendMessage={vi.fn()}
        onClearMessages={onClear}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /clear conversation/i }));
    expect(onClear).toHaveBeenCalled();
  });

  it("shows stale context banner when any persisted message has context_stale", () => {
    const persisted: ThreadMessage[] = [
      { id: "msg1", thread_id: "t1", role: "assistant", content: "Old answer", sources: null, context_stale: true, stale_details: JSON.stringify([{ id: "m1", title: "Deleted Meeting" }]), created_at: "2026-03-01T10:00:00.000Z" },
    ];
    render(
      <ChatPanel
        activeMeetingIds={[]}
        charCount={0}
        onChat={vi.fn()}
        persistedMessages={persisted}
        onSendMessage={vi.fn()}
      />,
    );
    expect(screen.getByText(/source meetings have changed/i)).toBeDefined();
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
