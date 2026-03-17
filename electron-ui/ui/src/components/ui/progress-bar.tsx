import React from "react";
import { cn } from "../../lib/utils.js";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const complete = current >= total && total > 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "text-[11px]",
          complete
            ? "text-[var(--color-success)]"
            : "text-[var(--color-text-secondary)]",
        )}
      >
        {current}/{total}
      </span>
      <div className="flex-1 h-[3px] rounded-[2px] bg-[var(--color-line)]">
        <div
          className={cn(
            "h-[3px] rounded-[2px] transition-all",
            complete
              ? "bg-[var(--color-success)]"
              : "bg-[var(--color-accent)]",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
