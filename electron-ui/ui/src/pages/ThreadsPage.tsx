import React, { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ThreadsView } from "../components/ThreadsView.js";
import { ThreadDetailView } from "../components/ThreadDetailView.js";
import { MeetingDetail } from "../components/MeetingDetail.js";
import { mergeArtifactsDeduped, computeActionItemOrigins } from "../lib/merge-artifacts.js";
import type { Thread, ThreadMeeting } from "../../../../core/threads.js";
import type { MeetingRow, Artifact, ActionItemCompletion } from "../../../../electron/channels.js";

interface ThreadsPageProps {
  threads: Thread[];
  selectedClient: string | null;
  selectedThreadId: string | null;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  selectedThread: Thread | null;
  threadMeetings: ThreadMeeting[];
  threadCandidates: Array<{ meeting_id: string; title: string; date: string; similarity: number }>;
  onEdit: () => void;
  onDeleteThread: () => void;
  onFindCandidates: () => void;
  onRemoveThreadMeetings: (ids: string[]) => void;
  onRegenerateThreadSummary: (ids?: string[]) => void;
  onMeetingClick: (id: string) => void;
  onEvaluateCandidates: (ids: string[], overrideExisting: boolean) => void;
  onCandidateCheck: (ids: Set<string>) => void;
  onResolveThread: (status: "open" | "resolved") => void;
  threadPreviewCandidateIds: Set<string>;
  scopeMeetings: MeetingRow[];
  selectedMeeting: MeetingRow | null;
  selectedArtifact: Artifact | null;
  selectedArtifactLoading: boolean;
  selectedCompletions: ActionItemCompletion[];
  threadKeywords: string | undefined;
}

export function ThreadsPage(props: ThreadsPageProps): React.ReactNode[] {
  const {
    threads, selectedClient, selectedThreadId, onSelectThread, onCreateThread,
    selectedThread, threadMeetings, threadCandidates, onEdit, onDeleteThread,
    onFindCandidates, onRemoveThreadMeetings, onRegenerateThreadSummary, onMeetingClick,
    onEvaluateCandidates, onCandidateCheck, onResolveThread,
    threadPreviewCandidateIds, scopeMeetings, selectedMeeting,
    selectedArtifact, selectedArtifactLoading, selectedCompletions, threadKeywords,
  } = props;

  const isCandidatePreview = threadPreviewCandidateIds.size > 0;
  const candidatePreviewMeetings = useMemo(
    () => scopeMeetings.filter((m) => threadPreviewCandidateIds.has(m.id)),
    [scopeMeetings, threadPreviewCandidateIds],
  );
  const isCandidateMulti = candidatePreviewMeetings.length >= 2;

  const candidateArtifactQueries = useQueries({
    queries: candidatePreviewMeetings.map((m) => ({
      queryKey: ["artifact", m.id] as const,
      queryFn: () => window.api.getArtifact(m.id),
      enabled: isCandidatePreview,
    })),
  });

  const { candidateMergedArtifact, candidateActionItemOrigins } = useMemo(() => {
    if (!isCandidatePreview) return { candidateMergedArtifact: null, candidateActionItemOrigins: [] };
    const artifacts = candidateArtifactQueries.map((q) => q.data).filter((a): a is Artifact => a != null);
    if (artifacts.length === 0) return { candidateMergedArtifact: null, candidateActionItemOrigins: [] };
    if (!isCandidateMulti) return { candidateMergedArtifact: artifacts[0], candidateActionItemOrigins: [] };
    const meetingIds = candidatePreviewMeetings.filter((_, idx) => candidateArtifactQueries[idx].data != null).map((m) => m.id);
    return {
      candidateMergedArtifact: mergeArtifactsDeduped(artifacts),
      candidateActionItemOrigins: computeActionItemOrigins(artifacts, meetingIds),
    };
  }, [isCandidatePreview, isCandidateMulti, candidateArtifactQueries, candidatePreviewMeetings]);

  const candidateArtifactLoading = isCandidatePreview && candidateArtifactQueries.some((q) => q.isLoading);

  const candidateCompletionQueries = useQueries({
    queries: candidatePreviewMeetings.map((m) => ({
      queryKey: ["completions", m.id] as const,
      queryFn: () => window.api.getCompletions(m.id),
      enabled: isCandidatePreview && isCandidateMulti,
    })),
  });

  const candidateMergedCompletions = useMemo((): ActionItemCompletion[] => {
    if (!isCandidateMulti || candidateActionItemOrigins.length === 0) return [];
    const completionsByMeeting = new Map<string, ActionItemCompletion[]>();
    for (let i = 0; i < candidatePreviewMeetings.length; i++) {
      const data = candidateCompletionQueries[i]?.data;
      if (data) completionsByMeeting.set(candidatePreviewMeetings[i].id, data);
    }
    const result: ActionItemCompletion[] = [];
    for (let mergedIdx = 0; mergedIdx < candidateActionItemOrigins.length; mergedIdx++) {
      const origin = candidateActionItemOrigins[mergedIdx];
      const meetingCompletions = completionsByMeeting.get(origin.meetingId) ?? [];
      const match = meetingCompletions.find((c) => c.item_index === origin.itemIndex);
      if (match) result.push({ ...match, item_index: mergedIdx });
    }
    return result;
  }, [isCandidateMulti, candidateActionItemOrigins, candidatePreviewMeetings, candidateCompletionQueries]);

  const candidateSingleCompletionsQuery = useQuery<ActionItemCompletion[]>({
    queryKey: ["completions", candidatePreviewMeetings[0]?.id],
    queryFn: () => window.api.getCompletions(candidatePreviewMeetings[0].id),
    enabled: isCandidatePreview && !isCandidateMulti && candidatePreviewMeetings.length === 1,
  });

  return [
    <ThreadsView
      key="threads-list"
      threads={threads}
      clientName={selectedClient ?? "All"}
      onSelectThread={(id: string) => { onSelectThread(id); }}
      onCreateThread={onCreateThread}
      selectedThreadId={selectedThreadId}
    />,
    ...(selectedThread ? [
      <ThreadDetailView
        key="thread-detail"
        thread={selectedThread}
        meetings={threadMeetings}
        candidates={threadCandidates.length > 0 ? threadCandidates : undefined}
        onEdit={onEdit}
        onDelete={onDeleteThread}
        onFindCandidates={onFindCandidates}
        onRemoveMeetings={onRemoveThreadMeetings}
        onRegenerateSummary={onRegenerateThreadSummary}
        onMeetingClick={onMeetingClick}
        onEvaluateCandidates={onEvaluateCandidates}
        onCandidateCheck={onCandidateCheck}
        onResolve={onResolveThread}
      />,
    ] : []),
    ...(isCandidatePreview ? [
      <MeetingDetail
        key="candidate-preview"
        meeting={isCandidateMulti ? null : (candidatePreviewMeetings[0] ?? null)}
        meetings={isCandidateMulti ? candidatePreviewMeetings : undefined}
        artifact={isCandidateMulti ? candidateMergedArtifact : (candidateArtifactQueries[0]?.data ?? null)}
        completions={isCandidateMulti ? candidateMergedCompletions : (candidateSingleCompletionsQuery.data ?? [])}
        artifactLoading={candidateArtifactLoading}
        searchQuery={threadKeywords}
      />,
    ] : []),
    ...(!isCandidatePreview && selectedMeeting ? [
      <MeetingDetail
        key="source-preview"
        meeting={selectedMeeting}
        artifact={selectedArtifact}
        completions={selectedCompletions}
        artifactLoading={selectedArtifactLoading}
        searchQuery={threadKeywords}
        threadTags={selectedMeeting.thread_tags}
        onThreadClick={onMeetingClick}
      />,
    ] : []),
  ];
}
