import React, { useState } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Search, RefreshCw, Pencil, Trash2, Check, RotateCcw } from "lucide-react";
import type { Thread, ThreadMeeting } from "../../../../core/threads.js";

interface ThreadCandidate {
  meeting_id: string;
  title: string;
  date: string;
  similarity: number;
}

type CandidateGroupBy = "none" | "day" | "week" | "month";

interface CandidateGroup {
  key: string;
  label: string;
  candidates: ThreadCandidate[];
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr.slice(0, 10) + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function groupCandidatesByDay(candidates: ThreadCandidate[]): CandidateGroup[] {
  const map = new Map<string, ThreadCandidate[]>();
  for (const c of candidates) {
    const key = c.date.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, cs]) => ({ key, label: formatDayLabel(key), candidates: cs }));
}

function groupCandidatesByWeek(candidates: ThreadCandidate[]): CandidateGroup[] {
  const map = new Map<string, { candidates: ThreadCandidate[]; monday: Date }>();
  for (const c of candidates) {
    const d = new Date(c.date.slice(0, 10) + "T12:00:00Z");
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() + diff);
    const key = monday.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, { candidates: [], monday });
    map.get(key)!.candidates.push(c);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, { candidates: cs, monday }]) => ({
      key,
      label: "Week of " + monday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
      candidates: cs,
    }));
}

function groupCandidatesByMonth(candidates: ThreadCandidate[]): CandidateGroup[] {
  const map = new Map<string, ThreadCandidate[]>();
  for (const c of candidates) {
    const key = c.date.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, cs]) => {
      const d = new Date(key + "-15T12:00:00Z");
      return { key, label: d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }), candidates: cs };
    });
}

const CANDIDATE_GROUP_MODES: { value: CandidateGroupBy; label: string }[] = [
  { value: "none", label: "Score" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

interface CandidateListProps {
  candidates: ThreadCandidate[];
  groupBy: CandidateGroupBy;
  checkedCandidates: Set<string>;
  onToggle: (meetingId: string) => void;
}

function CandidateRow({ c, checked, onToggle }: { c: ThreadCandidate; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-2 px-4 py-1.5 text-sm border-b border-border cursor-pointer hover:bg-secondary/60">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">{(c.similarity * 100).toFixed(0)}%</span>
      <span className="flex-1 truncate">{c.title}</span>
      <span className="text-xs text-muted-foreground shrink-0">{new Date(c.date).toLocaleDateString()}</span>
    </label>
  );
}

function CandidateList({ candidates, groupBy, checkedCandidates, onToggle }: CandidateListProps) {
  if (groupBy === "none") {
    const sorted = [...candidates].sort((a, b) => b.similarity - a.similarity);
    return (
      <div className="flex flex-col">
        {sorted.map((c) => (
          <CandidateRow key={c.meeting_id} c={c} checked={checkedCandidates.has(c.meeting_id)} onToggle={() => onToggle(c.meeting_id)} />
        ))}
      </div>
    );
  }

  const groups =
    groupBy === "day" ? groupCandidatesByDay(candidates) :
    groupBy === "week" ? groupCandidatesByWeek(candidates) :
    groupCandidatesByMonth(candidates);

  return (
    <div className="flex flex-col">
      {groups.map((g) => (
        <div key={g.key}>
          <div className="px-4 py-1 text-[0.65rem] font-semibold text-muted-foreground bg-secondary/40">{g.label}</div>
          {g.candidates.map((c) => (
            <CandidateRow key={c.meeting_id} c={c} checked={checkedCandidates.has(c.meeting_id)} onToggle={() => onToggle(c.meeting_id)} />
          ))}
        </div>
      ))}
    </div>
  );
}

interface ThreadDetailViewProps {
  thread: Thread;
  meetings: ThreadMeeting[];
  candidates?: ThreadCandidate[];
  onEdit: () => void;
  onDelete: () => void;
  onFindCandidates: () => void;
  onRemoveMeeting: (meetingId: string) => void;
  onRegenerateSummary: (meetingIds?: string[]) => void;
  onMeetingClick: (meetingId: string) => void;
  onEvaluateCandidates?: (meetingIds: string[], overrideExisting: boolean) => void;
  onCandidateCheck?: (checkedIds: Set<string>) => void;
  onResolve?: (status: "open" | "resolved") => void;
}

export function ThreadDetailView({
  thread,
  meetings,
  candidates,
  onEdit,
  onDelete,
  onFindCandidates,
  onRemoveMeeting,
  onRegenerateSummary,
  onMeetingClick,
  onEvaluateCandidates,
  onCandidateCheck,
  onResolve,
}: ThreadDetailViewProps) {
  const sorted = [...meetings].sort((a, b) => b.relevance_score - a.relevance_score);
  const maxEvaluatedAt = meetings.length > 0
    ? meetings.reduce((max, m) => m.evaluated_at > max ? m.evaluated_at : max, meetings[0].evaluated_at)
    : null;
  const criteriaStale = maxEvaluatedAt !== null && thread.criteria_changed_at > maxEvaluatedAt;

  const [checkedCandidates, setCheckedCandidates] = useState<Set<string>>(
    () => new Set(candidates?.map((c) => c.meeting_id) ?? []),
  );
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [candidateGroupBy, setCandidateGroupBy] = useState<CandidateGroupBy>("none");

  const prevCandidateIds = React.useRef<string>("");
  const candidateIds = candidates?.map((c) => c.meeting_id).join(",") ?? "";
  if (candidateIds !== prevCandidateIds.current) {
    prevCandidateIds.current = candidateIds;
    setCheckedCandidates(new Set(candidates?.map((c) => c.meeting_id) ?? []));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold flex-1">{thread.title}</h2>
        <Badge variant="outline">{thread.shorthand}</Badge>
        <Badge variant={thread.status === "open" ? "default" : "secondary"}>{thread.status}</Badge>
        <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete">
          <Trash2 className="w-4 h-4" />
        </Button>
        {onResolve && (
          thread.status === "open" ? (
            <Button size="sm" variant="ghost" onClick={() => onResolve("resolved")} aria-label="Resolve">
              <Check className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => onResolve("open")} aria-label="Reopen">
              <RotateCcw className="w-4 h-4" />
            </Button>
          )
        )}
      </div>

      {criteriaStale && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs">
          Criteria changed — re-evaluate?
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-muted-foreground mb-1">Summary</h3>
          {thread.summary ? (
            <p className="text-sm">{thread.summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No summary yet — click Regenerate</p>
          )}
        </div>

        <div className="px-4 py-2 flex items-center gap-2 border-t border-border">
          <span className="text-xs font-semibold text-muted-foreground flex-1">
            {sorted.length} Meeting{sorted.length !== 1 ? "s" : ""}
          </span>
          <Button size="sm" variant="outline" onClick={onFindCandidates} aria-label="Find Candidates">
            <Search className="w-3 h-3 mr-1" />
            Find Candidates
          </Button>
          {sorted.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => onRegenerateSummary()} aria-label="Regenerate">
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          )}
        </div>

        <div className="flex flex-col">
          {sorted.map((m) => (
            <button
              key={m.meeting_id}
              onClick={() => onMeetingClick(m.meeting_id)}
              className="flex flex-col gap-1 px-4 py-2 text-left text-sm border-b border-border cursor-pointer bg-transparent w-full hover:bg-secondary/60"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">{m.relevance_score}</span>
                <span className="flex-1 truncate">{m.meeting_title}</span>
              </div>
              <p className="text-xs text-muted-foreground pl-10">{m.relevance_summary}</p>
            </button>
          ))}
        </div>

        {candidates && candidates.length > 0 && (
          <div className="border-t border-border">
            <div className="px-4 py-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex-1">
                {candidates.length} Candidate{candidates.length !== 1 ? "s" : ""}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-auto px-2 py-0.5 text-[0.7rem]"
                aria-label={checkedCandidates.size === candidates.length ? "Deselect all" : "Select all"}
                onClick={() => {
                  if (checkedCandidates.size === candidates.length) {
                    setCheckedCandidates(new Set());
                    onCandidateCheck?.(new Set());
                  } else {
                    const all = new Set(candidates.map((c) => c.meeting_id));
                    setCheckedCandidates(all);
                    onCandidateCheck?.(all);
                  }
                }}
              >
                {checkedCandidates.size === candidates.length ? "Deselect all" : "Select all"}
              </Button>
              <label className="flex items-center gap-1 text-xs" data-override="">
                <input
                  type="checkbox"
                  checked={overrideExisting}
                  onChange={(e) => setOverrideExisting(e.target.checked)}
                  aria-label="Override existing"
                />
                Override existing
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEvaluateCandidates?.([...checkedCandidates], overrideExisting)}
              >
                Evaluate Selected ({checkedCandidates.size})
              </Button>
            </div>
            <div className="px-4 py-1 flex items-center gap-1">
              <span className="text-[0.65rem] text-muted-foreground mr-1">Group:</span>
              {CANDIDATE_GROUP_MODES.map(({ value, label }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={candidateGroupBy === value ? "default" : "outline"}
                  className="h-auto px-2 py-0.5 text-[0.65rem]"
                  onClick={() => setCandidateGroupBy(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <CandidateList
              candidates={candidates}
              groupBy={candidateGroupBy}
              checkedCandidates={checkedCandidates}
              onToggle={(meetingId) => {
                setCheckedCandidates((prev) => {
                  const next = new Set(prev);
                  if (next.has(meetingId)) next.delete(meetingId);
                  else next.add(meetingId);
                  onCandidateCheck?.(next);
                  return next;
                });
              }}
            />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
