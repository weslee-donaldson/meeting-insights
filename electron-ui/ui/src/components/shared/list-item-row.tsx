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
  touchTarget?: boolean;
}

export function ListItemRow({ selected, onClick, children, className, density, touchTarget }: ListItemRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center cursor-pointer transition-colors",
        density ? densityStyles[density] : "gap-2.5",
        touchTarget && "min-h-[48px] py-3 px-4 gap-3",
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

interface MeetingAvatarProps {
  title: string;
}

export function MeetingAvatar({ title }: MeetingAvatarProps) {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const hue = [...title].reduce((h, c) => h + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
      style={{ backgroundColor: `hsl(${hue}, 55%, 50%)` }}
      data-testid="meeting-avatar"
    >
      {initials}
    </div>
  );
}
