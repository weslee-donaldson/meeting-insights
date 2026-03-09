import React, { useState } from "react";
import type { ClientActionItem } from "../../../electron/channels.js";

interface ClientActionItemsViewProps {
  clientName: string | null;
  items: ClientActionItem[];
  onPreviewMeeting?: (meetingId: string) => void;
  onComplete?: (meetingId: string, itemIndex: number) => void;
}

export function ClientActionItemsView({ clientName, items, onPreviewMeeting, onComplete }: ClientActionItemsViewProps) {
  const [completedItems, setCompletedItems] = useState<ClientActionItem[]>([]);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [seriesFilter, setSeriesFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [requesterFilter, setRequesterFilter] = useState("");

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

  const criticalItems = filtered.filter((i) => i.priority === "critical");
  const normalItems = filtered.filter((i) => i.priority === "normal");

  return (
    <div data-testid="client-action-items-view" className="flex flex-col h-full overflow-auto">
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{clientName}</h2>
        <p className="text-xs text-muted-foreground">{items.length} open items</p>
      </div>

      <div className="shrink-0 px-4 py-2 flex flex-wrap gap-1 border-b border-border">
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

      <div className="flex flex-col">
        {criticalItems.map((item) => (
          <ActionItemCard key={`${item.meeting_id}:${item.item_index}`} item={item} onPreviewMeeting={onPreviewMeeting} onComplete={handleComplete} />
        ))}
        {normalItems.map((item) => (
          <ActionItemCard key={`${item.meeting_id}:${item.item_index}`} item={item} onPreviewMeeting={onPreviewMeeting} onComplete={handleComplete} />
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
    </div>
  );
}

function ActionItemCard({ item, onPreviewMeeting, onComplete, completed = false }: { item: ClientActionItem; onPreviewMeeting?: (id: string) => void; onComplete?: (meetingId: string, itemIndex: number) => void; completed?: boolean }) {
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
      </span>
    </div>
  );
}
