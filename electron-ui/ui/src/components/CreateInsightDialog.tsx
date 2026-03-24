import React, { useState, useMemo, useEffect } from "react";
import { ResponsiveDialog } from "./ui/responsive-dialog.js";
import { DialogClose } from "./ui/dialog.js";
import { Button } from "./ui/button.js";

type PeriodType = "day" | "week" | "month";

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function computePeriodBounds(periodType: PeriodType, referenceDate: string): { start: string; end: string } {
  const [year, month, day] = referenceDate.split("-").map(Number);
  if (periodType === "day") {
    return { start: referenceDate, end: referenceDate };
  }
  if (periodType === "week") {
    const d = new Date(year, month - 1, day);
    const dow = d.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(year, month - 1, day + mondayOffset);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { start: fmtDate(monday), end: fmtDate(sunday) };
  }
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  return { start: fmtDate(firstDay), end: fmtDate(lastDay) };
}

interface CreateInsightSubmitData {
  period_type: PeriodType;
  period_start: string;
  period_end: string;
}

interface CreateInsightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateInsightSubmitData) => void;
}

function formatPreviewDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const PERIOD_TYPES: PeriodType[] = ["day", "week", "month"];
const PERIOD_LABELS: Record<PeriodType, string> = { day: "Day", week: "Week", month: "Month" };

export function CreateInsightDialog({ open, onOpenChange, onSubmit }: CreateInsightDialogProps) {
  const [periodType, setPeriodType] = useState<PeriodType>("week");
  const [referenceDate, setReferenceDate] = useState(todayISO());

  useEffect(() => {
    if (open) {
      setPeriodType("week");
      setReferenceDate(todayISO());
    }
  }, [open]);

  const bounds = useMemo(() => {
    if (!referenceDate) return null;
    return computePeriodBounds(periodType, referenceDate);
  }, [periodType, referenceDate]);

  const canSubmit = !!referenceDate && !!bounds;

  function handleSubmit() {
    if (!bounds) return;
    onSubmit({ period_type: periodType, period_start: bounds.start, period_end: bounds.end });
  }

  const previewText = bounds
    ? bounds.start === bounds.end
      ? formatPreviewDate(bounds.start)
      : `${formatPreviewDate(bounds.start)} \u2013 ${formatPreviewDate(bounds.end)}`
    : "";

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Create Insight" sheetHeight={50}>
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex gap-1">
            {PERIOD_TYPES.map((pt) => (
              <Button
                key={pt}
                size="sm"
                variant={periodType === pt ? "default" : "outline"}
                className="h-auto px-2 py-0.5 text-xs"
                onClick={() => setPeriodType(pt)}
              >
                {PERIOD_LABELS[pt]}
              </Button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span>Reference Date</span>
            <input
              type="date"
              aria-label="Reference Date"
              className="border border-border rounded px-3 py-2 text-sm bg-background text-foreground"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
            />
          </label>
          {previewText && (
            <div data-testid="period-preview" className="text-sm text-muted-foreground">
              Period: {previewText}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={!canSubmit} onClick={handleSubmit}>
              Create
            </Button>
          </div>
        </div>
    </ResponsiveDialog>
  );
}
