import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/utils.js";

export interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbBarProps {
  segments: BreadcrumbSegment[];
}

export function BreadcrumbBar({ segments }: BreadcrumbBarProps) {
  if (segments.length === 0) return null;

  return (
    <nav
      data-testid="breadcrumb-bar"
      className="flex items-center gap-1 px-4 py-2 overflow-x-auto bg-[var(--color-bg-surface)] border-b border-[var(--color-line)] shrink-0"
      style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
    >
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <ChevronRight
                className="w-3 h-3 text-[var(--color-text-muted)] shrink-0"
                strokeWidth={2}
              />
            )}
            {isLast ? (
              <span
                className="text-[12px] font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] rounded-full px-2.5 py-0.5 shrink-0 whitespace-nowrap"
              >
                {segment.label}
              </span>
            ) : (
              <button
                onClick={segment.onClick}
                className={cn(
                  "text-[12px] font-medium bg-transparent border-0 cursor-pointer shrink-0 whitespace-nowrap transition-colors",
                  "text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]",
                )}
              >
                {segment.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
