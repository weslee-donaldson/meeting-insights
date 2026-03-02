import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Clipboard } from "lucide-react";
import { Button } from "./ui/button.js";
import type { ChatResponse } from "../../../electron/channels.js";

interface QAPair {
  question: string;
  answer: string;
  sources: string[];
}

interface ChatPanelProps {
  activeMeetingIds: string[];
  charCount: number;
  onChat: (question: string) => Promise<ChatResponse>;
}

export function ChatPanel({ activeMeetingIds, charCount, onChat }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const meetingKey = useMemo(() => activeMeetingIds.join(","), [activeMeetingIds]);

  useEffect(() => {
    setHistory([]);
  }, [meetingKey]);

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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-1.5 text-[0.7rem] border-b border-border text-muted-foreground flex gap-2 shrink-0">
        <span>
          <span className="text-secondary-foreground">{activeMeetingIds.length}</span>{" "}
          {activeMeetingIds.length === 1 ? "meeting" : "meetings"}
        </span>
        <span>·</span>
        <span>
          <span className="text-secondary-foreground">{charCount.toLocaleString()}</span> chars
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {history.map((pair, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="text-[0.75rem] font-semibold text-muted-foreground pb-1 border-b border-border">
              {pair.question}
            </div>
            <div className="text-sm leading-[1.65] text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{pair.answer}</ReactMarkdown>
            </div>
            {pair.sources.length > 0 && (
              <div className="text-[0.7rem] text-muted-foreground">
                <span className="font-semibold uppercase tracking-[0.05em]">Sources</span>
                <ul className="mt-1 m-0 p-0 list-none flex flex-col gap-0.5">
                  {pair.sources.map((s, j) => (
                    <li key={j} className="pl-2">— {s}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(pair.answer)}
              aria-label="Copy to clipboard"
              className="self-start h-auto px-1 py-0.5 text-[0.7rem] text-muted-foreground"
            >
              <Clipboard className="w-[11px] h-[11px]" />
              Copy
            </Button>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-muted-foreground">Thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about these meetings…"
            rows={2}
            className="flex-1 resize-none rounded-md px-3 py-2 text-sm bg-input text-foreground border border-border outline-none"
          />
          <Button
            onClick={submit}
            disabled={!question.trim() || loading}
            size="icon"
            className="self-end shrink-0"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
