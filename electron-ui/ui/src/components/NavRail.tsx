import React from "react";
import { CalendarDays, CircleCheck } from "lucide-react";
import { cn } from "../lib/utils.js";

type View = "meetings" | "action-items";

interface NavRailProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const ITEMS: { view: View; label: string; Icon: React.ElementType }[] = [
  { view: "meetings", label: "Meetings", Icon: CalendarDays },
  { view: "action-items", label: "Action Items", Icon: CircleCheck },
];

export function NavRail({ currentView, onNavigate }: NavRailProps) {
  return (
    <div className="flex flex-col items-center w-16 shrink-0 bg-card border-r border-border py-3 gap-1">
      {ITEMS.map(({ view, label, Icon }) => (
        <button
          key={view}
          onClick={() => onNavigate(view)}
          aria-label={label}
          className={cn(
            "flex flex-col items-center gap-1 w-full px-1 py-2.5 rounded-md text-[0.6rem] font-medium transition-colors cursor-pointer bg-transparent border-0",
            currentView === view
              ? "text-foreground bg-secondary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
          )}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span className="leading-tight text-center">{label}</span>
        </button>
      ))}
    </div>
  );
}
