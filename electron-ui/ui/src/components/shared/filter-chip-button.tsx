import React from "react";
import { cn } from "../../lib/utils.js";

interface FilterChipButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChipButton({ label, active, onClick }: FilterChipButtonProps) {
  return (
    <button
      onClick={onClick}
      data-testid="filter-chip"
      className={cn(
        "text-[11px] font-medium px-3 py-1.5 rounded-full border shrink-0 cursor-pointer whitespace-nowrap transition-colors",
        active
          ? "bg-[var(--color-tint)] text-[var(--color-accent)] border-[var(--color-accent)]"
          : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-line)] hover:border-[var(--color-text-muted)]",
      )}
    >
      {label}
    </button>
  );
}
