import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog.js";
import { Button } from "./ui/button.js";
import type { CreateMeetingRequest } from "../../../electron/channels.js";

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: string[];
  onSubmit: (req: CreateMeetingRequest) => void;
}

export function NewMeetingDialog({ open, onOpenChange, clients, onSubmit }: NewMeetingDialogProps) {
  const [clientName, setClientName] = useState(clients[0] ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [rawTranscript, setRawTranscript] = useState("");

  const isValid = title.trim().length > 0 && rawTranscript.trim().length > 0 && date.length > 0;

  function handleImport() {
    onSubmit({ clientName, date, title: title.trim(), rawTranscript: rawTranscript.trim() });
    onOpenChange(false);
    setTitle("");
    setRawTranscript("");
    setClientName(clients[0] ?? "");
    setDate(new Date().toISOString().slice(0, 10));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[480px]" aria-describedby={undefined}>
        <DialogTitle>New Meeting</DialogTitle>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Client
            <select
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            >
              {clients.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Meeting title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Sync"
              className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Transcript
            <textarea
              value={rawTranscript}
              onChange={(e) => setRawTranscript(e.target.value)}
              placeholder="Paste transcript here..."
              className="resize-y min-h-[120px] rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={!isValid} onClick={handleImport}>Import</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
