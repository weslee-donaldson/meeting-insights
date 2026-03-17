import React from "react";
import { cn } from "../../lib/utils.js";

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  milestone?: boolean;
}

export function Tag({ className, milestone, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-[3px]",
        "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
        milestone && "border-l-2 border-l-[var(--color-accent)]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
