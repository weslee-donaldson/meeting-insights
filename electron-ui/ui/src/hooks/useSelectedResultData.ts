import { useQuery } from "@tanstack/react-query";
import type { Artifact, ActionItemCompletion } from "../../../electron/channels.js";
import type { AssetRow } from "../../../../core/assets.js";

export interface SelectedResultData {
  artifact: Artifact | null;
  artifactLoading: boolean;
  completions: ActionItemCompletion[];
  assets: AssetRow[];
  threadTags: Array<{ thread_id: string; title: string; shorthand: string }>;
  milestoneTags: Array<{ milestone_id: string; title: string; target_date: string | null; status: string }>;
  notesCount: number;
}

export function useSelectedResultData(meetingId: string | null): SelectedResultData {
  const artifactQuery = useQuery<Artifact | null>({
    queryKey: ["artifact", meetingId],
    queryFn: () => window.api.getArtifact(meetingId!),
    enabled: !!meetingId,
  });

  const completionsQuery = useQuery<ActionItemCompletion[]>({
    queryKey: ["completions", meetingId],
    queryFn: () => window.api.getCompletions(meetingId!),
    enabled: !!meetingId,
  });

  const assetsQuery = useQuery<AssetRow[]>({
    queryKey: ["assets", meetingId],
    queryFn: () => window.api.getMeetingAssets(meetingId!),
    enabled: !!meetingId,
  });

  const threadsQuery = useQuery<Array<{ thread_id: string; title: string; shorthand: string }>>({
    queryKey: ["meeting-threads", meetingId],
    queryFn: () => window.api.getMeetingThreads(meetingId!),
    enabled: !!meetingId,
  });

  const milestonesQuery = useQuery<Array<{ milestone_id: string; title: string; target_date: string | null; status: string }>>({
    queryKey: ["meeting-milestones", meetingId],
    queryFn: () => window.api.getMeetingMilestones(meetingId!),
    enabled: !!meetingId,
  });

  const notesCountQuery = useQuery<number>({
    queryKey: ["noteCount", "meeting", meetingId],
    queryFn: () => window.api.notesCount("meeting", meetingId!),
    enabled: !!meetingId,
  });

  return {
    artifact: artifactQuery.data ?? null,
    artifactLoading: artifactQuery.isLoading,
    completions: completionsQuery.data ?? [],
    assets: assetsQuery.data ?? [],
    threadTags: threadsQuery.data ?? [],
    milestoneTags: milestonesQuery.data ?? [],
    notesCount: notesCountQuery.data ?? 0,
  };
}
