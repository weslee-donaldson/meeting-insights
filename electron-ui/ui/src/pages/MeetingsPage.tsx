import React from "react";
import { MeetingList, type GroupBy, type SortBy } from "../components/MeetingList.js";
import { MeetingDetail } from "../components/MeetingDetail.js";
import type { MeetingRow, Artifact, ActionItemCompletion, MentionStat, EditActionItemFields } from "../../../../electron/channels.js";
import type { AssetRow } from "../../../../core/assets.js";
import type { DensityMode } from "../components/shared/density-toggle.js";

interface MeetingsPageProps {
  scopeMeetings: MeetingRow[];
  selectedMeetingId: string | null;
  checkedMeetingIds: Set<string>;
  groupBy: GroupBy;
  onGroupBy: (g: GroupBy) => void;
  sortBy: SortBy;
  onSortBy: (s: SortBy) => void;
  searchScores: Map<string, number> | undefined;
  onSelect: (id: string) => void;
  onCheck: (id: string) => void;
  onCheckGroup: (ids: string[]) => void;
  searchFetching: boolean;
  searchQuery: string;
  meetingsLoading: boolean;
  hasFilters: boolean;
  onDelete: () => void;
  onNewMeeting: () => void;
  newMeetingIds: Set<string>;
  deepSearchSummaries: Map<string, string> | undefined;
  isDeepSearchActive: boolean;
  deepSearchLoading: boolean;
  deepSearchEmpty: boolean;
  isMultiMode: boolean;
  checkedMeetings: MeetingRow[];
  selectedMeeting: MeetingRow | null;
  artifact: Artifact | null;
  artifactLoading: boolean;
  clients: string[] | undefined;
  onReExtract: (() => void) | undefined;
  reExtractPending: boolean;
  onReassignClient: ((name: string) => void) | undefined;
  onIgnore: (() => void) | undefined;
  completions: ActionItemCompletion[];
  onComplete: ((idx: number, note: string) => void) | undefined;
  onUncomplete: ((idx: number) => void) | undefined;
  mergedCompletions: ActionItemCompletion[];
  onMultiComplete: ((idx: number, note: string) => void) | undefined;
  onMultiUncomplete: ((idx: number) => void) | undefined;
  mentionStats: MentionStat[];
  onMentionClick: ((canonicalId: string, text: string) => void) | undefined;
  onThreadClick: (threadId: string) => void;
  onMilestoneClick: (milestoneId: string) => void;
  onEditActionItem?: (index: number, fields: EditActionItemFields) => void;
  onUpdateArtifactSection?: (field: string, value: unknown) => void;
  assets?: AssetRow[];
  onUploadAsset?: (file: File) => void;
  onDeleteAsset?: (assetId: string) => void;
  onRename?: (newTitle: string) => void;
  rawTranscript?: string;
  densityMode?: DensityMode;
  onDensityChange?: (mode: DensityMode) => void;
  notesCount?: number;
  onNotesClick?: () => void;
  onCopyTranscripts?: () => void;
}

export function MeetingsPage(props: MeetingsPageProps): React.ReactNode[] {
  const {
    scopeMeetings, selectedMeetingId, checkedMeetingIds, groupBy, onGroupBy, sortBy, onSortBy,
    searchScores, onSelect, onCheck, onCheckGroup, searchFetching, searchQuery, meetingsLoading,
    hasFilters, onDelete, onNewMeeting, newMeetingIds, deepSearchSummaries, isDeepSearchActive,
    deepSearchLoading, deepSearchEmpty, isMultiMode, checkedMeetings, selectedMeeting,
    artifact, artifactLoading, clients, onReExtract, reExtractPending, onReassignClient,
    onIgnore, completions, onComplete, onUncomplete, mergedCompletions, onMultiComplete,
    onMultiUncomplete, mentionStats, onMentionClick, onThreadClick, onMilestoneClick,
    onEditActionItem, onUpdateArtifactSection, assets, onUploadAsset, onDeleteAsset, onRename, rawTranscript,
    densityMode, onDensityChange, notesCount, onNotesClick, onCopyTranscripts,
  } = props;

  return [
    <MeetingList
      key="meeting-list"
      meetings={scopeMeetings}
      selectedId={selectedMeetingId}
      checked={checkedMeetingIds}
      groupBy={groupBy}
      onGroupBy={onGroupBy}
      sortBy={sortBy}
      onSortBy={onSortBy}
      searchScores={searchScores}
      onSelect={onSelect}
      onCheck={onCheck}
      onCheckGroup={onCheckGroup}
      searchLoading={searchFetching && searchQuery.trim().length >= 2}
      searchQuery={searchQuery}
      loading={meetingsLoading}
      hasFilters={hasFilters}
      checkedCount={checkedMeetingIds.size}
      onDelete={onDelete}
      onNewMeeting={onNewMeeting}
      newMeetingIds={newMeetingIds}
      deepSearchSummaries={deepSearchSummaries}
      isDeepSearchActive={isDeepSearchActive}
      deepSearchLoading={deepSearchLoading}
      deepSearchEmpty={deepSearchEmpty}
      onMilestoneClick={onMilestoneClick}
      densityMode={densityMode}
      onDensityChange={onDensityChange}
    />,
    <MeetingDetail
      key="meeting-detail"
      meeting={isMultiMode ? null : selectedMeeting}
      meetings={isMultiMode ? checkedMeetings : undefined}
      artifact={artifact}
      onReExtract={isMultiMode ? undefined : onReExtract}
      reExtractPending={reExtractPending}
      clients={clients}
      onReassignClient={isMultiMode ? undefined : onReassignClient}
      onIgnore={isMultiMode ? undefined : onIgnore}
      completions={isMultiMode ? mergedCompletions : completions}
      onComplete={isMultiMode ? onMultiComplete : (selectedMeetingId ? onComplete : undefined)}
      onUncomplete={isMultiMode ? onMultiUncomplete : (selectedMeetingId ? onUncomplete : undefined)}
      mentionStats={isMultiMode ? [] : mentionStats}
      onMentionClick={isMultiMode ? undefined : onMentionClick}
      artifactLoading={artifactLoading}
      searchQuery={searchQuery}
      threadTags={isMultiMode ? undefined : selectedMeeting?.thread_tags}
      onThreadClick={onThreadClick}
      milestoneTags={isMultiMode ? undefined : selectedMeeting?.milestone_tags}
      onMilestoneClick={onMilestoneClick}
      onEditActionItem={isMultiMode ? undefined : onEditActionItem}
      onUpdateArtifactSection={isMultiMode ? undefined : onUpdateArtifactSection}
      assets={isMultiMode ? undefined : assets}
      onUploadAsset={isMultiMode ? undefined : onUploadAsset}
      onDeleteAsset={isMultiMode ? undefined : onDeleteAsset}
      onRename={isMultiMode ? undefined : onRename}
      rawTranscript={isMultiMode ? undefined : rawTranscript}
      notesCount={isMultiMode ? undefined : notesCount}
      onNotesClick={isMultiMode ? undefined : onNotesClick}
      onCopyTranscripts={isMultiMode ? onCopyTranscripts : undefined}
    />,
  ];
}
