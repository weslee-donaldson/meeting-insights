import React from "react";
import { CalendarDays, CircleCheck, Link2, Brain, Milestone, Search } from "lucide-react";
import { cn } from "../lib/utils.js";

type View = "meetings" | "action-items" | "threads" | "insights" | "timelines" | "search";

interface NavRailProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const ITEMS: { view: View; label: string; Icon: React.ElementType }[] = [
  { view: "meetings", label: "Meetings", Icon: CalendarDays },
  { view: "action-items", label: "Action Items", Icon: CircleCheck },
  { view: "threads", label: "Threads", Icon: Link2 },
  { view: "insights", label: "Insights", Icon: Brain },
  { view: "timelines", label: "Timelines", Icon: Milestone },
  { view: "search", label: "Search", Icon: Search },
];

export function NavRail({ currentView, onNavigate }: NavRailProps) {
  return (
    <div className="flex flex-col items-center w-full h-full bg-[var(--color-bg-surface)] border-r border-[var(--color-line)] py-3 gap-1.5">
      <div
        className="w-[28px] h-[28px] rounded-[6px] bg-[var(--color-accent)] flex items-center justify-center mb-2 shrink-0"
      >
        <span
          className="text-white text-[13px] font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          K
        </span>
      </div>

      {ITEMS.map(({ view, label, Icon }) => (
        <button
          key={view}
          onClick={() => onNavigate(view)}
          aria-label={label}
          className={cn(
            "flex flex-col items-center gap-1 w-full px-1 py-2 rounded-md transition-colors cursor-pointer bg-transparent border-0",
            currentView === view
              ? view === "search" ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
          )}
        >
          <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          <span className="text-[9px] font-medium leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  );
}
