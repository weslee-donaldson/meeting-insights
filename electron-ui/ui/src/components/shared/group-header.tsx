import React from "react";
import { cn } from "../../lib/utils.js";

interface GroupHeaderProps {
  label: string;
  variant?: "default" | "priority" | "date";
  meta?: string;
  className?: string;
}

export function GroupHeader({ label, variant = "default", meta, className }: GroupHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 sticky top-0 bg-[var(--color-bg-elevated)] border-t border-[var(--color-line)]",
        className,
      )}
    >
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-primary)]",
          variant === "priority" && "text-[var(--color-danger)]",
        )}
      >
        {label}
      </span>
      {meta && (
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {meta}
        </span>
      )}
    </div>
  );
}
