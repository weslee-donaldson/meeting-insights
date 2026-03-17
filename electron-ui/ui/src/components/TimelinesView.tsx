import React, { useState } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Plus, List, BarChart2, CalendarDays } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Milestone } from "../../../../core/timelines.js";
import { MilestoneGanttView } from "./MilestoneGanttView.js";
import { MilestoneCalendarView } from "./MilestoneCalendarView.js";
import { ListItemRow } from "./shared/list-item-row.js";

type MilestoneWithMentions = Milestone & { mention_count?: number; first_mentioned_at?: string | null; has_pending_review?: boolean };

interface TimelinesViewProps {
  milestones: MilestoneWithMentions[];
  clientName: string;
  onSelectMilestone: (id: string) => void;
  onCreateMilestone: () => void;
  selectedMilestoneId: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  identified: "bg-gray-500",
  tracked: "bg-blue-500",
  completed: "bg-green-500",
  missed: "bg-red-500",
  deferred: "bg-amber-500",
};

function formatTargetDate(dateStr: string | null): string {
  if (!dateStr) return "Unscheduled";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type ViewMode = "list" | "gantt" | "calendar";

export function TimelinesView({
  milestones,
  clientName,
  onSelectMilestone,
  onCreateMilestone,
  selectedMilestoneId,
}: TimelinesViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const filtered = statusFilter ? milestones.filter((m) => m.status === statusFilter) : milestones;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{clientName} Timelines</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border rounded">
            <Button size="sm" variant={viewMode === "list" ? "secondary" : "ghost"} aria-label="List view" className="rounded-r-none px-2" onClick={() => setViewMode("list")}>
              <List className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant={viewMode === "gantt" ? "secondary" : "ghost"} aria-label="Gantt view" className="rounded-none border-x border-border px-2" onClick={() => setViewMode("gantt")}>
              <BarChart2 className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant={viewMode === "calendar" ? "secondary" : "ghost"} aria-label="Calendar view" className="rounded-l-none px-2" onClick={() => setViewMode("calendar")}>
              <CalendarDays className="w-3.5 h-3.5" />
            </Button>
          </div>
          {viewMode === "list" && (
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-border rounded px-2 py-1 bg-background"
            >
              <option value="">All</option>
              <option value="identified">identified</option>
              <option value="tracked">tracked</option>
              <option value="completed">completed</option>
              <option value="missed">missed</option>
              <option value="deferred">deferred</option>
            </select>
          )}
          <Button size="sm" variant="outline" onClick={onCreateMilestone} aria-label="New Milestone">
            <Plus className="w-4 h-4 mr-1" />
            New Milestone
          </Button>
        </div>
      </div>
      {viewMode === "gantt" ? (
        <MilestoneGanttView milestones={milestones} onSelectMilestone={onSelectMilestone} selectedMilestoneId={selectedMilestoneId} />
      ) : viewMode === "calendar" ? (
        <MilestoneCalendarView milestones={milestones} onSelectMilestone={onSelectMilestone} selectedMilestoneId={selectedMilestoneId} />
      ) : (
        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No milestones
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((milestone) => (
                <ListItemRow
                  key={milestone.id}
                  selected={selectedMilestoneId === milestone.id}
                  onClick={() => onSelectMilestone(milestone.id)}
                  className="px-4 py-3 text-sm border-b border-[var(--color-line)]"
                >
                  <span
                    data-testid="status-dot"
                    className={cn("w-2.5 h-2.5 rounded-full shrink-0", STATUS_COLORS[milestone.status] ?? "bg-gray-500")}
                  />
                  <span className="flex-1 truncate font-medium">{milestone.title}</span>
                  {milestone.mention_count ? (
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{milestone.mention_count}</span>
                  ) : null}
                  <Badge variant="outline" className="text-xs shrink-0">{milestone.status}</Badge>
                  {milestone.has_pending_review && (
                    <Badge variant="secondary" className="text-xs shrink-0 bg-amber-100 text-amber-800">Review</Badge>
                  )}
                  <span className="text-xs text-muted-foreground shrink-0">{formatTargetDate(milestone.target_date)}</span>
                </ListItemRow>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
