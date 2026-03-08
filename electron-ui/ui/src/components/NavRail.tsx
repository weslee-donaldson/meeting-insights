import React from "react";
import { CalendarDays, CircleCheck, Link2, Brain } from "lucide-react";
import { cn } from "../lib/utils.js";

type View = "meetings" | "action-items" | "threads" | "insights";

interface NavRailProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const ITEMS: { view: View; label: string; Icon: React.ElementType }[] = [
  { view: "meetings", label: "Meetings", Icon: CalendarDays },
  { view: "action-items", label: "Action Items", Icon: CircleCheck },
  { view: "threads", label: "Threads", Icon: Link2 },
  { view: "insights", label: "Insights", Icon: Brain },
];

export function NavRail({ currentView, onNavigate }: NavRailProps) {
  return (
    <div className="flex flex-col items-center w-20 shrink-0 bg-card border-r border-border py-3 gap-1">
      {ITEMS.map(({ view, label, Icon }) => (
        <button
          key={view}
          onClick={() => onNavigate(view)}
          aria-label={label}
          className={cn(
            "flex flex-col items-center gap-1.5 w-full px-1 py-3 rounded-md text-xs font-medium transition-colors cursor-pointer bg-transparent border-0",
            currentView === view
              ? "text-foreground bg-secondary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
          )}
        >
          <Icon className="w-7 h-7 shrink-0" />
          <span className="leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  );
}
