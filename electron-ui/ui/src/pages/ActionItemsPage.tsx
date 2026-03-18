import React from "react";
import { ClientActionItemsView } from "../components/ClientActionItemsView.js";
import { MeetingDetail } from "../components/MeetingDetail.js";
import type { MeetingRow, ClientActionItem, Artifact, ActionItemCompletion, MentionStat, EditActionItemFields } from "../../../../electron/channels.js";
import type { DensityMode } from "../components/shared/density-toggle.js";

interface ActionItemsPageProps {
  selectedClient: string | null;
  items: ClientActionItem[];
  onPreviewMeeting: (id: string) => void;
  onComplete: (meetingId: string, itemIndex: number) => void;
  onUncomplete: (meetingId: string, itemIndex: number) => void;
  onEditActionItem: (meetingId: string, itemIndex: number, fields: EditActionItemFields) => void;
  onAddActionItem: (meetingId: string, fields: EditActionItemFields) => void;
  previewMeetingId: string | null;
  previewMeeting: MeetingRow | null;
  previewArtifact: Artifact | null;
  previewArtifactLoading: boolean;
  previewCompletions: ActionItemCompletion[];
  previewMentionStats: MentionStat[];
  onCompletePreview: (itemIndex: number, note: string) => void;
  onUncompletePreview: (itemIndex: number) => void;
  onEditPreviewActionItem: (itemIndex: number, fields: EditActionItemFields) => void;
  densityMode?: DensityMode;
  onDensityChange?: (mode: DensityMode) => void;
}

export function ActionItemsPage(props: ActionItemsPageProps): React.ReactNode[] {
  const {
    selectedClient, items, onPreviewMeeting, onComplete, onUncomplete, onEditActionItem, onAddActionItem,
    previewMeetingId, previewMeeting, previewArtifact, previewArtifactLoading,
    previewCompletions, previewMentionStats, onCompletePreview, onUncompletePreview,
    onEditPreviewActionItem,
    densityMode, onDensityChange,
  } = props;

  return [
    <ClientActionItemsView
      key="client-action-items"
      clientName={selectedClient}
      items={items}
      onPreviewMeeting={onPreviewMeeting}
      onComplete={onComplete}
      onUncomplete={onUncomplete}
      onEditActionItem={onEditActionItem}
      onAddActionItem={onAddActionItem}
      densityMode={densityMode}
      onDensityChange={onDensityChange}
    />,
    ...(previewMeetingId ? [
      <MeetingDetail
        key="preview-detail"
        meeting={previewMeeting}
        artifact={previewArtifact}
        completions={previewCompletions}
        onComplete={onCompletePreview}
        onUncomplete={onUncompletePreview}
        onEditActionItem={onEditPreviewActionItem}
        mentionStats={previewMentionStats}
        artifactLoading={previewArtifactLoading}
      />,
    ] : []),
  ];
}
