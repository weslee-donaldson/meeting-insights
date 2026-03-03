import React from "react";
import type { ClientActionItem } from "../../../electron/channels.js";

interface ClientActionItemsViewProps {
  clientName: string | null;
  items: ClientActionItem[];
  onPreviewMeeting?: (meetingId: string) => void;
}

export function ClientActionItemsView({ clientName, items, onPreviewMeeting }: ClientActionItemsViewProps) {
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
          <ActionItemCard key={`${item.meeting_id}:${item.item_index}`} item={item} onPreviewMeeting={onPreviewMeeting} />
        ))}
        {normalItems.map((item) => (
          <ActionItemCard key={`${item.meeting_id}:${item.item_index}`} item={item} onPreviewMeeting={onPreviewMeeting} />
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm">No open action items.</p>
        )}
      </div>
    </div>
  );
}

function ActionItemCard({ item, onPreviewMeeting }: { item: ClientActionItem; onPreviewMeeting?: (id: string) => void }) {
  return (
    <div className="rounded-md border border-border p-3 flex flex-col gap-1.5 text-sm">
      <div className="flex items-start gap-2">
        {item.priority === "critical" && (
          <span className="shrink-0 text-[0.6rem] font-bold px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">
            CRITICAL
          </span>
        )}
        <span className="flex-1 leading-snug">{item.description}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
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
