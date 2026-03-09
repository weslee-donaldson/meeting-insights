import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { RichTextEditor } from "./ui/rich-text-editor.js";
import { RefreshCw, Check, RotateCcw, Trash2, X, Pencil, ArrowLeft, Save, ListRestart } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Insight, InsightMeeting } from "../../../../core/insights.js";

interface TopicDetail {
  topic: string;
  summary: string;
  status: "green" | "yellow" | "red";
}

interface InsightDetailViewProps {
  insight: Insight;
  meetings: InsightMeeting[];
  onDelete: () => void;
  onRegenerate: () => void;
  onFinalize: () => void;
  onRemoveMeetings?: (meetingIds: string[]) => void;
  onUpdateSummary?: (summary: string) => void;
  onShowAllMeetings?: () => void;
  isRegenerating?: boolean;
}

const RAG_COLORS = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
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

function groupMeetingsByWeek(meetings: InsightMeeting[]): MeetingGroup[] {
  const map = new Map<string, { meetings: InsightMeeting[]; monday: Date }>();
  for (const m of meetings) {
    const d = new Date(m.meeting_date.slice(0, 10) + "T12:00:00Z");
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() + diff);
    const key = monday.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, { meetings: [], monday });
    map.get(key)!.meetings.push(m);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, { meetings: ms, monday }]) => ({
      key,
      label: "Week of " + monday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
      meetings: ms,
    }));
}

function groupMeetingsByMonth(meetings: InsightMeeting[]): MeetingGroup[] {
  const map = new Map<string, InsightMeeting[]>();
  for (const m of meetings) {
    const key = m.meeting_date.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, ms]) => {
      const d = new Date(key + "-15T12:00:00Z");
      return { key, label: d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }), meetings: ms };
    });
}

function groupMeetingsBySeries(meetings: InsightMeeting[]): MeetingGroup[] {
  const map = new Map<string, InsightMeeting[]>();
  for (const m of meetings) {
    const key = m.meeting_title.toLowerCase().replace(/\s+/g, " ").trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return [...map.entries()]
    .sort(([, a], [, b]) => b.length - a.length)
    .map(([, ms]) => ({
      key: ms[0].meeting_title,
      label: ms[0].meeting_title,
      meetings: ms.sort((a, b) => b.meeting_date.localeCompare(a.meeting_date)),
    }));
}

function hasContent(html: string): boolean {
  const stripped = html.replace(/<[^>]+>/g, "").trim();
  return stripped.length > 0;
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
  onUpdateSummary,
  onShowAllMeetings,
  isRegenerating,
}: InsightDetailViewProps) {
  const topics: TopicDetail[] = insight.topic_details ? JSON.parse(insight.topic_details) : [];
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState("");
  const summaryHtml = insight.executive_summary ?? "";
  const hasSummary = hasContent(summaryHtml);

  const handleSummaryChange = useCallback((html: string) => {
    setSummaryDraft(html);
  }, []);

  const prevRegenerating = useRef(isRegenerating);
  useEffect(() => {
    if (prevRegenerating.current && !isRegenerating) {
      setEditing(false);
    }
    prevRegenerating.current = isRegenerating;
  }, [isRegenerating]);

  useEffect(() => {
    setChecked(new Set());
  }, [meetings]);

  const [meetingGroupBy, setMeetingGroupBy] = useState<"none" | "series" | "day" | "week" | "month">("none");

  const uncheckedIds = meetings.filter((m) => !checked.has(m.meeting_id)).map((m) => m.meeting_id);

  function checkGroup(meetingIds: string[], value: boolean) {
    setChecked((prev) => {
      const next = new Set(prev);
      for (const id of meetingIds) {
        if (value) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

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
        <div className="flex gap-1 mt-2 ml-6.5">
          {editing ? (
            <Button size="sm" variant="outline" className="h-auto px-2 py-0.5 text-xs" onClick={() => setEditing(false)}>
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-auto px-2 py-0.5 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
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
        {editing ? (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground">Source Meetings</h3>
              <div className="flex gap-1">
                {onShowAllMeetings && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-auto px-2 py-0.5 text-xs"
                    onClick={onShowAllMeetings}
                  >
                    <ListRestart className="w-3 h-3 mr-1" />
                    Show All Meetings
                  </Button>
                )}
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
                {(meetingGroupBy === "day" ? groupMeetingsByDay(meetings)
                  : meetingGroupBy === "week" ? groupMeetingsByWeek(meetings)
                  : meetingGroupBy === "month" ? groupMeetingsByMonth(meetings)
                  : groupMeetingsBySeries(meetings)).map((group) => (
                  <div key={group.key}>
                    <div data-testid="meeting-group-header" className="flex items-center justify-between px-4 py-1.5 bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border">
                      <span>{group.label}</span>
                      {group.meetings.every((m) => checked.has(m.meeting_id)) ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto px-1 py-0 text-xs"
                          onClick={() => checkGroup(group.meetings.map((m) => m.meeting_id), false)}
                        >
                          Deselect all
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto px-1 py-0 text-xs"
                          onClick={() => checkGroup(group.meetings.map((m) => m.meeting_id), true)}
                        >
                          Select all
                        </Button>
                      )}
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
            <div className="mt-3 pt-3 border-t border-border">
              <Button size="sm" variant="default" className="h-auto px-3 py-1.5 text-xs" onClick={onRegenerate} disabled={isRegenerating}>
                <RefreshCw className={cn("w-3 h-3 mr-1", isRegenerating && "animate-spin")} />
                {isRegenerating ? "Regenerating..." : insight.executive_summary ? "Regenerate" : "Generate"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Executive Summary</h3>
                {hasSummary && !editingSummary && onUpdateSummary && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto px-1.5 py-0.5 text-xs"
                    onClick={() => { setSummaryDraft(summaryHtml); setEditingSummary(true); }}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              {editingSummary ? (
                <div className="flex flex-col gap-2">
                  <RichTextEditor
                    initialHtml={summaryDraft}
                    onChange={handleSummaryChange}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-auto px-2 py-0.5 text-xs"
                      onClick={() => { onUpdateSummary?.(summaryDraft); setEditingSummary(false); }}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-auto px-2 py-0.5 text-xs"
                      onClick={() => setEditingSummary(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : hasSummary ? (
                <div data-testid="summary-display" className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
              ) : (
                <p className="text-sm text-muted-foreground">No summary yet. Click Edit to select meetings and generate.</p>
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
          </>
        )}
      </ScrollArea>
    </div>
  );
}
