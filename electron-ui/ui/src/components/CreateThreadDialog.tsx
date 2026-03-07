import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "./ui/dialog.js";
import { Button } from "./ui/button.js";

interface ThreadFormData {
  title: string;
  shorthand: string;
  description: string;
  criteria_prompt: string;
}

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ThreadFormData) => void;
  thread?: ThreadFormData;
  initialDescription?: string;
}

export function CreateThreadDialog({ open, onOpenChange, onSubmit, thread, initialDescription }: CreateThreadDialogProps) {
  const [title, setTitle] = useState("");
  const [shorthand, setShorthand] = useState("");
  const [description, setDescription] = useState("");
  const [criteriaPrompt, setCriteriaPrompt] = useState("");

  useEffect(() => {
    if (thread) {
      setTitle(thread.title);
      setShorthand(thread.shorthand);
      setDescription(thread.description);
      setCriteriaPrompt(thread.criteria_prompt);
    } else {
      setTitle("");
      setShorthand("");
      setDescription(initialDescription ?? "");
      setCriteriaPrompt("");
    }
  }, [thread, open, initialDescription]);

  const isEdit = !!thread;
  const canSubmit = title.trim().length > 0 && shorthand.trim().length > 0;

  function handleSubmit() {
    onSubmit({ title, shorthand, description, criteria_prompt: criteriaPrompt });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>{isEdit ? "Edit Thread" : "Create Thread"}</DialogTitle>
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
            <span>Shorthand</span>
            <input
              aria-label="Shorthand"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
              value={shorthand}
              maxLength={10}
              onChange={(e) => setShorthand(e.target.value.slice(0, 10))}
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
            <span>Criteria Prompt</span>
            <textarea
              aria-label="Criteria Prompt"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground min-h-[80px]"
              value={criteriaPrompt}
              onChange={(e) => setCriteriaPrompt(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2 mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={!canSubmit} onClick={handleSubmit}>
              {isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
