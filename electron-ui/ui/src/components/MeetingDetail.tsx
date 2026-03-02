import React, { useCallback, useMemo, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, ChevronDown, Clipboard, RefreshCw, UserPen, EyeOff } from "lucide-react";
import type { MeetingRow, Artifact, ActionItemCompletion } from "../../../electron/channels.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "./ui/dialog.js";
import { cn } from "../lib/utils.js";

interface MeetingDetailProps {
  meeting: MeetingRow | null;
  artifact: Artifact | null;
  onReExtract?: () => void;
  clients?: string[];
  onReassignClient?: (clientName: string) => void;
  onIgnore?: () => void;
  completions?: ActionItemCompletion[];
  onComplete?: (index: number, note: string) => void;
  onUncomplete?: (index: number) => void;
  artifactLoading?: boolean;
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
      <Collapsible.Content className="pb-3 pl-5 text-sm text-secondary-foreground leading-[1.65]">
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

function NoteDialogBody({ initialNote, onSave, onCancel, saveLabel = "Save" }: { initialNote: string; onSave: (note: string) => void; onCancel: () => void; saveLabel?: string }) {
  const [note, setNote] = useState(initialNote);
  return (
    <>
      <textarea
        aria-label="Completion note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        className="w-full rounded border border-border bg-background text-foreground text-sm p-2 resize-none focus:outline-none"
      />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} aria-label="Cancel">Cancel</Button>
        <Button size="sm" onClick={() => onSave(note)} aria-label={saveLabel}>{saveLabel}</Button>
      </div>
    </>
  );
}

function ArtifactView({ artifact, completions = [], onComplete, onUncomplete }: { artifact: Artifact; completions?: ActionItemCompletion[]; onComplete?: (index: number, note: string) => void; onUncomplete?: (index: number) => void }) {
  const [noteDialog, setNoteDialog] = useState<{ index: number; note: string } | null>(null);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [actionItemFilter, setActionItemFilter] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("");

  const completedSet = useMemo(() => new Set(completions.map((c) => c.item_index)), [completions]);

  const activeCount = useMemo(
    () => artifact.action_items.filter((_, i) => !completedSet.has(i)).length,
    [artifact.action_items, completedSet],
  );

  const actionPeople = useMemo(() => {
    const names = new Set<string>();
    for (const a of artifact.action_items) {
      if (a.owner) names.add(a.owner);
      if (a.requester) names.add(a.requester);
    }
    return Array.from(names).sort();
  }, [artifact.action_items]);

  const filteredActions = useMemo(() => {
    if (!actionItemFilter) return artifact.action_items.map((a, i) => ({ a, i }));
    return artifact.action_items
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => a.owner === actionItemFilter || a.requester === actionItemFilter);
  }, [artifact.action_items, actionItemFilter]);

  const decisionPeople = useMemo(() => {
    const names = new Set<string>();
    for (const d of artifact.decisions) {
      if (d.decided_by) names.add(d.decided_by);
    }
    return Array.from(names).sort();
  }, [artifact.decisions]);

  const filteredDecisions = useMemo(() => {
    if (!decisionFilter) return artifact.decisions;
    return artifact.decisions.filter((d) => d.decided_by === decisionFilter);
  }, [artifact.decisions, decisionFilter]);

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

      <Section
        title="Decisions"
        isEmpty={artifact.decisions.length === 0}
        headerExtra={decisionPeople.length > 0 ? (
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            aria-label="Filter decisions by person"
            className="text-[0.7rem] bg-transparent border border-border rounded px-1.5 py-0.5 text-muted-foreground"
          >
            <option value="">Person: All</option>
            {decisionPeople.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        ) : undefined}
      >
        <ItemList items={filteredDecisions.map((d) => d.decided_by ? `${d.text} (${d.decided_by})` : d.text)} icon="—" />
      </Section>

      <Section
        title="Action Items"
        isEmpty={artifact.action_items.length === 0}
        defaultOpen={true}
        headerExtra={
          <div className="flex items-center gap-2">
            {actionPeople.length > 0 && (
              <select
                value={actionItemFilter}
                onChange={(e) => setActionItemFilter(e.target.value)}
                aria-label="Filter action items by person"
                className="text-[0.7rem] bg-transparent border border-border rounded px-1.5 py-0.5 text-muted-foreground"
              >
                <option value="">Person: All</option>
                {actionPeople.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
            {artifact.action_items.length > 0 && (
              <>
                <span className="text-[0.7rem] text-muted-foreground shrink-0">
                  {completedSet.size} / {artifact.action_items.length}
                </span>
                <div className="w-12 h-1.5 rounded-full bg-muted shrink-0 overflow-hidden">
                  <div
                    role="progressbar"
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.round((completedSet.size / artifact.action_items.length) * 100)}%` }}
                  />
                </div>
              </>
            )}
            {onComplete && activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBulkDialog(true)}
                aria-label="Mark all complete"
                className="shrink-0 h-auto px-1.5 py-1 text-[0.7rem] text-muted-foreground"
              >
                Mark all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyActionItems}
              aria-label="Copy action items"
              className="shrink-0 h-auto px-1.5 py-1 text-[0.7rem] text-muted-foreground"
            >
              <Clipboard className="w-3 h-3" />
            </Button>
          </div>
        }
      >
        <ul className="m-0 p-0 list-none flex flex-col gap-2">
          {filteredActions.map(({ a, i }) => {
            const isCompleted = completedSet.has(i);
            const existingNote = completions.find((c) => c.item_index === i)?.note ?? "";
            return (
              <li key={i} className={cn("flex gap-2.5 items-start", isCompleted && "opacity-60")}>
                {isCompleted ? (
                  <button
                    onClick={() => onUncomplete?.(i)}
                    aria-label={`Uncomplete item ${i}`}
                    className="shrink-0 mt-0.5 text-green-500 bg-transparent border-0 cursor-pointer p-0"
                  >✓</button>
                ) : onComplete ? (
                  <button
                    onClick={() => onComplete(i, "")}
                    aria-label={`Complete item ${i}`}
                    className="shrink-0 mt-0.5 text-primary bg-transparent border-0 cursor-pointer p-0"
                  >
                    □
                  </button>
                ) : (
                  <span className="shrink-0 mt-0.5 text-primary">□</span>
                )}
                <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                  {isCompleted ? (
                    <button
                      onClick={() => setNoteDialog({ index: i, note: existingNote })}
                      className="text-left text-sm leading-[1.5] line-through bg-transparent border-0 cursor-pointer p-0 text-inherit"
                    >
                      {a.description}
                    </button>
                  ) : (
                    <span className="leading-[1.5]">{a.description}</span>
                  )}
                  {a.owner && <Badge variant="secondary">{a.owner}</Badge>}
                  {a.requester && <Badge variant="outline">{a.requester}</Badge>}
                  {a.due_date && <Badge variant="muted">{a.due_date}</Badge>}
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Dialog open={noteDialog !== null} onOpenChange={(open) => { if (!open) setNoteDialog(null); }}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Completion note</DialogTitle>
          {noteDialog !== null && (
            <NoteDialogBody
              initialNote={noteDialog.note}
              onSave={(note) => { onComplete?.(noteDialog.index, note); setNoteDialog(null); }}
              onCancel={() => setNoteDialog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDialog} onOpenChange={(open) => { if (!open) setBulkDialog(false); }}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Mark all complete</DialogTitle>
          <NoteDialogBody
            initialNote=""
            onSave={(note) => { artifact.action_items.forEach((_, i) => { if (!completedSet.has(i)) onComplete?.(i, note); }); setBulkDialog(false); }}
            onCancel={() => setBulkDialog(false)}
            saveLabel="Confirm"
          />
        </DialogContent>
      </Dialog>

      <Section title="Open Questions" isEmpty={artifact.open_questions.length === 0}>
        <ItemList items={artifact.open_questions} icon="?" iconColor="var(--color-text-secondary)" />
      </Section>

      <Section title="Risks" isEmpty={artifact.risk_items.length === 0}>
        <ItemList items={artifact.risk_items} icon="⚠" iconColor="var(--color-danger)" />
      </Section>

      <Section title="Proposed Features" isEmpty={artifact.proposed_features.length === 0}>
        <ItemList items={artifact.proposed_features} icon="✦" iconColor="var(--color-accent)" />
      </Section>

      <Section title="Architecture" isEmpty={artifact.architecture.length === 0}>
        <ItemList items={artifact.architecture} icon="◆" />
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

export function MeetingDetail({ meeting, artifact, onReExtract, clients, onReassignClient, onIgnore, completions, onComplete, onUncomplete, artifactLoading }: MeetingDetailProps) {
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const copySummary = useCallback(() => {
    if (!meeting || !artifact) return;
    const lines = [
      `# ${meeting.title}`,
      `Date: ${meeting.date.slice(0, 10)}`,
      "",
      "## Summary",
      artifact.summary,
      ...(artifact.decisions.length > 0 ? ["", "## Decisions", ...artifact.decisions.map((d) => `- ${d.text}`)] : []),
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
          <div className="relative flex items-center gap-1 shrink-0">
            {onReassignClient && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setClientPickerOpen((v) => !v)}
                  aria-label="Reassign client"
                  className="h-auto w-auto px-1.5 py-1 text-muted-foreground"
                >
                  <UserPen className="w-3 h-3" />
                </Button>
                {clientPickerOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-secondary border border-border rounded shadow-lg flex flex-col min-w-[120px]">
                    {(clients ?? []).map((c) => (
                      <button
                        key={c}
                        onClick={() => { onReassignClient(c); setClientPickerOpen(false); }}
                        className="px-3 py-1.5 text-left text-sm hover:bg-accent text-foreground"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {onIgnore && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onIgnore}
                aria-label="Ignore meeting"
                className="h-auto w-auto px-1.5 py-1 text-muted-foreground"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            )}
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
          <ArtifactView artifact={artifact} completions={completions} onComplete={onComplete} onUncomplete={onUncomplete} />
        ) : artifactLoading ? (
          <div data-testid="artifact-skeleton" className="flex flex-col gap-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex flex-col gap-2">
                <div className="h-3 rounded bg-muted w-1/4" />
                <div className="h-3 rounded bg-muted w-full" />
                <div className="h-3 rounded bg-muted w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-xs text-muted-foreground">No artifact extracted</div>
        )}
      </div>
    </div>
  );
}
