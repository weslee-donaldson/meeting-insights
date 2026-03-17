import React from "react";
import { cn } from "../../lib/utils.js";

interface GroupHeaderProps {
  label: string;
  variant?: "default" | "priority" | "date";
  meta?: string;
  className?: string;
}

const variantStyles = {
  default: "text-[var(--color-text-secondary)]",
  priority: "text-[var(--color-danger)]",
  date: "text-[var(--color-text-secondary)]",
} as const;

export function GroupHeader({ label, variant = "default", meta, className }: GroupHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-1 sticky top-0",
        className,
      )}
    >
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.04em]",
          variantStyles[variant],
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
