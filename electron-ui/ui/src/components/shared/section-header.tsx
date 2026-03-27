import React, { useState } from "react";
import { cn } from "../../lib/utils.js";

interface SectionHeaderProps {
  label: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  count?: string;
  progress?: { current: number; total: number };
  filterSlot?: React.ReactNode;
  children?: React.ReactNode;
  isEmpty?: boolean;
}

export function SectionHeader({
  label,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  count,
  progress,
  filterSlot,
  children,
  isEmpty,
}: SectionHeaderProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const setExpanded = onExpandedChange ?? setInternalExpanded;

  if (isEmpty) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 w-full">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(!expanded)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded); } }}
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
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
              "w-3 h-3 transition-transform flex-shrink-0",
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
        </div>
        {filterSlot && expanded && (
          <div className="flex-shrink-0">{filterSlot}</div>
        )}
      </div>
      {expanded && children && (
        <div className="pb-3 text-sm leading-[1.65]">
          <div className="pl-5 pr-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
