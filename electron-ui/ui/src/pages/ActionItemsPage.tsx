import React from "react";
import { ClientActionItemsView } from "../components/ClientActionItemsView.js";
import { MeetingDetail } from "../components/MeetingDetail.js";
import type { MeetingRow, ClientActionItem, Artifact, ActionItemCompletion, MentionStat, EditActionItemFields } from "../../../../electron/channels.js";
import type { AssetRow } from "../../../../core/assets.js";
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
  clients?: string[];
  onReExtract?: () => void;
  reExtractPending?: boolean;
  onReassignClient?: (clientName: string) => void;
  onIgnore?: () => void;
  previewAssets?: AssetRow[];
  onUploadAsset?: (file: File) => void;
  onDeleteAsset?: (assetId: string) => void;
  onRename?: (newTitle: string) => void;
  previewRawTranscript?: string;
  previewThreadTags?: MeetingRow["thread_tags"];
  previewMilestoneTags?: MeetingRow["milestone_tags"];
  onThreadClick?: (threadId: string) => void;
  onMilestoneClick?: (milestoneId: string) => void;
  onMentionClick?: (canonicalId: string, text: string) => void;
  notesCount?: number;
  onNotesClick?: () => void;
}

export function ActionItemsPage(props: ActionItemsPageProps): React.ReactNode[] {
  const {
    selectedClient, items, onPreviewMeeting, onComplete, onUncomplete, onEditActionItem, onAddActionItem,
    previewMeetingId, previewMeeting, previewArtifact, previewArtifactLoading,
    previewCompletions, previewMentionStats, onCompletePreview, onUncompletePreview,
    onEditPreviewActionItem,
    densityMode, onDensityChange,
    clients, onReExtract, reExtractPending, onReassignClient, onIgnore,
    previewAssets, onUploadAsset, onDeleteAsset, onRename, previewRawTranscript,
    previewThreadTags, previewMilestoneTags, onThreadClick, onMilestoneClick, onMentionClick,
    notesCount, onNotesClick,
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
        onMentionClick={onMentionClick}
        artifactLoading={previewArtifactLoading}
        clients={clients}
        onReExtract={onReExtract}
        reExtractPending={reExtractPending}
        onReassignClient={onReassignClient}
        onIgnore={onIgnore}
        assets={previewAssets}
        onUploadAsset={onUploadAsset}
        onDeleteAsset={onDeleteAsset}
        onRename={onRename}
        rawTranscript={previewRawTranscript}
        threadTags={previewThreadTags}
        onThreadClick={onThreadClick}
        milestoneTags={previewMilestoneTags}
        onMilestoneClick={onMilestoneClick}
        notesCount={notesCount}
        onNotesClick={onNotesClick}
      />,
    ] : []),
  ];
}
