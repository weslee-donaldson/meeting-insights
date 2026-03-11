import React, { useState } from "react";
import type { Milestone } from "../../../../core/timelines.js";

interface MilestoneCalendarViewProps {
  milestones: Milestone[];
  onSelectMilestone: (id: string) => void;
  selectedMilestoneId: string | null;
  initialMonth?: { year: number; month: number };
}

const STATUS_COLORS: Record<string, string> = {
  identified: "bg-gray-400",
  tracked: "bg-blue-500",
  completed: "bg-green-500",
  missed: "bg-red-500",
  deferred: "bg-amber-500",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function MilestoneCalendarView({
  milestones,
  onSelectMilestone,
  selectedMilestoneId: _selectedMilestoneId,
  initialMonth,
}: MilestoneCalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(initialMonth?.year ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth?.month ?? today.getMonth());

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const scheduledMilestones = milestones.filter((m) => m.target_date !== null);
  const unscheduledMilestones = milestones.filter((m) => m.target_date === null);

  function milestonesForDay(day: number): Milestone[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return scheduledMilestones.filter((m) => m.target_date === dateStr);
  }

  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7).concat(Array(7 - cells.slice(i, i + 7).length).fill(null)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <button
          aria-label="Previous month"
          onClick={prevMonth}
          className="text-sm px-2 py-1 rounded hover:bg-muted"
        >
          ‹
        </button>
        <span className="font-semibold text-sm">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          aria-label="Next month"
          onClick={nextMonth}
          className="text-sm px-2 py-1 rounded hover:bg-muted"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {rows.map((row, ri) =>
          row.map((day, ci) => (
            <div key={`${ri}-${ci}`} className="min-h-16 border border-border p-1 text-xs">
              {day !== null && (
                <>
                  <div className="text-muted-foreground mb-1">{day}</div>
                  <div className="flex flex-col gap-0.5">
                    {milestonesForDay(day).map((m) => (
                      <button
                        key={m.id}
                        data-testid="calendar-pill"
                        onClick={() => onSelectMilestone(m.id)}
                        className={`text-white rounded px-1 py-0.5 text-left truncate ${STATUS_COLORS[m.status] ?? "bg-gray-400"}`}
                      >
                        {m.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )),
        )}
      </div>

      {unscheduledMilestones.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm font-semibold mb-2">Unscheduled</h3>
          <div className="flex flex-col gap-1">
            {unscheduledMilestones.map((m) => (
              <button
                key={m.id}
                data-testid={`unscheduled-item-${m.id}`}
                onClick={() => onSelectMilestone(m.id)}
                className={`text-white rounded px-2 py-1 text-left text-sm ${STATUS_COLORS[m.status] ?? "bg-gray-400"}`}
              >
                {m.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
