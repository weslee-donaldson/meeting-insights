import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const badgeVariants = cva(
  "inline-flex items-center font-bold tracking-wide",
  {
    variants: {
      variant: {
        default:     "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
        critical:    "bg-[var(--color-danger)] text-white",
        high:        "bg-[#EA580C] text-white",
        medium:      "bg-[var(--color-accent)] text-white",
        low:         "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
        open:        "bg-[#DCFCE7] text-[#15803D]",
        draft:       "bg-[var(--color-tint)] text-[var(--color-accent)]",
        identified:  "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
        tracked:     "bg-[#DBEAFE] text-[#1D4ED8]",
        completed:   "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
        client:      "bg-[var(--color-tint)] text-[var(--color-accent)]",
        secondary:   "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
        outline:     "border border-[var(--color-line)] text-[var(--color-text-primary)]",
        muted:       "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]",
        destructive: "bg-[var(--color-danger)] text-white",
        primary:     "bg-[var(--color-accent)] text-white",
      },
      size: {
        default: "px-2 py-0.5 text-[10px] rounded",
        sm:      "px-1.5 py-0 text-[9px] rounded-sm",
        lg:      "px-2.5 py-1 text-xs rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
