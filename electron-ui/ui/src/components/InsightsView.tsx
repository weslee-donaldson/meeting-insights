import React from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Plus } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Insight } from "../../../../core/insights.js";

interface InsightsViewProps {
  insights: Insight[];
  clientName: string;
  onSelectInsight: (insightId: string) => void;
  onCreateInsight: () => void;
  selectedInsightId: string | null;
}

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

const RAG_COLORS = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
} as const;

export function InsightsView({
  insights,
  clientName,
  onSelectInsight,
  onCreateInsight,
  selectedInsightId,
}: InsightsViewProps) {
  return (
    <div className="flex flex-col h-full" data-testid="insights-view">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{clientName} Insights</h2>
        <Button size="sm" variant="outline" onClick={onCreateInsight} aria-label="New Insight">
          <Plus className="w-4 h-4 mr-1" />
          New Insight
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {insights.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No insights
          </div>
        ) : (
          <div className="flex flex-col">
            {insights.map((insight) => (
              <button
                key={insight.id}
                onClick={() => onSelectInsight(insight.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-left text-sm border-b border-border cursor-pointer bg-transparent w-full",
                  selectedInsightId === insight.id
                    ? "bg-secondary"
                    : "hover:bg-secondary/60",
                )}
              >
                <span
                  data-testid="rag-badge"
                  className={cn("w-2.5 h-2.5 rounded-full shrink-0", RAG_COLORS[insight.rag_status])}
                />
                <span className="flex-1 truncate font-medium">{formatPeriodLabel(insight)}</span>
                <Badge variant="outline" className="text-xs shrink-0 capitalize">{insight.period_type}</Badge>
                {insight.status === "final" && (
                  <Badge variant="secondary" className="text-xs shrink-0">Final</Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
