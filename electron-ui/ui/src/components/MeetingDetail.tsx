import React, { useState, useRef, useCallback } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, ChevronDown, Send, Clipboard } from "lucide-react";
import type { MeetingRow, Artifact, ChatResponse } from "../../../electron/channels.js";

interface MeetingDetailProps {
  meeting: MeetingRow | null;
  artifact: Artifact | null;
  chatContext: { meetingIds: string[]; charCount: number };
  onChat: (question: string) => Promise<ChatResponse>;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isEmpty: boolean;
}

function Section({ title, children, isEmpty }: SectionProps) {
  const [open, setOpen] = React.useState(false);
  if (isEmpty) return null;
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          width: "100%",
          textAlign: "left",
          padding: "4px 0",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: open ? "var(--color-text-secondary)" : "var(--color-text-muted)",
        }}
      >
        {open ? (
          <ChevronDown style={{ width: "12px", height: "12px", flexShrink: 0 }} />
        ) : (
          <ChevronRight style={{ width: "12px", height: "12px", flexShrink: 0 }} />
        )}
        {title}
      </Collapsible.Trigger>
      <Collapsible.Content style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function ArtifactView({ artifact }: { artifact: Artifact }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Section title="Summary" isEmpty={!artifact.summary}>
        <p style={{ lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0 }}>{artifact.summary}</p>
      </Section>

      <Section title="Decisions" isEmpty={artifact.decisions.length === 0}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
          {artifact.decisions.map((d, i) => (
            <li key={i} style={{ display: "flex", gap: "8px" }}>
              <span style={{ flexShrink: 0, color: "var(--color-text-muted)" }}>—</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Action Items" isEmpty={artifact.action_items.length === 0}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
          {artifact.action_items.map((a, i) => (
            <li key={i} style={{ display: "flex", gap: "8px" }}>
              <span style={{ flexShrink: 0, color: "var(--color-text-muted)" }}>□</span>
              <span>
                {a.description}
                <span style={{ marginLeft: "4px", color: "var(--color-text-muted)" }}>
                  ({a.owner}{a.due_date ? `, ${a.due_date}` : ""})
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Open Questions" isEmpty={artifact.open_questions.length === 0}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
          {artifact.open_questions.map((q, i) => (
            <li key={i} style={{ display: "flex", gap: "8px" }}>
              <span style={{ flexShrink: 0, color: "var(--color-text-muted)" }}>?</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Risks" isEmpty={artifact.risk_items.length === 0}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
          {artifact.risk_items.map((r, i) => (
            <li key={i} style={{ display: "flex", gap: "8px" }}>
              <span style={{ flexShrink: 0, color: "var(--color-danger)" }}>⚠</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Proposed Features" isEmpty={artifact.proposed_features.length === 0}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
          {artifact.proposed_features.map((f, i) => (
            <li key={i} style={{ display: "flex", gap: "8px" }}>
              <span style={{ flexShrink: 0, color: "var(--color-accent)" }}>✦</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Technical Topics" isEmpty={artifact.technical_topics.length === 0}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
          {artifact.technical_topics.map((t, i) => (
            <li key={i} style={{ display: "flex", gap: "8px" }}>
              <span style={{ flexShrink: 0, color: "var(--color-text-muted)" }}>◆</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Additional Notes" isEmpty={artifact.additional_notes.length === 0}>
        {artifact.additional_notes.map((note, i) => {
          const entries = Object.entries(note);
          const header = entries.find(([, v]) => typeof v === "string");
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {header && (
                <div style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>
                  {String(header[1])}
                </div>
              )}
              {entries
                .filter(([k]) => k !== header?.[0])
                .map(([k, v]) => {
                  const items = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
                  return items.map((item, j) => (
                    <div key={`${k}-${j}`} style={{ display: "flex", gap: "8px", paddingLeft: "8px" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>•</span>
                      <span>{String(item)}</span>
                    </div>
                  ));
                })}
            </div>
          );
        })}
      </Section>
    </div>
  );
}

interface QAPair {
  question: string;
  answer: string;
  sources: string[];
}

function ChatSection({
  chatContext,
  onChat,
}: {
  chatContext: { meetingIds: string[]; charCount: number };
  onChat: (question: string) => Promise<ChatResponse>;
}) {
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
    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid var(--color-border)" }}>
      <div
        style={{
          padding: "8px 16px",
          fontSize: "0.75rem",
          borderBottom: "1px solid var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        Context:{" "}
        <span style={{ color: "var(--color-text-secondary)" }}>{chatContext.meetingIds.length} meetings</span>
        {" | "}
        <span style={{ color: "var(--color-text-secondary)" }}>{chatContext.charCount.toLocaleString()} characters</span>
      </div>

      <div style={{ overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {history.map((pair, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--color-text-muted)" }}>
              Q: {pair.question}
            </div>
            <div style={{ fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--color-text-primary)" }}>
              {pair.answer}
            </div>
            {pair.sources.length > 0 && (
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                <span style={{ fontWeight: 500 }}>Sources:</span>
                <ul style={{ margin: "2px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {pair.sources.map((s, j) => (
                    <li key={j} style={{ paddingLeft: "8px" }}>— {s}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => copyToClipboard(`Q: ${pair.question}\n\nA: ${pair.answer}`)}
              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}
            >
              <Clipboard style={{ width: "12px", height: "12px" }} />
              Copy
            </button>
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "16px", borderTop: "1px solid var(--color-border)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about these meetings…"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              borderRadius: "4px",
              padding: "8px 12px",
              fontSize: "0.875rem",
              background: "var(--color-bg-input)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              outline: "none",
            }}
          />
          <button
            onClick={submit}
            disabled={!question.trim() || loading}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              background: "var(--color-accent)",
              color: "white",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              alignSelf: "flex-end",
              opacity: (!question.trim() || loading) ? 0.4 : 1,
            }}
            aria-label="Send"
          >
            <Send style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MeetingDetail({ meeting, artifact, chatContext, onChat }: MeetingDetailProps) {
  if (!meeting) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
        }}
      >
        Select a meeting
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
          {meeting.title}
        </div>
        <div style={{ fontSize: "0.75rem", marginTop: "2px", color: "var(--color-text-muted)" }}>
          {meeting.date.slice(0, 10)}
          {meeting.client && (
            <span style={{ marginLeft: "8px" }}>[{meeting.client}]</span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {artifact ? (
          <ArtifactView artifact={artifact} />
        ) : (
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>No artifact extracted</div>
        )}
      </div>

      <ChatSection chatContext={chatContext} onChat={onChat} />
    </div>
  );
}
