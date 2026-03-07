import React, { useState } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Search, RefreshCw, Pencil, Trash2 } from "lucide-react";
import type { Thread, ThreadMeeting } from "../../../../core/threads.js";

interface ThreadCandidate {
  meeting_id: string;
  title: string;
  date: string;
  similarity: number;
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
              className="flex items-center gap-2 px-4 py-2 text-left text-sm border-b border-border cursor-pointer bg-transparent w-full hover:bg-secondary/60"
            >
              <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">{m.relevance_score}</span>
              <span className="flex-1 truncate">{m.meeting_title}</span>
              <span className="text-xs text-muted-foreground">{m.relevance_summary.slice(0, 60)}</span>
            </button>
          ))}
        </div>

        {candidates && candidates.length > 0 && (
          <div className="border-t border-border">
            <div className="px-4 py-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex-1">
                {candidates.length} Candidate{candidates.length !== 1 ? "s" : ""}
              </span>
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
            <div className="flex flex-col">
              {candidates.map((c) => (
                <label
                  key={c.meeting_id}
                  className="flex items-center gap-2 px-4 py-2 text-sm border-b border-border cursor-pointer hover:bg-secondary/60"
                >
                  <input
                    type="checkbox"
                    checked={checkedCandidates.has(c.meeting_id)}
                    onChange={() => {
                      setCheckedCandidates((prev) => {
                        const next = new Set(prev);
                        if (next.has(c.meeting_id)) {
                          next.delete(c.meeting_id);
                        } else {
                          next.add(c.meeting_id);
                        }
                        return next;
                      });
                    }}
                  />
                  <span className="text-xs font-mono text-muted-foreground w-12 shrink-0">
                    {(c.similarity * 100).toFixed(0)}%
                  </span>
                  <span className="flex-1 truncate">{c.title}</span>
                  <span className="text-xs text-muted-foreground">{c.date.slice(0, 10)}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
