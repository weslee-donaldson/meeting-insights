import React, { useState } from "react";
import { Button } from "./ui/button.js";
import { Badge } from "./ui/badge.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog.js";
import { Trash2, Pencil, GitMerge } from "lucide-react";
import { cn } from "../lib/utils.js";
import type { Milestone, DateSlippageEntry, MilestoneMention, MilestoneActionItem } from "../../../../core/timelines.js";

interface UpdateMilestoneInput {
  title: string;
  description: string;
  targetDate: string | null;
  status: string;
}

interface TimelineDetailViewProps {
  milestone: Milestone;
  onDelete: () => void;
  slippage?: DateSlippageEntry[];
  mentions?: MilestoneMention[];
  onMeetingClick?: (meetingId: string) => void;
  actionItems?: MilestoneActionItem[];
  onUnlinkActionItem?: (milestoneId: string, meetingId: string, itemIndex: number) => void;
  pendingMentions?: MilestoneMention[];
  onConfirmMention?: (milestoneId: string, meetingId: string) => void;
  onRejectMention?: (milestoneId: string, meetingId: string) => void;
  onUpdate?: (input: UpdateMilestoneInput) => void;
  allMilestones?: Array<{ id: string; title: string }>;
  onMerge?: (targetMilestoneId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  identified: "bg-gray-500",
  tracked: "bg-blue-500",
  completed: "bg-green-500",
  missed: "bg-red-500",
  deferred: "bg-amber-500",
};

function formatDetailDate(dateStr: string | null): string {
  if (!dateStr) return "Unscheduled";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TimelineDetailView({
  milestone,
  onDelete,
  slippage,
  mentions,
  onMeetingClick,
  actionItems,
  onUnlinkActionItem,
  pendingMentions,
  onConfirmMention,
  onRejectMention,
  onUpdate,
  allMilestones,
  onMerge,
}: TimelineDetailViewProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [editTitle, setEditTitle] = useState(milestone.title);
  const [editDescription, setEditDescription] = useState(milestone.description);
  const [editTargetDate, setEditTargetDate] = useState(milestone.target_date ?? "");
  const [editStatus, setEditStatus] = useState(milestone.status);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              data-testid="detail-status-dot"
              className={cn(
                "w-3 h-3 rounded-full shrink-0",
                STATUS_COLORS[milestone.status] ?? "bg-gray-500",
              )}
            />
            <h2 className="text-lg font-semibold">{milestone.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="capitalize">
              {milestone.status}
            </Badge>
            {allMilestones && allMilestones.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                aria-label="Merge into..."
                onClick={() => { setMergeTargetId(allMilestones[0].id); setMerging(true); }}
              >
                <GitMerge className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              aria-label="Edit"
              onClick={() => {
                setEditTitle(milestone.title);
                setEditDescription(milestone.description);
                setEditTargetDate(milestone.target_date ?? "");
                setEditStatus(milestone.status);
                setEditing(true);
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Delete"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="edit-title" className="text-xs font-medium">Title</label>
              <input
                id="edit-title"
                aria-label="Title"
                className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-description" className="text-xs font-medium">Description</label>
              <textarea
                id="edit-description"
                aria-label="Description"
                className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-target-date" className="text-xs font-medium">Target date</label>
              <input
                id="edit-target-date"
                aria-label="Target date"
                type="date"
                className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-status" className="text-xs font-medium">Status</label>
              <select
                id="edit-status"
                aria-label="Status"
                className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="identified">identified</option>
                <option value="tracked">tracked</option>
                <option value="completed">completed</option>
                <option value="missed">missed</option>
                <option value="deferred">deferred</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                aria-label="Save"
                onClick={() => {
                  onUpdate?.({ title: editTitle, description: editDescription, targetDate: editTargetDate || null, status: editStatus });
                  setEditing(false);
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Cancel"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {formatDetailDate(milestone.target_date)}
            </div>

            {milestone.description && (
              <p className="text-sm">{milestone.description}</p>
            )}
          </>
        )}

        {slippage && slippage.length > 0 && (
          <div className="space-y-2">
            <div
              data-testid="slippage-warning"
              className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
            >
              Target date has changed
            </div>
            <h3 className="text-sm font-semibold">Date History</h3>
            <div className="space-y-1">
              {slippage.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {formatDetailDate(entry.mentioned_at)}
                  </span>
                  <span className="text-muted-foreground">—</span>
                  <span>{formatDetailDate(entry.target_date_at_mention)}</span>
                  <span className="text-muted-foreground text-xs">
                    ({entry.meeting_title})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mentions && mentions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Mentions</h3>
            <div className="space-y-2">
              {mentions.map((mention, i) => (
                <div key={i} className="space-y-1 text-sm border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{mention.mention_type}</Badge>
                    <button className="text-sm font-medium hover:underline" onClick={() => onMeetingClick?.(mention.meeting_id)}>
                      {mention.meeting_title}
                    </button>
                    {mention.pending_review === 1 && (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Pending</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">{mention.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {actionItems && actionItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Linked Action Items</h3>
            <div className="space-y-1">
              {actionItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="text-muted-foreground">#{item.item_index} </span>
                    {item.meeting_title}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Unlink"
                    onClick={() => onUnlinkActionItem?.(item.milestone_id, item.meeting_id, item.item_index)}
                  >
                    Unlink
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingMentions && pendingMentions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Review Pending Matches</h3>
            <div className="space-y-2">
              {pendingMentions.map((mention) => (
                <div key={mention.meeting_id} className="border border-amber-200 rounded-md p-3 space-y-2">
                  <div className="text-sm font-medium">{mention.meeting_title}</div>
                  <div className="text-xs text-muted-foreground">{mention.excerpt}</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label="Confirm Match"
                      onClick={() => onConfirmMention?.(mention.milestone_id, mention.meeting_id)}
                    >
                      Confirm Match
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Reject Match"
                      onClick={() => onRejectMention?.(mention.milestone_id, mention.meeting_id)}
                    >
                      Reject Match
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={merging} onOpenChange={setMerging}>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Merge into another milestone</DialogTitle>
            <select
              aria-label="Target milestone"
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
            >
              {allMilestones?.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                aria-label="Confirm Merge"
                onClick={() => { onMerge?.(mergeTargetId); setMerging(false); }}
              >
                Confirm Merge
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Cancel"
                onClick={() => setMerging(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {confirmingDelete && (
          <div className="border border-destructive rounded-md p-3 space-y-2">
            <p className="text-sm">
              Are you sure you want to delete this milestone?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                aria-label="Confirm"
                onClick={() => {
                  onDelete();
                  setConfirmingDelete(false);
                }}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                aria-label="Cancel"
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
