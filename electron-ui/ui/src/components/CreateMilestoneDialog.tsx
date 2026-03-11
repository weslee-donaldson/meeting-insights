import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "./ui/dialog.js";
import { Button } from "./ui/button.js";
import type { CreateMilestoneRequest } from "../../electron/channels.js";

interface CreateMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (req: CreateMilestoneRequest) => void;
  clientName: string;
}

export function CreateMilestoneDialog({ open, onOpenChange, onSubmit, clientName }: CreateMilestoneDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setTargetDate("");
    }
  }, [open]);

  const canSubmit = title.trim().length > 0;

  function handleSubmit() {
    onSubmit({
      clientName,
      title,
      description: description || undefined,
      targetDate: targetDate || undefined,
    });
    setTitle("");
    setDescription("");
    setTargetDate("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Create Milestone</DialogTitle>
        <div className="flex flex-col gap-3 mt-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Title</span>
            <input
              aria-label="Title"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Description</span>
            <textarea
              aria-label="Description"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Target Date</span>
            <input
              type="date"
              aria-label="Target Date"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={!canSubmit} onClick={handleSubmit}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
