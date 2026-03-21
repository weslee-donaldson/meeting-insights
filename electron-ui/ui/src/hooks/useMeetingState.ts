import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { useSearchScope } from "./useSearchScope.js";
import { mergeArtifactsDeduped, computeActionItemOrigins } from "../lib/merge-artifacts.js";
import type { MeetingRow, Artifact, ActionItemCompletion, MentionStat, ItemHistoryEntry, CreateMeetingRequest, EditActionItemFields } from "../../../electron/channels.js";
import type { GroupBy, SortBy } from "../components/MeetingList.js";
import { useClearMessages } from "./useClearMessages.js";
import { useMeetingSelection } from "./useMeetingSelection.js";

interface DateRange {
  after: string;
  before: string;
}

export function useMeetingState(
  selectedClient: string | null,
  currentView: string,
  addToast: (message: string, type: "success" | "error") => void,
  setCurrentView: (view: "meetings" | "action-items" | "threads" | "insights" | "timelines") => void,
) {
  const queryClient = useQueryClient();
  const selection = useMeetingSelection();
  const { selectedMeetingId, setSelectedMeetingId, checkedMeetingIds, setCheckedMeetingIds, previewMeetingId, setPreviewMeetingId } = selection;
  const [dateRange, setDateRange] = useState<DateRange>({ after: "", before: "" });
  const [groupBy, setGroupBy] = useState<GroupBy>("series");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [typedSearchQuery, setTypedSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [historyItem, setHistoryItem] = useState<{ canonicalId: string; itemText: string } | null>(null);
  const meetingIdPerView = useRef<Record<string, string | null>>({});
  const [isReExtracting, setIsReExtracting] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null);
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [newMeetingIds, setNewMeetingIds] = useState<Set<string>>(new Set());
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(true);
  const [threadInitialDescription, setThreadInitialDescription] = useState("");

  const meetingsQuery = useQuery<MeetingRow[]>({
    queryKey: ["meetings", selectedClient, dateRange],
    queryFn: () =>
      window.api.getMeetings({
        client: selectedClient ?? undefined,
        after: dateRange.after || undefined,
        before: dateRange.before || undefined,
      }),
  });

  const searchScope = useSearchScope(meetingsQuery.data ?? [], searchQuery, deepSearchEnabled, addToast);
  const { searchFetching, isDeepSearchActive, deepSearchLoading, deepSearchEmpty, scopeMeetings, searchScores, deepSearchSummaries, searchResults } = searchScope;

  useEffect(() => {
    if (searchQuery.trim().length >= 2 && searchResults && searchResults.length > 0) {
      setSortBy("relevance");
    } else if (searchQuery.trim().length < 2) {
      setSortBy("date-desc");
    }
  }, [searchQuery, searchResults]);

  const selectedMeeting = selectedMeetingId
    ? (scopeMeetings.find((m) => m.id === selectedMeetingId)
      ?? (meetingsQuery.data ?? []).find((m) => m.id === selectedMeetingId)
      ?? null)
    : null;

  const selectedArtifactQuery = useQuery<Artifact | null>({
    queryKey: ["artifact", selectedMeetingId],
    queryFn: () => window.api.getArtifact(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  });

  const completionsQuery = useQuery<ActionItemCompletion[]>({
    queryKey: ["completions", selectedMeetingId],
    queryFn: () => window.api.getCompletions(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  });

  const mentionStatsQuery = useQuery<MentionStat[]>({
    queryKey: ["mentionStats", selectedMeetingId],
    queryFn: () => window.api.getMentionStats(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  });

  const previewArtifactQuery = useQuery<Artifact | null>({
    queryKey: ["artifact", previewMeetingId],
    queryFn: () => window.api.getArtifact(previewMeetingId!),
    enabled: !!previewMeetingId,
  });

  const previewCompletionsQuery = useQuery<ActionItemCompletion[]>({
    queryKey: ["completions", previewMeetingId],
    queryFn: () => window.api.getCompletions(previewMeetingId!),
    enabled: !!previewMeetingId,
  });

  const previewMentionStatsQuery = useQuery<MentionStat[]>({
    queryKey: ["mentionStats", previewMeetingId],
    queryFn: () => window.api.getMentionStats(previewMeetingId!),
    enabled: !!previewMeetingId,
  });

  const itemHistoryQuery = useQuery<ItemHistoryEntry[]>({
    queryKey: ["itemHistory", historyItem?.canonicalId],
    queryFn: () => window.api.getItemHistory(historyItem!.canonicalId),
    enabled: !!historyItem,
  });

  const clientActionItemsQuery = useQuery({
    queryKey: ["clientActionItems", selectedClient, dateRange],
    queryFn: () => window.api.getClientActionItems(selectedClient!, {
      after: dateRange.after || undefined,
      before: dateRange.before || undefined,
    }),
    enabled: currentView === "action-items" && !!selectedClient,
  });

  const isMultiMode = checkedMeetingIds.size >= 2;

  const checkedMeetings = useMemo(
    () => scopeMeetings.filter((m) => checkedMeetingIds.has(m.id)),
    [scopeMeetings, checkedMeetingIds],
  );

  const checkedArtifactQueries = useQueries({
    queries: checkedMeetings.map((m) => ({
      queryKey: ["artifact", m.id] as const,
      queryFn: () => window.api.getArtifact(m.id),
      enabled: isMultiMode,
    })),
  });

  const { mergedArtifact, actionItemOrigins } = useMemo(() => {
    if (!isMultiMode) return { mergedArtifact: null, actionItemOrigins: [] };
    const artifacts = checkedArtifactQueries
      .map((q) => q.data)
      .filter((a): a is Artifact => a != null);
    if (artifacts.length === 0) return { mergedArtifact: null, actionItemOrigins: [] };
    const meetingIds = checkedMeetings
      .filter((_, idx) => checkedArtifactQueries[idx].data != null)
      .map((m) => m.id);
    return {
      mergedArtifact: mergeArtifactsDeduped(artifacts),
      actionItemOrigins: computeActionItemOrigins(artifacts, meetingIds),
    };
  }, [isMultiMode, checkedArtifactQueries, checkedMeetings]);

  const mergedArtifactLoading = isMultiMode && checkedArtifactQueries.some((q) => q.isLoading);

  const checkedCompletionQueries = useQueries({
    queries: checkedMeetings.map((m) => ({
      queryKey: ["completions", m.id] as const,
      queryFn: () => window.api.getCompletions(m.id),
      enabled: isMultiMode,
    })),
  });

  const mergedCompletions = useMemo((): ActionItemCompletion[] => {
    if (!isMultiMode || actionItemOrigins.length === 0) return [];
    const completionsByMeeting = new Map<string, ActionItemCompletion[]>();
    for (let i = 0; i < checkedMeetings.length; i++) {
      const data = checkedCompletionQueries[i]?.data;
      if (data) completionsByMeeting.set(checkedMeetings[i].id, data);
    }
    const result: ActionItemCompletion[] = [];
    for (let mergedIdx = 0; mergedIdx < actionItemOrigins.length; mergedIdx++) {
      const origin = actionItemOrigins[mergedIdx];
      const meetingCompletions = completionsByMeeting.get(origin.meetingId) ?? [];
      const match = meetingCompletions.find((c) => c.item_index === origin.itemIndex);
      if (match) {
        result.push({ ...match, item_index: mergedIdx });
      }
    }
    return result;
  }, [isMultiMode, actionItemOrigins, checkedMeetings, checkedCompletionQueries]);

  const charCount = isMultiMode
    ? (mergedArtifact ? JSON.stringify(mergedArtifact).length : 0)
    : (selectedArtifactQuery.data ? JSON.stringify(selectedArtifactQuery.data).length : 0);

  const handleDateChange = useCallback((field: "after" | "before", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setCheckedMeetingIds((prev) => {
      const scopeIds = new Set(scopeMeetings.map((m) => m.id));
      return new Set([...prev].filter((id) => scopeIds.has(id)));
    });
  }, [scopeMeetings]);

  const { handleCheck, handleCheckGroup } = selection;

  const handleDeleteMeetings = useCallback(() => {
    setPendingDeleteIds([...checkedMeetingIds]);
  }, [checkedMeetingIds]);

  const handleConfirmDelete = useCallback(async () => {
    const ids = pendingDeleteIds ?? [];
    const idSet = new Set(ids);
    setPendingDeleteIds(null);
    queryClient.setQueriesData<MeetingRow[]>({ queryKey: ["meetings"] }, (old) => old?.filter((m) => !idSet.has(m.id)));
    setCheckedMeetingIds(new Set());
    if (selectedMeetingId && ids.includes(selectedMeetingId)) setSelectedMeetingId(null);
    try {
      await window.api.deleteMeetings(ids);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      addToast(`${ids.length} meeting(s) deleted`, "success");
    } catch (err) {
      console.error("Delete meetings failed:", err);
      addToast(`Delete failed: ${(err as Error).message}`, "error");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    }
  }, [pendingDeleteIds, selectedMeetingId, queryClient, addToast]);

  const handleReExtract = useCallback(async () => {
    if (!selectedMeetingId) return;
    setIsReExtracting(true);
    try {
      await window.api.reExtract(selectedMeetingId);
      queryClient.invalidateQueries({ queryKey: ["artifact", selectedMeetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Re-extraction complete", "success");
      window.api.reEmbedMeeting(selectedMeetingId).then(() => {
        addToast("Search index updated", "success");
      }).catch(() => {
        addToast("Search index update failed", "error");
      });
    } catch {
      addToast("Re-extraction failed", "error");
    } finally {
      setIsReExtracting(false);
    }
  }, [selectedMeetingId, selectedClient, queryClient, addToast]);

  const handleNewMeeting = useCallback(async (req: CreateMeetingRequest) => {
    addToast("Importing meeting...", "success");
    try {
      const { meetingId } = await window.api.createMeeting(req);
      setNewMeetingIds((prev) => new Set([...prev, meetingId]));
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      addToast("Meeting imported", "success");
      window.api.reEmbedMeeting(meetingId).then(() => {
        addToast("Search index updated", "success");
      }).catch(() => {});
    } catch {
      addToast("Meeting import failed", "error");
    }
  }, [queryClient, addToast]);

  const handleReassignClient = useCallback(async (clientName: string) => {
    if (!selectedMeetingId) return;
    try {
      await window.api.reassignClient(selectedMeetingId, clientName);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      addToast(`Client reassigned to ${clientName}`, "success");
    } catch (err) {
      console.error("Reassign client failed:", err);
      addToast(`Reassign failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMeetingId, queryClient, addToast]);

  const handleCompleteActionItem = useCallback(async (itemIndex: number, note: string) => {
    if (!selectedMeetingId) return;
    try {
      await window.api.completeActionItem(selectedMeetingId, itemIndex, note);
      queryClient.invalidateQueries({ queryKey: ["completions", selectedMeetingId] });
    } catch (err) {
      console.error("Complete action item failed:", err);
      addToast(`Complete failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMeetingId, queryClient, addToast]);

  const handleUncompleteActionItem = useCallback(async (itemIndex: number) => {
    if (!selectedMeetingId) return;
    try {
      await window.api.uncompleteActionItem(selectedMeetingId, itemIndex);
      queryClient.invalidateQueries({ queryKey: ["completions", selectedMeetingId] });
    } catch (err) {
      console.error("Uncomplete action item failed:", err);
      addToast(`Uncomplete failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMeetingId, queryClient, addToast]);

  const handleEditActionItem = useCallback(async (itemIndex: number, fields: EditActionItemFields) => {
    if (!selectedMeetingId) return;
    try {
      await window.api.editActionItem(selectedMeetingId, itemIndex, fields);
      queryClient.invalidateQueries({ queryKey: ["artifact", selectedMeetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Action item updated", "success");
    } catch (err) {
      addToast(`Edit failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMeetingId, selectedClient, queryClient, addToast]);

  const handleMultiCompleteActionItem = useCallback(async (mergedIndex: number, note: string) => {
    const origin = actionItemOrigins[mergedIndex];
    if (!origin) return;
    try {
      await window.api.completeActionItem(origin.meetingId, origin.itemIndex, note);
      queryClient.invalidateQueries({ queryKey: ["completions", origin.meetingId] });
    } catch (err) {
      console.error("Complete action item failed:", err);
      addToast(`Complete failed: ${(err as Error).message}`, "error");
    }
  }, [actionItemOrigins, queryClient, addToast]);

  const handleMultiUncompleteActionItem = useCallback(async (mergedIndex: number) => {
    const origin = actionItemOrigins[mergedIndex];
    if (!origin) return;
    try {
      await window.api.uncompleteActionItem(origin.meetingId, origin.itemIndex);
      queryClient.invalidateQueries({ queryKey: ["completions", origin.meetingId] });
    } catch (err) {
      console.error("Uncomplete action item failed:", err);
      addToast(`Uncomplete failed: ${(err as Error).message}`, "error");
    }
  }, [actionItemOrigins, queryClient, addToast]);

  const handleCompleteClientActionItem = useCallback(async (meetingId: string, itemIndex: number) => {
    try {
      await window.api.completeActionItem(meetingId, itemIndex, "");
      queryClient.invalidateQueries({ queryKey: ["completions", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
    } catch (err) {
      console.error("Complete action item failed:", err);
      addToast(`Complete failed: ${(err as Error).message}`, "error");
    }
  }, [selectedClient, queryClient, addToast]);

  const handleUncompleteClientActionItem = useCallback(async (meetingId: string, itemIndex: number) => {
    try {
      await window.api.uncompleteActionItem(meetingId, itemIndex);
      queryClient.invalidateQueries({ queryKey: ["completions", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
    } catch (err) {
      console.error("Uncomplete action item failed:", err);
      addToast(`Uncomplete failed: ${(err as Error).message}`, "error");
    }
  }, [selectedClient, queryClient, addToast]);

  const handleEditClientActionItem = useCallback(async (meetingId: string, itemIndex: number, fields: EditActionItemFields) => {
    try {
      await window.api.editActionItem(meetingId, itemIndex, fields);
      queryClient.invalidateQueries({ queryKey: ["artifact", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Action item updated", "success");
    } catch (err) {
      addToast(`Edit failed: ${(err as Error).message}`, "error");
    }
  }, [selectedClient, queryClient, addToast]);

  const handleAddClientActionItem = useCallback(async (meetingId: string, fields: EditActionItemFields) => {
    try {
      await window.api.createActionItem(meetingId, fields);
      queryClient.invalidateQueries({ queryKey: ["artifact", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Action item added", "success");
    } catch (err) {
      addToast(`Add failed: ${(err as Error).message}`, "error");
    }
  }, [selectedClient, queryClient, addToast]);

  const handleEditPreviewActionItem = useCallback(async (itemIndex: number, fields: EditActionItemFields) => {
    if (!previewMeetingId) return;
    try {
      await window.api.editActionItem(previewMeetingId, itemIndex, fields);
      queryClient.invalidateQueries({ queryKey: ["artifact", previewMeetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Action item updated", "success");
    } catch (err) {
      addToast(`Edit failed: ${(err as Error).message}`, "error");
    }
  }, [previewMeetingId, selectedClient, queryClient, addToast]);

  const handleCompletePreviewActionItem = useCallback(async (itemIndex: number, note: string) => {
    if (!previewMeetingId) return;
    try {
      await window.api.completeActionItem(previewMeetingId, itemIndex, note);
      queryClient.invalidateQueries({ queryKey: ["completions", previewMeetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
    } catch (err) {
      console.error("Complete action item failed:", err);
      addToast(`Complete failed: ${(err as Error).message}`, "error");
    }
  }, [previewMeetingId, selectedClient, queryClient, addToast]);

  const handleUncompletePreviewActionItem = useCallback(async (itemIndex: number) => {
    if (!previewMeetingId) return;
    try {
      await window.api.uncompleteActionItem(previewMeetingId, itemIndex);
      queryClient.invalidateQueries({ queryKey: ["completions", previewMeetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
    } catch (err) {
      console.error("Uncomplete action item failed:", err);
      addToast(`Uncomplete failed: ${(err as Error).message}`, "error");
    }
  }, [previewMeetingId, selectedClient, queryClient, addToast]);

  const handlePreviewReExtract = useCallback(async () => {
    if (!previewMeetingId) return;
    setIsReExtracting(true);
    try {
      await window.api.reExtract(previewMeetingId);
      queryClient.invalidateQueries({ queryKey: ["artifact", previewMeetingId] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Re-extraction complete", "success");
      window.api.reEmbedMeeting(previewMeetingId).catch(() => {});
    } catch {
      addToast("Re-extraction failed", "error");
    } finally {
      setIsReExtracting(false);
    }
  }, [previewMeetingId, selectedClient, queryClient, addToast]);

  const handlePreviewReassignClient = useCallback(async (clientName: string) => {
    if (!previewMeetingId) return;
    try {
      await window.api.reassignClient(previewMeetingId, clientName);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Client reassigned", "success");
    } catch (err) {
      addToast(`Reassign failed: ${(err as Error).message}`, "error");
    }
  }, [previewMeetingId, selectedClient, queryClient, addToast]);

  const handlePreviewIgnore = useCallback(async () => {
    if (!previewMeetingId) return;
    try {
      await window.api.setIgnored(previewMeetingId, true);
      setPreviewMeetingId(null);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Meeting hidden", "success");
    } catch (err) {
      addToast(`Ignore failed: ${(err as Error).message}`, "error");
    }
  }, [previewMeetingId, selectedClient, queryClient, addToast]);

  const handlePreviewRename = useCallback(async (newTitle: string) => {
    if (!previewMeetingId) return;
    try {
      await window.api.renameMeeting(previewMeetingId, newTitle);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
      addToast("Meeting renamed", "success");
    } catch (err) {
      addToast(`Rename failed: ${(err as Error).message}`, "error");
    }
  }, [previewMeetingId, selectedClient, queryClient, addToast]);

  const handleIgnore = useCallback(async () => {
    if (!selectedMeetingId) return;
    try {
      await window.api.setIgnored(selectedMeetingId, true);
      setSelectedMeetingId(null);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      addToast("Meeting hidden", "success");
    } catch (err) {
      console.error("Ignore meeting failed:", err);
      addToast(`Ignore failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMeetingId, queryClient, addToast]);

  const handleNavigate = useCallback((view: "meetings" | "action-items" | "threads" | "insights" | "timelines") => {
    setCurrentView((prev: "meetings" | "action-items" | "threads" | "insights" | "timelines") => {
      meetingIdPerView.current[prev] = selectedMeetingId;
      return view;
    });
    setSelectedMeetingId(meetingIdPerView.current[view] ?? null);
    setTypedSearchQuery("");
    setSearchQuery("");
  }, [selectedMeetingId, setCurrentView]);

  const handleMentionClick = useCallback((canonicalId: string, itemText: string) => {
    setHistoryItem({ canonicalId, itemText });
  }, []);

  const handleHistorySelectMeeting = useCallback((meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setHistoryItem(null);
  }, []);

  const handleSaveAsThread = useCallback((content: string) => {
    setThreadInitialDescription(content);
  }, []);

  const handleResetSearch = useCallback(() => {
    setTypedSearchQuery("");
    setSearchQuery("");
  }, []);

  const { handleResetChecked } = selection;

  const transcriptQuery = useQuery<string | null>({
    queryKey: ["transcript", selectedMeetingId],
    queryFn: () => window.api.getTranscript(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  });

  const meetingMessagesQuery = useQuery({
    queryKey: ["meetingMessages", selectedMeetingId],
    queryFn: () => window.api.getMeetingMessages(selectedMeetingId!),
    enabled: !!selectedMeetingId,
  });

  const handleMeetingSendMessage = useCallback(async (message: string, includeTranscripts: boolean) => {
    if (!selectedMeetingId) return;
    try {
      await window.api.meetingChat(selectedMeetingId, message, includeTranscripts);
      queryClient.invalidateQueries({ queryKey: ["meetingMessages", selectedMeetingId] });
    } catch (err) {
      addToast(`Chat failed: ${(err as Error).message}`, "error");
    }
  }, [selectedMeetingId, queryClient, addToast]);

  const meetingClear = useClearMessages(useCallback(async () => {
    if (!selectedMeetingId) return;
    try {
      await window.api.clearMeetingMessages(selectedMeetingId);
      queryClient.invalidateQueries({ queryKey: ["meetingMessages", selectedMeetingId] });
      addToast("Messages cleared", "success");
    } catch (err) {
      addToast(`Clear messages failed: ${(err as Error).message}`, "error");
      throw err;
    }
  }, [selectedMeetingId, queryClient, addToast]));

  const handleClearMeetingMessages = useCallback(() => {
    if (!selectedMeetingId) return;
    meetingClear.requestClear();
  }, [selectedMeetingId, meetingClear]);

  return {
    dateRange,
    setDateRange,
    selectedMeetingId,
    setSelectedMeetingId,
    checkedMeetingIds,
    setCheckedMeetingIds,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    typedSearchQuery,
    setTypedSearchQuery,
    searchQuery,
    setSearchQuery,
    historyItem,
    setHistoryItem,
    previewMeetingId,
    setPreviewMeetingId,
    isReExtracting,
    pendingDeleteIds,
    setPendingDeleteIds,
    newMeetingOpen,
    setNewMeetingOpen,
    newMeetingIds,
    deepSearchEnabled,
    setDeepSearchEnabled,
    threadInitialDescription,
    setThreadInitialDescription,
    meetingsQuery,
    searchFetching,
    isDeepSearchActive,
    deepSearchLoading,
    deepSearchEmpty,
    scopeMeetings,
    searchScores,
    deepSearchSummaries,
    selectedMeeting,
    selectedArtifactQuery,
    completionsQuery,
    mentionStatsQuery,
    previewArtifactQuery,
    previewCompletionsQuery,
    previewMentionStatsQuery,
    itemHistoryQuery,
    clientActionItemsQuery,
    isMultiMode,
    checkedMeetings,
    mergedArtifact,
    actionItemOrigins,
    mergedArtifactLoading,
    mergedCompletions,
    charCount,
    handleDateChange,
    handleCheck,
    handleCheckGroup,
    handleDeleteMeetings,
    handleConfirmDelete,
    handleReExtract,
    handleNewMeeting,
    handleReassignClient,
    handleEditActionItem,
    handleCompleteActionItem,
    handleUncompleteActionItem,
    handleMultiCompleteActionItem,
    handleMultiUncompleteActionItem,
    handleEditClientActionItem,
    handleAddClientActionItem,
    handleCompleteClientActionItem,
    handleUncompleteClientActionItem,
    handleEditPreviewActionItem,
    handleCompletePreviewActionItem,
    handleUncompletePreviewActionItem,
    handleIgnore,
    handleNavigate,
    handleMentionClick,
    handleHistorySelectMeeting,
    handleSaveAsThread,
    handleResetSearch,
    handleResetChecked,
    transcriptQuery,
    meetingMessagesQuery,
    handleMeetingSendMessage,
    handleClearMeetingMessages,
    handleConfirmClearMeetingMessages: meetingClear.confirmClear,
    pendingClearMeetingMessages: meetingClear.pendingClear,
    handlePreviewReExtract,
    handlePreviewReassignClient,
    handlePreviewIgnore,
    handlePreviewRename,
  };
}
