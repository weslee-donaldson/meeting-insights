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
      <div className="px-4 py-2 text-xs text-zinc-500 border-b border-zinc-800 shrink-0">
        Context:{" "}
        <span className="text-zinc-400">{contextInfo.meetingCount} meetings</span>
        {" | "}
        <span className="text-zinc-400">{contextInfo.charCount.toLocaleString()} characters</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {history.map((pair, i) => (
          <div key={i} className="space-y-2">
            <div className="text-xs text-zinc-500 font-medium">Q: {pair.question}</div>
            <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {pair.answer}
            </div>
            {pair.sources.length > 0 && (
              <div className="text-xs text-zinc-500">
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
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-300"
            >
              <Clipboard className="w-3 h-3" />
              Copy
            </button>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-zinc-500 animate-pulse">Thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-800 p-4 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about these meetings…"
            rows={2}
            className="flex-1 resize-none bg-zinc-900 text-zinc-100 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          />
          <button
            onClick={submit}
            disabled={!question.trim() || loading}
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shrink-0 self-end"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
