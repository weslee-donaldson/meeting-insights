import React, { useState } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Trash2 } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Milestone } from "../../../../core/timelines.js";

interface TimelineDetailViewProps {
  milestone: Milestone;
  onDelete: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  identified: "bg-gray-500",
  tracked: "bg-blue-500",
  completed: "bg-green-500",
  missed: "bg-red-500",
  deferred: "bg-amber-500",
};

function formatDetailDate(dateStr: string | null): string {
  if (!dateStr) return "Unscheduled";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TimelineDetailView({
  milestone,
  onDelete,
}: TimelineDetailViewProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              data-testid="detail-status-dot"
              className={cn(
                "w-3 h-3 rounded-full shrink-0",
                STATUS_COLORS[milestone.status] ?? "bg-gray-500",
              )}
            />
            <h2 className="text-lg font-semibold">{milestone.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="capitalize">
              {milestone.status}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Delete"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {formatDetailDate(milestone.target_date)}
        </div>

        {milestone.description && (
          <p className="text-sm">{milestone.description}</p>
        )}

        {confirmingDelete && (
          <div className="border border-destructive rounded-md p-3 space-y-2">
            <p className="text-sm">
              Are you sure you want to delete this milestone?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                aria-label="Confirm"
                onClick={() => {
                  onDelete();
                  setConfirmingDelete(false);
                }}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Cancel"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
