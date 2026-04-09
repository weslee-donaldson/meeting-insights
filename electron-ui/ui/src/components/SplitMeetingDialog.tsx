import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog.js";
import { Button } from "./ui/button.js";
import type { SplitResult } from "../../../electron/channels.js";

interface SplitMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  meetingTitle: string;
  totalDurationMinutes: number;
  onSuccess: (result: SplitResult) => void;
}

export function SplitMeetingDialog({ open, onOpenChange, meetingId, meetingTitle, totalDurationMinutes, onSuccess }: SplitMeetingDialogProps) {
  const [segmentCount, setSegmentCount] = useState(2);
  const [durations, setDurations] = useState<number[]>([Math.floor(totalDurationMinutes / 2), 0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSegmentCountChange = (count: number) => {
    const clamped = Math.min(10, Math.max(2, count));
    setSegmentCount(clamped);
    const perPart = Math.floor(totalDurationMinutes / clamped);
    setDurations(Array.from({ length: clamped }, (_, i) => (i < clamped - 1 ? perPart : 0)));
  };

  const handleDurationChange = (index: number, value: number) => {
    setDurations((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.api.splitMeeting(meetingId, durations.slice(0, segmentCount - 1));
      onSuccess(result);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed");
    } finally {
      setLoading(false);
    }
  };

  const filledDurations = durations.slice(0, segmentCount - 1);
  const usedMinutes = filledDurations.reduce((sum, d) => sum + d, 0);
  const remainder = Math.max(0, totalDurationMinutes - usedMinutes);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Split &ldquo;{meetingTitle}&rdquo;</DialogTitle>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Number of meetings:</label>
            <input
              type="number"
              min={2}
              max={10}
              value={segmentCount}
              onChange={(e) => handleSegmentCountChange(parseInt(e.target.value, 10) || 2)}
              className="w-16 px-2 py-1 rounded border border-border bg-input text-sm"
              aria-label="Number of meetings"
            />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: segmentCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm w-28 text-muted-foreground">Meeting {i + 1} of {segmentCount}:</span>
                {i < segmentCount - 1 ? (
                  <input
                    type="number"
                    min={1}
                    value={durations[i] ?? 0}
                    onChange={(e) => handleDurationChange(i, parseInt(e.target.value, 10) || 0)}
                    className="w-20 px-2 py-1 rounded border border-border bg-input text-sm"
                    aria-label={`Duration for meeting ${i + 1}`}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">{remainder} min (remainder)</span>
                )}
                {i < segmentCount - 1 && <span className="text-xs text-muted-foreground">min</span>}
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={loading}>
              {loading ? "Splitting..." : "Split Meeting"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
