import React from "react";
import { ClientActionItemsView } from "../components/ClientActionItemsView.js";
import { MeetingDetail } from "../components/MeetingDetail.js";
import type { MeetingRow, ClientActionItem, Artifact, ActionItemCompletion, MentionStat } from "../../../../electron/channels.js";

interface ActionItemsPageProps {
  selectedClient: string | null;
  items: ClientActionItem[];
  onPreviewMeeting: (id: string) => void;
  onComplete: (meetingId: string, itemIndex: number) => void;
  previewMeetingId: string | null;
  previewMeeting: MeetingRow | null;
  previewArtifact: Artifact | null;
  previewArtifactLoading: boolean;
  previewCompletions: ActionItemCompletion[];
  previewMentionStats: MentionStat[];
  onCompletePreview: (itemIndex: number, note: string) => void;
  onUncompletePreview: (itemIndex: number) => void;
}

export function ActionItemsPage(props: ActionItemsPageProps): React.ReactNode[] {
  const {
    selectedClient, items, onPreviewMeeting, onComplete,
    previewMeetingId, previewMeeting, previewArtifact, previewArtifactLoading,
    previewCompletions, previewMentionStats, onCompletePreview, onUncompletePreview,
  } = props;

  return [
    <ClientActionItemsView
      key="client-action-items"
      clientName={selectedClient}
      items={items}
      onPreviewMeeting={onPreviewMeeting}
      onComplete={onComplete}
    />,
    ...(previewMeetingId ? [
      <MeetingDetail
        key="preview-detail"
        meeting={previewMeeting}
        artifact={previewArtifact}
        completions={previewCompletions}
        onComplete={onCompletePreview}
        onUncomplete={onUncompletePreview}
        mentionStats={previewMentionStats}
        artifactLoading={previewArtifactLoading}
      />,
    ] : []),
  ];
}
