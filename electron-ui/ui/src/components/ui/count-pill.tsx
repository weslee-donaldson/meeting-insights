import React from "react";
import { cn } from "../../lib/utils.js";

interface CountPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
}

export function CountPill({ count, className, ...props }: CountPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "px-2 py-[1px] rounded-[10px]",
        "text-[11px] font-semibold",
        "bg-[var(--color-bg-elevated)] text-[var(--color-text-body)]",
        className,
      )}
      {...props}
    >
      {count}
    </span>
  );
}
