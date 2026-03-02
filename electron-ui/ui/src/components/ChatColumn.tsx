import React, { useState, useRef, useCallback } from "react";
import { Send, Clipboard } from "lucide-react";
import type { ChatResponse } from "../../../electron/channels.js";

interface ContextInfo {
  meetingCount: number;
  charCount: number;
}

interface Props {
  contextInfo: ContextInfo;
  onChat: (question: string) => Promise<ChatResponse>;
}

interface QAPair {
  question: string;
  answer: string;
  sources: string[];
}

export function ChatColumn({ contextInfo, onChat }: Props) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const submit = useCallback(async () => {
    const q = question.trim();
    if (!q || loading) return;
    setQuestion("");
    setLoading(true);
    try {
      const response = await onChat(q);
      setHistory((prev) => [
        ...prev,
        { question: q, answer: response.answer, sources: response.sources },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [question, loading, onChat]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-4 py-2 text-xs border-b shrink-0"
        style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}
      >
        Context:{" "}
        <span style={{ color: "var(--color-text-secondary)" }}>{contextInfo.meetingCount} meetings</span>
        {" | "}
        <span style={{ color: "var(--color-text-secondary)" }}>{contextInfo.charCount.toLocaleString()} characters</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {history.map((pair, i) => (
          <div key={i} className="space-y-2">
            <div className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
              Q: {pair.question}
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-text-primary)" }}>
              {pair.answer}
            </div>
            {pair.sources.length > 0 && (
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                <span className="font-medium">Sources:</span>
                <ul className="mt-0.5 space-y-0.5">
                  {pair.sources.map((s, j) => (
                    <li key={j} className="pl-2">— {s}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => copyToClipboard(`Q: ${pair.question}\n\nA: ${pair.answer}`)}
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              <Clipboard className="w-3 h-3" />
              Copy
            </button>
          </div>
        ))}
        {loading && (
          <div className="text-xs animate-pulse" style={{ color: "var(--color-text-muted)" }}>
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 shrink-0" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="flex gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about these meetings…"
            rows={2}
            className="flex-1 resize-none rounded px-3 py-2 text-sm focus:outline-none"
            style={{
              background: "var(--color-bg-input)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            }}
          />
          <button
            onClick={submit}
            disabled={!question.trim() || loading}
            className="px-3 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed text-white shrink-0 self-end"
            style={{ background: "var(--color-accent)" }}
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
