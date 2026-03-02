import React from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Badge } from "./ui/badge.js";
import type { ItemHistoryEntry } from "../../../electron/channels.js";

interface ItemHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  itemText: string;
  history: ItemHistoryEntry[];
  onSelectMeeting?: (meetingId: string) => void;
}

export function ItemHistoryDialog({ open, onClose, itemText, history, onSelectMeeting }: ItemHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>{itemText}</DialogTitle>
        <ScrollArea maxHeight={300}>
          <div className="flex flex-col gap-2">
            {history.map((entry, i) => (
              <button
                key={entry.meeting_id}
                onClick={() => onSelectMeeting?.(entry.meeting_id)}
                className="flex items-center gap-2 text-left text-sm px-2 py-1.5 rounded hover:bg-accent bg-transparent border-0 cursor-pointer text-foreground"
              >
                <div className="flex-1 flex flex-col">
                  <span className="font-medium">{entry.meeting_title}</span>
                  <span className="text-xs text-muted-foreground">{entry.meeting_date.slice(0, 10)}</span>
                </div>
                {i === 0 && <Badge variant="secondary">First mentioned</Badge>}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
