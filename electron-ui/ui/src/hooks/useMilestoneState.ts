import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Milestone, MilestoneMention, MilestoneActionItem, DateSlippageEntry, MilestoneMessage } from "../../../../core/timelines.js";
import type { CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest } from "../../../electron/channels.js";
import { useDeleteConfirmation } from "./useDeleteConfirmation.js";

export function useMilestoneState(
  selectedClient: string | null,
  currentView: string,
  addToast: (message: string, type: "success" | "error") => void,
) {
  const queryClient = useQueryClient();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [createMilestoneOpen, setCreateMilestoneOpen] = useState(false);
  const [pendingClearMilestoneMessages, setPendingClearMilestoneMessages] = useState(false);

  const milestonesQuery = useQuery<Milestone[]>({
    queryKey: ["milestones", selectedClient],
    queryFn: () => window.api.listMilestones(selectedClient!),
    enabled: currentView === "timelines" && !!selectedClient,
  });

  const milestoneMentionsQuery = useQuery<MilestoneMention[]>({
    queryKey: ["milestoneMentions", selectedMilestoneId],
    queryFn: () => window.api.getMilestoneMentions(selectedMilestoneId!),
    enabled: !!selectedMilestoneId,
  });

  const milestoneSlippageQuery = useQuery<DateSlippageEntry[]>({
    queryKey: ["milestoneSlippage", selectedMilestoneId],
    queryFn: () => window.api.getDateSlippage(selectedMilestoneId!),
    enabled: !!selectedMilestoneId,
  });

  const milestoneActionItemsQuery = useQuery<MilestoneActionItem[]>({
    queryKey: ["milestoneActionItems", selectedMilestoneId],
    queryFn: () => window.api.getMilestoneActionItems(selectedMilestoneId!),
    enabled: !!selectedMilestoneId,
  });

  const milestoneMessagesQuery = useQuery<MilestoneMessage[]>({
    queryKey: ["milestoneMessages", selectedMilestoneId],
    queryFn: () => window.api.getMilestoneMessages(selectedMilestoneId!),
    enabled: !!selectedMilestoneId,
  });

  const selectedMilestone = useMemo(
    () => milestonesQuery.data?.find((m) => m.id === selectedMilestoneId) ?? null,
    [milestonesQuery.data, selectedMilestoneId],
  );

  const pendingMilestoneMentions = useMemo(
    () => (milestoneMentionsQuery.data ?? []).filter((m) => m.pending_review === 1),
    [milestoneMentionsQuery.data],
  );

  const handleCreateMilestone = useCallback(async (req: CreateMilestoneRequest) => {
    try {
      const m = await window.api.createMilestone(req);
      queryClient.invalidateQueries({ queryKey: ["milestones", selectedClient] });
      setSelectedMilestoneId(m.id);
      setCreateMilestoneOpen(false);
      addToast("Milestone created", "success");
    } catch (err) {
      addToast(`Create milestone failed: ${(err as Error).message}`, "error");
    }
  }, [selectedClient, queryClient, addToast]);

  const handleUpdateMilestone = useCallback(async (input: UpdateMilestoneRequest) => {
    if (!selectedMilestoneId) return;
    try {
      await window.api.updateMilestone(selectedMilestoneId, input);
      queryClient.invalidateQueries({ queryKey: ["milestones", selectedClient] });
      addToast("Milestone updated", "success");
    } catch (err) {
      addToast(`Update milestone failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMilestoneId, selectedClient, queryClient, addToast]);

  const milestoneDelete = useDeleteConfirmation(useCallback(async (id: string) => {
    setSelectedMilestoneId(null);
    try {
      await window.api.deleteMilestone(id);
      queryClient.invalidateQueries({ queryKey: ["milestones", selectedClient] });
      addToast("Milestone deleted", "success");
    } catch (err) {
      addToast(`Delete milestone failed: ${(err as Error).message}`, "error");
      queryClient.invalidateQueries({ queryKey: ["milestones", selectedClient] });
      throw err;
    }
  }, [selectedClient, queryClient, addToast]));

  const handleDeleteMilestone = useCallback(() => {
    if (!selectedMilestoneId) return;
    milestoneDelete.requestDelete(selectedMilestoneId);
  }, [selectedMilestoneId, milestoneDelete]);

  const handleConfirmMilestoneMention = useCallback(async (milestoneId: string, meetingId: string) => {
    try {
      await window.api.confirmMilestoneMention(milestoneId, meetingId);
      queryClient.invalidateQueries({ queryKey: ["milestoneMentions", milestoneId] });
      addToast("Match confirmed", "success");
    } catch (err) {
      addToast(`Confirm failed: ${(err as Error).message}`, "error");
    }
  }, [queryClient, addToast]);

  const handleRejectMilestoneMention = useCallback(async (milestoneId: string, meetingId: string) => {
    try {
      await window.api.rejectMilestoneMention(milestoneId, meetingId);
      queryClient.invalidateQueries({ queryKey: ["milestoneMentions", milestoneId] });
      addToast("Match rejected", "success");
    } catch (err) {
      addToast(`Reject failed: ${(err as Error).message}`, "error");
    }
  }, [queryClient, addToast]);

  const handleMergeMilestones = useCallback(async (targetId: string) => {
    if (!selectedMilestoneId) return;
    try {
      await window.api.mergeMilestones(selectedMilestoneId, targetId);
      queryClient.invalidateQueries({ queryKey: ["milestones", selectedClient] });
      setSelectedMilestoneId(targetId);
      addToast("Milestones merged", "success");
    } catch (err) {
      addToast(`Merge failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMilestoneId, selectedClient, queryClient, addToast]);

  const handleUnlinkMilestoneActionItem = useCallback(async (milestoneId: string, meetingId: string, itemIndex: number) => {
    try {
      await window.api.unlinkMilestoneActionItem(milestoneId, meetingId, itemIndex);
      queryClient.invalidateQueries({ queryKey: ["milestoneActionItems", milestoneId] });
      addToast("Action item unlinked", "success");
    } catch (err) {
      addToast(`Unlink failed: ${(err as Error).message}`, "error");
    }
  }, [queryClient, addToast]);

  const handleMilestoneSendMessage = useCallback(async (message: string, includeTranscripts: boolean) => {
    if (!selectedMilestoneId) return;
    const req: MilestoneChatRequest = { milestoneId: selectedMilestoneId, message, includeTranscripts };
    try {
      await window.api.milestoneChat(req);
      queryClient.invalidateQueries({ queryKey: ["milestoneMessages", selectedMilestoneId] });
    } catch (err) {
      addToast(`Chat failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMilestoneId, queryClient, addToast]);

  const handleClearMilestoneMessages = useCallback(() => {
    setPendingClearMilestoneMessages(true);
  }, []);

  const handleConfirmClearMilestoneMessages = useCallback(async () => {
    if (!selectedMilestoneId) return;
    setPendingClearMilestoneMessages(false);
    try {
      await window.api.clearMilestoneMessages(selectedMilestoneId);
      queryClient.invalidateQueries({ queryKey: ["milestoneMessages", selectedMilestoneId] });
      addToast("Messages cleared", "success");
    } catch (err) {
      addToast(`Clear failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMilestoneId, queryClient, addToast]);

  return {
    selectedMilestoneId,
    setSelectedMilestoneId,
    createMilestoneOpen,
    setCreateMilestoneOpen,
    pendingDeleteMilestoneId: milestoneDelete.pendingDeleteId,
    setPendingDeleteMilestoneId: (id: string | null) => { if (id) milestoneDelete.requestDelete(id); else milestoneDelete.cancelDelete(); },
    pendingClearMilestoneMessages,
    setPendingClearMilestoneMessages,
    milestonesQuery,
    milestoneMentionsQuery,
    milestoneSlippageQuery,
    milestoneActionItemsQuery,
    milestoneMessagesQuery,
    selectedMilestone,
    pendingMilestoneMentions,
    handleCreateMilestone,
    handleUpdateMilestone,
    handleDeleteMilestone,
    handleConfirmDeleteMilestone: milestoneDelete.confirmDelete,
    handleConfirmMilestoneMention,
    handleRejectMilestoneMention,
    handleMergeMilestones,
    handleUnlinkMilestoneActionItem,
    handleMilestoneSendMessage,
    handleClearMilestoneMessages,
    handleConfirmClearMilestoneMessages,
  };
}
