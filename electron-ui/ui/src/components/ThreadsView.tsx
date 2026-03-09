import React from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Plus } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Thread } from "../../../../core/threads.js";

interface ThreadsViewProps {
  threads: Thread[];
  clientName: string;
  onSelectThread: (threadId: string) => void;
  onCreateThread: () => void;
  selectedThreadId: string | null;
  statusFilter?: "open" | "resolved" | "all";
}

export function ThreadsView({
  threads,
  clientName,
  onSelectThread,
  onCreateThread,
  selectedThreadId,
  statusFilter,
}: ThreadsViewProps) {
  const filtered = statusFilter && statusFilter !== "all"
    ? threads.filter((t) => t.status === statusFilter)
    : threads;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{clientName} Threads</h2>
        <Button size="sm" variant="outline" onClick={onCreateThread} aria-label="New Thread">
          <Plus className="w-4 h-4 mr-1" />
          New Thread
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No threads
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-left text-sm border-b border-border cursor-pointer bg-transparent w-full",
                  selectedThreadId === thread.id
                    ? "bg-secondary"
                    : "hover:bg-secondary/60",
                )}
              >
                <span className="flex-1 truncate font-medium">{thread.title}</span>
                {thread.meeting_count ? (
                  <span className="text-xs font-mono text-muted-foreground shrink-0">{thread.meeting_count}</span>
                ) : null}
                <Badge variant="outline" className="text-xs shrink-0">{thread.shorthand}</Badge>
                {thread.status === "resolved" && (
                  <Badge variant="secondary" className="text-xs shrink-0">Resolved</Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
