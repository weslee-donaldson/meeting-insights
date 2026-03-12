import React, { useRef, useEffect } from "react";
import { cn } from "../lib/utils.js";
import type { Milestone } from "../../../../core/timelines.js";

type MilestoneWithMention = Milestone & { first_mentioned_at?: string | null };

interface MilestoneGanttViewProps {
  milestones: MilestoneWithMention[];
  onSelectMilestone: (id: string) => void;
  selectedMilestoneId: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  identified: "bg-gray-400",
  tracked: "bg-blue-500",
  completed: "bg-green-500",
  missed: "bg-red-500",
  deferred: "bg-amber-500",
};

const MONTH_WIDTH = 120;
const LEFT_COL_WIDTH = 320;

function parseYearMonth(dateStr: string): { year: number; month: number } {
  const d = new Date(dateStr);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthLabel(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function monthIndex(year: number, month: number, startYear: number, startMonth: number): number {
  return (year - startYear) * 12 + (month - startMonth);
}

function buildMonthColumns(
  milestones: MilestoneWithMention[],
  todayYear: number,
  todayMonth: number,
): Array<{ year: number; month: number; label: string }> {
  let minYear = todayYear;
  let minMonth = todayMonth;
  let maxYear = todayYear;
  let maxMonth = todayMonth + 1;

  for (const m of milestones) {
    if (m.first_mentioned_at) {
      const { year, month } = parseYearMonth(m.first_mentioned_at);
      if (year < minYear || (year === minYear && month < minMonth)) {
        minYear = year;
        minMonth = month;
      }
    }
    if (m.target_date) {
      const { year, month } = parseYearMonth(m.target_date);
      if (year > maxYear || (year === maxYear && month > maxMonth)) {
        maxYear = year;
        maxMonth = month;
      }
    }
  }

  const columns: Array<{ year: number; month: number; label: string }> = [];
  let cy = minYear;
  let cm = minMonth;
  while (cy < maxYear || (cy === maxYear && cm <= maxMonth)) {
    columns.push({ year: cy, month: cm, label: monthLabel(cy, cm) });
    cm++;
    if (cm > 11) {
      cm = 0;
      cy++;
    }
  }
  return columns;
}

export function MilestoneGanttView({
  milestones,
  onSelectMilestone,
  selectedMilestoneId,
}: MilestoneGanttViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  if (milestones.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No milestones
      </div>
    );
  }

  const columns = buildMonthColumns(milestones, todayYear, todayMonth);
  const startYear = columns[0].year;
  const startMonth = columns[0].month;
  const totalCols = columns.length;

  const todayColIndex = monthIndex(todayYear, todayMonth, startYear, startMonth);
  const todayFraction = today.getDate() / 31;
  const todayLeft = todayColIndex * MONTH_WIDTH + todayFraction * MONTH_WIDTH;

  useEffect(() => {
    if (scrollRef.current) {
      const scrollTarget = todayLeft - scrollRef.current.clientWidth / 2;
      scrollRef.current.scrollLeft = Math.max(0, scrollTarget);
    }
  }, [todayLeft]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: LEFT_COL_WIDTH }} className="shrink-0 flex flex-col">
          <div className="h-8 border-b border-border" />
          {milestones.map((m) => (
            <div
              key={m.id}
              data-testid="gantt-row"
              className={cn(
                "flex items-center gap-2 px-2 h-10 border-b border-border text-sm shrink-0",
                selectedMilestoneId === m.id ? "bg-secondary" : "hover:bg-secondary/60",
              )}
            >
              <span className="flex-1 truncate font-medium">{m.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">{m.status}</span>
            </div>
          ))}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-x-auto relative">
          <div style={{ minWidth: totalCols * MONTH_WIDTH }} className="relative w-full">
            <div className="flex h-8 border-b border-border">
              {columns.map((col) => (
                <div
                  key={monthKey(col.year, col.month)}
                  style={{ width: MONTH_WIDTH }}
                  className="shrink-0 flex items-center justify-center text-xs font-medium border-r border-border text-muted-foreground"
                >
                  {col.label}
                </div>
              ))}
            </div>

            <div className="relative">
              <div
                data-testid="today-marker"
                style={{ left: todayLeft }}
                className="absolute top-0 bottom-0 w-px bg-blue-500 z-10 pointer-events-none"
              />

              {milestones.map((m) => {
                if (!m.target_date) return (
                  <div key={m.id} className="h-10 border-b border-border" />
                );

                const startDate = m.first_mentioned_at ?? m.created_at;
                const { year: sy, month: sm } = parseYearMonth(startDate);
                const { year: ey, month: em } = parseYearMonth(m.target_date);

                const startCol = Math.max(0, monthIndex(sy, sm, startYear, startMonth));
                const endCol = Math.min(totalCols - 1, monthIndex(ey, em, startYear, startMonth));
                const barLeft = startCol * MONTH_WIDTH + 4;
                const barWidth = Math.max(MONTH_WIDTH / 2, (endCol - startCol + 1) * MONTH_WIDTH - 8);

                return (
                  <div key={m.id} className="h-10 border-b border-border relative flex items-center">
                    <button
                      data-testid="gantt-bar"
                      style={{ left: barLeft, width: barWidth }}
                      className={cn(
                        "absolute h-5 rounded cursor-pointer opacity-80 hover:opacity-100",
                        STATUS_COLORS[m.status] ?? "bg-gray-400",
                      )}
                      onClick={() => onSelectMilestone(m.id)}
                      aria-label={m.title}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
