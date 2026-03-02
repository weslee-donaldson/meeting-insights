import React, { useMemo, useState } from "react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import type { MeetingRow } from "../../../electron/channels.js";
import { Button } from "./ui/button.js";


export type GroupBy = "series" | "day" | "week" | "month";

interface MeetingListProps {
  meetings: MeetingRow[];
  selectedId: string | null;
  checked: Set<string>;
  groupBy: GroupBy;
  onGroupBy: (g: GroupBy) => void;
  onSelect: (id: string) => void;
  onCheck: (id: string) => void;
  onCheckGroup: (ids: string[]) => void;
  onIgnoreGroup?: (ids: string[]) => void;
  sortAsc?: boolean;
  onSortToggle?: () => void;
  searchLoading?: boolean;
  searchQuery?: string;
  loading?: boolean;
  hasFilters?: boolean;
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
  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  const map = new Map<string, MeetingRow[]>();
  for (const m of sorted) {
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
  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  const map = new Map<string, MeetingRow[]>();
  for (const m of sorted) {
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
  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  const map = new Map<string, { meetings: MeetingRow[]; monday: Date }>();
  for (const m of sorted) {
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
  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  const map = new Map<string, MeetingRow[]>();
  for (const m of sorted) {
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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

interface GroupMenuProps {
  onSelectAll: () => void;
  onIgnoreAll?: () => void;
}

function GroupMenu({ onSelectAll, onIgnoreAll }: GroupMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative ml-2 shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Group menu"
        className="text-muted-foreground bg-transparent border-none cursor-pointer p-0"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-secondary border border-border rounded shadow-lg flex flex-col min-w-[120px]">
          <button
            onClick={() => { onSelectAll(); setOpen(false); }}
            className="px-3 py-1.5 text-left text-sm hover:bg-accent text-foreground bg-transparent border-none cursor-pointer"
            aria-label="Select all"
          >
            Select all
          </button>
          {onIgnoreAll && (
            <button
              onClick={() => { onIgnoreAll(); setOpen(false); }}
              className="px-3 py-1.5 text-left text-sm hover:bg-accent text-foreground bg-transparent border-none cursor-pointer"
              aria-label="Ignore all"
            >
              Ignore all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const GROUP_MODES: { value: GroupBy; label: string }[] = [
  { value: "series", label: "Series" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export function MeetingList({
  meetings,
  selectedId,
  checked,
  groupBy,
  onGroupBy,
  onSelect,
  onCheck,
  onCheckGroup,
  onIgnoreGroup,
  sortAsc,
  onSortToggle,
  searchLoading,
  searchQuery,
  loading,
  hasFilters,
}: MeetingListProps) {
  const groups = useMemo(() => {
    let g: SeriesGroup[];
    if (groupBy === "day") g = groupByDay(meetings);
    else if (groupBy === "week") g = groupByWeek(meetings);
    else if (groupBy === "month") g = groupByMonth(meetings);
    else g = groupBySeries(meetings);
    if (sortAsc) {
      return g.reverse().map((gr) => ({ ...gr, meetings: [...gr.meetings].reverse() }));
    }
    return g;
  }, [meetings, groupBy, sortAsc]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-3 py-1.5 shrink-0 border-b border-border items-center">
        {GROUP_MODES.map(({ value, label }) => (
          <Button
            key={value}
            variant={groupBy === value ? "default" : "secondary"}
            size="sm"
            className="rounded-full h-auto px-2.5 py-0.5 text-xs"
            onClick={() => onGroupBy(value)}
          >
            {label}
          </Button>
        ))}
        {onSortToggle && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-auto px-1.5 py-0.5"
            onClick={onSortToggle}
            aria-label={sortAsc ? "Sort descending" : "Sort ascending"}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
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
                <div className="flex items-baseline">
                  <span className="text-sm font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-foreground">
                    {group.label}
                  </span>
                  <GroupMenu
                    onSelectAll={() => onCheckGroup(allChecked ? [] : groupIds)}
                    onIgnoreAll={onIgnoreGroup ? () => onIgnoreGroup(groupIds) : undefined}
                  />
                </div>
                {showStats && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {statLine(group.meetings)}
                  </div>
                )}
              </div>

              {group.meetings.map((m) => (
                <div
                  key={m.id}
                  data-testid={`meeting-row-${m.id}`}
                  onClick={() => onSelect(m.id)}
                  className="flex items-center gap-2 py-1.5 pr-3 pl-6 cursor-pointer"
                  style={{
                    background: selectedId === m.id ? "var(--color-bg-elevated)" : "transparent",
                    borderLeft: "2px solid " + (selectedId === m.id ? "var(--color-accent)" : "transparent"),
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
                </div>
              ))}
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
