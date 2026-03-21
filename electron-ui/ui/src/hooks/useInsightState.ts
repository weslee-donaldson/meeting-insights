import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Insight, InsightMeeting, InsightMessage } from "../../../../core/insights.js";
import { useDeleteConfirmation } from "./useDeleteConfirmation.js";

export function useInsightState(
  selectedClient: string | null,
  currentView: string,
  addToast: (message: string, type: "success" | "error") => void,
) {
  const queryClient = useQueryClient();
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [createInsightOpen, setCreateInsightOpen] = useState(false);
  const [pendingClearInsightMessages, setPendingClearInsightMessages] = useState(false);
  const [regeneratingInsightId, setRegeneratingInsightId] = useState<string | null>(null);

  const insightsQuery = useQuery<Insight[]>({
    queryKey: ["insights", selectedClient],
    queryFn: () => window.api.listInsights(selectedClient!),
    enabled: currentView === "insights" && !!selectedClient,
  });

  const insightMeetingsQuery = useQuery<InsightMeeting[]>({
    queryKey: ["insightMeetings", selectedInsightId],
    queryFn: () => window.api.getInsightMeetings(selectedInsightId!),
    enabled: !!selectedInsightId,
  });

  const insightMessagesQuery = useQuery<InsightMessage[]>({
    queryKey: ["insightMessages", selectedInsightId],
    queryFn: () => window.api.getInsightMessages(selectedInsightId!),
    enabled: !!selectedInsightId,
  });

  const selectedInsight = useMemo(() => {
    return insightsQuery.data?.find((i) => i.id === selectedInsightId) ?? null;
  }, [insightsQuery.data, selectedInsightId]);

  const handleCreateInsight = useCallback(async (data: { period_type: "day" | "week" | "month"; period_start: string; period_end: string }) => {
    if (!selectedClient) return;
    try {
      setCreateInsightOpen(false);
      addToast("Discovering meetings...", "success");
      const insight = await window.api.createInsight({ client_name: selectedClient, ...data });
      await window.api.discoverInsightMeetings(insight.id);
      queryClient.invalidateQueries({ queryKey: ["insights", selectedClient] });
      setSelectedInsightId(insight.id);
      addToast("Insight created — review meetings and generate", "success");
    } catch (err) {
      console.error("Create insight failed:", err);
      addToast(`Create insight failed: ${(err as Error).message}`, "error");
    }
  }, [selectedClient, queryClient, addToast]);

  const insightDelete = useDeleteConfirmation(useCallback(async (id: string) => {
    setSelectedInsightId(null);
    try {
      await window.api.deleteInsight(id);
      queryClient.invalidateQueries({ queryKey: ["insights", selectedClient] });
      addToast("Insight deleted", "success");
    } catch (err) {
      console.error("Delete insight failed:", err);
      addToast(`Delete insight failed: ${(err as Error).message}`, "error");
      queryClient.invalidateQueries({ queryKey: ["insights", selectedClient] });
      throw err;
    }
  }, [selectedClient, queryClient, addToast]));

  const handleDeleteInsight = useCallback(() => {
    if (!selectedInsightId) return;
    insightDelete.requestDelete(selectedInsightId);
  }, [selectedInsightId, insightDelete]);

  const handleFinalizeInsight = useCallback(async () => {
    if (!selectedInsightId || !selectedInsight) return;
    const newStatus = selectedInsight.status === "draft" ? "final" : "draft";
    try {
      await window.api.updateInsight(selectedInsightId, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["insights", selectedClient] });
      addToast(newStatus === "final" ? "Insight finalized" : "Insight reopened", "success");
    } catch (err) {
      console.error("Update insight failed:", err);
      addToast(`Update insight failed: ${(err as Error).message}`, "error");
    }
  }, [selectedInsightId, selectedInsight, selectedClient, queryClient, addToast]);

  const handleUpdateInsightSummary = useCallback(async (summary: string) => {
    if (!selectedInsightId) return;
    try {
      await window.api.updateInsight(selectedInsightId, { executive_summary: summary });
      queryClient.invalidateQueries({ queryKey: ["insights", selectedClient] });
      addToast("Summary updated", "success");
    } catch (err) {
      addToast(`Update failed: ${(err as Error).message}`, "error");
    }
  }, [selectedInsightId, selectedClient, queryClient, addToast]);

  const handleRegenerateInsight = useCallback(async (checkedMeetingIds?: string[]) => {
    if (!selectedInsightId) return;
    const isFirst = !selectedInsight?.executive_summary;
    try {
      setRegeneratingInsightId(selectedInsightId);
      await window.api.generateInsight(selectedInsightId, checkedMeetingIds);
      queryClient.invalidateQueries({ queryKey: ["insights", selectedClient] });
      queryClient.invalidateQueries({ queryKey: ["insightMeetings", selectedInsightId] });
      addToast(isFirst ? "Insight generated" : "Insight regenerated", "success");
    } catch (err) {
      console.error("Regenerate insight failed:", err);
      addToast(`${isFirst ? "Generate" : "Regenerate"} insight failed: ${(err as Error).message}`, "error");
    } finally {
      setRegeneratingInsightId(null);
    }
  }, [selectedInsightId, selectedInsight, selectedClient, queryClient, addToast]);

  const handleInsightSendMessage = useCallback(async (message: string, includeTranscripts: boolean) => {
    if (!selectedInsightId) return;
    try {
      await window.api.insightChat({ insightId: selectedInsightId, message, includeTranscripts });
      queryClient.invalidateQueries({ queryKey: ["insightMessages", selectedInsightId] });
    } catch (err) {
      console.error("Insight chat failed:", err);
      addToast(`Insight chat failed: ${(err as Error).message}`, "error");
    }
  }, [selectedInsightId, queryClient, addToast]);

  const handleClearInsightMessages = useCallback(() => {
    if (!selectedInsightId) return;
    setPendingClearInsightMessages(true);
  }, [selectedInsightId]);

  const handleConfirmClearInsightMessages = useCallback(async () => {
    setPendingClearInsightMessages(false);
    if (!selectedInsightId) return;
    try {
      await window.api.clearInsightMessages(selectedInsightId);
      queryClient.invalidateQueries({ queryKey: ["insightMessages", selectedInsightId] });
      addToast("Messages cleared", "success");
    } catch (err) {
      console.error("Clear insight messages failed:", err);
      addToast(`Clear messages failed: ${(err as Error).message}`, "error");
    }
  }, [selectedInsightId, queryClient, addToast]);

  const handleShowAllInsightMeetings = useCallback(async () => {
    if (!selectedInsightId) return;
    try {
      await window.api.discoverInsightMeetings(selectedInsightId);
      queryClient.invalidateQueries({ queryKey: ["insightMeetings", selectedInsightId] });
      queryClient.invalidateQueries({ queryKey: ["insights", selectedClient] });
      addToast("Restored all meetings for period", "success");
    } catch (err) {
      console.error("Show all meetings failed:", err);
      addToast(`Show all meetings failed: ${(err as Error).message}`, "error");
    }
  }, [selectedInsightId, selectedClient, queryClient, addToast]);

  return {
    selectedInsightId,
    setSelectedInsightId,
    createInsightOpen,
    setCreateInsightOpen,
    pendingDeleteInsightId: insightDelete.pendingDeleteId,
    setPendingDeleteInsightId: (id: string | null) => { if (id) insightDelete.requestDelete(id); else insightDelete.cancelDelete(); },
    pendingClearInsightMessages,
    setPendingClearInsightMessages,
    regeneratingInsightId,
    insightsQuery,
    insightMeetingsQuery,
    insightMessagesQuery,
    selectedInsight,
    handleCreateInsight,
    handleDeleteInsight,
    handleConfirmDeleteInsight: insightDelete.confirmDelete,
    handleFinalizeInsight,
    handleUpdateInsightSummary,
    handleRegenerateInsight,
    handleInsightSendMessage,
    handleClearInsightMessages,
    handleConfirmClearInsightMessages,
    handleShowAllInsightMeetings,
  };
}
