import React, { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import type { ClientActionItem, EditActionItemFields } from "../../../electron/channels.js";
import { Button } from "./ui/button.js";
import { EditActionItemDialog } from "./EditActionItemDialog.js";

type ActionGroupBy = "priority" | "series" | "owner" | "requester" | "intent";

const GROUP_MODES: { value: ActionGroupBy; label: string }[] = [
  { value: "priority", label: "Priority" },
  { value: "series", label: "Series" },
  { value: "owner", label: "Owner" },
  { value: "requester", label: "Requester" },
  { value: "intent", label: "Intent" },
];

interface ClientActionItemsViewProps {
  clientName: string | null;
  items: ClientActionItem[];
  onPreviewMeeting?: (meetingId: string) => void;
  onComplete?: (meetingId: string, itemIndex: number) => void;
  onEditActionItem?: (meetingId: string, itemIndex: number, fields: EditActionItemFields) => void;
}

function groupKey(item: ClientActionItem, mode: ActionGroupBy): string {
  if (mode === "priority") return item.priority;
  if (mode === "series") return item.meeting_title;
  if (mode === "owner") return item.owner || "(unassigned)";
  if (mode === "intent") return item.canonical_id ?? `${item.meeting_id}:${item.item_index}`;
  return item.requester || "(unassigned)";
}

function groupLabel(key: string, mode: ActionGroupBy, items: ClientActionItem[]): string {
  if (mode === "priority") return key === "critical" ? "Critical" : "Normal";
  if (mode === "intent") return items[0]?.description ?? key;
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
  } else {
    entries.sort((a, b) => a.label.localeCompare(b.label));
  }
  return entries;
}

export function ClientActionItemsView({ clientName, items, onPreviewMeeting, onComplete, onEditActionItem }: ClientActionItemsViewProps) {
  const [completedItems, setCompletedItems] = useState<ClientActionItem[]>([]);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [seriesFilter, setSeriesFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [requesterFilter, setRequesterFilter] = useState("");
  const [groupBy, setGroupBy] = useState<ActionGroupBy>("priority");
  const [editDialog, setEditDialog] = useState<{ meetingId: string; itemIndex: number; item: ClientActionItem } | null>(null);

  function handleComplete(meetingId: string, itemIndex: number) {
    const item = items.find((i) => i.meeting_id === meetingId && i.item_index === itemIndex);
    if (item) setCompletedItems((prev) => [...prev, item]);
    onComplete?.(meetingId, itemIndex);
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

  const groups = groupItems(filtered, groupBy);

  return (
    <div data-testid="client-action-items-view" className="flex flex-col h-full overflow-auto">
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{clientName}</h2>
        <p className="text-xs text-muted-foreground">{items.length} open items</p>
      </div>

      <div className="shrink-0 px-4 py-2 flex flex-col gap-1.5 border-b border-border">
        <div className="flex flex-wrap gap-1">
          <select data-testid="action-series-filter" value={seriesFilter} onChange={(e) => setSeriesFilter(e.target.value)} className="h-7 px-2 text-xs border border-border rounded-md bg-background">
            <option value="">All Series</option>
            {seriesOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select data-testid="action-priority-filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-7 px-2 text-xs border border-border rounded-md bg-background">
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="normal">Normal</option>
          </select>
          <select data-testid="action-owner-filter" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="h-7 px-2 text-xs border border-border rounded-md bg-background">
            <option value="">All Owners</option>
            {ownerOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select data-testid="action-requester-filter" value={requesterFilter} onChange={(e) => setRequesterFilter(e.target.value)} className="h-7 px-2 text-xs border border-border rounded-md bg-background">
            <option value="">All Requesters</option>
            {requesterOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div data-testid="action-group-by" className="flex items-center gap-1.5">
          <span className="text-xs text-foreground font-semibold">Group:</span>
          {GROUP_MODES.map(({ value, label }) => (
            <Button
              key={value}
              variant={groupBy === value ? "default" : "secondary"}
              size="sm"
              className="rounded-full h-auto px-3 py-0.5 text-xs"
              onClick={() => setGroupBy(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {groups.map((group) => (
          <div key={group.key} data-testid="action-group">
            <div className="px-4 py-1.5 bg-secondary/60 flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{group.label}</span>
              {groupBy === "intent" && (group.items[0]?.total_mentions ?? 0) > 1 && (
                <span className="text-[0.65rem] text-muted-foreground">raised {group.items[0].total_mentions}×</span>
              )}
            </div>
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
      />
    </div>
  );
}

function ActionItemCard({ item, onPreviewMeeting, onComplete, onEdit, completed = false }: { item: ClientActionItem; onPreviewMeeting?: (id: string) => void; onComplete?: (meetingId: string, itemIndex: number) => void; onEdit?: (item: ClientActionItem) => void; completed?: boolean }) {
  return (
    <div className={`px-4 py-2 border-b border-border flex items-start gap-2 text-sm transition-colors hover:bg-secondary/60 active:bg-secondary/80${completed ? " opacity-50" : ""}`}>
      <input
        type="checkbox"
        className="mt-0.5 shrink-0 cursor-pointer"
        checked={completed}
        readOnly={completed}
        onChange={completed ? undefined : () => onComplete?.(item.meeting_id, item.item_index)}
      />
      {item.priority === "critical" && !completed && (
        <span className="shrink-0 text-[0.6rem] font-bold px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">
          CRITICAL
        </span>
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
        {onEdit && !completed && (
          <button
            onClick={() => onEdit(item)}
            aria-label={`Edit item ${item.meeting_id}:${item.item_index}`}
            className="ml-1 inline-flex items-center bg-transparent border-0 cursor-pointer p-0 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </span>
    </div>
  );
}
