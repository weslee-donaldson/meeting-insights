import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils.js";

interface FilterChipProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

export function FilterChip({ label, value, options, onChange, className }: FilterChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-[5px]",
          "px-2.5 py-1 rounded-md",
          "border border-[var(--color-line)]",
          "bg-[var(--color-bg-input)]",
          "text-[11px]",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-[var(--color-text-secondary)]">{label}:</span>
        <span className="font-semibold text-[var(--color-text-primary)]">{value}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth="2"
          className="w-2.5 h-2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute top-full left-0 mt-1 z-50",
            "min-w-[240px] py-1 rounded-md",
            "border border-[var(--color-line)]",
            "bg-[var(--color-bg-surface)]",
            "shadow-md",
          )}
        >
          {options.map((opt) => (
            <button
              key={opt}
              role="option"
              aria-selected={opt === value}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-[11px]",
                opt === value
                  ? "text-[var(--color-accent)] font-semibold"
                  : "text-[var(--color-text-body)]",
                "hover:bg-[var(--color-bg-elevated)]",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ActiveFilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

export function ActiveFilterChip({ label, onRemove, className }: ActiveFilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "px-2 py-[3px] rounded",
        "bg-[var(--color-tint)]",
        "text-[10px] font-medium text-[var(--color-accent)]",
        className,
      )}
    >
      {label}
      <button onClick={onRemove} aria-label={`Remove filter ${label}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          className="w-2.5 h-2.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
