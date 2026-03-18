import React, { useMemo, useState } from "react";
import { Pencil, Clipboard, ReceiptText } from "lucide-react";
import type { ClientActionItem, EditActionItemFields } from "../../../electron/channels.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { EditActionItemDialog } from "./EditActionItemDialog.js";
import { FilterBar } from "./shared/filter-bar.js";
import { GroupHeader } from "./shared/group-header.js";

type ActionGroupBy = "priority" | "series" | "owner" | "requester" | "intent" | "day" | "week";

const GROUP_MODES: { value: ActionGroupBy; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "series", label: "Series" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "owner", label: "Owner" },
  { value: "requester", label: "Requester" },
  { value: "intent", label: "Intent" },
];

interface ClientActionItemsViewProps {
  clientName: string | null;
  items: ClientActionItem[];
  onPreviewMeeting?: (meetingId: string) => void;
  onComplete?: (meetingId: string, itemIndex: number) => void;
  onUncomplete?: (meetingId: string, itemIndex: number) => void;
  onEditActionItem?: (meetingId: string, itemIndex: number, fields: EditActionItemFields) => void;
  onAddActionItem?: (meetingId: string, fields: EditActionItemFields) => void;
}

function weekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatWeekLabel(startStr: string): string {
  const start = new Date(startStr + "T12:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}, ${start.getFullYear()}`;
}

function groupKey(item: ClientActionItem, mode: ActionGroupBy): string {
  if (mode === "priority") return item.priority;
  if (mode === "series") return item.meeting_title;
  if (mode === "owner") return item.owner || "(unassigned)";
  if (mode === "intent") return item.canonical_id ?? `${item.meeting_id}:${item.item_index}`;
  if (mode === "day") return item.meeting_date.slice(0, 10);
  if (mode === "week") return weekStart(item.meeting_date);
  return item.requester || "(unassigned)";
}

function groupLabel(key: string, mode: ActionGroupBy, items: ClientActionItem[]): string {
  if (mode === "priority") return key === "critical" ? "Critical" : "Normal";
  if (mode === "intent") return items[0]?.description ?? key;
  if (mode === "day") return formatDateLabel(key);
  if (mode === "week") return formatWeekLabel(key);
  return key;
}

function groupItems(items: ClientActionItem[], mode: ActionGroupBy): { key: string; label: string; items: ClientActionItem[] }[] {
  const map = new Map<string, ClientActionItem[]>();
  for (const item of items) {
    const k = groupKey(item, mode);
    const arr = map.get(k);
    if (arr) arr.push(item);
    else map.set(k, [item]);
  }
  const entries = [...map.entries()].map(([k, v]) => ({ key: k, label: groupLabel(k, mode, v), items: v }));
  if (mode === "priority") {
    entries.sort((a, b) => (a.key === "critical" ? -1 : 1) - (b.key === "critical" ? -1 : 1));
  } else if (mode === "intent") {
    entries.sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label));
  } else if (mode === "day" || mode === "week") {
    entries.sort((a, b) => b.key.localeCompare(a.key));
  } else {
    entries.sort((a, b) => a.label.localeCompare(b.label));
  }
  return entries;
}

export function ClientActionItemsView({ clientName, items, onPreviewMeeting, onComplete, onUncomplete, onEditActionItem, onAddActionItem }: ClientActionItemsViewProps) {
  const [completedItems, setCompletedItems] = useState<ClientActionItem[]>([]);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [seriesFilter, setSeriesFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [requesterFilter, setRequesterFilter] = useState("");
  const [groupBy, setGroupBy] = useState<ActionGroupBy>("priority");
  const [sortBy, setSortBy] = useState<"priority" | "alphabetical" | "owner" | "meeting">("priority");
  const [editDialog, setEditDialog] = useState<{ meetingId: string; itemIndex: number; item: ClientActionItem } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const uniqueMeetings = useMemo(() => {
    const seen = new Map<string, { title: string; date: string }>();
    for (const i of items) {
      if (!seen.has(i.meeting_id)) seen.set(i.meeting_id, { title: i.meeting_title, date: i.meeting_date });
    }
    return [...seen.entries()].map(([id, { title, date }]) => ({ id, title, date }));
  }, [items]);

  function handleComplete(meetingId: string, itemIndex: number) {
    const item = items.find((i) => i.meeting_id === meetingId && i.item_index === itemIndex);
    if (item) setCompletedItems((prev) => [...prev, item]);
    onComplete?.(meetingId, itemIndex);
  }

  function handleUncomplete(meetingId: string, itemIndex: number) {
    setCompletedItems((prev) => prev.filter((i) => !(i.meeting_id === meetingId && i.item_index === itemIndex)));
    onUncomplete?.(meetingId, itemIndex);
  }

  if (!clientName) {
    return (
      <div data-testid="client-action-items-view" className="flex flex-col h-full p-4">
        <p className="text-muted-foreground text-sm">Select a client to view action items</p>
      </div>
    );
  }

  const seriesOptions = [...new Set(items.map((i) => i.meeting_title))].sort();
  const ownerOptions = [...new Set(items.map((i) => i.owner).filter(Boolean))].sort();
  const requesterOptions = [...new Set(items.map((i) => i.requester).filter(Boolean))].sort();

  const filtered = items.filter((i) =>
    (!seriesFilter || i.meeting_title === seriesFilter)
    && (!priorityFilter || i.priority === priorityFilter)
    && (!ownerFilter || i.owner === ownerFilter)
    && (!requesterFilter || i.requester === requesterFilter),
  );

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (sortBy === "priority") {
      const p = (i: ClientActionItem) => i.priority === "critical" ? 0 : 1;
      return p(a) - p(b) || a.description.localeCompare(b.description);
    }
    if (sortBy === "alphabetical") return a.description.localeCompare(b.description);
    if (sortBy === "owner") return (a.owner ?? "").localeCompare(b.owner ?? "") || a.description.localeCompare(b.description);
    return a.meeting_title.localeCompare(b.meeting_title) || a.description.localeCompare(b.description);
  });

  const groups = groupItems(sortedFiltered, groupBy);

  return (
    <div data-testid="client-action-items-view" className="flex flex-col h-full overflow-auto">
      <div className="shrink-0 px-4 py-3 border-b border-border flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold">{clientName}</h2>
          <p className="text-xs text-muted-foreground">{items.length} open items</p>
        </div>
        {onAddActionItem && (
          <button
            aria-label="Add action item"
            className="shrink-0 mt-0.5 px-2 py-1 text-xs border border-border rounded bg-background hover:bg-secondary cursor-pointer"
            onClick={() => setAddDialogOpen(true)}
          >
            + Add
          </button>
        )}
      </div>

      <div className="shrink-0 px-4 py-2 border-b border-[var(--color-line)]">
        <FilterBar
          groupBy={{
            label: "Group",
            value: GROUP_MODES.find((m) => m.value === groupBy)?.label ?? "Priority",
            options: GROUP_MODES.map((m) => m.label),
            onChange: (v) => {
              const mode = GROUP_MODES.find((m) => m.label === v);
              if (mode) setGroupBy(mode.value);
            },
          }}
          sortBy={{
            label: "Sort",
            value: sortBy === "priority" ? "Priority" : sortBy === "alphabetical" ? "A–Z" : sortBy === "owner" ? "Owner" : "Meeting",
            options: ["Priority", "A–Z", "Owner", "Meeting"],
            onChange: (v) => {
              const map: Record<string, typeof sortBy> = { "Priority": "priority", "A–Z": "alphabetical", "Owner": "owner", "Meeting": "meeting" };
              setSortBy(map[v] ?? "priority");
            },
          }}
          filters={[
            { key: "series", label: "Series", value: seriesFilter || "All", options: ["All", ...seriesOptions], onChange: (v) => setSeriesFilter(v === "All" ? "" : v) },
            { key: "priority", label: "Priority", value: priorityFilter || "All", options: ["All", "critical", "normal"], onChange: (v) => setPriorityFilter(v === "All" ? "" : v) },
            { key: "owner", label: "Owner", value: ownerFilter || "All", options: ["All", ...ownerOptions], onChange: (v) => setOwnerFilter(v === "All" ? "" : v) },
            { key: "requester", label: "Requester", value: requesterFilter || "All", options: ["All", ...requesterOptions], onChange: (v) => setRequesterFilter(v === "All" ? "" : v) },
          ]}
        />
      </div>

      <div className="flex flex-col">
        {groups.map((group) => (
          <div key={group.key} data-testid="action-group">
            <GroupHeader
              label={group.label}
              variant={groupBy === "priority" && group.key === "critical" ? "priority" : "default"}
              meta={groupBy === "intent" && (group.items[0]?.total_mentions ?? 0) > 1 ? `raised ${group.items[0].total_mentions}×` : undefined}
            />
            {group.items.map((item) => (
              <ActionItemCard key={`${item.meeting_id}:${item.item_index}`} item={item} onPreviewMeeting={onPreviewMeeting} onComplete={handleComplete} onEdit={onEditActionItem ? (i) => setEditDialog({ meetingId: i.meeting_id, itemIndex: i.item_index, item: i }) : undefined} />
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm px-4 py-2">No open action items.</p>
        )}

        {completedItems.length > 0 && (
          <div
            data-testid="completed-section"
            data-open={String(completedOpen)}
            className="mt-2"
          >
            <button
              className="w-full flex items-center gap-2 text-xs font-semibold text-muted-foreground px-4 py-1 hover:text-foreground transition-colors"
              onClick={() => setCompletedOpen((o) => !o)}
              aria-label={`Completed (${completedItems.length})`}
            >
              <span>{completedOpen ? "▾" : "▸"}</span>
              <span>Completed</span>
              <span className="text-muted-foreground/70">({completedItems.length})</span>
            </button>
            {completedOpen && (
              <div data-testid="completed-items-list" className="flex flex-col mt-1">
                {completedItems.map((item) => (
                  <ActionItemCard
                    key={`done:${item.meeting_id}:${item.item_index}`}
                    item={item}
                    onPreviewMeeting={onPreviewMeeting}
                    onUncomplete={handleUncomplete}
                    completed
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <EditActionItemDialog
        open={editDialog !== null}
        onOpenChange={(open) => { if (!open) setEditDialog(null); }}
        onSave={(fields) => { if (editDialog) { onEditActionItem?.(editDialog.meetingId, editDialog.itemIndex, fields); setEditDialog(null); } }}
        item={editDialog ? { description: editDialog.item.description, owner: editDialog.item.owner ?? "", requester: editDialog.item.requester ?? "", due_date: editDialog.item.due_date ?? null, priority: editDialog.item.priority ?? "normal" } : null}
        owners={ownerOptions}
        requesters={requesterOptions}
      />
      <EditActionItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={(fields, meetingId) => { if (meetingId) onAddActionItem?.(meetingId, fields); setAddDialogOpen(false); }}
        item={null}
        mode="add"
        meetings={uniqueMeetings}
        owners={ownerOptions}
        requesters={requesterOptions}
      />
    </div>
  );
}

function ActionItemCard({ item, onPreviewMeeting, onComplete, onUncomplete, onEdit, completed = false }: { item: ClientActionItem; onPreviewMeeting?: (id: string) => void; onComplete?: (meetingId: string, itemIndex: number) => void; onUncomplete?: (meetingId: string, itemIndex: number) => void; onEdit?: (item: ClientActionItem) => void; completed?: boolean }) {
  return (
    <div className={`px-4 py-2 border-b border-border flex items-start gap-2 text-sm transition-colors hover:bg-secondary/60 active:bg-secondary/80${completed ? " opacity-50" : ""}`}>
      <input
        type="checkbox"
        className="mt-0.5 shrink-0 cursor-pointer"
        checked={completed}
        onChange={completed ? () => onUncomplete?.(item.meeting_id, item.item_index) : () => onComplete?.(item.meeting_id, item.item_index)}
      />
      {onPreviewMeeting && (
        <button
          onClick={() => onPreviewMeeting(item.meeting_id)}
          aria-label={`View details for ${item.meeting_title}`}
          className="mt-0.5 shrink-0 inline-flex items-center bg-transparent border-0 cursor-pointer p-0 text-muted-foreground hover:text-foreground"
        >
          <ReceiptText className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      )}
      {onEdit && !completed && (
        <button
          onClick={() => onEdit(item)}
          aria-label={`Edit item ${item.meeting_id}:${item.item_index}`}
          className="mt-0.5 shrink-0 inline-flex items-center bg-transparent border-0 cursor-pointer p-0 text-foreground hover:text-foreground"
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      )}
      {item.short_id && (
        <button
          onClick={() => navigator.clipboard.writeText(item.short_id!)}
          aria-label={`Copy ${item.short_id}`}
          className="shrink-0 mt-0.5 inline-flex items-center gap-0.5 bg-transparent border-0 cursor-pointer p-0 text-muted-foreground hover:text-foreground"
        >
          <span className="font-mono text-[0.65rem]">{item.short_id}</span>
          <Clipboard className="w-3 h-3" />
        </button>
      )}
      {item.priority === "critical" && !completed && (
        <Badge variant="destructive" className="shrink-0">CRITICAL</Badge>
      )}
      <span className="flex-1 leading-snug">
        <span className={completed ? "line-through" : ""}>{item.description}</span>
        <span className="ml-1.5 text-xs text-muted-foreground">
          {" — "}
          <button
            className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-xs text-muted-foreground"
            onClick={() => onPreviewMeeting?.(item.meeting_id)}
          >
            {item.meeting_title}
          </button>
          {" · "}{item.owner}{item.requester ? ` · ${item.requester}` : ""}
        </span>
      </span>
    </div>
  );
}
