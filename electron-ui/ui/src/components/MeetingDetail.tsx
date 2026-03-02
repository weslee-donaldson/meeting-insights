import React, { useCallback } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, ChevronDown, Clipboard, RefreshCw } from "lucide-react";
import type { MeetingRow, Artifact } from "../../../electron/channels.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { cn } from "../lib/utils.js";

interface MeetingDetailProps {
  meeting: MeetingRow | null;
  artifact: Artifact | null;
  onReExtract?: () => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isEmpty: boolean;
  defaultOpen?: boolean;
  headerExtra?: React.ReactNode;
}

function Section({ title, children, isEmpty, defaultOpen = false, headerExtra }: SectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  if (isEmpty) return null;
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-t border-border">
        <Collapsible.Trigger
          className={cn(
            "flex items-center gap-1.5 flex-1 text-left pt-2.5 pb-1.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] bg-transparent border-0 cursor-pointer",
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
        {headerExtra}
      </div>
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
  const copyActionItems = useCallback(() => {
    const text = artifact.action_items
      .map((a) => {
        const meta = [a.owner, a.due_date].filter(Boolean).join(", ");
        return meta ? `- [ ] ${a.description} (${meta})` : `- [ ] ${a.description}`;
      })
      .join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }, [artifact.action_items]);

  return (
    <div className="flex flex-col">
      <Section title="Summary" isEmpty={!artifact.summary} defaultOpen={true}>
        <p className="leading-[1.65] text-secondary-foreground m-0">{artifact.summary}</p>
      </Section>

      <Section title="Decisions" isEmpty={artifact.decisions.length === 0}>
        <ItemList items={artifact.decisions} icon="—" />
      </Section>

      <Section
        title="Action Items"
        isEmpty={artifact.action_items.length === 0}
        headerExtra={
          <Button
            variant="ghost"
            size="sm"
            onClick={copyActionItems}
            aria-label="Copy action items"
            className="shrink-0 h-auto px-1.5 py-1 text-[0.7rem] text-muted-foreground"
          >
            <Clipboard className="w-3 h-3" />
          </Button>
        }
      >
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

export function MeetingDetail({ meeting, artifact, onReExtract }: MeetingDetailProps) {
  const copySummary = useCallback(() => {
    if (!meeting || !artifact) return;
    const lines = [
      `# ${meeting.title}`,
      `Date: ${meeting.date.slice(0, 10)}`,
      "",
      "## Summary",
      artifact.summary,
      ...(artifact.decisions.length > 0 ? ["", "## Decisions", ...artifact.decisions.map((d) => `- ${d}`)] : []),
    ];
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
  }, [meeting, artifact]);

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
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="font-bold text-base text-foreground leading-[1.3]">
              {meeting.title}
            </div>
            <div className="text-xs mt-1 text-muted-foreground flex gap-2 items-center">
              <span>{meeting.date.slice(0, 10)}</span>
              {meeting.client && <Badge variant="secondary">{meeting.client}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onReExtract && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onReExtract}
                aria-label="Re-extract"
                className="h-auto w-auto px-1.5 py-1 text-muted-foreground"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
            {artifact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copySummary}
                aria-label="Copy summary"
                className="shrink-0 h-auto px-1.5 py-1 text-[0.7rem] text-muted-foreground"
              >
                <Clipboard className="w-3 h-3" />
                Copy summary
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {artifact ? (
          <ArtifactView artifact={artifact} />
        ) : (
          <div className="py-4 text-xs text-muted-foreground">No artifact extracted</div>
        )}
      </div>
    </div>
  );
}
