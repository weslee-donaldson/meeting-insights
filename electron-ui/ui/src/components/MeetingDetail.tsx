import React, { useCallback, useMemo, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, ChevronDown, Clipboard, RefreshCw, UserPen, EyeOff } from "lucide-react";
import type { MeetingRow, Artifact, ActionItemCompletion, MentionStat } from "../../../electron/channels.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "./ui/dialog.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { cn } from "../lib/utils.js";

interface MeetingDetailProps {
  meeting: MeetingRow | null;
  meetings?: MeetingRow[];
  artifact: Artifact | null;
  onReExtract?: () => void;
  reExtractPending?: boolean;
  clients?: string[];
  onReassignClient?: (clientName: string) => void;
  onIgnore?: () => void;
  completions?: ActionItemCompletion[];
  onComplete?: (index: number, note: string) => void;
  onUncomplete?: (index: number) => void;
  mentionStats?: MentionStat[];
  onMentionClick?: (canonicalId: string, itemText: string) => void;
  artifactLoading?: boolean;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isEmpty: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  headerExtra?: React.ReactNode;
}

function Section({ title, children, isEmpty, defaultOpen = false, open: controlledOpen, onOpenChange, headerExtra }: SectionProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
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
        <ScrollArea maxHeight={400}>
          <div className="pl-5 pr-1">
            {children}
          </div>
        </ScrollArea>
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

function ArtifactView({ artifact, completions = [], onComplete, onUncomplete, mentionStats = [], onMentionClick }: { artifact: Artifact; completions?: ActionItemCompletion[]; onComplete?: (index: number, note: string) => void; onUncomplete?: (index: number) => void; mentionStats?: MentionStat[]; onMentionClick?: (canonicalId: string, itemText: string) => void }) {
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
    const items = actionItemFilter
      ? artifact.action_items
          .map((a, i) => ({ a, i }))
          .filter(({ a }) => a.owner === actionItemFilter || a.requester === actionItemFilter)
      : artifact.action_items.map((a, i) => ({ a, i }));
    const score = (item: { a: Artifact["action_items"][number]; i: number }) => {
      if (completedSet.has(item.i)) return 2;
      if (item.a.priority === "critical") return 0;
      return 1;
    };
    return items.sort((x, y) => score(x) - score(y));
  }, [artifact.action_items, actionItemFilter, completedSet]);

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

  const mentionLookup = useMemo(() => {
    const map = new Map<string, MentionStat>();
    for (const stat of mentionStats) {
      if (stat.mention_count > 1) map.set(`${stat.item_type}:${stat.item_index}`, stat);
    }
    return map;
  }, [mentionStats]);

  const copyActionItems = useCallback(() => {
    const text = artifact.action_items
      .map((a) => {
        const meta = [a.owner, a.due_date].filter(Boolean).join(", ");
        return meta ? `- [ ] ${a.description} (${meta})` : `- [ ] ${a.description}`;
      })
      .join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }, [artifact.action_items]);

  const [sectionStates, setSectionStates] = useState<Record<string, boolean>>({
    Summary: true,
    "Action Items": true,
  });

  const setSectionOpen = useCallback((title: string, open: boolean) => {
    setSectionStates(prev => ({ ...prev, [title]: open }));
  }, []);

  const SECTION_KEYS = ["Summary", "Decisions", "Action Items", "Open Questions", "Risks", "Proposed Features", "Additional Notes"];
  const allExpanded = SECTION_KEYS.every((k) => !!sectionStates[k]);

  const toggleAllSections = useCallback(() => {
    if (allExpanded) {
      setSectionStates({});
    } else {
      setSectionStates({
        Summary: true, Decisions: true, "Action Items": true,
        "Open Questions": true, Risks: true, "Proposed Features": true,
        "Additional Notes": true,
      });
    }
  }, [allExpanded]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 pt-2 pb-1">
        <Button variant="outline" size="sm" onClick={toggleAllSections} aria-label={allExpanded ? "Collapse all" : "Expand all"}
          className="h-auto px-2 py-0.5 text-[0.7rem]">
          {allExpanded ? "Collapse all" : "Expand all"}
        </Button>
      </div>
      <Section title="Summary" isEmpty={!artifact.summary} open={!!sectionStates["Summary"]} onOpenChange={(o) => setSectionOpen("Summary", o)}>
        <p className="leading-[1.65] text-secondary-foreground m-0 whitespace-pre-wrap">{artifact.summary}</p>
      </Section>

      <Section
        title="Decisions"
        isEmpty={artifact.decisions.length === 0}
        open={!!sectionStates["Decisions"]}
        onOpenChange={(o) => setSectionOpen("Decisions", o)}
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
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {filteredDecisions.map((d, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span className="shrink-0 mt-px text-[0.8rem] text-muted-foreground">—</span>
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className="leading-[1.6]">{d.text}</span>
                {d.decided_by && <Badge variant="secondary">{d.decided_by}</Badge>}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Action Items"
        isEmpty={artifact.action_items.length === 0}
        open={!!sectionStates["Action Items"]}
        onOpenChange={(o) => setSectionOpen("Action Items", o)}
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
            const mention = mentionLookup.get(`action_items:${i}`);
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
                    <span className="leading-[1.5]">
                      {a.priority === "critical" && <Badge variant="destructive" className="inline mr-1 text-[0.65rem]">CRITICAL</Badge>}
                      {a.description}
                    </span>
                  )}
                  {a.owner && <Badge variant="secondary">{a.owner}</Badge>}
                  {a.requester && <Badge variant="outline">{a.requester}</Badge>}
                  {a.due_date && <Badge variant="muted">{a.due_date}</Badge>}
                  {mention && (
                    <Badge
                      variant="outline"
                      className="cursor-pointer text-[0.65rem]"
                      onClick={() => onMentionClick?.(mention.canonical_id, a.description)}
                    >
                      {mention.mention_count}x
                    </Badge>
                  )}
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

      <Section title="Open Questions" isEmpty={artifact.open_questions.length === 0} open={!!sectionStates["Open Questions"]} onOpenChange={(o) => setSectionOpen("Open Questions", o)}>
        <ItemList items={artifact.open_questions} icon="?" iconColor="var(--color-text-secondary)" />
      </Section>

      <Section title="Risks" isEmpty={artifact.risk_items.length === 0} open={!!sectionStates["Risks"]} onOpenChange={(o) => setSectionOpen("Risks", o)}>
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {artifact.risk_items.map((r, i) => (
            <li key={i} className="flex flex-wrap gap-x-1.5 gap-y-0.5 items-baseline">
              <span className="shrink-0 mt-px text-[0.8rem]" style={{ color: "var(--color-danger)" }}>⚠</span>
              <span className="leading-[1.6]">{r.description}</span>
              <Badge variant="muted">{r.category}</Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Proposed Features" isEmpty={artifact.proposed_features.length === 0} open={!!sectionStates["Proposed Features"]} onOpenChange={(o) => setSectionOpen("Proposed Features", o)}>
        <ItemList items={artifact.proposed_features} icon="✦" iconColor="var(--color-accent)" />
      </Section>

      <Section title="Additional Notes" isEmpty={artifact.additional_notes.length === 0} open={!!sectionStates["Additional Notes"]} onOpenChange={(o) => setSectionOpen("Additional Notes", o)}>
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

export function MeetingDetail({ meeting, meetings, artifact, onReExtract, reExtractPending, clients, onReassignClient, onIgnore, completions, onComplete, onUncomplete, mentionStats, onMentionClick, artifactLoading }: MeetingDetailProps) {
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [reassignSelection, setReassignSelection] = useState("");
  const isMultiMode = !!(meetings && meetings.length > 1);
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

  if (!meeting && !isMultiMode) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Select a meeting
      </div>
    );
  }

  if (isMultiMode) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border shrink-0">
          <div className="font-bold text-base text-foreground leading-[1.3]">
            {meetings!.length} meetings selected
          </div>
          <div className="text-xs mt-1 text-muted-foreground flex flex-col gap-0.5">
            {meetings!.map((m) => (
              <span key={m.id}>{m.title} — {m.date.slice(0, 10)}</span>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4" data-testid="artifact-scroll">
          {artifact ? (
            <ArtifactView artifact={artifact} />
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
            <div className="py-4 text-xs text-muted-foreground">No artifacts extracted</div>
          )}
        </div>
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
          <div className="relative flex items-center gap-0.5 shrink-0">
            {onReassignClient && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setReassignSelection((clients ?? [])[0] ?? ""); setClientPickerOpen(true); }}
                  aria-label="Reassign client"
                  title="Reassign client"
                  className="w-8 h-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                >
                  <UserPen className="w-[18px] h-[18px]" />
                </Button>
                <Dialog open={clientPickerOpen} onOpenChange={setClientPickerOpen}>
                  <DialogContent>
                    <DialogTitle>Reassign Client</DialogTitle>
                    <select
                      value={reassignSelection}
                      onChange={(e) => setReassignSelection(e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-input text-foreground border border-border text-sm"
                    >
                      {(clients ?? []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <DialogClose asChild>
                        <Button variant="ghost" size="sm">Cancel</Button>
                      </DialogClose>
                      <Button
                        size="sm"
                        onClick={() => { onReassignClient(reassignSelection); setClientPickerOpen(false); }}
                      >
                        Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {onIgnore && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onIgnore}
                aria-label="Ignore meeting"
                title="Ignore meeting"
                className="w-8 h-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              >
                <EyeOff className="w-[18px] h-[18px]" />
              </Button>
            )}
            {onReExtract && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onReExtract}
                disabled={reExtractPending}
                aria-label="Re-extract"
                title="Re-extract"
                className="w-8 h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              >
                <RefreshCw className={cn("w-[18px] h-[18px]", reExtractPending && "animate-spin")} />
              </Button>
            )}
            {artifact && (
              <Button
                variant="ghost"
                size="icon"
                onClick={copySummary}
                aria-label="Copy summary"
                title="Copy summary"
                className="w-8 h-8 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10"
              >
                <Clipboard className="w-[18px] h-[18px]" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {artifact ? (
          <ArtifactView artifact={artifact} completions={completions} onComplete={onComplete} onUncomplete={onUncomplete} mentionStats={mentionStats} onMentionClick={onMentionClick} />
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
