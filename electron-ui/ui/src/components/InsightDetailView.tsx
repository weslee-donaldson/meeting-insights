import React, { useState, useEffect } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { RefreshCw, Check, RotateCcw, Trash2, X } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Insight, InsightMeeting } from "../../../../core/insights.js";

interface TopicDetail {
  topic: string;
  summary: string;
  status: "green" | "yellow" | "red";
  meeting_ids: string[];
}

interface InsightDetailViewProps {
  insight: Insight;
  meetings: InsightMeeting[];
  onDelete: () => void;
  onRegenerate: () => void;
  onFinalize: () => void;
  onRemoveMeetings?: (meetingIds: string[]) => void;
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

interface MeetingGroup {
  key: string;
  label: string;
  meetings: InsightMeeting[];
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function groupMeetingsByDay(meetings: InsightMeeting[]): MeetingGroup[] {
  const map = new Map<string, InsightMeeting[]>();
  for (const m of meetings) {
    const key = m.meeting_date.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, ms]) => ({ key, label: formatDayLabel(key), meetings: ms }));
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

export function InsightDetailView({
  insight,
  meetings,
  onDelete,
  onRegenerate,
  onFinalize,
  onRemoveMeetings,
}: InsightDetailViewProps) {
  const topics: TopicDetail[] = insight.topic_details ? JSON.parse(insight.topic_details) : [];
  const [checked, setChecked] = useState<Set<string>>(() => new Set(meetings.map((m) => m.meeting_id)));

  useEffect(() => {
    setChecked(new Set(meetings.map((m) => m.meeting_id)));
  }, [meetings]);

  const [meetingGroupBy, setMeetingGroupBy] = useState<"none" | "series" | "day" | "week" | "month">("none");

  const uncheckedIds = meetings.filter((m) => !checked.has(m.meeting_id)).map((m) => m.meeting_id);

  function toggleMeeting(meetingId: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(meetingId)) next.delete(meetingId);
      else next.add(meetingId);
      return next;
    });
  }

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
        <div className="flex gap-1 mt-2 ml-6.5">
          <Button size="sm" variant="outline" className="h-auto px-2 py-0.5 text-xs" onClick={onRegenerate}>
            <RefreshCw className="w-3 h-3 mr-1" />
            {insight.executive_summary ? "Regenerate" : "Generate"}
          </Button>
          {insight.status === "draft" ? (
            <Button size="sm" variant="outline" className="h-auto px-2 py-0.5 text-xs" onClick={onFinalize}>
              <Check className="w-3 h-3 mr-1" />
              Finalize
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-auto px-2 py-0.5 text-xs" onClick={onFinalize}>
              <RotateCcw className="w-3 h-3 mr-1" />
              Reopen
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-auto px-2 py-0.5 text-xs" onClick={onDelete}>
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
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
        {topics.length > 0 && (
          <div className="px-4 py-3 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">Topic Details</h3>
            <div className="flex flex-col gap-3">
              {topics.map((topic) => (
                <div key={topic.topic} className="flex items-start gap-2">
                  <span
                    data-testid="topic-rag-badge"
                    className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-1", RAG_COLORS[topic.status])}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{topic.topic}</p>
                    <p className="text-xs text-muted-foreground">{topic.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Source Meetings</h3>
            {uncheckedIds.length > 0 && onRemoveMeetings && (
              <Button
                size="sm"
                variant="outline"
                className="h-auto px-2 py-0.5 text-xs"
                onClick={() => onRemoveMeetings(uncheckedIds)}
              >
                <X className="w-3 h-3 mr-1" />
                Remove Unchecked
              </Button>
            )}
          </div>
          {meetings.length > 0 && (
            <div className="flex gap-1 mb-2">
              {(["series", "day", "week", "month"] as const).map((mode) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={meetingGroupBy === mode ? "default" : "outline"}
                  className="h-auto px-2 py-0.5 text-xs capitalize"
                  onClick={() => setMeetingGroupBy(meetingGroupBy === mode ? "none" : mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          )}
          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No source meetings found for this period. Try a wider date range or check client assignments.</p>
          ) : meetingGroupBy === "none" ? (
            <div className="flex flex-col">
              {meetings.map((m) => (
                <label key={m.meeting_id} className="flex items-start gap-2 px-4 py-2 text-sm border-b border-border last:border-b-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked.has(m.meeting_id)}
                    onChange={() => toggleMeeting(m.meeting_id)}
                    className="mt-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{m.meeting_title}</p>
                    <p className="text-xs text-muted-foreground">{m.contribution_summary}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {(meetingGroupBy === "day" ? groupMeetingsByDay(meetings) : []).map((group) => (
                <div key={group.key}>
                  <div data-testid="meeting-group-header" className="px-4 py-1.5 bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border">
                    {group.label}
                  </div>
                  {group.meetings.map((m) => (
                    <label key={m.meeting_id} className="flex items-start gap-2 px-4 py-2 text-sm border-b border-border last:border-b-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked.has(m.meeting_id)}
                        onChange={() => toggleMeeting(m.meeting_id)}
                        className="mt-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{m.meeting_title}</p>
                        <p className="text-xs text-muted-foreground">{m.contribution_summary}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
