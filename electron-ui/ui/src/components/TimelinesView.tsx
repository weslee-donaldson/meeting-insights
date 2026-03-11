import React, { useState } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Plus } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Milestone } from "../../../../core/timelines.js";

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

export function TimelinesView({
  milestones,
  clientName,
  onSelectMilestone,
  onCreateMilestone,
  selectedMilestoneId,
}: TimelinesViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const filtered = statusFilter ? milestones.filter((m) => m.status === statusFilter) : milestones;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{clientName} Timelines</h2>
        <div className="flex items-center gap-2">
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
          <Button size="sm" variant="outline" onClick={onCreateMilestone} aria-label="New Milestone">
            <Plus className="w-4 h-4 mr-1" />
            New Milestone
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No milestones
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => onSelectMilestone(milestone.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-left text-sm border-b border-border cursor-pointer bg-transparent w-full",
                  selectedMilestoneId === milestone.id
                    ? "bg-secondary"
                    : "hover:bg-secondary/60",
                )}
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
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
