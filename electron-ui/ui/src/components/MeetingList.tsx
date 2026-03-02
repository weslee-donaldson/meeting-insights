import React, { useMemo } from "react";
import type { MeetingRow } from "../../../electron/channels.js";

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
}: MeetingListProps) {
  const groups = useMemo(() => {
    if (groupBy === "day") return groupByDay(meetings);
    if (groupBy === "week") return groupByWeek(meetings);
    if (groupBy === "month") return groupByMonth(meetings);
    return groupBySeries(meetings);
  }, [meetings, groupBy]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "6px 12px",
          flexShrink: 0,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {GROUP_MODES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onGroupBy(value)}
            style={{
              fontSize: "0.75rem",
              padding: "3px 10px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              background: groupBy === value ? "var(--color-accent)" : "var(--color-bg-elevated)",
              color: groupBy === value ? "#fff" : "var(--color-text-secondary)",
              fontWeight: groupBy === value ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {groups.map((group) => {
          const allChecked = group.meetings.every((m) => checked.has(m.id));
          const groupIds = group.meetings.map((m) => m.id);
          const showStats = groupBy !== "series";
          return (
            <div key={group.series}>
              {/* Group header — prominent */}
              <div style={{ padding: "10px 12px 4px 12px", marginTop: "4px" }}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {group.label}
                  </span>
                  <button
                    onClick={() => onCheckGroup(allChecked ? [] : groupIds)}
                    style={{
                      fontSize: "0.7rem",
                      marginLeft: "8px",
                      flexShrink: 0,
                      color: "var(--color-text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {allChecked ? "Deselect all" : "Select all"}
                  </button>
                </div>
                {showStats && (
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    {statLine(group.meetings)}
                  </div>
                )}
              </div>

              {/* Meeting rows — indented under group header */}
              {group.meetings.map((m) => (
                <div
                  key={m.id}
                  data-testid={`meeting-row-${m.id}`}
                  onClick={() => onSelect(m.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px 12px 5px 24px",
                    cursor: "pointer",
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
                    style={{ width: "13px", height: "13px", flexShrink: 0, accentColor: "var(--color-accent)" }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    {groupBy === "series" ? (
                      <>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {formatShortDate(m.date)}
                        </div>
                        {m.client && (
                          <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                            {m.client}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {m.title}
                        </div>
                        {m.client && (
                          <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                            {m.client}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {meetings.length === 0 && (
          <div style={{ padding: "16px 12px", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            No meetings in scope
          </div>
        )}
      </div>
    </div>
  );
}
