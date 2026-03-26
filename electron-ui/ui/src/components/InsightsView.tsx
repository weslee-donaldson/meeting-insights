import React, { useMemo, useState } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Plus } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Insight } from "../../../../core/insights.js";
import { ListItemRow } from "./shared/list-item-row.js";
import { FilterBar } from "./shared/filter-bar.js";
import { GroupHeader } from "./shared/group-header.js";

interface InsightsViewProps {
  insights: Insight[];
  clientName: string;
  onSelectInsight: (insightId: string) => void;
  onCreateInsight: () => void;
  selectedInsightId: string | null;
}

type InsightGroupBy = "period-type" | "status" | "month";
type InsightSortBy = "newest" | "oldest" | "status" | "rag";

const GROUP_LABELS: Record<InsightGroupBy, string> = {
  "period-type": "Period Type",
  status: "Status",
  month: "Month",
};

const SORT_LABELS: Record<InsightSortBy, string> = {
  newest: "Newest",
  oldest: "Oldest",
  status: "Status",
  rag: "RAG Status",
};

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

const RAG_ORDER: Record<string, number> = { red: 0, yellow: 1, green: 2 };

interface InsightGroup {
  key: string;
  label: string;
  insights: Insight[];
}

function groupByPeriodType(insights: Insight[]): InsightGroup[] {
  const map = new Map<string, Insight[]>();
  for (const i of insights) {
    if (!map.has(i.period_type)) map.set(i.period_type, []);
    map.get(i.period_type)!.push(i);
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    insights: items,
  }));
}

function groupByStatus(insights: Insight[]): InsightGroup[] {
  const map = new Map<string, Insight[]>();
  for (const i of insights) {
    if (!map.has(i.status)) map.set(i.status, []);
    map.get(i.status)!.push(i);
  }
  return [...map.entries()].map(([key, items]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    insights: items,
  }));
}

function groupByMonth(insights: Insight[]): InsightGroup[] {
  const map = new Map<string, Insight[]>();
  for (const i of insights) {
    const key = i.period_start.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(i);
  }
  return [...map.entries()].map(([key, items]) => {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return { key, label, insights: items };
  });
}

export function InsightsView({
  insights,
  clientName,
  onSelectInsight,
  onCreateInsight,
  selectedInsightId,
}: InsightsViewProps) {
  const [groupBy, setGroupBy] = useState<InsightGroupBy>("month");
  const [sortBy, setSortBy] = useState<InsightSortBy>("newest");

  const sorted = useMemo(() => {
    if (sortBy === "oldest") return [...insights].sort((a, b) => a.period_start.localeCompare(b.period_start));
    if (sortBy === "status") return [...insights].sort((a, b) => {
      const order: Record<string, number> = { draft: 0, final: 1 };
      return (order[a.status] ?? 2) - (order[b.status] ?? 2) || b.period_start.localeCompare(a.period_start);
    });
    if (sortBy === "rag") return [...insights].sort((a, b) => {
      return (RAG_ORDER[a.rag_status] ?? 3) - (RAG_ORDER[b.rag_status] ?? 3) || b.period_start.localeCompare(a.period_start);
    });
    return [...insights].sort((a, b) => b.period_start.localeCompare(a.period_start));
  }, [insights, sortBy]);

  const groups = useMemo(() => {
    if (groupBy === "period-type") return groupByPeriodType(sorted);
    if (groupBy === "status") return groupByStatus(sorted);
    return groupByMonth(sorted);
  }, [sorted, groupBy]);

  const groupOptions = Object.values(GROUP_LABELS);
  const sortOptions = Object.values(SORT_LABELS);

  const handleGroupChange = (label: string) => {
    const entry = Object.entries(GROUP_LABELS).find(([, v]) => v === label);
    if (entry) setGroupBy(entry[0] as InsightGroupBy);
  };

  const handleSortChange = (label: string) => {
    const entry = Object.entries(SORT_LABELS).find(([, v]) => v === label);
    if (entry) setSortBy(entry[0] as InsightSortBy);
  };

  return (
    <div className="flex flex-col h-full" data-testid="insights-view">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{clientName} Insights</h2>
        <Button size="sm" variant="outline" onClick={onCreateInsight} aria-label="New Insight">
          <Plus className="w-4 h-4 mr-1" />
          New Insight
        </Button>
      </div>
      <FilterBar
        groupBy={{ label: "Group", value: GROUP_LABELS[groupBy], options: groupOptions, onChange: handleGroupChange }}
        sortBy={{ label: "Sort", value: SORT_LABELS[sortBy], options: sortOptions, onChange: handleSortChange }}
        className="px-4 py-2 border-b border-border"
      />
      <ScrollArea className="flex-1">
        {insights.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No insights
          </div>
        ) : (
          <div className="flex flex-col">
            {groups.map((group) => (
              <div key={group.key}>
                <GroupHeader
                  label={group.label}
                  meta={`${group.insights.length} insight${group.insights.length !== 1 ? "s" : ""}`}
                />
                {group.insights.map((insight) => (
                  <ListItemRow
                    key={insight.id}
                    selected={selectedInsightId === insight.id}
                    onClick={() => onSelectInsight(insight.id)}
                    className="px-4 py-3 text-sm border-b border-[var(--color-line)]"
                  >
                    <span
                      data-testid="rag-badge"
                      className={cn("w-2.5 h-2.5 rounded-full shrink-0", RAG_COLORS[insight.rag_status])}
                    />
                    <span className="flex-1 truncate font-medium">{insight.name || formatPeriodLabel(insight)}</span>
                    <Badge variant="outline" className="text-xs shrink-0 capitalize">{insight.period_type}</Badge>
                    {insight.status === "final" && (
                      <Badge variant="secondary" className="text-xs shrink-0">Final</Badge>
                    )}
                  </ListItemRow>
                ))}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
