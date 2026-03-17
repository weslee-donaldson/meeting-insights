import React from "react";
import { cn } from "../../lib/utils.js";

export type DensityMode = "comfortable" | "compact" | "dense";

interface DensityToggleProps {
  value: DensityMode;
  onChange: (mode: DensityMode) => void;
  className?: string;
}

const modes: DensityMode[] = ["comfortable", "compact", "dense"];

function ComfortableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="3" rx="1" fill="currentColor" />
      <rect x="2" y="9" width="16" height="3" rx="1" fill="currentColor" />
      <rect x="2" y="15" width="16" height="3" rx="1" fill="currentColor" />
    </svg>
  );
}

function CompactIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="8" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="13" width="16" height="2" rx="1" fill="currentColor" />
      <rect x="2" y="18" width="16" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function DenseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="1" rx="0.5" fill="currentColor" />
      <rect x="2" y="5" width="16" height="1" rx="0.5" fill="currentColor" />
      <rect x="2" y="8" width="16" height="1" rx="0.5" fill="currentColor" />
      <rect x="2" y="11" width="16" height="1" rx="0.5" fill="currentColor" />
      <rect x="2" y="14" width="16" height="1" rx="0.5" fill="currentColor" />
      <rect x="2" y="17" width="16" height="1" rx="0.5" fill="currentColor" />
    </svg>
  );
}

const icons: Record<DensityMode, React.FC> = {
  comfortable: ComfortableIcon,
  compact: CompactIcon,
  dense: DenseIcon,
};

export function DensityToggle({ value, onChange, className }: DensityToggleProps) {
  return (
    <div
      className={cn(
        "flex p-0.5 rounded-md bg-[var(--color-bg-elevated)] gap-[1px]",
        className,
      )}
      role="radiogroup"
      aria-label="List density"
    >
      {modes.map((mode) => {
        const Icon = icons[mode];
        const active = mode === value;
        return (
          <button
            key={mode}
            role="radio"
            aria-checked={active}
            aria-label={`${mode} density`}
            onClick={() => onChange(mode)}
            className={cn(
              "p-1 rounded transition-colors",
              active
                ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)]",
            )}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
