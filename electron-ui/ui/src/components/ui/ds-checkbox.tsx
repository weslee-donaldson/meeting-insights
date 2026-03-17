import React from "react";
import { cn } from "../../lib/utils.js";

interface DsCheckboxProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  size?: "default" | "compact" | "dense";
}

const sizeMap = {
  default: "w-4 h-4 rounded",
  compact: "w-3 h-3 rounded-[3px]",
  dense: "w-2.5 h-2.5 rounded-[2px]",
} as const;

export function DsCheckbox({ checked = false, disabled = false, onChange, className, size = "default" }: DsCheckboxProps) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        "flex-shrink-0 flex items-center justify-center",
        sizeMap[size],
        checked
          ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
          : disabled
            ? "bg-[var(--color-bg-elevated)] border-[1.5px] border-[var(--color-line)]"
            : "bg-transparent border-[1.5px] border-[var(--color-line)]",
        className,
      )}
    >
      {checked && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-2.5 h-2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
