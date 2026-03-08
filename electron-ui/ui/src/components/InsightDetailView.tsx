import React from "react";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { cn } from "../lib/utils.js";
import type { Insight, InsightMeeting } from "../../../../core/insights.js";

interface InsightDetailViewProps {
  insight: Insight;
  meetings: InsightMeeting[];
  onDelete: () => void;
  onRegenerate: () => void;
  onFinalize: () => void;
}

const RAG_COLORS = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
} as const;

const RAG_LABELS = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
} as const;

function formatPeriodLabel(insight: Insight): string {
  const fmt = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  if (insight.period_start === insight.period_end) {
    return fmt(insight.period_start);
  }
  return `${fmt(insight.period_start)} – ${fmt(insight.period_end)}`;
}

export function InsightDetailView({
  insight,
  meetings,
  onDelete,
  onRegenerate,
  onFinalize,
}: InsightDetailViewProps) {
  return (
    <div className="flex flex-col h-full" data-testid="insight-detail-view">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <span
            data-testid="detail-rag-badge"
            className={cn("w-3.5 h-3.5 rounded-full shrink-0", RAG_COLORS[insight.rag_status])}
          />
          <h2 className="text-sm font-semibold flex-1">{formatPeriodLabel(insight)}</h2>
          <Badge variant="outline" className="text-xs capitalize">{insight.period_type}</Badge>
          <Badge variant={insight.status === "final" ? "default" : "secondary"} className="text-xs capitalize">
            {insight.status === "final" ? "Final" : "Draft"}
          </Badge>
        </div>
        {insight.rag_rationale && (
          <p className="text-xs text-muted-foreground mt-1 ml-6.5">{insight.rag_rationale}</p>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Executive Summary</h3>
          {insight.executive_summary ? (
            <p className="text-sm whitespace-pre-wrap">{insight.executive_summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No summary yet. Generate to create one.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
