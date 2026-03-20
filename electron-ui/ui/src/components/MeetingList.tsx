import React, { useMemo } from "react";
import { Trash2, EyeOff } from "lucide-react";
import type { MeetingRow } from "../../../electron/channels.js";
import { Button } from "./ui/button.js";
import { cn } from "../lib/utils.js";
import { FilterBar } from "./shared/filter-bar.js";
import { GroupHeader } from "./shared/group-header.js";
import { ListItemRow } from "./shared/list-item-row.js";
import { DensityToggle, type DensityMode } from "./shared/density-toggle.js";


export type GroupBy = "series" | "day" | "week" | "month";
export type SortBy = "date-desc" | "date-asc" | "client" | "relevance" | "thread";

interface MeetingListProps {
  meetings: MeetingRow[];
  selectedId: string | null;
  checked: Set<string>;
  groupBy: GroupBy;
  onGroupBy: (g: GroupBy) => void;
  sortBy: SortBy;
  onSortBy: (s: SortBy) => void;
  searchScores?: Map<string, number>;
  onSelect: (id: string) => void;
  onCheck: (id: string) => void;
  onCheckGroup: (ids: string[]) => void;
  onIgnoreGroup?: (ids: string[]) => void;
  searchLoading?: boolean;
  searchQuery?: string;
  loading?: boolean;
  hasFilters?: boolean;
  checkedCount?: number;
  onDelete?: () => void;
  onNewMeeting?: () => void;
  newMeetingIds?: Set<string>;
  deepSearchSummaries?: Map<string, string>;
  isDeepSearchActive?: boolean;
  deepSearchLoading?: boolean;
  deepSearchEmpty?: boolean;
  onMilestoneClick?: (milestoneId: string) => void;
  densityMode?: DensityMode;
  onDensityChange?: (mode: DensityMode) => void;
}

function normalizeSeries(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

interface SeriesGroup {
  series: string;
  label: string;
  meetings: MeetingRow[];
}

function groupBySeries(meetings: MeetingRow[]): SeriesGroup[] {
  const map = new Map<string, MeetingRow[]>();
  for (const m of meetings) {
    const key = normalizeSeries(m.title);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return [...map.entries()].map(([series, ms]) => ({
    series,
    label: ms[0].title,
    meetings: ms,
  }));
}

function groupByDay(meetings: MeetingRow[]): SeriesGroup[] {
  const map = new Map<string, MeetingRow[]>();
  for (const m of meetings) {
    const key = m.date.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return [...map.entries()].map(([key, ms]) => {
    const d = new Date(key + "T12:00:00Z");
    const label = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    return { series: key, label, meetings: ms };
  });
}

function isoWeekKey(dateStr: string): { key: string; monday: Date } {
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00Z");
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diff);
  const jan4 = new Date(Date.UTC(monday.getUTCFullYear(), 0, 4));
  const jan4Day = jan4.getUTCDay() === 0 ? 7 : jan4.getUTCDay();
  const weekNum = Math.ceil(((monday.getTime() - jan4.getTime()) / 86400000 + jan4Day) / 7);
  return { key: `${monday.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`, monday };
}

function groupByWeek(meetings: MeetingRow[]): SeriesGroup[] {
  const map = new Map<string, { meetings: MeetingRow[]; monday: Date }>();
  for (const m of meetings) {
    const { key, monday } = isoWeekKey(m.date);
    if (!map.has(key)) map.set(key, { meetings: [], monday });
    map.get(key)!.meetings.push(m);
  }
  return [...map.entries()].map(([key, { meetings: ms, monday }]) => {
    const label = "Week of " + monday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    return { series: key, label, meetings: ms };
  });
}

function groupByMonth(meetings: MeetingRow[]): SeriesGroup[] {
  const map = new Map<string, MeetingRow[]>();
  for (const m of meetings) {
    const key = m.date.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return [...map.entries()].map(([key, ms]) => {
    const d = new Date(key + "-15T12:00:00Z");
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
    return { series: key, label, meetings: ms };
  });
}

function statLine(ms: MeetingRow[]): string {
  const mCount = ms.length;
  const aiCount = ms.reduce((s, m) => s + m.actionItemCount, 0);
  return `${mCount} meeting${mCount !== 1 ? "s" : ""} · ${aiCount} action item${aiCount !== 1 ? "s" : ""}`;
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

const GROUP_LABELS: Record<GroupBy, string> = {
  series: "Series",
  day: "Day",
  week: "Week",
  month: "Month",
};

const SORT_LABELS: Record<SortBy, string> = {
  "date-desc": "Newest",
  "date-asc": "Oldest",
  client: "Client",
  relevance: "Relevance",
  thread: "Thread",
};

export function MeetingList({
  meetings,
  selectedId,
  checked,
  groupBy,
  onGroupBy,
  sortBy,
  onSortBy,
  searchScores,
  onSelect,
  onCheck,
  onCheckGroup,
  onIgnoreGroup,
  searchLoading,
  searchQuery,
  loading,
  hasFilters,
  checkedCount,
  onDelete,
  onNewMeeting,
  newMeetingIds,
  deepSearchSummaries,
  isDeepSearchActive,
  deepSearchLoading,
  deepSearchEmpty,
  onMilestoneClick,
  densityMode,
  onDensityChange,
}: MeetingListProps) {
  const sorted = useMemo(() => {
    if (sortBy === "relevance" && searchScores && searchScores.size > 0) {
      return [...meetings].sort((a, b) => (searchScores.get(a.id) ?? 2) - (searchScores.get(b.id) ?? 2));
    }
    if (sortBy === "date-asc") {
      return [...meetings].sort((a, b) => a.date.localeCompare(b.date));
    }
    if (sortBy === "client") {
      return [...meetings].sort((a, b) => a.client.localeCompare(b.client) || b.date.localeCompare(a.date));
    }
    if (sortBy === "thread") {
      return [...meetings].sort((a, b) => {
        const aHas = (a.thread_tags?.length ?? 0) > 0 ? 0 : 1;
        const bHas = (b.thread_tags?.length ?? 0) > 0 ? 0 : 1;
        if (aHas !== bHas) return aHas - bHas;
        const aTitle = a.thread_tags?.[0]?.title ?? "";
        const bTitle = b.thread_tags?.[0]?.title ?? "";
        return aTitle.localeCompare(bTitle) || b.date.localeCompare(a.date);
      });
    }
    return [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  }, [meetings, sortBy, searchScores]);

  const groups = useMemo(() => {
    if (groupBy === "day") return groupByDay(sorted);
    if (groupBy === "week") return groupByWeek(sorted);
    if (groupBy === "month") return groupByMonth(sorted);
    return groupBySeries(sorted);
  }, [sorted, groupBy]);

  const hasRelevance = !!searchScores && searchScores.size > 0;
  const hasThreads = meetings.some((m) => (m.thread_tags?.length ?? 0) > 0);

  const sortOptions = useMemo(() => {
    const opts: string[] = ["Newest", "Oldest", "Client"];
    if (hasRelevance) opts.push("Relevance");
    if (hasThreads) opts.push("Thread");
    return opts;
  }, [hasRelevance, hasThreads]);

  const sortLabelToValue: Record<string, SortBy> = {
    Newest: "date-desc",
    Oldest: "date-asc",
    Client: "client",
    Relevance: "relevance",
    Thread: "thread",
  };

  const groupLabelToValue: Record<string, GroupBy> = {
    Series: "series",
    Day: "day",
    Week: "week",
    Month: "month",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col shrink-0 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-1 px-3 pt-2 pb-1.5">
          {onNewMeeting && (
            <Button size="sm" className="h-auto px-2 py-0.5 text-xs" onClick={onNewMeeting}>+ Add Meeting</Button>
          )}
          {(checkedCount ?? 0) > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-auto px-2 py-0.5 text-xs"
              onClick={onDelete}
              aria-label={`Delete ${checkedCount}`}
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete {checkedCount}</span>
            </Button>
          )}
        </div>
        <div className="border-b border-[var(--color-line)] mx-3" />
        <div className="px-3 pt-1.5 pb-2 flex items-start gap-2">
          <FilterBar
            className="flex-1"
            groupBy={{
              label: "Group",
              value: GROUP_LABELS[groupBy],
              options: Object.values(GROUP_LABELS),
              onChange: (v) => onGroupBy(groupLabelToValue[v] ?? "series"),
            }}
            sortBy={{
              label: "Sort",
              value: SORT_LABELS[sortBy],
              options: sortOptions,
              onChange: (v) => onSortBy(sortLabelToValue[v] ?? "date-desc"),
            }}
          />
          {densityMode && onDensityChange && (
            <DensityToggle value={densityMode} onChange={onDensityChange} />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1 pb-[10px] relative">
        {deepSearchLoading && (
          <div
            data-testid="deep-search-overlay"
            className="absolute inset-0 z-10 flex items-center justify-center bg-card/80"
            style={{ pointerEvents: "auto" }}
          >
            <div className="text-sm text-muted-foreground animate-pulse">
              Deep searching {meetings.length} meetings…
            </div>
          </div>
        )}
        {loading && (
          <div data-testid="meeting-list-skeleton" className="flex flex-col gap-2 px-3 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col gap-1.5">
                <div className="h-3.5 rounded bg-muted w-2/3" />
                <div className="h-2.5 rounded bg-muted w-1/3" />
              </div>
            ))}
          </div>
        )}
        {!loading && searchLoading && (
          <div className="px-3 py-4 text-sm text-muted-foreground">Searching…</div>
        )}
        {!loading && !searchLoading && (searchQuery?.length ?? 0) >= 2 && groups.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground">
            {deepSearchEmpty ? `Deep search found no relevant results for '${searchQuery}'` : `No results for '${searchQuery}'`}
          </div>
        )}
        {!loading && !searchLoading && groups.map((group) => {
          const allChecked = group.meetings.every((m) => checked.has(m.id));
          const groupIds = group.meetings.map((m) => m.id);
          const showStats = groupBy !== "series";
          return (
            <div key={group.series}>
              <div className="flex items-center gap-1.5 mx-3 px-3 sticky top-0 bg-[var(--color-bg-elevated)] border-t border-[var(--color-line)] border-l-[3px] border-l-[var(--color-accent)]">
                <GroupHeader
                  label={group.label}
                  variant={groupBy === "day" || groupBy === "week" || groupBy === "month" ? "date" : "default"}
                  meta={showStats ? statLine(group.meetings) : undefined}
                  className="flex-1 px-0 border-t-0 bg-transparent static"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-auto px-2 py-0.5 text-xs shrink-0"
                  onClick={() => onCheckGroup(groupIds)}
                  aria-label={allChecked ? "Deselect all in group" : "Select all in group"}
                >
                  {allChecked ? "Deselect all" : "Select all"}
                </Button>
                {onIgnoreGroup && (
                  <button
                    onClick={() => onIgnoreGroup(groupIds)}
                    aria-label="Ignore all"
                    className="text-muted-foreground bg-transparent border-none cursor-pointer p-0 shrink-0"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {group.meetings.map((m) => {
                const isHighlighted = selectedId === m.id || checked.has(m.id);
                const deepActive = isDeepSearchActive && !deepSearchLoading;
                const deepSummary = deepActive ? deepSearchSummaries?.get(m.id) : undefined;
                return (
                <ListItemRow
                  key={m.id}
                  selected={isHighlighted}
                  onClick={() => { onSelect(m.id); onCheck(m.id); }}
                  density={densityMode}
                  className={cn(
                    "flex-col !items-start ml-[15px]",
                    !densityMode && "px-4 py-2",
                    deepActive && "!border-l-[var(--color-search-deep)]",
                  )}
                >
                  <div
                    data-testid={`meeting-row-${m.id}`}
                    className="flex items-center gap-2 w-full"
                  >
                    <input
                      type="checkbox"
                      checked={checked.has(m.id)}
                      onChange={() => {}}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCheck(m.id);
                      }}
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ accentColor: "var(--color-accent)" }}
                    />
                    <div className="min-w-0 flex-1 text-[11px] font-medium overflow-hidden text-ellipsis whitespace-nowrap text-secondary-foreground">
                      {groupBy === "series" ? formatShortDate(m.date) : m.title}
                    </div>
                    {m.thread_tags?.map((tag) => (
                      <span key={tag.thread_id} className="text-[9px] px-1 py-0.5 rounded border border-border text-muted-foreground shrink-0">{tag.shorthand}</span>
                    ))}
                    {m.milestone_tags?.map((tag) => (
                      <span
                        key={tag.milestone_id}
                        className="text-[0.6rem] px-1 py-0.5 rounded border border-border text-muted-foreground shrink-0 cursor-pointer hover:bg-secondary"
                        onClick={(e) => { e.stopPropagation(); onMilestoneClick?.(tag.milestone_id); }}
                      >{tag.title}</span>
                    ))}
                    {newMeetingIds?.has(m.id) && (
                      <span className="text-[0.6rem] font-bold px-1 py-0.5 rounded bg-accent text-accent-foreground shrink-0">NEW</span>
                    )}
                  </div>
                  {deepSummary && (
                    <div className="text-xs text-muted-foreground mt-0.5 pl-5.5">{deepSummary}</div>
                  )}
                </ListItemRow>
              );
              })}
            </div>
          );
        })}
        {!loading && !searchLoading && (searchQuery?.length ?? 0) < 2 && meetings.length === 0 && (
          <div className="p-4 text-xs text-muted-foreground">
            {hasFilters ? "No meetings match your filters" : "No meetings yet"}
          </div>
        )}
      </div>
    </div>
  );
}
