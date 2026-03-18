import React from "react";
import { cn } from "../../lib/utils.js";
import type { DensityMode } from "./density-toggle.js";

const densityStyles: Record<DensityMode, string> = {
  comfortable: "gap-2.5 py-2.5 px-4",
  compact: "gap-2 py-1 px-2",
  dense: "gap-1.5 py-0.5 px-2",
};

interface ListItemRowProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  density?: DensityMode;
}

export function ListItemRow({ selected, onClick, children, className, density }: ListItemRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center cursor-pointer transition-colors",
        density ? densityStyles[density] : "gap-2.5",
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
