import React from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Search, RefreshCw, Pencil, Trash2 } from "lucide-react";
import type { Thread, ThreadMeeting } from "../../../../core/threads.js";

interface ThreadDetailViewProps {
  thread: Thread;
  meetings: ThreadMeeting[];
  onEdit: () => void;
  onDelete: () => void;
  onFindCandidates: () => void;
  onRemoveMeeting: (meetingId: string) => void;
  onRegenerateSummary: (meetingIds?: string[]) => void;
  onMeetingClick: (meetingId: string) => void;
}

export function ThreadDetailView({
  thread,
  meetings,
  onEdit,
  onDelete,
  onFindCandidates,
  onRemoveMeeting,
  onRegenerateSummary,
  onMeetingClick,
}: ThreadDetailViewProps) {
  const sorted = [...meetings].sort((a, b) => b.relevance_score - a.relevance_score);
  const maxEvaluatedAt = meetings.length > 0
    ? meetings.reduce((max, m) => m.evaluated_at > max ? m.evaluated_at : max, meetings[0].evaluated_at)
    : null;
  const criteriaStale = maxEvaluatedAt !== null && thread.criteria_changed_at > maxEvaluatedAt;

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
      </ScrollArea>
    </div>
  );
}
