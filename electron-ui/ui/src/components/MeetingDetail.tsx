import React, { useCallback, useMemo, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, ChevronDown, Clipboard, RefreshCw, UserPen, EyeOff } from "lucide-react";
import type { MeetingRow, Artifact, ActionItemCompletion, MentionStat } from "../../../electron/channels.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "./ui/dialog.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { cn } from "../lib/utils.js";
import { useArtifactSearch } from "../hooks/useArtifactSearch.js";
import { HighlightText } from "./HighlightText.js";

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
  searchQuery?: string;
  threadTags?: Array<{ thread_id: string; title: string; shorthand: string }>;
  onThreadClick?: (threadId: string) => void;
  milestoneTags?: Array<{ milestone_id: string; title: string; target_date: string | null; status: string }>;
  onMilestoneClick?: (milestoneId: string) => void;
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

function ItemList({ items, icon, iconColor, highlightTerms = [] }: { items: string[]; icon: string; iconColor?: string; highlightTerms?: string[] }) {
  return (
    <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
      {items.map((d, i) => (
        <li key={i} className="flex gap-2.5 items-start">
          <span className="shrink-0 mt-px text-[0.8rem] text-muted-foreground" style={iconColor ? { color: iconColor } : undefined}>{icon}</span>
          <span className="leading-[1.6]">{highlightTerms.length > 0 ? <HighlightText text={d} terms={highlightTerms} /> : d}</span>
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

function ArtifactView({ artifact, completions = [], onComplete, onUncomplete, mentionStats = [], onMentionClick, searchQuery }: { artifact: Artifact; completions?: ActionItemCompletion[]; onComplete?: (index: number, note: string) => void; onUncomplete?: (index: number) => void; mentionStats?: MentionStat[]; onMentionClick?: (canonicalId: string, itemText: string) => void; searchQuery?: string }) {
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

  const [sectionStates, setSectionStates] = useState<Record<string, boolean | undefined>>({
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
      const collapsed: Record<string, false> = {};
      for (const k of SECTION_KEYS) collapsed[k] = false;
      setSectionStates(collapsed);
    } else {
      setSectionStates({
        Summary: true, Decisions: true, "Action Items": true,
        "Open Questions": true, Risks: true, "Proposed Features": true,
        "Additional Notes": true,
      });
    }
  }, [allExpanded]);

  const { matchedTerms, matchesBySection } = useArtifactSearch(artifact, searchQuery ?? "");

  const effectiveOpen = useCallback((key: string) => {
    const explicit = sectionStates[key];
    if (explicit !== undefined) return explicit;
    return (matchesBySection[key] ?? 0) > 0;
  }, [sectionStates, matchesBySection]);

  const allEmpty = !artifact.summary
    && artifact.decisions.length === 0
    && artifact.action_items.length === 0
    && artifact.open_questions.length === 0
    && artifact.risk_items.length === 0
    && artifact.proposed_features.length === 0
    && artifact.additional_notes.length === 0;

  if (allEmpty) {
    return (
      <div className="px-4 py-6 text-sm text-muted-foreground" data-testid="empty-artifact-message">
        No meeting details were extracted. Try re-extracting or check the transcript format.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 pt-2 pb-1">
        <Button variant="outline" size="sm" onClick={toggleAllSections} aria-label={allExpanded ? "Collapse all" : "Expand all"}
          className="h-auto px-2 py-0.5 text-[0.7rem]">
          {allExpanded ? "Collapse all" : "Expand all"}
        </Button>
      </div>
      <Section title="Summary" isEmpty={!artifact.summary} open={effectiveOpen("Summary")} onOpenChange={(o) => setSectionOpen("Summary", o)}
        headerExtra={matchesBySection["Summary"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Summary"]} match{matchesBySection["Summary"] > 1 ? "es" : ""}</span> : undefined}
      >
        <p className="leading-[1.65] text-secondary-foreground m-0 whitespace-pre-wrap"><HighlightText text={artifact.summary} terms={matchedTerms} /></p>
      </Section>

      <Section
        title="Decisions"
        isEmpty={artifact.decisions.length === 0}
        open={effectiveOpen("Decisions")}
        onOpenChange={(o) => setSectionOpen("Decisions", o)}
        headerExtra={
          <div className="flex items-center gap-2">
            {matchesBySection["Decisions"] && <span className="text-[0.65rem] text-yellow-500">{matchesBySection["Decisions"]} match{matchesBySection["Decisions"] > 1 ? "es" : ""}</span>}
            {decisionPeople.length > 0 && (
              <select
                value={decisionFilter}
                onChange={(e) => setDecisionFilter(e.target.value)}
                aria-label="Filter decisions by person"
                className="text-[0.7rem] bg-transparent border border-border rounded px-1.5 py-0.5 text-muted-foreground"
              >
                <option value="">Person: All</option>
                {decisionPeople.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            )}
          </div>
        }
      >
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {filteredDecisions.map((d, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span className="shrink-0 mt-px text-[0.8rem] text-muted-foreground">—</span>
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span className="leading-[1.6]"><HighlightText text={d.text} terms={matchedTerms} /></span>
                {d.decided_by && <Badge variant="secondary">{d.decided_by}</Badge>}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Action Items"
        isEmpty={artifact.action_items.length === 0}
        open={effectiveOpen("Action Items")}
        onOpenChange={(o) => setSectionOpen("Action Items", o)}
        headerExtra={
          <div className="flex items-center gap-2">
            {matchesBySection["Action Items"] && <span className="text-[0.65rem] text-yellow-500">{matchesBySection["Action Items"]} match{matchesBySection["Action Items"] > 1 ? "es" : ""}</span>}
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
                <span className="text-sm leading-[1.5]">
                  {isCompleted ? (
                    <button
                      onClick={() => setNoteDialog({ index: i, note: existingNote })}
                      className="text-left leading-[1.5] line-through bg-transparent border-0 cursor-pointer p-0 text-inherit"
                    >
                      <HighlightText text={a.description} terms={matchedTerms} />
                    </button>
                  ) : (
                    <>
                      {a.priority === "critical" && <Badge variant="destructive" className="inline mr-1 text-[0.65rem]">CRITICAL</Badge>}
                      <HighlightText text={a.description} terms={matchedTerms} />
                    </>
                  )}
                  {(a.owner || a.requester || a.due_date || mention) && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {a.owner && <span> · {a.owner}</span>}
                      {a.requester && <span> · {a.requester}</span>}
                      {a.due_date && <span> · {a.due_date}</span>}
                      {mention && (
                        <span>
                          {" · "}
                          <button
                            className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-xs text-muted-foreground"
                            onClick={() => onMentionClick?.(mention.canonical_id, a.description)}
                          >
                            {mention.mention_count}x
                          </button>
                        </span>
                      )}
                    </span>
                  )}
                </span>
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

      <Section title="Open Questions" isEmpty={artifact.open_questions.length === 0} open={effectiveOpen("Open Questions")} onOpenChange={(o) => setSectionOpen("Open Questions", o)}
        headerExtra={matchesBySection["Open Questions"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Open Questions"]} match{matchesBySection["Open Questions"] > 1 ? "es" : ""}</span> : undefined}
      >
        <ItemList items={artifact.open_questions} icon="?" iconColor="var(--color-text-secondary)" highlightTerms={matchedTerms} />
      </Section>

      <Section title="Risks" isEmpty={artifact.risk_items.length === 0} open={effectiveOpen("Risks")} onOpenChange={(o) => setSectionOpen("Risks", o)}
        headerExtra={matchesBySection["Risks"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Risks"]} match{matchesBySection["Risks"] > 1 ? "es" : ""}</span> : undefined}
      >
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {artifact.risk_items.map((r, i) => (
            <li key={i} className="flex flex-wrap gap-x-1.5 gap-y-0.5 items-baseline">
              <span className="shrink-0 mt-px text-[0.8rem]" style={{ color: "var(--color-danger)" }}>⚠</span>
              <span className="leading-[1.6]"><HighlightText text={r.description} terms={matchedTerms} /></span>
              <Badge variant="muted">{r.category}</Badge>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Proposed Features" isEmpty={artifact.proposed_features.length === 0} open={effectiveOpen("Proposed Features")} onOpenChange={(o) => setSectionOpen("Proposed Features", o)}
        headerExtra={matchesBySection["Proposed Features"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Proposed Features"]} match{matchesBySection["Proposed Features"] > 1 ? "es" : ""}</span> : undefined}
      >
        <ItemList items={artifact.proposed_features} icon="✦" iconColor="var(--color-accent)" highlightTerms={matchedTerms} />
      </Section>

      <Section title="Additional Notes" isEmpty={artifact.additional_notes.length === 0} open={effectiveOpen("Additional Notes")} onOpenChange={(o) => setSectionOpen("Additional Notes", o)}
        headerExtra={matchesBySection["Additional Notes"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Additional Notes"]} match{matchesBySection["Additional Notes"] > 1 ? "es" : ""}</span> : undefined}
      >
        {artifact.additional_notes.map((note, i) => {
          const entries = Object.entries(note);
          const header = entries.find(([, v]) => typeof v === "string");
          return (
            <div key={i} className="flex flex-col gap-1">
              {header && (
                <div className="font-medium text-secondary-foreground">
                  <HighlightText text={String(header[1])} terms={matchedTerms} />
                </div>
              )}
              {entries
                .filter(([k]) => k !== header?.[0])
                .map(([k, v]) => {
                  const items = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
                  return items.map((item, j) => (
                    <div key={`${k}-${j}`} className="flex gap-2.5 pl-2">
                      <span className="text-muted-foreground">•</span>
                      <span><HighlightText text={String(item)} terms={matchedTerms} /></span>
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

export function MeetingDetail({ meeting, meetings, artifact, onReExtract, reExtractPending, clients, onReassignClient, onIgnore, completions, onComplete, onUncomplete, mentionStats, onMentionClick, artifactLoading, searchQuery, threadTags, onThreadClick, milestoneTags, onMilestoneClick }: MeetingDetailProps) {
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
            <ArtifactView artifact={artifact} completions={completions} onComplete={onComplete} onUncomplete={onUncomplete} searchQuery={searchQuery} />
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
            {threadTags && threadTags.length > 0 && (
              <div className="text-xs mt-1 text-muted-foreground flex gap-2 items-center">
                <span className="text-muted-foreground">Threads:</span>
                {threadTags.map((tag) => (
                  <Badge
                    key={tag.thread_id}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onThreadClick?.(tag.thread_id); }}
                  >
                    {tag.shorthand}
                  </Badge>
                ))}
              </div>
            )}
            {milestoneTags && milestoneTags.length > 0 && (
              <div className="text-xs mt-1 text-muted-foreground flex gap-2 items-center">
                <span className="text-muted-foreground">Milestones:</span>
                {milestoneTags.map((tag) => (
                  <Badge
                    key={tag.milestone_id}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onMilestoneClick?.(tag.milestone_id); }}
                  >
                    {tag.title}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          {onReassignClient && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setReassignSelection((clients ?? [])[0] ?? ""); setClientPickerOpen(true); }}
                aria-label="Reassign client"
                title="Reassign client"
              >
                <UserPen className="w-4 h-4 mr-1" />
                Reassign
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
              size="sm"
              variant="outline"
              onClick={onIgnore}
              aria-label="Ignore meeting"
              title="Ignore meeting"
            >
              <EyeOff className="w-4 h-4 mr-1" />
              Ignore
            </Button>
          )}
          {onReExtract && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReExtract}
              disabled={reExtractPending}
              aria-label="Re-extract"
              title="Re-extract summary, action items, and milestones"
            >
              <RefreshCw className={cn("w-4 h-4 mr-1", reExtractPending && "animate-spin")} />
              Re-extract
            </Button>
          )}
          {artifact && (
            <Button
              size="sm"
              variant="outline"
              onClick={copySummary}
              aria-label="Copy summary"
              title="Copy summary"
            >
              <Clipboard className="w-4 h-4 mr-1" />
              Copy
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {artifact ? (
          <ArtifactView artifact={artifact} completions={completions} onComplete={onComplete} onUncomplete={onUncomplete} mentionStats={mentionStats} onMentionClick={onMentionClick} searchQuery={searchQuery} />
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
