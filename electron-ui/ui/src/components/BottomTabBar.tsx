import React from "react";
import { CalendarDays, CircleCheck, Link2, Brain, Milestone, Search } from "lucide-react";
import { cn } from "../lib/utils.js";

type View = "meetings" | "action-items" | "threads" | "insights" | "timelines" | "search";

interface BottomTabBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const ITEMS: { view: View; label: string; Icon: React.ElementType }[] = [
  { view: "meetings", label: "Meetings", Icon: CalendarDays },
  { view: "action-items", label: "Items", Icon: CircleCheck },
  { view: "threads", label: "Threads", Icon: Link2 },
  { view: "insights", label: "Insights", Icon: Brain },
  { view: "timelines", label: "Timelines", Icon: Milestone },
  { view: "search", label: "Search", Icon: Search },
];

export function BottomTabBar({ currentView, onNavigate }: BottomTabBarProps) {
  return (
    <nav
      data-testid="bottom-tab-bar"
      className="flex items-center justify-around bg-[var(--color-bg-surface)] border-t border-[var(--color-line)] shrink-0"
      style={{ height: "56px" }}
    >
      {ITEMS.map(({ view, label, Icon }) => (
        <button
          key={view}
          onClick={() => onNavigate(view)}
          aria-label={label}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 h-full bg-transparent border-0 cursor-pointer transition-colors",
            currentView === view
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
          )}
        >
          <Icon className="w-[20px] h-[20px] shrink-0" strokeWidth={1.75} />
          <span className="text-[10px] font-medium leading-tight">{label}</span>
        </button>
      ))}
    </nav>
  );
}
