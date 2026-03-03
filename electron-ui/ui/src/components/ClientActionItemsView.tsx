import React from "react";

interface ClientActionItemsViewProps {
  clientName: string | null;
  onPreviewMeeting?: (meetingId: string) => void;
}

export function ClientActionItemsView({ clientName }: ClientActionItemsViewProps) {
  return (
    <div data-testid="client-action-items-view" className="flex flex-col h-full p-4">
      <p className="text-muted-foreground text-sm">
        {clientName ? `${clientName} — action items` : "Select a client to view action items"}
      </p>
    </div>
  );
}
