import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TurndownService from "turndown";
import { Send, Clipboard, Paperclip, X, FileText, Code, Trash2, Bookmark } from "lucide-react";
import { Button } from "./ui/button.js";
import type { ConversationMessage, ConversationChatResponse } from "../../../electron/channels.js";
interface PersistedMessage {
  role: "user" | "assistant";
  content: string;
  sources: string | null;
  context_stale: boolean;
}

function markdownToJira(md: string): string {
  return md
    .replace(/```(\w+)\n([\s\S]*?)```/g, (_: string, lang: string, code: string) => `{code:${lang}}\n${code}{code}`)
    .replace(/```\n([\s\S]*?)```/g, (_: string, code: string) => `{code}\n${code}{code}`)
    .replace(/^### (.+)$/gm, "h3. $1")
    .replace(/^## (.+)$/gm, "h2. $1")
    .replace(/^# (.+)$/gm, "h1. $1")
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/^- (.+)$/gm, "* $1");
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/```(\w+)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/```\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/\n/g, "<br>");
}

interface SourceRef {
  id: string;
  label: string;
}

type SourceItem = string | SourceRef;

interface InternalMessage {
  role: "user" | "assistant";
  content: string;
  sources?: SourceItem[];
}

interface AttachmentItem {
  name: string;
  url: string;
}

interface ChatPanelProps {
  activeMeetingIds: string[];
  charCount: number;
  onChat: (messages: ConversationMessage[], attachments?: { name: string; base64: string; mimeType: string }[], includeTranscripts?: boolean, template?: string) => Promise<ConversationChatResponse>;
  templates?: string[];
  persistedMessages?: PersistedMessage[];
  onSendMessage?: (message: string, includeTranscripts: boolean) => void;
  onClearMessages?: () => void;
  onSaveAsThread?: (content: string) => void;
  onSourceClick?: (meetingId: string) => void;
}

function toDisplayName(stem: string): string {
  return stem.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ChatPanel({ activeMeetingIds, charCount, onChat, templates, persistedMessages, onSendMessage, onClearMessages, onSaveAsThread, onSourceClick }: ChatPanelProps) {
  const isPersisted = persistedMessages !== undefined;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [includeTranscripts, setIncludeTranscripts] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [expandedBubbles, setExpandedBubbles] = useState<Set<number>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const meetingKey = useMemo(() => activeMeetingIds.join(","), [activeMeetingIds]);

  useEffect(() => {
    setMessages([]);
    setAttachments([]);
    setSelectedTemplate("");
  }, [meetingKey]);

  const submit = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    if (isPersisted && onSendMessage) {
      onSendMessage(q, includeTranscripts);
      return;
    }
    const currentAttachments = [...attachments];
    setAttachments([]);
    const userMsg: InternalMessage = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const historyForApi: ConversationMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: q },
      ];
      let base64Attachments: { name: string; base64: string; mimeType: string }[] | undefined;
      if (currentAttachments.length > 0) {
        base64Attachments = await Promise.all(
          currentAttachments.map(async (a) => {
            const resp = await fetch(a.url);
            const buf = await resp.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            const mimeType = resp.headers.get("content-type") ?? "image/png";
            return { name: a.name, base64, mimeType };
          }),
        );
      }
      const response = await onChat(historyForApi, base64Attachments, includeTranscripts, selectedTemplate);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, sources: response.sources },
      ]);
    } catch (err) {
      const msg = (err as Error).message.replace(/^\[api_error\]\s*/, "").replace(/^\[rate_limit\]\s*/, "");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView?.({ behavior: "smooth" }), 50);
    }
  }, [input, loading, onChat, messages, attachments, includeTranscripts, selectedTemplate, isPersisted, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0) {
      e.preventDefault();
      setAttachments((prev) => [
        ...prev,
        ...files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
      ]);
      return;
    }
    if (e.clipboardData.types.includes("text/html")) {
      const html = e.clipboardData.getData("text/html");
      if (html) {
        e.preventDefault();
        const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });
        const markdown = td.turndown(html);
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const next = ta.value.slice(0, start) + markdown + ta.value.slice(end);
        setInput(next);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + markdown.length;
        });
      }
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeAttachment = useCallback((name: string) => {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
  }, []);

  const copyMarkdown = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  const copyJira = useCallback((text: string) => {
    navigator.clipboard.writeText(markdownToJira(text)).catch(() => {});
  }, []);

  const copyRichText = useCallback((text: string) => {
    const html = markdownToHtml(text);
    const htmlBlob = new Blob([html], { type: "text/html" });
    const textBlob = new Blob([text], { type: "text/plain" });
    navigator.clipboard.write([
      new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob }),
    ]).catch(() => {});
  }, []);

  const displayMessages: InternalMessage[] = isPersisted
    ? (persistedMessages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
        sources: m.sources ? JSON.parse(m.sources) : undefined,
      }))
    : messages;

  const hasStaleContext = isPersisted && (persistedMessages ?? []).some((m) => m.context_stale);

  return (
    <div className="flex flex-col h-full overflow-hidden min-w-0">
      <div className="px-4 py-1.5 text-[0.7rem] border-b border-border text-muted-foreground flex gap-2 shrink-0">
        <span>
          <span className="text-secondary-foreground">{activeMeetingIds.length}</span>{" "}
          {activeMeetingIds.length === 1 ? "meeting" : "meetings"}
        </span>
        <span>·</span>
        <span>
          <span className="text-secondary-foreground">{charCount.toLocaleString()}</span> chars
        </span>
        {isPersisted && onClearMessages && displayMessages.length > 0 && (
          <Button size="sm" variant="ghost" onClick={onClearMessages} aria-label="Clear conversation" className="ml-auto h-auto px-1 py-0">
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>

      {hasStaleContext && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs border-b border-border">
          Source meetings have changed — some context may be outdated
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-w-0">
        {displayMessages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="self-end max-w-[85%] flex flex-col items-end gap-0.5 min-w-0">
              <div
                data-testid="user-bubble"
                className={`px-3.5 py-2 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm leading-relaxed overflow-hidden break-words [word-break:break-word] min-w-0 ${expandedBubbles.has(i) ? "" : "max-h-[3.5rem]"}`}
              >
                <div className="chat-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.content.length > 120 && (
                <button
                  data-testid="user-bubble-toggle"
                  className="text-xs text-muted-foreground hover:text-foreground px-1"
                  onClick={() => setExpandedBubbles((prev) => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i); else next.add(i);
                    return next;
                  })}
                >
                  {expandedBubbles.has(i) ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          ) : (
            <div key={i} className="flex flex-col gap-1.5 max-w-[90%]">
              <div
                data-testid="assistant-bubble"
                className="self-start px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-secondary text-secondary-foreground text-sm leading-[1.65]"
              >
                <div className="chat-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="text-[0.7rem] text-muted-foreground pl-1">
                  <span className="font-semibold uppercase tracking-[0.05em]">Sources</span>
                  <span className="inline flex-wrap ml-1">
                    {msg.sources.map((s, j) => {
                      const isRef = typeof s === "object" && s !== null && "id" in s;
                      const label = isRef ? (s as SourceRef).label : (s as string);
                      return (
                        <span key={j}>
                          {j > 0 && <span className="mx-1.5">·</span>}
                          {isRef && onSourceClick ? (
                            <button
                              type="button"
                              onClick={() => onSourceClick((s as SourceRef).id)}
                              className="text-left underline decoration-dotted underline-offset-2 hover:text-foreground bg-transparent border-none cursor-pointer p-0 m-0 text-[0.7rem] text-muted-foreground"
                            >
                              {label}
                            </button>
                          ) : (
                            label
                          )}
                        </span>
                      );
                    })}
                  </span>
                </div>
              )}
              <div className="flex gap-0.5 pl-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyMarkdown(msg.content)}
                  aria-label="Copy as Markdown"
                  className="h-auto px-1 py-0.5 text-[0.65rem] text-muted-foreground"
                >
                  <Clipboard className="w-[10px] h-[10px]" />
                  Copy as Markdown
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyJira(msg.content)}
                  aria-label="Copy for Jira"
                  className="h-auto px-1 py-0.5 text-[0.65rem] text-muted-foreground"
                >
                  <Code className="w-[10px] h-[10px]" />
                  Copy for Jira
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyRichText(msg.content)}
                  aria-label="Copy as Rich Text"
                  className="h-auto px-1 py-0.5 text-[0.65rem] text-muted-foreground"
                >
                  <FileText className="w-[10px] h-[10px]" />
                  Copy as Rich Text
                </Button>
                {onSaveAsThread && !isPersisted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSaveAsThread(msg.content)}
                    aria-label="Save as Thread"
                    className="h-auto px-1 py-0.5 text-[0.65rem] text-muted-foreground"
                  >
                    <Bookmark className="w-[10px] h-[10px]" />
                    Save as Thread
                  </Button>
                )}
              </div>
            </div>
          ),
        )}
        {loading && (
          <div
            data-testid="thinking-indicator"
            className="self-start px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-secondary text-muted-foreground text-sm"
          >
            <span className="inline-flex gap-1">
              <span className="animate-bounce [animation-delay:0ms]">·</span>
              <span className="animate-bounce [animation-delay:150ms]">·</span>
              <span className="animate-bounce [animation-delay:300ms]">·</span>
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-border shrink-0">
        {attachments.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {attachments.map((a) => (
              <div key={a.name} className="flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-xs text-secondary-foreground">
                <span>{a.name}</span>
                <button
                  onClick={() => removeAttachment(a.name)}
                  aria-label={`Remove ${a.name}`}
                  className="text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0 leading-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Ask a question about these meetings…"
              rows={3}
              className="w-full resize-none rounded-md px-3 py-2 text-sm bg-input text-foreground border border-border outline-none"
            />
            <div className="flex items-center gap-3">
              {templates && templates.length > 0 && (
                <label className="flex items-center gap-1.5 select-none">
                  <span className="text-[0.7rem] text-muted-foreground">Output Template</span>
                  <select
                    aria-label="Output template"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="text-[0.7rem] text-muted-foreground bg-transparent border border-border rounded px-1 py-0.5 cursor-pointer"
                  >
                    <option value="">Default</option>
                    {templates.map((t) => (
                      <option key={t} value={t}>{toDisplayName(t)}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="flex items-center gap-1.5 cursor-pointer select-none w-fit">
                <input
                  type="checkbox"
                  aria-label="Include full transcripts"
                  checked={includeTranscripts}
                  onChange={(e) => setIncludeTranscripts(e.target.checked)}
                  className="cursor-pointer"
                />
                <span className="text-[0.7rem] text-muted-foreground">Include full transcripts</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1 self-center">
            <label className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-md hover:bg-secondary text-muted-foreground">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Paperclip className="w-4 h-4" />
            </label>
            <Button
              onClick={submit}
              disabled={!input.trim() || loading}
              size="icon"
              className="shrink-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
