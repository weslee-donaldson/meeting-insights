import React from "react";
import { cn } from "../../lib/utils.js";

interface ListItemRowProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ListItemRow({ selected, onClick, children, className }: ListItemRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 cursor-pointer transition-colors",
        selected
          ? "bg-[var(--color-tint)] border-l-2 border-l-[var(--color-accent)]"
          : "border-l-2 border-l-transparent hover:bg-[var(--color-bg-elevated)]",
        className,
      )}
      role="option"
      aria-selected={selected ?? false}
    >
      {children}
    </div>
  );
}
