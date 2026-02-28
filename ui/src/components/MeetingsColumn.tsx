import React, { useMemo } from "react";
import type { MeetingRow } from "../../../electron/channels.js";

interface Props {
  meetings: MeetingRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleGroup: (ids: string[]) => void;
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

export function MeetingsColumn({ meetings, selected, onToggle, onToggleGroup }: Props) {
  const groups = useMemo(() => groupBySeries(meetings), [meetings]);

  return (
    <div className="py-1">
      {groups.map((group) => {
        const allSelected = group.meetings.every((m) => selected.has(m.id));
        return (
          <div key={group.series}>
            <div className="flex items-center px-3 py-1.5 mt-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex-1 truncate">
                {group.label}
              </span>
              <button
                onClick={() => onToggleGroup(group.meetings.map((m) => m.id))}
                className="text-xs text-zinc-600 hover:text-zinc-300 ml-2 shrink-0"
              >
                {allSelected ? "Deselect all" : "Select all"}
              </button>
            </div>
            {group.meetings.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-zinc-900 group"
              >
                <input
                  type="checkbox"
                  checked={selected.has(m.id)}
                  onChange={() => onToggle(m.id)}
                  className="w-3.5 h-3.5 rounded accent-blue-400 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-zinc-300 truncate">{m.title}</div>
                  <div className="text-xs text-zinc-600">
                    {m.date.slice(0, 10)}
                    {m.client && (
                      <span className="ml-1 text-zinc-700">[{m.client}]</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        );
      })}
      {meetings.length === 0 && (
        <div className="px-3 py-4 text-xs text-zinc-600">No meetings in scope</div>
      )}
    </div>
  );
}
