import React, { useState } from "react";
import { cn } from "../../lib/utils.js";

interface SectionHeaderProps {
  label: string;
  defaultExpanded?: boolean;
  count?: string;
  progress?: { current: number; total: number };
  filterSlot?: React.ReactNode;
  children?: React.ReactNode;
}

export function SectionHeader({
  label,
  defaultExpanded = false,
  count,
  progress,
  filterSlot,
  children,
}: SectionHeaderProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full"
        aria-expanded={expanded}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "w-3 h-3 transition-transform",
            expanded
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-muted)] rotate-[-90deg]",
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span
          className={cn(
            "text-[13px] uppercase tracking-[0.02em]",
            expanded
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-muted)]",
          )}
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
        >
          {label}
        </span>
        {count && (
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            {count}
          </span>
        )}
        {progress && expanded && (
          <div className="w-[60px] h-[3px] rounded-[2px] bg-[var(--color-line)]">
            <div
              className={cn(
                "h-[3px] rounded-[2px]",
                progress.current >= progress.total
                  ? "bg-[var(--color-success)]"
                  : "bg-[var(--color-accent)]",
              )}
              style={{
                width: `${progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%`,
              }}
            />
          </div>
        )}
        <div className="flex-1 h-px bg-[var(--color-line)]" />
        {filterSlot && expanded && (
          <div className="flex-shrink-0">{filterSlot}</div>
        )}
      </button>
      {expanded && children && <div>{children}</div>}
    </div>
  );
}
