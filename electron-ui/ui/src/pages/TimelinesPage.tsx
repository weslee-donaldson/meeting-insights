import React from "react";
import { TimelinesView } from "../components/TimelinesView.js";
import { TimelineDetailView } from "../components/TimelineDetailView.js";
import type { Milestone, MilestoneMention, MilestoneActionItem, DateSlippageEntry } from "../../../../core/timelines.js";
import type { UpdateMilestoneRequest } from "../../../../electron/channels.js";

interface TimelinesPageProps {
  milestones: Milestone[];
  milestoneMentions: MilestoneMention[];
  selectedClient: string | null;
  selectedMilestoneId: string | null;
  onSelectMilestone: (id: string) => void;
  onCreateMilestone: () => void;
  selectedMilestone: Milestone | null;
  milestoneSlippage: DateSlippageEntry[];
  milestoneActionItems: MilestoneActionItem[];
  pendingMilestoneMentions: MilestoneMention[];
  onDeleteMilestone: () => void;
  onMeetingClick: (id: string) => void;
  onUnlinkActionItem: (milestoneId: string, meetingId: string, itemIndex: number) => void;
  onConfirmMention: (milestoneId: string, meetingId: string) => void;
  onRejectMention: (milestoneId: string, meetingId: string) => void;
  onUpdateMilestone: (input: UpdateMilestoneRequest) => void;
  onMergeMilestones: (targetId: string) => void;
}

export function TimelinesPage(props: TimelinesPageProps): React.ReactNode[] {
  const {
    milestones, milestoneMentions, selectedClient, selectedMilestoneId, onSelectMilestone,
    onCreateMilestone, selectedMilestone, milestoneSlippage, milestoneActionItems,
    pendingMilestoneMentions, onDeleteMilestone, onMeetingClick, onUnlinkActionItem,
    onConfirmMention, onRejectMention, onUpdateMilestone, onMergeMilestones,
  } = props;

  return [
    <TimelinesView
      key="timelines-list"
      milestones={milestones.map((m) => ({
        ...m,
        has_pending_review: milestoneMentions.some((mn) => mn.milestone_id === m.id && mn.pending_review === 1),
      }))}
      clientName={selectedClient ?? "All"}
      onSelectMilestone={onSelectMilestone}
      onCreateMilestone={onCreateMilestone}
      selectedMilestoneId={selectedMilestoneId}
    />,
    ...(selectedMilestone ? [
      <TimelineDetailView
        key="timeline-detail"
        milestone={selectedMilestone}
        onDelete={onDeleteMilestone}
        slippage={milestoneSlippage}
        mentions={milestoneMentions.filter((m) => m.pending_review === 0)}
        onMeetingClick={onMeetingClick}
        actionItems={milestoneActionItems}
        onUnlinkActionItem={onUnlinkActionItem}
        pendingMentions={pendingMilestoneMentions}
        onConfirmMention={onConfirmMention}
        onRejectMention={onRejectMention}
        onUpdate={onUpdateMilestone}
        allMilestones={milestones.filter((m) => m.id !== selectedMilestoneId).map((m) => ({ id: m.id, title: m.title }))}
        onMerge={onMergeMilestones}
      />,
    ] : []),
  ];
}
