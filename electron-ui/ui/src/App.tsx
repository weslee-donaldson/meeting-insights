import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { LinearShell } from "./components/LinearShell.js";
import { TopBar } from "./components/TopBar.js";
import { MeetingList, type GroupBy, type SortBy } from "./components/MeetingList.js";
import { MeetingDetail } from "./components/MeetingDetail.js";
import { ChatPanel } from "./components/ChatPanel.js";
import { NavRail } from "./components/NavRail.js";
import { ClientActionItemsView } from "./components/ClientActionItemsView.js";
import { useTheme } from "./ThemeContext.js";
import { useSearch } from "./hooks/useSearch.js";
import { useDeepSearch } from "./hooks/useDeepSearch.js";
import { ToastContainer, useToast } from "./components/ui/toast.js";
import { mergeArtifactsDeduped, computeActionItemOrigins } from "./lib/merge-artifacts.js";
import type { MeetingRow, ConversationMessage, ConversationChatResponse, Artifact, ActionItemCompletion, MentionStat, ItemHistoryEntry, ClientActionItem, CreateMeetingRequest } from "../../electron/channels.js";
import { ItemHistoryDialog } from "./components/ItemHistoryDialog.js";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog.js";
import { Button } from "./components/ui/button.js";
import { NewMeetingDialog } from "./components/NewMeetingDialog.js";

interface DateRange {
  after: string;
  before: string;
}

export function App() {
  const queryClient = useQueryClient();
  const { theme, setTheme, themes } = useTheme();
  const { toasts, addToast, removeToast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ after: "", before: "" });
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [checkedMeetingIds, setCheckedMeetingIds] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<GroupBy>("series");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [typedSearchQuery, setTypedSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [historyItem, setHistoryItem] = useState<{ canonicalId: string; itemText: string } | null>(null);
  const [currentView, setCurrentView] = useState<"meetings" | "action-items">("meetings");
  const [previewMeetingId, setPreviewMeetingId] = useState<string | null>(null);
  const [isReExtracting, setIsReExtracting] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null);
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [newMeetingIds, setNewMeetingIds] = useState<Set<string>>(new Set());
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(true);

  const clientsQuery = useQuery<string[]>({
    queryKey: ["clients"],
    queryFn: () => window.api.getClients(),
  });

  const templatesQuery = useQuery<string[]>({
    queryKey: ["templates"],
    queryFn: () => window.api.getTemplates(),
  });

  const defaultClientQuery = useQuery<string | null>({
    queryKey: ["defaultClient"],
    queryFn: () => window.api.getDefaultClient(),
  });

  const defaultApplied = useRef(false);
  useEffect(() => {
    if (!defaultApplied.current && defaultClientQuery.data) {
      defaultApplied.current = true;
      setSelectedClient(defaultClientQuery.data);
    }
  }, [defaultClientQuery.data]);

  const meetingsQuery = useQuery<MeetingRow[]>({
    queryKey: ["meetings", selectedClient, dateRange],
    queryFn: () =>
      window.api.getMeetings({
        client: selectedClient ?? undefined,
        after: dateRange.after || undefined,
        before: dateRange.before || undefined,
      }),
  });

  const { data: searchResults, isFetching: searchFetching } = useSearch(searchQuery);

  const hybridMeetingIds = useMemo(
    () => (searchResults ?? []).map((r) => r.meeting_id),
    [searchResults],
  );

  const { data: deepSearchResults, isFetching: deepSearchFetching } = useDeepSearch(
    hybridMeetingIds,
    searchQuery,
    deepSearchEnabled && searchQuery.trim().length >= 2 && !searchFetching,
  );

  const isDeepSearchActive = deepSearchEnabled && !!deepSearchResults && deepSearchResults.length > 0;
  const deepSearchLoading = deepSearchEnabled && deepSearchFetching && searchQuery.trim().length >= 2;

  const scopeMeetings = useMemo(() => {
    const all = meetingsQuery.data ?? [];
    if (searchQuery.trim().length < 2 || !searchResults) return all;
    if (isDeepSearchActive) {
      const deepIds = new Set(deepSearchResults!.map((r) => r.meeting_id));
      return all.filter((m) => deepIds.has(m.id));
    }
    const matchIds = new Set(searchResults.map((r) => r.meeting_id));
    return all.filter((m) => matchIds.has(m.id));
  }, [meetingsQuery.data, searchQuery, searchResults, isDeepSearchActive, deepSearchResults]);

  const searchScores = useMemo(() => {
    if (isDeepSearchActive) {
      return new Map(deepSearchResults!.map((r) => [r.meeting_id, r.relevanceScore]));
    }
    if (!searchResults || searchResults.length === 0) return undefined;
    return new Map(searchResults.map((r) => [r.meeting_id, r.score]));
  }, [searchResults, isDeepSearchActive, deepSearchResults]);

  const deepSearchSummaries = useMemo(() => {
    if (!isDeepSearchActive) return undefined;
    return new Map(deepSearchResults!.map((r) => [r.meeting_id, r.relevanceSummary]));
  }, [isDeepSearchActive, deepSearchResults]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2 && searchResults && searchResults.length > 0) {
      setSortBy("relevance");
    } else if (searchQuery.trim().length < 2) {
      setSortBy("date-desc");
    }
  }, [searchQuery, searchResults]);

  const activeMeetingIds =
    currentView === "action-items"
      ? (previewMeetingId ? [previewMeetingId] : [])
      : checkedMeetingIds.size > 0
      ? [...checkedMeetingIds]
      : selectedMeetingId
      ? [selectedMeetingId]
      : [];

  const selectedMeeting = selectedMeetingId
    ? (scopeMeetings.find((m) => m.id === selectedMeetingId) ?? null)
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

  const clientActionItemsQuery = useQuery<ClientActionItem[]>({
    queryKey: ["clientActionItems", selectedClient],
    queryFn: () => window.api.getClientActionItems(selectedClient!),
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

  const handleClientChange = useCallback((name: string | null) => {
    setSelectedClient(name);
    setCheckedMeetingIds(new Set());
  }, []);

  const handleDateChange = useCallback((field: "after" | "before", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setCheckedMeetingIds((prev) => {
      const scopeIds = new Set(scopeMeetings.map((m) => m.id));
      return new Set([...prev].filter((id) => scopeIds.has(id)));
    });
  }, [scopeMeetings]);

  const handleReset = useCallback(() => {
    setSelectedClient(null);
    setDateRange({ after: "", before: "" });
    setSelectedMeetingId(null);
    setCheckedMeetingIds(new Set());
    setTypedSearchQuery("");
    setSearchQuery("");
  }, []);

  const handleCheck = useCallback((id: string) => {
    setCheckedMeetingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCheckGroup = useCallback((ids: string[]) => {
    setCheckedMeetingIds((prev) => {
      const allChecked = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allChecked) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

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
    await window.api.deleteMeetings(ids);
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
    addToast(`${ids.length} meeting(s) deleted`, "success");
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
    await window.api.reassignClient(selectedMeetingId, clientName);
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
  }, [selectedMeetingId, queryClient]);

  const handleCompleteActionItem = useCallback(async (itemIndex: number, note: string) => {
    if (!selectedMeetingId) return;
    await window.api.completeActionItem(selectedMeetingId, itemIndex, note);
    queryClient.invalidateQueries({ queryKey: ["completions", selectedMeetingId] });
  }, [selectedMeetingId, queryClient]);

  const handleUncompleteActionItem = useCallback(async (itemIndex: number) => {
    if (!selectedMeetingId) return;
    await window.api.uncompleteActionItem(selectedMeetingId, itemIndex);
    queryClient.invalidateQueries({ queryKey: ["completions", selectedMeetingId] });
  }, [selectedMeetingId, queryClient]);

  const handleMultiCompleteActionItem = useCallback(async (mergedIndex: number, note: string) => {
    const origin = actionItemOrigins[mergedIndex];
    if (!origin) return;
    await window.api.completeActionItem(origin.meetingId, origin.itemIndex, note);
    queryClient.invalidateQueries({ queryKey: ["completions", origin.meetingId] });
  }, [actionItemOrigins, queryClient]);

  const handleMultiUncompleteActionItem = useCallback(async (mergedIndex: number) => {
    const origin = actionItemOrigins[mergedIndex];
    if (!origin) return;
    await window.api.uncompleteActionItem(origin.meetingId, origin.itemIndex);
    queryClient.invalidateQueries({ queryKey: ["completions", origin.meetingId] });
  }, [actionItemOrigins, queryClient]);

  const handleCompleteClientActionItem = useCallback(async (meetingId: string, itemIndex: number) => {
    await window.api.completeActionItem(meetingId, itemIndex, "");
    queryClient.invalidateQueries({ queryKey: ["completions", meetingId] });
    queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
  }, [selectedClient, queryClient]);

  const handleCompletePreviewActionItem = useCallback(async (itemIndex: number, note: string) => {
    if (!previewMeetingId) return;
    await window.api.completeActionItem(previewMeetingId, itemIndex, note);
    queryClient.invalidateQueries({ queryKey: ["completions", previewMeetingId] });
    queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
  }, [previewMeetingId, selectedClient, queryClient]);

  const handleUncompletePreviewActionItem = useCallback(async (itemIndex: number) => {
    if (!previewMeetingId) return;
    await window.api.uncompleteActionItem(previewMeetingId, itemIndex);
    queryClient.invalidateQueries({ queryKey: ["completions", previewMeetingId] });
    queryClient.invalidateQueries({ queryKey: ["clientActionItems", selectedClient] });
  }, [previewMeetingId, selectedClient, queryClient]);

  const handleIgnore = useCallback(async () => {
    if (!selectedMeetingId) return;
    await window.api.setIgnored(selectedMeetingId, true);
    setSelectedMeetingId(null);
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
  }, [selectedMeetingId, queryClient]);

  const handleNavigate = useCallback((view: "meetings" | "action-items") => {
    setCurrentView(view);
    setTypedSearchQuery("");
    setSearchQuery("");
  }, []);

  const handleMentionClick = useCallback((canonicalId: string, itemText: string) => {
    setHistoryItem({ canonicalId, itemText });
  }, []);

  const handleHistorySelectMeeting = useCallback((meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setHistoryItem(null);
  }, []);

  const handleChat = useCallback(
    async (messages: ConversationMessage[], attachments?: { name: string; base64: string; mimeType: string }[], includeTranscripts?: boolean, template?: string): Promise<ConversationChatResponse> => {
      return window.api.conversationChat({ meetingIds: activeMeetingIds, messages, attachments, includeTranscripts, template: template || undefined });
    },
    [activeMeetingIds],
  );

  const meetingsViewPanels = [
    <MeetingList
      key="meeting-list"
      meetings={scopeMeetings}
      selectedId={selectedMeetingId}
      checked={checkedMeetingIds}
      groupBy={groupBy}
      onGroupBy={setGroupBy}
      sortBy={sortBy}
      onSortBy={setSortBy}
      searchScores={searchScores}
      onSelect={setSelectedMeetingId}
      onCheck={handleCheck}
      onCheckGroup={handleCheckGroup}
      searchLoading={searchFetching && searchQuery.trim().length >= 2}
      searchQuery={searchQuery}
      loading={meetingsQuery.isLoading}
      hasFilters={!!(selectedClient || dateRange.after || dateRange.before)}
      checkedCount={checkedMeetingIds.size}
      onDelete={handleDeleteMeetings}
      onNewMeeting={() => setNewMeetingOpen(true)}
      newMeetingIds={newMeetingIds}
      deepSearchSummaries={deepSearchSummaries}
      isDeepSearchActive={isDeepSearchActive}
      deepSearchLoading={deepSearchLoading}
    />,
    <MeetingDetail
      key="meeting-detail"
      meeting={isMultiMode ? null : selectedMeeting}
      meetings={isMultiMode ? checkedMeetings : undefined}
      artifact={isMultiMode ? mergedArtifact : (selectedArtifactQuery.data ?? null)}
      onReExtract={isMultiMode ? undefined : (selectedMeetingId ? handleReExtract : undefined)}
      reExtractPending={isReExtracting}
      clients={clientsQuery.data}
      onReassignClient={isMultiMode ? undefined : (selectedMeetingId ? handleReassignClient : undefined)}
      onIgnore={isMultiMode ? undefined : (selectedMeetingId ? handleIgnore : undefined)}
      completions={isMultiMode ? mergedCompletions : (completionsQuery.data ?? [])}
      onComplete={isMultiMode ? handleMultiCompleteActionItem : (selectedMeetingId ? handleCompleteActionItem : undefined)}
      onUncomplete={isMultiMode ? handleMultiUncompleteActionItem : (selectedMeetingId ? handleUncompleteActionItem : undefined)}
      mentionStats={isMultiMode ? [] : (mentionStatsQuery.data ?? [])}
      onMentionClick={isMultiMode ? undefined : handleMentionClick}
      artifactLoading={isMultiMode ? mergedArtifactLoading : selectedArtifactQuery.isLoading}
      searchQuery={searchQuery}
    />,
  ];

  const actionItemsViewPanels: React.ReactNode[] = [
    <ClientActionItemsView
      key="client-action-items"
      clientName={selectedClient}
      items={clientActionItemsQuery.data ?? []}
      onPreviewMeeting={setPreviewMeetingId}
      onComplete={handleCompleteClientActionItem}
    />,
    ...(previewMeetingId ? [
      <MeetingDetail
        key="preview-detail"
        meeting={scopeMeetings.find((m) => m.id === previewMeetingId) ?? null}
        artifact={previewArtifactQuery.data ?? null}
        completions={previewCompletionsQuery.data ?? []}
        onComplete={handleCompletePreviewActionItem}
        onUncomplete={handleUncompletePreviewActionItem}
        mentionStats={previewMentionStatsQuery.data ?? []}
        artifactLoading={previewArtifactQuery.isLoading}
      />,
    ] : []),
  ];

  const panels = currentView === "meetings" ? meetingsViewPanels : actionItemsViewPanels;

  return (
    <>
    <LinearShell
      chatOpen={activeMeetingIds.length > 0}
      topBar={
        <TopBar
          clients={clientsQuery.data ?? []}
          selectedClient={selectedClient}
          dateRange={dateRange}
          searchQuery={typedSearchQuery}
          onClientChange={handleClientChange}
          onDateChange={handleDateChange}
          onSearchQueryChange={setTypedSearchQuery}
          onSubmitSearch={setSearchQuery}
          deepSearchEnabled={deepSearchEnabled}
          onDeepSearchToggle={setDeepSearchEnabled}
          onReset={handleReset}
          theme={theme}
          setTheme={setTheme}
          themes={themes}
        />
      }
      navRail={<NavRail currentView={currentView} onNavigate={handleNavigate} />}
      panels={panels}
      chat={
        <ChatPanel
          activeMeetingIds={activeMeetingIds}
          charCount={charCount}
          onChat={handleChat}
          templates={templatesQuery.data ?? []}
        />
      }
    />
    <ToastContainer toasts={toasts} onDismiss={removeToast} />
    <ItemHistoryDialog
      open={!!historyItem}
      onClose={() => setHistoryItem(null)}
      itemText={historyItem?.itemText ?? ""}
      history={itemHistoryQuery.data ?? []}
      onSelectMeeting={handleHistorySelectMeeting}
    />
    <NewMeetingDialog
      open={newMeetingOpen}
      onOpenChange={setNewMeetingOpen}
      clients={clientsQuery.data ?? []}
      onSubmit={handleNewMeeting}
    />
    <Dialog open={pendingDeleteIds !== null} onOpenChange={(o) => { if (!o) setPendingDeleteIds(null); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Delete meetings</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Permanently delete {pendingDeleteIds?.length ?? 0} meeting(s)?
        </p>
        <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setPendingDeleteIds(null)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>Delete permanently</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
