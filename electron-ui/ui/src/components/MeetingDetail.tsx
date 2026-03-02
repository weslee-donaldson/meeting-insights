import React, { useState, useRef, useCallback } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, ChevronDown, Send, Clipboard } from "lucide-react";
import type { MeetingRow, Artifact, ChatResponse } from "../../../electron/channels.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { cn } from "../lib/utils.js";

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
  defaultOpen?: boolean;
}

function Section({ title, children, isEmpty, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  if (isEmpty) return null;
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        className={cn(
          "flex items-center gap-1.5 w-full text-left pt-2.5 pb-1.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] bg-transparent border-0 border-t border-border cursor-pointer",
          open ? "text-foreground" : "text-secondary-foreground",
        )}
      >
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        )}
        {title}
      </Collapsible.Trigger>
      <Collapsible.Content className="pb-3 text-sm text-secondary-foreground leading-[1.65]">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function ItemList({ items, icon, iconColor }: { items: string[]; icon: string; iconColor?: string }) {
  return (
    <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
      {items.map((d, i) => (
        <li key={i} className="flex gap-2.5 items-start">
          <span className="shrink-0 mt-px text-[0.8rem] text-muted-foreground" style={iconColor ? { color: iconColor } : undefined}>{icon}</span>
          <span className="leading-[1.6]">{d}</span>
        </li>
      ))}
    </ul>
  );
}

function ArtifactView({ artifact }: { artifact: Artifact }) {
  return (
    <div className="flex flex-col">
      <Section title="Summary" isEmpty={!artifact.summary} defaultOpen={true}>
        <p className="leading-[1.65] text-secondary-foreground m-0">{artifact.summary}</p>
      </Section>

      <Section title="Decisions" isEmpty={artifact.decisions.length === 0}>
        <ItemList items={artifact.decisions} icon="—" />
      </Section>

      <Section title="Action Items" isEmpty={artifact.action_items.length === 0}>
        <ul className="m-0 p-0 list-none flex flex-col gap-2">
          {artifact.action_items.map((a, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span className="shrink-0 mt-0.5 text-primary">□</span>
              <div className="flex flex-col gap-0.5">
                <span className="leading-[1.5]">{a.description}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {a.owner && <Badge variant="secondary">{a.owner}</Badge>}
                  {a.due_date && <Badge variant="muted">{a.due_date}</Badge>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Open Questions" isEmpty={artifact.open_questions.length === 0}>
        <ItemList items={artifact.open_questions} icon="?" iconColor="var(--color-text-secondary)" />
      </Section>

      <Section title="Risks" isEmpty={artifact.risk_items.length === 0}>
        <ItemList items={artifact.risk_items} icon="⚠" iconColor="var(--color-danger)" />
      </Section>

      <Section title="Proposed Features" isEmpty={artifact.proposed_features.length === 0}>
        <ItemList items={artifact.proposed_features} icon="✦" iconColor="var(--color-accent)" />
      </Section>

      <Section title="Technical Topics" isEmpty={artifact.technical_topics.length === 0}>
        <ItemList items={artifact.technical_topics} icon="◆" />
      </Section>

      <Section title="Additional Notes" isEmpty={artifact.additional_notes.length === 0}>
        {artifact.additional_notes.map((note, i) => {
          const entries = Object.entries(note);
          const header = entries.find(([, v]) => typeof v === "string");
          return (
            <div key={i} className="flex flex-col gap-1">
              {header && (
                <div className="font-medium text-secondary-foreground">
                  {String(header[1])}
                </div>
              )}
              {entries
                .filter(([k]) => k !== header?.[0])
                .map(([k, v]) => {
                  const items = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
                  return items.map((item, j) => (
                    <div key={`${k}-${j}`} className="flex gap-2.5 pl-2">
                      <span className="text-muted-foreground">•</span>
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
    <div className="flex flex-col border-t border-border">
      <div className="px-4 py-1.5 text-[0.7rem] border-b border-border text-muted-foreground flex gap-2">
        <span><span className="text-secondary-foreground">{chatContext.meetingIds.length}</span> {chatContext.meetingIds.length === 1 ? "meeting" : "meetings"}</span>
        <span>·</span>
        <span><span className="text-secondary-foreground">{chatContext.charCount.toLocaleString()}</span> chars</span>
      </div>

      <div className="overflow-y-auto p-4 flex flex-col gap-5">
        {history.map((pair, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="text-[0.75rem] font-semibold text-muted-foreground pb-1 border-b border-border">
              {pair.question}
            </div>
            <div className="text-sm leading-[1.65] whitespace-pre-wrap text-foreground">
              {pair.answer}
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
            <button
              onClick={() => copyToClipboard(`Q: ${pair.question}\n\nA: ${pair.answer}`)}
              className="flex items-center gap-1 text-[0.7rem] text-muted-foreground bg-transparent border-none cursor-pointer self-start p-0"
            >
              <Clipboard className="w-[11px] h-[11px]" />
              Copy
            </button>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-muted-foreground">
            Thinking…
          </div>
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

export function MeetingDetail({ meeting, artifact, chatContext, onChat }: MeetingDetailProps) {
  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Select a meeting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border shrink-0">
        <div className="font-bold text-base text-foreground leading-[1.3]">
          {meeting.title}
        </div>
        <div className="text-xs mt-1 text-muted-foreground flex gap-2 items-center">
          <span>{meeting.date.slice(0, 10)}</span>
          {meeting.client && <Badge variant="secondary">{meeting.client}</Badge>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {artifact ? (
          <ArtifactView artifact={artifact} />
        ) : (
          <div className="py-4 text-xs text-muted-foreground">No artifact extracted</div>
        )}
      </div>

      <ChatSection chatContext={chatContext} onChat={onChat} />
    </div>
  );
}
