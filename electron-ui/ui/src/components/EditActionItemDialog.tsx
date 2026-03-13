import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "./ui/dialog.js";
import { Button } from "./ui/button.js";
import type { EditActionItemFields } from "../../../electron/channels.js";

interface ActionItemData {
  description: string;
  owner: string;
  requester: string;
  due_date: string | null;
  priority: "critical" | "normal" | "low";
}

interface EditActionItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (fields: EditActionItemFields, meetingId?: string) => void;
  item: ActionItemData | null;
  mode?: "edit" | "add";
  meetings?: Array<{ id: string; title: string }>;
}

export function EditActionItemDialog({ open, onOpenChange, onSave, item, mode = "edit", meetings }: EditActionItemDialogProps) {
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [requester, setRequester] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"critical" | "normal" | "low">("normal");
  const [selectedMeetingId, setSelectedMeetingId] = useState("");

  useEffect(() => {
    if (open && item) {
      setDescription(item.description);
      setOwner(item.owner);
      setRequester(item.requester);
      setDueDate(item.due_date ?? "");
      setPriority(item.priority);
    }
    if (open && mode === "add") {
      setDescription("");
      setOwner("");
      setRequester("");
      setDueDate("");
      setPriority("normal");
      setSelectedMeetingId(meetings?.[0]?.id ?? "");
    }
  }, [open, item, mode, meetings]);

  const canSave = description.trim().length > 0;

  function handleSave() {
    const fields: EditActionItemFields = {
      description: description.trim(),
      owner: owner.trim(),
      requester: requester.trim(),
      due_date: dueDate || null,
      priority,
    };
    if (mode === "add") {
      onSave(fields, selectedMeetingId);
    } else {
      onSave(fields);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>{mode === "add" ? "Add Action Item" : "Edit Action Item"}</DialogTitle>
        <div className="flex flex-col gap-3 mt-2">
          {mode === "add" && meetings && (
            <label className="flex flex-col gap-1 text-sm">
              <span>Meeting</span>
              <select
                aria-label="Meeting"
                className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
              >
                {meetings.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span>Description</span>
            <textarea
              aria-label="Description"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span>Owner</span>
              <input
                aria-label="Owner"
                className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Requester</span>
              <input
                aria-label="Requester"
                className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span>Due Date</span>
              <input
                type="date"
                aria-label="Due Date"
                className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Priority</span>
              <select
                aria-label="Priority"
                className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "critical" | "normal" | "low")}
              >
                <option value="critical">Critical</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={!canSave} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
