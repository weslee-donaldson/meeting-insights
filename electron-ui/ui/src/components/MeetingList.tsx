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
  const groups = useMemo(() => groupBySeries(meetings), [meetings]);

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
          return (
            <div key={group.series}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  marginTop: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {group.label}
                </span>
                <button
                  onClick={() => onCheckGroup(allChecked ? [] : groupIds)}
                  style={{
                    fontSize: "0.75rem",
                    marginLeft: "8px",
                    flexShrink: 0,
                    color: "var(--color-text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {allChecked ? "Deselect all" : "Select all"}
                </button>
              </div>
              {group.meetings.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    background: selectedId === m.id ? "var(--color-bg-elevated)" : "transparent",
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
                    style={{ width: "14px", height: "14px", flexShrink: 0, accentColor: "var(--color-accent)" }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {m.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {m.date.slice(0, 10)}
                      {m.client && (
                        <span style={{ marginLeft: "4px", color: "var(--color-text-muted)" }}>
                          [{m.client}]
                        </span>
                      )}
                    </div>
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
