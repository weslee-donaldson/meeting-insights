import React from "react";
import { cn } from "../../lib/utils.js";
import { ActiveFilterChip } from "./filter-chip.js";

interface UnifiedSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (q: string) => void;
  clientName: string | null;
  onClientClear: () => void;
  onClientClick: () => void;
  deepEnabled: boolean;
  onDeepToggle: (enabled: boolean) => void;
  contextLine?: string;
  placeholder?: string;
  className?: string;
}

export function UnifiedSearch({
  query,
  onQueryChange,
  onSubmit,
  clientName,
  onClientClear,
  onClientClick,
  deepEnabled,
  onDeepToggle,
  contextLine,
  placeholder = "Search meetings, action items, threads...",
  className,
}: UnifiedSearchProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      onSubmit(query);
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className={cn(
          "flex items-center gap-2",
          "px-3.5 py-2 rounded-[10px]",
          "border-[1.5px] border-[var(--color-line)]",
          "bg-[var(--color-bg-elevated)]",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 flex-shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {clientName && (
          <button
            onClick={onClientClick}
            className={cn(
              "flex items-center gap-1",
              "px-2 py-[2px] rounded",
              "bg-[var(--color-tint)]",
              "text-[11px] font-semibold text-[var(--color-accent)]",
            )}
          >
            {clientName}
            <span
              onClick={(e) => {
                e.stopPropagation();
                onClientClear();
              }}
              role="button"
              aria-label={`Remove ${clientName} filter`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                className="w-2.5 h-2.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </span>
          </button>
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent outline-none",
            "text-[13px] text-[var(--color-text-primary)]",
            "placeholder:text-[var(--color-text-muted)]",
          )}
        />
        <button
          onClick={() => onDeepToggle(!deepEnabled)}
          className={cn(
            "flex items-center gap-1",
            "px-2 py-[2px] rounded",
            "bg-[var(--color-bg-elevated)]",
            "text-[10px] font-medium text-[var(--color-text-secondary)]",
          )}
          aria-pressed={deepEnabled}
        >
          Deep
          {deepEnabled && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          )}
        </button>
      </div>
      {contextLine && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            {contextLine}
          </span>
        </div>
      )}
    </div>
  );
}
