import React from "react";
import { InsightsView } from "../components/InsightsView.js";
import { InsightDetailView } from "../components/InsightDetailView.js";
import { MeetingDetail } from "../components/MeetingDetail.js";
import type { Insight, InsightMeeting } from "../../../../core/insights.js";
import type { MeetingRow, Artifact, ActionItemCompletion } from "../../../../electron/channels.js";

interface InsightsPageProps {
  insights: Insight[];
  selectedClient: string | null;
  selectedInsightId: string | null;
  onSelectInsight: (id: string) => void;
  onCreateInsight: () => void;
  selectedInsight: Insight | null;
  insightMeetings: InsightMeeting[];
  onDeleteInsight: () => void;
  onRegenerateInsight: (checkedMeetingIds: string[]) => void;
  onFinalizeInsight: () => void;
  onUpdateInsightSummary: (summary: string) => void;
  onShowAllInsightMeetings: () => void;
  isRegenerating: boolean;
  selectedMeeting: MeetingRow | null;
  selectedArtifact: Artifact | null;
  selectedArtifactLoading: boolean;
  selectedCompletions: ActionItemCompletion[];
}

export function InsightsPage(props: InsightsPageProps): React.ReactNode[] {
  const {
    insights, selectedClient, selectedInsightId, onSelectInsight, onCreateInsight,
    selectedInsight, insightMeetings, onDeleteInsight, onRegenerateInsight, onFinalizeInsight,
    onUpdateInsightSummary, onShowAllInsightMeetings, isRegenerating,
    selectedMeeting, selectedArtifact, selectedArtifactLoading, selectedCompletions,
  } = props;

  return [
    <InsightsView
      key="insights-list"
      insights={insights}
      clientName={selectedClient ?? "All"}
      onSelectInsight={onSelectInsight}
      onCreateInsight={onCreateInsight}
      selectedInsightId={selectedInsightId}
    />,
    ...(selectedInsight ? [
      <InsightDetailView
        key="insight-detail"
        insight={selectedInsight}
        meetings={insightMeetings}
        onDelete={onDeleteInsight}
        onRegenerate={onRegenerateInsight}
        onFinalize={onFinalizeInsight}
        onUpdateSummary={onUpdateInsightSummary}
        onShowAllMeetings={onShowAllInsightMeetings}
        isRegenerating={isRegenerating}
      />,
    ] : []),
    ...(selectedMeeting ? [
      <MeetingDetail
        key="source-preview"
        meeting={selectedMeeting}
        artifact={selectedArtifact}
        completions={selectedCompletions}
        artifactLoading={selectedArtifactLoading}
      />,
    ] : []),
  ];
}
