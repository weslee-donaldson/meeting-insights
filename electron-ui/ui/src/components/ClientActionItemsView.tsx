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

  const criticalItems = items.filter((i) => i.priority === "critical");
  const normalItems = items.filter((i) => i.priority === "normal");

  return (
    <div data-testid="client-action-items-view" className="flex flex-col h-full overflow-auto">
      <div className="shrink-0 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{clientName}</h2>
        <p className="text-xs text-muted-foreground">{items.length} open items</p>
      </div>

      <div className="flex flex-col gap-2 p-4">
        {criticalItems.map((item) => (
          <ActionItemCard key={`${item.meeting_id}:${item.item_index}`} item={item} onPreviewMeeting={onPreviewMeeting} onComplete={handleComplete} />
        ))}
        {normalItems.map((item) => (
          <ActionItemCard key={`${item.meeting_id}:${item.item_index}`} item={item} onPreviewMeeting={onPreviewMeeting} onComplete={handleComplete} />
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm">No open action items.</p>
        )}

        {completedItems.length > 0 && (
          <div
            data-testid="completed-section"
            data-open={String(completedOpen)}
            className="mt-2"
          >
            <button
              className="w-full flex items-center gap-2 text-xs font-semibold text-muted-foreground py-1 hover:text-foreground transition-colors"
              onClick={() => setCompletedOpen((o) => !o)}
              aria-label={`Completed (${completedItems.length})`}
            >
              <span>{completedOpen ? "▾" : "▸"}</span>
              <span>Completed</span>
              <span className="text-muted-foreground/70">({completedItems.length})</span>
            </button>
            {completedOpen && (
              <div data-testid="completed-items-list" className="flex flex-col gap-2 mt-1">
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
    <div className={`rounded-md border border-border p-3 flex flex-col gap-1.5 text-sm${completed ? " opacity-50" : ""}`}>
      <div className="flex items-start gap-2">
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
        <span className={`flex-1 leading-snug${completed ? " line-through" : ""}`}>{item.description}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap pl-5">
        <span className="font-medium text-foreground">{item.owner}</span>
        <button
          className="hover:underline cursor-pointer bg-transparent border-0 p-0 text-xs text-muted-foreground"
          onClick={() => onPreviewMeeting?.(item.meeting_id)}
        >
          {item.meeting_title}
        </button>
        <span>{item.meeting_date.slice(0, 10)}</span>
      </div>
    </div>
  );
}
