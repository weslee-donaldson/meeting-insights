import React from "react";
import { cn } from "../../lib/utils.js";

const DOT_COLORS: Record<string, string> = {
  green: "bg-[var(--color-success)]",
  yellow: "bg-[var(--color-accent)]",
  red: "bg-[var(--color-danger)]",
  blue: "#3B82F6",
  gray: "bg-[var(--color-text-muted)]",
  tracked: "bg-[#3B82F6]",
  completed: "bg-[var(--color-success)]",
  identified: "bg-[var(--color-text-muted)]",
  missed: "bg-[var(--color-danger)]",
};

interface StatusDotProps {
  color: string;
  size?: number;
}

export function StatusDot({ color, size = 10 }: StatusDotProps) {
  const bgClass = DOT_COLORS[color];

  return (
    <span
      data-testid="status-dot"
      className={cn("rounded-full shrink-0 inline-block", bgClass)}
      style={{
        width: size,
        height: size,
        ...(color === "tracked" || (color === "blue" && !bgClass?.startsWith("bg-"))
          ? { backgroundColor: "#3B82F6" }
          : {}),
      }}
    />
  );
}
