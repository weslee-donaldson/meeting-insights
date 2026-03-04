import React, { useMemo } from "react";
import { Trash2, ListChecks, EyeOff } from "lucide-react";
import type { MeetingRow } from "../../../electron/channels.js";
import { Button } from "./ui/button.js";


export type GroupBy = "series" | "day" | "week" | "month";
export type SortBy = "date-desc" | "date-asc" | "client" | "relevance";

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

const GROUP_MODES: { value: GroupBy; label: string }[] = [
  { value: "series", label: "Series" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const SORT_MODES: { value: SortBy; label: string }[] = [
  { value: "date-desc", label: "Newest" },
  { value: "date-asc", label: "Oldest" },
  { value: "client", label: "Client" },
  { value: "relevance", label: "Relevance" },
];

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
    return [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  }, [meetings, sortBy, searchScores]);

  const groups = useMemo(() => {
    if (groupBy === "day") return groupByDay(sorted);
    if (groupBy === "week") return groupByWeek(sorted);
    if (groupBy === "month") return groupByMonth(sorted);
    return groupBySeries(sorted);
  }, [sorted, groupBy]);

  const hasRelevance = !!searchScores && searchScores.size > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-1.5 px-3 pt-2 pb-2 shrink-0 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-foreground font-semibold">Group by:</span>
          {GROUP_MODES.map(({ value, label }) => (
            <Button
              key={value}
              variant={groupBy === value ? "default" : "secondary"}
              size="sm"
              className="rounded-full h-auto px-3 py-0.5 text-sm"
              onClick={() => onGroupBy(value)}
            >
              {label}
            </Button>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            {onNewMeeting && (
              <Button variant="outline" size="sm" className="h-auto px-2 py-0.5 text-xs" onClick={onNewMeeting}>+ Add Meeting</Button>
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
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-foreground font-semibold">Sort:</span>
          {SORT_MODES.map(({ value, label }) =>
            value === "relevance" && !hasRelevance ? null : (
              <Button
                key={value}
                variant={sortBy === value ? "default" : "secondary"}
                size="sm"
                className="rounded-full h-auto px-3 py-0.5 text-sm"
                onClick={() => onSortBy(value)}
              >
                {label}
              </Button>
            ),
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1 pb-[10px]">
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
          <div className="px-3 py-4 text-sm text-muted-foreground">No results for '{searchQuery}'</div>
        )}
        {!loading && !searchLoading && groups.map((group) => {
          const allChecked = group.meetings.every((m) => checked.has(m.id));
          const groupIds = group.meetings.map((m) => m.id);
          const showStats = groupBy !== "series";
          return (
            <div key={group.series}>
              <div className="px-3 pt-2.5 pb-1 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold overflow-hidden text-ellipsis whitespace-nowrap text-foreground">
                    {group.label}
                  </span>
                  <button
                    onClick={() => onCheckGroup(allChecked ? [] : groupIds)}
                    aria-label={allChecked ? "Deselect all in group" : "Select all in group"}
                    className="text-muted-foreground bg-transparent border-none cursor-pointer p-0 shrink-0 hover:text-foreground"
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                  </button>
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
                {showStats && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {statLine(group.meetings)}
                  </div>
                )}
              </div>

              {group.meetings.map((m) => {
                const isHighlighted = selectedId === m.id || checked.has(m.id);
                return (
                <div
                  key={m.id}
                  data-testid={`meeting-row-${m.id}`}
                  onClick={() => { onSelect(m.id); onCheck(m.id); }}
                  className="flex items-center gap-2 py-1.5 pr-3 pl-6 cursor-pointer"
                  style={{
                    background: isHighlighted ? "var(--color-bg-elevated)" : "transparent",
                    borderLeft: "2px solid " + (isHighlighted ? "var(--color-accent)" : "transparent"),
                  }}
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
                  <div className="min-w-0 flex-1">
                    {groupBy === "series" ? (
                      <div className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap text-foreground">
                        {formatShortDate(m.date)}
                      </div>
                    ) : (
                      <div className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap text-foreground">
                        {m.title}
                      </div>
                    )}
                  </div>
                  {newMeetingIds?.has(m.id) && (
                    <span className="text-[0.6rem] font-bold px-1 py-0.5 rounded bg-accent text-accent-foreground shrink-0">NEW</span>
                  )}
                </div>
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
