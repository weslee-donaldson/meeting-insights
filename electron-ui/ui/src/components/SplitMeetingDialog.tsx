import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog.js";
import { Button } from "./ui/button.js";
import type { SplitResult } from "../../../../core/meeting-split.js";
interface SplitMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  meetingTitle: string;
  totalDurationMinutes: number;
  onSuccess: (result: SplitResult) => void;
}

export function SplitMeetingDialog({
  open,
  onOpenChange,
  meetingId,
  meetingTitle,
  totalDurationMinutes,
  onSuccess,
}: SplitMeetingDialogProps) {
  const queryClient = useQueryClient();
  const [numSegments, setNumSegments] = useState(2);
  const [durations, setDurations] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getFilledDurations(): number[] {
    const filled: number[] = [];
    let remaining = totalDurationMinutes;
    for (let i = 0; i < numSegments - 1; i++) {
      const val = durations[i] ?? 0;
      filled.push(val);
      remaining -= val;
    }
    filled.push(Math.max(0, remaining));
    return filled;
  }

  function buildSummary(): string {
    const filled = getFilledDurations();
    let cursor = 0;
    return filled.map((d, i) => {
      const start = String(Math.floor(cursor / 60)).padStart(2, "0") + ":" + String(cursor % 60).padStart(2, "0");
      cursor += d;
      const end = i === filled.length - 1 ? "end" : String(Math.floor(cursor / 60)).padStart(2, "0") + ":" + String(cursor % 60).padStart(2, "0");
      return `Segment ${i + 1}: ${start}-${end}`;
    }).join(" | ");
  }

  async function handleSplit() {
    setLoading(true);
    setError(null);
    try {
      const filled = getFilledDurations();
      const result = await (window as unknown as { api: { splitMeeting: (id: string, d: number[]) => Promise<SplitResult> } }).api.splitMeeting(meetingId, filled);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      onSuccess(result);
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[480px]" aria-describedby={undefined}>
        <DialogTitle>Split Meeting</DialogTitle>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Splitting: <span className="font-medium text-foreground">{meetingTitle}</span>
          </p>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            How many meetings are in this recording?            <input
              type="number"
              min={2}
              max={10}
              value={numSegments}
              onChange={(e) => {
                const n = Math.max(2, Math.min(10, Number(e.target.value)));
                setNumSegments(n);
                setDurations((prev) => prev.slice(0, n - 1));
              }}
              className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground w-20"
            />
          </label>
          {Array.from({ length: numSegments - 1 }, (_, i) => (
            <label key={i} className="flex flex-col gap-1 text-xs text-muted-foreground">
              Meeting {i + 1} of {numSegments} duration
              <input
                type="number"
                min={1}
                placeholder="minutes"
                value={durations[i] ?? ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDurations((prev) => {
                    const next = [...prev];
                    next[i] = val;
                    return next;
                  });
                }}
                className="rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground w-32"
              />
            </label>
          ))}
          <p className="text-xs text-muted-foreground bg-muted rounded px-2 py-1.5">
            {buildSummary()}
          </p>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSplit} disabled={loading}>              {loading ? "Splitting..." : "Split Meeting"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
