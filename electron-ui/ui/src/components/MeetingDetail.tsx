import React, { useCallback, useMemo, useState } from "react";
import { Clipboard, RefreshCw, UserPen, EyeOff, Pencil, Trash2, Paperclip } from "lucide-react";
import type { MeetingRow, Artifact, ActionItemCompletion, MentionStat } from "../../../electron/channels.js";
import type { AssetRow } from "../../../../core/assets.js";
import { useDropzone } from "react-dropzone";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "./ui/dialog.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { cn } from "../lib/utils.js";
import { useArtifactSearch } from "../hooks/useArtifactSearch.js";
import { HighlightText } from "./HighlightText.js";
import { EditActionItemDialog } from "./EditActionItemDialog.js";
import { CommandBar } from "./shared/command-bar.js";
import { SectionHeader } from "./shared/section-header.js";
import type { EditActionItemFields } from "../../../electron/channels.js";

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
  onEditActionItem?: (index: number, fields: EditActionItemFields) => void;
  assets?: AssetRow[];
  onDeleteAsset?: (assetId: string) => void;
  onUploadAsset?: (file: File) => void;
  onRename?: (newTitle: string) => void;
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

function ArtifactView({ artifact, completions = [], onComplete, onUncomplete, mentionStats = [], onMentionClick, searchQuery, onEditActionItem }: { artifact: Artifact; completions?: ActionItemCompletion[]; onComplete?: (index: number, note: string) => void; onUncomplete?: (index: number) => void; mentionStats?: MentionStat[]; onMentionClick?: (canonicalId: string, itemText: string) => void; searchQuery?: string; onEditActionItem?: (index: number, fields: EditActionItemFields) => void }) {
  const [noteDialog, setNoteDialog] = useState<{ index: number; note: string } | null>(null);
  const [editDialog, setEditDialog] = useState<{ index: number; item: Artifact["action_items"][number] } | null>(null);
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
      <SectionHeader label="Summary" isEmpty={!artifact.summary} expanded={effectiveOpen("Summary")} onExpandedChange={(o) => setSectionOpen("Summary", o)}
        filterSlot={matchesBySection["Summary"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Summary"]} match{matchesBySection["Summary"] > 1 ? "es" : ""}</span> : undefined}
      >
        <p className="leading-[1.65] text-secondary-foreground m-0 whitespace-pre-wrap"><HighlightText text={artifact.summary} terms={matchedTerms} /></p>
      </SectionHeader>

      <SectionHeader
        label="Decisions"
        isEmpty={artifact.decisions.length === 0}
        expanded={effectiveOpen("Decisions")}
        onExpandedChange={(o) => setSectionOpen("Decisions", o)}
        count={String(artifact.decisions.length)}
        filterSlot={
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
      </SectionHeader>

      <SectionHeader
        label="Action Items"
        isEmpty={artifact.action_items.length === 0}
        expanded={effectiveOpen("Action Items")}
        onExpandedChange={(o) => setSectionOpen("Action Items", o)}
        count={String(artifact.action_items.length)}
        filterSlot={
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
                {onEditActionItem && !isCompleted && (
                  <button
                    onClick={() => setEditDialog({ index: i, item: a })}
                    aria-label={`Edit item ${i}`}
                    className="shrink-0 mt-0.5 inline-flex items-center bg-transparent border-0 cursor-pointer p-0 text-foreground hover:text-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                )}
                {a.short_id && (
                  <button
                    onClick={() => navigator.clipboard.writeText(a.short_id!)}
                    aria-label={`Copy ${a.short_id}`}
                    className="shrink-0 mt-0.5 inline-flex items-center gap-0.5 bg-transparent border-0 cursor-pointer p-0 text-muted-foreground hover:text-foreground"
                  >
                    <span className="font-mono text-[0.65rem]">{a.short_id}</span>
                    <Clipboard className="w-3 h-3" />
                  </button>
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
      </SectionHeader>

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

      <EditActionItemDialog
        open={editDialog !== null}
        onOpenChange={(open) => { if (!open) setEditDialog(null); }}
        onSave={(fields) => { if (editDialog) { onEditActionItem?.(editDialog.index, fields); setEditDialog(null); } }}
        item={editDialog ? { description: editDialog.item.description, owner: editDialog.item.owner ?? "", requester: editDialog.item.requester ?? "", due_date: editDialog.item.due_date ?? null, priority: editDialog.item.priority ?? "normal" } : null}
        owners={[...new Set(artifact.action_items.map((a) => a.owner).filter(Boolean))].sort() as string[]}
        requesters={[...new Set(artifact.action_items.map((a) => a.requester).filter(Boolean))].sort() as string[]}
      />

      <SectionHeader label="Open Questions" isEmpty={artifact.open_questions.length === 0} expanded={effectiveOpen("Open Questions")} onExpandedChange={(o) => setSectionOpen("Open Questions", o)}
        filterSlot={matchesBySection["Open Questions"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Open Questions"]} match{matchesBySection["Open Questions"] > 1 ? "es" : ""}</span> : undefined}
      >
        <ItemList items={artifact.open_questions} icon="?" iconColor="var(--color-text-secondary)" highlightTerms={matchedTerms} />
      </SectionHeader>

      <SectionHeader label="Risks" isEmpty={artifact.risk_items.length === 0} expanded={effectiveOpen("Risks")} onExpandedChange={(o) => setSectionOpen("Risks", o)}
        filterSlot={matchesBySection["Risks"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Risks"]} match{matchesBySection["Risks"] > 1 ? "es" : ""}</span> : undefined}
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
      </SectionHeader>

      <SectionHeader label="Proposed Features" isEmpty={artifact.proposed_features.length === 0} expanded={effectiveOpen("Proposed Features")} onExpandedChange={(o) => setSectionOpen("Proposed Features", o)}
        filterSlot={matchesBySection["Proposed Features"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Proposed Features"]} match{matchesBySection["Proposed Features"] > 1 ? "es" : ""}</span> : undefined}
      >
        <ItemList items={artifact.proposed_features} icon="✦" iconColor="var(--color-accent)" highlightTerms={matchedTerms} />
      </SectionHeader>

      <SectionHeader label="Additional Notes" isEmpty={artifact.additional_notes.length === 0} expanded={effectiveOpen("Additional Notes")} onExpandedChange={(o) => setSectionOpen("Additional Notes", o)}
        filterSlot={matchesBySection["Additional Notes"] ? <span className="text-[0.65rem] text-yellow-500 ml-1">{matchesBySection["Additional Notes"]} match{matchesBySection["Additional Notes"] > 1 ? "es" : ""}</span> : undefined}
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
      </SectionHeader>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentsSection({ assets, onDeleteAsset, onUploadAsset }: { assets: AssetRow[]; onDeleteAsset?: (assetId: string) => void; onUploadAsset?: (file: File) => void }) {
  const onDrop = useCallback((accepted: File[]) => {
    for (const file of accepted) onUploadAsset?.(file);
  }, [onUploadAsset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: false });

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    for (const file of files) onUploadAsset?.(file);
  }, [onUploadAsset]);

  return (
    <div className="py-2" data-testid="attachments-section" onPaste={handlePaste}>
      <div className="flex items-center gap-1.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-foreground pb-1.5">
        <Paperclip className="w-3.5 h-3.5" />
        Attachments
      </div>
      {assets.length > 0 && (
        <ul className="m-0 p-0 pl-5 list-none flex flex-col gap-1 mb-2">
          {assets.map((asset) => (
            <li key={asset.id} className="flex items-center gap-2 text-sm text-secondary-foreground">
              <span className="truncate">{asset.filename}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(asset.file_size)}</span>
              {onDeleteAsset && (
                <button
                  onClick={() => onDeleteAsset(asset.id)}
                  aria-label={`Delete ${asset.filename}`}
                  className="shrink-0 bg-transparent border-0 cursor-pointer p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {onUploadAsset && (
        <div
          {...getRootProps()}
          data-testid="dropzone"
          className={cn(
            "ml-5 border border-dashed border-border rounded px-3 py-2 text-center text-xs text-muted-foreground cursor-pointer transition-colors",
            isDragActive && "border-primary bg-primary/5",
          )}
        >
          <input {...getInputProps()} />
          {isDragActive ? "Drop files here" : "Drag & drop, click to browse, or paste"}
        </div>
      )}
    </div>
  );
}

export function MeetingDetail({ meeting, meetings, artifact, onReExtract, reExtractPending, clients, onReassignClient, onIgnore, completions, onComplete, onUncomplete, mentionStats, onMentionClick, artifactLoading, searchQuery, threadTags, onThreadClick, milestoneTags, onMilestoneClick, onEditActionItem, assets, onDeleteAsset, onUploadAsset, onRename }: MeetingDetailProps) {
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [reassignSelection, setReassignSelection] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
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
            <ArtifactView artifact={artifact} completions={completions} onComplete={onComplete} onUncomplete={onUncomplete} searchQuery={searchQuery} onEditActionItem={onEditActionItem} />
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
            {editingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  aria-label="Meeting title"
                  className="flex-1 font-bold text-base bg-background border border-border rounded px-2 py-0.5"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { onRename?.(titleDraft); setEditingTitle(false); }
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                  autoFocus
                />
                <Button size="sm" aria-label="Save" onClick={() => { onRename?.(titleDraft); setEditingTitle(false); }}>Save</Button>
                <Button size="sm" variant="outline" aria-label="Cancel" onClick={() => setEditingTitle(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="font-bold text-base text-foreground leading-[1.3] flex items-center gap-1">
                {meeting.title}
                {onRename && (
                  <Button size="sm" variant="ghost" className="h-auto px-1 py-0.5" aria-label="Rename" onClick={() => { setTitleDraft(meeting.title); setEditingTitle(true); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
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
        <CommandBar
          className="mt-2"
          actions={[
            ...(onReExtract ? [{
              label: "Re-extract",
              icon: <RefreshCw className={cn("w-3.5 h-3.5", reExtractPending && "animate-spin")} />,
              onClick: onReExtract,
              variant: "primary" as const,
            }] : []),
            ...(artifact ? [{
              label: "Copy",
              icon: <Clipboard className="w-3.5 h-3.5" />,
              onClick: copySummary,
              variant: "default" as const,
            }] : []),
            ...(onReassignClient ? [{
              label: "Reassign",
              icon: <UserPen className="w-3.5 h-3.5" />,
              onClick: () => { setReassignSelection((clients ?? [])[0] ?? ""); setClientPickerOpen(true); },
              variant: "default" as const,
            }] : []),
            ...(onIgnore ? [{
              label: "Ignore",
              icon: <EyeOff className="w-3.5 h-3.5" />,
              onClick: onIgnore,
              variant: "destructive" as const,
            }] : []),
          ]}
        />
        {onReassignClient && (
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
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {((assets && assets.length > 0) || onUploadAsset) && (
          <AttachmentsSection assets={assets ?? []} onDeleteAsset={onDeleteAsset} onUploadAsset={onUploadAsset} />
        )}
        {artifact ? (
          <ArtifactView artifact={artifact} completions={completions} onComplete={onComplete} onUncomplete={onUncomplete} mentionStats={mentionStats} onMentionClick={onMentionClick} searchQuery={searchQuery} onEditActionItem={onEditActionItem} />
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
