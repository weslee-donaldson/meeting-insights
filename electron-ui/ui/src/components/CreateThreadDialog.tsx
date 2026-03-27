import React, { useState, useEffect } from "react";
import { ResponsiveDialog } from "./ui/responsive-dialog.js";
import { DialogClose } from "./ui/dialog.js";
import { Button } from "./ui/button.js";

interface ThreadFormData {
  title: string;
  shorthand: string;
  description: string;
  criteria_prompt: string;
  keywords: string;
}

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ThreadFormData, meetingIds?: string[]) => void;
  thread?: ThreadFormData;
  initialDescription?: string;
  initialTitle?: string;
  initialMeetingIds?: string[];
}

export function CreateThreadDialog({ open, onOpenChange, onSubmit, thread, initialDescription, initialTitle, initialMeetingIds }: CreateThreadDialogProps) {
  const [title, setTitle] = useState("");
  const [shorthand, setShorthand] = useState("");
  const [description, setDescription] = useState("");
  const [criteriaPrompt, setCriteriaPrompt] = useState("");
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    if (thread) {
      setTitle(thread.title);
      setShorthand(thread.shorthand);
      setDescription(thread.description);
      setCriteriaPrompt(thread.criteria_prompt);
      setKeywords(thread.keywords);
    } else {
      setTitle(initialTitle ?? "");
      setShorthand("");
      setDescription(initialDescription ?? "");
      setCriteriaPrompt("");
      setKeywords("");
    }
  }, [thread, open, initialDescription, initialTitle]);

  const isEdit = !!thread;
  const canSubmit = title.trim().length > 0 && shorthand.trim().length > 0;

  function handleSubmit() {
    onSubmit({ title, shorthand, description, criteria_prompt: criteriaPrompt, keywords }, initialMeetingIds);
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={isEdit ? "Edit Thread" : "Create Thread"} sheetHeight={85}>
        <div className="flex flex-col gap-3 mt-2">
          {initialMeetingIds && initialMeetingIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {initialMeetingIds.length} meetings will be linked
            </div>
          )}
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
              maxLength={20}
              onChange={(e) => setShorthand(e.target.value.slice(0, 20))}
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
            <span>Keywords</span>
            <span className="text-xs text-muted-foreground">Space-separated words. Use quotes for phrases: "blue green" rollback</span>
            <input
              aria-label="Keywords"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
              placeholder='e.g. deploy "ftp bug" rollback'
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Criteria Prompt</span>
            <textarea
              aria-label="Criteria Prompt"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground min-h-[160px]"
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
    </ResponsiveDialog>
  );
}
