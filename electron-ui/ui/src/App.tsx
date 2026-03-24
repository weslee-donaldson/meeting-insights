import React, { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConversationMessage, ConversationChatResponse } from "../../electron/channels.js";
import { ResponsiveShell } from "./components/ResponsiveShell.js";
import { TopBar } from "./components/TopBar.js";
import { ChatPanel } from "./components/ChatPanel.js";
import { NavRail } from "./components/NavRail.js";
import { useTheme } from "./ThemeContext.js";
import { ToastContainer, useToast } from "./components/ui/toast.js";
import { ItemHistoryDialog } from "./components/ItemHistoryDialog.js";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog.js";
import { Button } from "./components/ui/button.js";
import { NewMeetingDialog } from "./components/NewMeetingDialog.js";
import { CreateThreadDialog } from "./components/CreateThreadDialog.js";
import { CreateInsightDialog } from "./components/CreateInsightDialog.js";
import { CreateMilestoneDialog } from "./components/CreateMilestoneDialog.js";
import { useDensity } from "./hooks/useDensity.js";
import { useMeetingState } from "./hooks/useMeetingState.js";
import { useThreadState } from "./hooks/useThreadState.js";
import { useInsightState } from "./hooks/useInsightState.js";
import { useMilestoneState } from "./hooks/useMilestoneState.js";
import { useNotesState } from "./hooks/useNotesState.js";
import { NotesDialog } from "./components/NotesDialog.js";
import { MeetingsPage } from "./pages/MeetingsPage.js";
import { ActionItemsPage } from "./pages/ActionItemsPage.js";
import { ThreadsPage } from "./pages/ThreadsPage.js";
import { InsightsPage } from "./pages/InsightsPage.js";
import { TimelinesPage } from "./pages/TimelinesPage.js";

export function App() {
  const { theme, setTheme, themes } = useTheme();
  const [densityMode, setDensityMode] = useDensity();
  const { toasts, addToast, removeToast } = useToast();
  const [selectedClient, setSelectedClientRaw] = useState<string | null>(() => {
    try { return localStorage.getItem("mtninsights-client"); } catch { return null; }
  });
  const setSelectedClient = useCallback((client: string | null) => {
    setSelectedClientRaw(client);
    try {
      if (client) localStorage.setItem("mtninsights-client", client);
      else localStorage.removeItem("mtninsights-client");
    } catch { /* */ }
  }, []);
  const [currentView, setCurrentView] = useState<"meetings" | "action-items" | "threads" | "insights" | "timelines">("meetings");

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
    if (!defaultApplied.current && defaultClientQuery.data && !selectedClient) {
      defaultApplied.current = true;
      setSelectedClient(defaultClientQuery.data);
    }
  }, [defaultClientQuery.data, selectedClient, setSelectedClient]);

  const meeting = useMeetingState(selectedClient, currentView, addToast, setCurrentView);
  const thread = useThreadState(selectedClient, currentView, addToast);
  const insight = useInsightState(selectedClient, currentView, addToast);
  const milestone = useMilestoneState(selectedClient, currentView, addToast);
  const meetingNotes = useNotesState({ objectType: "meeting", objectId: meeting.selectedMeetingId, addToast });
  const threadNotes = useNotesState({ objectType: "thread", objectId: thread.selectedThreadId, addToast });
  const insightNotes = useNotesState({ objectType: "insight", objectId: insight.selectedInsightId, addToast });
  const milestoneNotes = useNotesState({ objectType: "milestone", objectId: milestone.selectedMilestoneId, addToast });

  const queryClient = useQueryClient();

  const assetsQuery = useQuery({
    queryKey: ["assets", meeting.selectedMeetingId],
    queryFn: () => window.api.getMeetingAssets(meeting.selectedMeetingId!),
    enabled: !!meeting.selectedMeetingId,
  });

  const handleUploadAsset = useCallback(async (file: File) => {
    if (!meeting.selectedMeetingId) return;
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    await window.api.uploadAsset(meeting.selectedMeetingId, file.name, file.type, base64);
    queryClient.invalidateQueries({ queryKey: ["assets", meeting.selectedMeetingId] });
  }, [meeting.selectedMeetingId, queryClient]);

  const handleDeleteAsset = useCallback(async (assetId: string) => {
    await window.api.deleteAsset(assetId);
    queryClient.invalidateQueries({ queryKey: ["assets", meeting.selectedMeetingId] });
  }, [meeting.selectedMeetingId, queryClient]);

  const handleRename = useCallback(async (newTitle: string) => {
    if (!meeting.selectedMeetingId) return;
    await window.api.renameMeeting(meeting.selectedMeetingId, newTitle);
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
  }, [meeting.selectedMeetingId, queryClient]);

  const previewAssetsQuery = useQuery({
    queryKey: ["assets", meeting.previewMeetingId],
    queryFn: () => window.api.getMeetingAssets(meeting.previewMeetingId!),
    enabled: !!meeting.previewMeetingId,
  });

  const previewTranscriptQuery = useQuery({
    queryKey: ["transcript", meeting.previewMeetingId],
    queryFn: () => window.api.getTranscript(meeting.previewMeetingId!),
    enabled: !!meeting.previewMeetingId,
  });

  const previewNotes = useNotesState({ objectType: "meeting", objectId: meeting.previewMeetingId, addToast });

  const handlePreviewUploadAsset = useCallback(async (file: File) => {
    if (!meeting.previewMeetingId) return;
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    await window.api.uploadAsset(meeting.previewMeetingId, file.name, file.type, base64);
    queryClient.invalidateQueries({ queryKey: ["assets", meeting.previewMeetingId] });
  }, [meeting.previewMeetingId, queryClient]);

  const handlePreviewDeleteAsset = useCallback(async (assetId: string) => {
    await window.api.deleteAsset(assetId);
    queryClient.invalidateQueries({ queryKey: ["assets", meeting.previewMeetingId] });
  }, [meeting.previewMeetingId, queryClient]);

  const computedActiveMeetingIds =
    currentView === "action-items"
      ? (meeting.previewMeetingId ? [meeting.previewMeetingId] : [])
      : currentView === "threads"
      ? []
      : meeting.checkedMeetingIds.size > 0
      ? [...meeting.checkedMeetingIds]
      : meeting.selectedMeetingId
      ? [meeting.selectedMeetingId]
      : [];

  const activeMeetingIdsRef = useRef(computedActiveMeetingIds);
  activeMeetingIdsRef.current = computedActiveMeetingIds;

  const handleChat = useCallback(
    async (messages: ConversationMessage[], attachments?: { name: string; base64: string; mimeType: string }[], includeTranscripts?: boolean, template?: string, includeAssets?: boolean): Promise<ConversationChatResponse> => {
      let mergedAttachments = attachments;
      if (includeAssets) {
        const assetAttachments: { name: string; base64: string; mimeType: string }[] = [];
        for (const meetingId of activeMeetingIdsRef.current) {
          const assets = await window.api.getMeetingAssets(meetingId);
          for (const asset of assets) {
            const data = await window.api.getAssetData(asset.id);
            if (data) {
              assetAttachments.push({ name: data.filename, base64: data.data, mimeType: data.mimeType });
            }
          }
        }
        mergedAttachments = [...(attachments ?? []), ...assetAttachments];
      }
      return window.api.conversationChat({ meetingIds: activeMeetingIdsRef.current, messages, attachments: mergedAttachments, includeTranscripts, template: template || undefined });
    },
    [],
  );

  const handleClientChange = useCallback((name: string | null) => {
    setSelectedClient(name);
    meeting.setCheckedMeetingIds(new Set());
  }, [meeting]);

  const handleReset = useCallback(() => {
    setSelectedClient(null);
    meeting.setDateRange({ after: "", before: "" });
    meeting.setSelectedMeetingId(null);
    meeting.setCheckedMeetingIds(new Set());
    meeting.handleResetSearch();
  }, [meeting]);

  const handleThreadClick = useCallback((threadId: string) => {
    setCurrentView("threads");
    thread.setSelectedThreadId(threadId);
  }, [thread]);

  const handleMilestoneClick = useCallback((milestoneId: string) => {
    setCurrentView("timelines");
    milestone.setSelectedMilestoneId(milestoneId);
  }, [milestone]);

  const handleCreateThreadWithMeetings = useCallback((data: { title: string; shorthand: string; description: string; criteria_prompt: string; keywords: string }) => {
    return thread.handleCreateThread(data, activeMeetingIdsRef.current);
  }, [thread]);

  const handleSaveAsThreadAndOpen = useCallback((content: string) => {
    meeting.handleSaveAsThread(content);
    thread.setCreateThreadOpen(true);
  }, [meeting, thread]);

  const chatOpenForCurrentView =
    computedActiveMeetingIds.length > 0 ||
    (currentView === "threads" && (thread.threadMeetingsQuery.data?.length ?? 0) > 0) ||
    (currentView === "insights" && (insight.insightMeetingsQuery.data?.length ?? 0) > 0) ||
    (currentView === "timelines" && !!milestone.selectedMilestoneId);

  const meetingsPanels = MeetingsPage({
    scopeMeetings: meeting.scopeMeetings,
    selectedMeetingId: meeting.selectedMeetingId,
    checkedMeetingIds: meeting.checkedMeetingIds,
    groupBy: meeting.groupBy,
    onGroupBy: meeting.setGroupBy,
    sortBy: meeting.sortBy,
    onSortBy: meeting.setSortBy,
    searchScores: meeting.searchScores,
    onSelect: meeting.setSelectedMeetingId,
    onCheck: meeting.handleCheck,
    onCheckGroup: meeting.handleCheckGroup,
    searchFetching: meeting.searchFetching,
    searchQuery: meeting.searchQuery,
    meetingsLoading: meeting.meetingsQuery.isLoading,
    hasFilters: !!(selectedClient || meeting.dateRange.after || meeting.dateRange.before),
    onDelete: meeting.handleDeleteMeetings,
    onNewMeeting: () => meeting.setNewMeetingOpen(true),
    newMeetingIds: meeting.newMeetingIds,
    deepSearchSummaries: meeting.deepSearchSummaries,
    isDeepSearchActive: meeting.isDeepSearchActive,
    deepSearchLoading: meeting.deepSearchLoading,
    deepSearchEmpty: meeting.deepSearchEmpty,
    isMultiMode: meeting.isMultiMode,
    checkedMeetings: meeting.checkedMeetings,
    selectedMeeting: meeting.selectedMeeting,
    artifact: meeting.isMultiMode ? meeting.mergedArtifact : (meeting.selectedArtifactQuery.data ?? null),
    artifactLoading: meeting.isMultiMode ? meeting.mergedArtifactLoading : meeting.selectedArtifactQuery.isLoading,
    clients: clientsQuery.data,
    onReExtract: meeting.selectedMeetingId ? meeting.handleReExtract : undefined,
    reExtractPending: meeting.isReExtracting,
    onReassignClient: meeting.selectedMeetingId ? meeting.handleReassignClient : undefined,
    onIgnore: meeting.selectedMeetingId ? meeting.handleIgnore : undefined,
    completions: meeting.completionsQuery.data ?? [],
    onComplete: meeting.handleCompleteActionItem,
    onUncomplete: meeting.handleUncompleteActionItem,
    mergedCompletions: meeting.mergedCompletions,
    onMultiComplete: meeting.handleMultiCompleteActionItem,
    onMultiUncomplete: meeting.handleMultiUncompleteActionItem,
    mentionStats: meeting.mentionStatsQuery.data ?? [],
    onMentionClick: meeting.handleMentionClick,
    onThreadClick: handleThreadClick,
    onMilestoneClick: handleMilestoneClick,
    onEditActionItem: meeting.handleEditActionItem,
    assets: assetsQuery.data,
    onUploadAsset: meeting.selectedMeetingId ? handleUploadAsset : undefined,
    onDeleteAsset: meeting.selectedMeetingId ? handleDeleteAsset : undefined,
    onRename: meeting.selectedMeetingId ? handleRename : undefined,
    rawTranscript: meeting.transcriptQuery.data ?? undefined,
    densityMode,
    onDensityChange: setDensityMode,
    notesCount: meetingNotes.noteCountQuery.data ?? 0,
    onNotesClick: meeting.selectedMeetingId ? () => meetingNotes.setNotesDialogOpen(true) : undefined,
  });

  const actionItemsPanels = ActionItemsPage({
    selectedClient,
    items: meeting.clientActionItemsQuery.data ?? [],
    onPreviewMeeting: meeting.setPreviewMeetingId,
    onComplete: meeting.handleCompleteClientActionItem,
    onUncomplete: meeting.handleUncompleteClientActionItem,
    onEditActionItem: meeting.handleEditClientActionItem,
    onAddActionItem: meeting.handleAddClientActionItem,
    previewMeetingId: meeting.previewMeetingId,
    previewMeeting: meeting.scopeMeetings.find((m) => m.id === meeting.previewMeetingId) ?? null,
    previewArtifact: meeting.previewArtifactQuery.data ?? null,
    previewArtifactLoading: meeting.previewArtifactQuery.isLoading,
    previewCompletions: meeting.previewCompletionsQuery.data ?? [],
    previewMentionStats: meeting.previewMentionStatsQuery.data ?? [],
    onCompletePreview: meeting.handleCompletePreviewActionItem,
    onUncompletePreview: meeting.handleUncompletePreviewActionItem,
    onEditPreviewActionItem: meeting.handleEditPreviewActionItem,
    densityMode,
    onDensityChange: setDensityMode,
    clients: clientsQuery.data,
    onReExtract: meeting.previewMeetingId ? meeting.handlePreviewReExtract : undefined,
    reExtractPending: meeting.isReExtracting,
    onReassignClient: meeting.previewMeetingId ? meeting.handlePreviewReassignClient : undefined,
    onIgnore: meeting.previewMeetingId ? meeting.handlePreviewIgnore : undefined,
    previewAssets: previewAssetsQuery.data,
    onUploadAsset: meeting.previewMeetingId ? handlePreviewUploadAsset : undefined,
    onDeleteAsset: meeting.previewMeetingId ? handlePreviewDeleteAsset : undefined,
    onRename: meeting.previewMeetingId ? meeting.handlePreviewRename : undefined,
    previewRawTranscript: previewTranscriptQuery.data ?? undefined,
    previewThreadTags: meeting.scopeMeetings.find((m) => m.id === meeting.previewMeetingId)?.thread_tags,
    previewMilestoneTags: meeting.scopeMeetings.find((m) => m.id === meeting.previewMeetingId)?.milestone_tags,
    onThreadClick: handleThreadClick,
    onMilestoneClick: handleMilestoneClick,
    onMentionClick: meeting.handleMentionClick,
    notesCount: previewNotes.noteCountQuery.data ?? 0,
    onNotesClick: meeting.previewMeetingId ? () => previewNotes.setNotesDialogOpen(true) : undefined,
  });

  const threadsPanels = ThreadsPage({
    threads: thread.threadsQuery.data ?? [],
    selectedClient,
    selectedThreadId: thread.selectedThreadId,
    onSelectThread: (id: string) => { thread.setSelectedThreadId(id); thread.setThreadPreviewCandidateIds(new Set()); },
    onCreateThread: () => thread.setCreateThreadOpen(true),
    selectedThread: thread.selectedThread,
    threadMeetings: thread.threadMeetingsQuery.data ?? [],
    threadCandidates: thread.threadCandidates,
    onEdit: () => thread.setEditThreadOpen(true),
    onDeleteThread: thread.handleDeleteThread,
    onFindCandidates: thread.handleFindCandidates,
    onRemoveThreadMeetings: thread.handleRemoveThreadMeetings,
    onRegenerateThreadSummary: thread.handleRegenerateThreadSummary,
    onMeetingClick: meeting.setSelectedMeetingId,
    onEvaluateCandidates: thread.handleEvaluateCandidates,
    onCandidateCheck: thread.handleCandidateCheck,
    onResolveThread: thread.handleResolveThread,
    threadPreviewCandidateIds: thread.threadPreviewCandidateIds,
    scopeMeetings: meeting.scopeMeetings,
    selectedMeeting: meeting.selectedMeeting,
    selectedArtifact: meeting.selectedArtifactQuery.data ?? null,
    selectedArtifactLoading: meeting.selectedArtifactQuery.isLoading,
    selectedCompletions: meeting.completionsQuery.data ?? [],
    threadKeywords: thread.selectedThread?.keywords,
    notesCount: threadNotes.noteCountQuery.data ?? 0,
    onNotesClick: thread.selectedThreadId ? () => threadNotes.setNotesDialogOpen(true) : undefined,
  });

  const insightsPanels = InsightsPage({
    insights: insight.insightsQuery.data ?? [],
    selectedClient,
    selectedInsightId: insight.selectedInsightId,
    onSelectInsight: insight.setSelectedInsightId,
    onCreateInsight: () => insight.setCreateInsightOpen(true),
    selectedInsight: insight.selectedInsight,
    insightMeetings: insight.insightMeetingsQuery.data ?? [],
    onDeleteInsight: insight.handleDeleteInsight,
    onRegenerateInsight: insight.handleRegenerateInsight,
    onFinalizeInsight: insight.handleFinalizeInsight,
    onUpdateInsightSummary: insight.handleUpdateInsightSummary,
    onShowAllInsightMeetings: insight.handleShowAllInsightMeetings,
    isRegenerating: insight.regeneratingInsightId === insight.selectedInsightId,
    selectedMeeting: meeting.selectedMeeting,
    selectedArtifact: meeting.selectedArtifactQuery.data ?? null,
    selectedArtifactLoading: meeting.selectedArtifactQuery.isLoading,
    selectedCompletions: meeting.completionsQuery.data ?? [],
    notesCount: insightNotes.noteCountQuery.data ?? 0,
    onNotesClick: insight.selectedInsightId ? () => insightNotes.setNotesDialogOpen(true) : undefined,
  });

  const timelinesPanels = TimelinesPage({
    milestones: milestone.milestonesQuery.data ?? [],
    milestoneMentions: milestone.milestoneMentionsQuery.data ?? [],
    selectedClient,
    selectedMilestoneId: milestone.selectedMilestoneId,
    onSelectMilestone: milestone.setSelectedMilestoneId,
    onCreateMilestone: () => milestone.setCreateMilestoneOpen(true),
    selectedMilestone: milestone.selectedMilestone,
    milestoneSlippage: milestone.milestoneSlippageQuery.data ?? [],
    milestoneActionItems: milestone.milestoneActionItemsQuery.data ?? [],
    pendingMilestoneMentions: milestone.pendingMilestoneMentions,
    onDeleteMilestone: milestone.handleDeleteMilestone,
    onMeetingClick: meeting.setSelectedMeetingId,
    onUnlinkActionItem: milestone.handleUnlinkMilestoneActionItem,
    onConfirmMention: milestone.handleConfirmMilestoneMention,
    onRejectMention: milestone.handleRejectMilestoneMention,
    onUpdateMilestone: milestone.handleUpdateMilestone,
    onMergeMilestones: milestone.handleMergeMilestones,
    notesCount: milestoneNotes.noteCountQuery.data ?? 0,
    onNotesClick: milestone.selectedMilestoneId ? () => milestoneNotes.setNotesDialogOpen(true) : undefined,
  });

  const panels =
    currentView === "meetings" ? meetingsPanels :
    currentView === "action-items" ? actionItemsPanels :
    currentView === "threads" ? threadsPanels :
    currentView === "timelines" ? timelinesPanels :
    insightsPanels;

  const chatPanel =
    currentView === "insights" && insight.selectedInsightId ? (
      <ChatPanel
        activeMeetingIds={[]}
        charCount={0}
        onChat={handleChat}
        persistedMessages={insight.insightMessagesQuery.data ?? []}
        onSendMessage={insight.handleInsightSendMessage}
        onClearMessages={insight.handleClearInsightMessages}
        onSourceClick={meeting.setSelectedMeetingId}
      />
    ) : currentView === "threads" && thread.selectedThreadId ? (
      <ChatPanel
        activeMeetingIds={[]}
        charCount={0}
        onChat={handleChat}
        persistedMessages={thread.threadMessagesQuery.data ?? []}
        onSendMessage={thread.handleThreadSendMessage}
        onClearMessages={thread.handleClearThreadMessages}
        onSourceClick={meeting.setSelectedMeetingId}
      />
    ) : currentView === "timelines" && milestone.selectedMilestoneId ? (
      <ChatPanel
        activeMeetingIds={[]}
        charCount={0}
        onChat={handleChat}
        persistedMessages={milestone.milestoneMessagesQuery.data ?? []}
        onSendMessage={milestone.handleMilestoneSendMessage}
        onClearMessages={milestone.handleClearMilestoneMessages}
        onSourceClick={meeting.setSelectedMeetingId}
      />
    ) : (
      <ChatPanel
        activeMeetingIds={computedActiveMeetingIds}
        charCount={meeting.charCount}
        onChat={handleChat}
        templates={templatesQuery.data ?? []}
        persistedMessages={!meeting.isMultiMode && meeting.selectedMeetingId ? meeting.meetingMessagesQuery.data ?? [] : undefined}
        onSendMessage={!meeting.isMultiMode && meeting.selectedMeetingId ? meeting.handleMeetingSendMessage : undefined}
        onClearMessages={!meeting.isMultiMode && meeting.selectedMeetingId ? meeting.handleClearMeetingMessages : undefined}
        onSaveAsThread={selectedClient ? handleSaveAsThreadAndOpen : undefined}
        showIncludeAssets={computedActiveMeetingIds.length > 0}
      />
    );

  return (
    <>
    <ResponsiveShell
      viewId={currentView}
      defaultSidebarWidth={currentView === "action-items" ? 520 : undefined}
      chatOpen={chatOpenForCurrentView}
      currentView={currentView}
      onNavigate={meeting.handleNavigate}
      selectedItemTitle={
        currentView === "meetings" ? meeting.selectedMeeting?.title :
        currentView === "threads" ? thread.selectedThread?.title :
        currentView === "insights" ? (insight.selectedInsight as { period_type?: string } | undefined)?.period_type :
        currentView === "timelines" ? milestone.selectedMilestone?.title :
        undefined
      }
      selectedItemId={
        currentView === "meetings" ? meeting.selectedMeetingId :
        currentView === "action-items" ? meeting.previewMeetingId :
        currentView === "threads" ? thread.selectedThreadId :
        currentView === "insights" ? insight.selectedInsightId :
        currentView === "timelines" ? milestone.selectedMilestoneId :
        null
      }
      topBar={
        <TopBar
          clients={clientsQuery.data ?? []}
          selectedClient={selectedClient}
          dateRange={meeting.dateRange}
          searchQuery={meeting.typedSearchQuery}
          onClientChange={handleClientChange}
          onDateChange={meeting.handleDateChange}
          onSearchQueryChange={meeting.setTypedSearchQuery}
          onSubmitSearch={meeting.setSearchQuery}
          deepSearchEnabled={meeting.deepSearchEnabled}
          onDeepSearchToggle={meeting.setDeepSearchEnabled}
          onReset={handleReset}
          theme={theme}
          setTheme={setTheme}
          themes={themes}
          stats={selectedClient ? {
            meetings: meeting.scopeMeetings.length,
            actionItems: (meeting.clientActionItemsQuery.data ?? []).length,
            threads: (thread.threadsQuery.data ?? []).length,
          } : undefined}
        />
      }
      navRail={<NavRail currentView={currentView} onNavigate={meeting.handleNavigate} />}
      panels={panels}
      chat={chatPanel}
    />
    <ToastContainer toasts={toasts} onDismiss={removeToast} />
    <ItemHistoryDialog
      open={!!meeting.historyItem}
      onClose={() => meeting.setHistoryItem(null)}
      itemText={meeting.historyItem?.itemText ?? ""}
      history={meeting.itemHistoryQuery.data ?? []}
      onSelectMeeting={meeting.handleHistorySelectMeeting}
    />
    <NewMeetingDialog
      open={meeting.newMeetingOpen}
      onOpenChange={meeting.setNewMeetingOpen}
      clients={clientsQuery.data ?? []}
      onSubmit={meeting.handleNewMeeting}
    />
    <Dialog open={meeting.pendingDeleteIds !== null} onOpenChange={(o) => { if (!o) meeting.setPendingDeleteIds(null); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Delete meetings</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Permanently delete {meeting.pendingDeleteIds?.length ?? 0} meeting(s)?
        </p>
        <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => meeting.setPendingDeleteIds(null)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={meeting.handleConfirmDelete}>Delete permanently</Button>
        </div>
      </DialogContent>
    </Dialog>
    <CreateThreadDialog
      open={thread.createThreadOpen}
      onOpenChange={thread.setCreateThreadOpen}
      onSubmit={handleCreateThreadWithMeetings}
      initialDescription={meeting.threadInitialDescription}
    />
    {thread.selectedThread && (
      <CreateThreadDialog
        open={thread.editThreadOpen}
        onOpenChange={thread.setEditThreadOpen}
        onSubmit={thread.handleUpdateThread}
        thread={thread.selectedThread}
      />
    )}
    <CreateInsightDialog
      open={insight.createInsightOpen}
      onOpenChange={insight.setCreateInsightOpen}
      onSubmit={insight.handleCreateInsight}
    />
    <Dialog open={insight.pendingDeleteInsightId !== null} onOpenChange={(o) => { if (!o) insight.setPendingDeleteInsightId(null); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Delete insight</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Permanently delete this insight and its associated data?
        </p>
        <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => insight.setPendingDeleteInsightId(null)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={insight.handleConfirmDeleteInsight}>Delete permanently</Button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={thread.pendingDeleteThreadId !== null} onOpenChange={(o) => { if (!o) thread.setPendingDeleteThreadId(null); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Delete thread</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Permanently delete this thread and its associated data?
        </p>
        <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => thread.setPendingDeleteThreadId(null)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={thread.handleConfirmDeleteThread}>Delete permanently</Button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={thread.pendingClearThreadMessages} onOpenChange={(o) => { if (!o) thread.setPendingClearThreadMessages(false); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Clear messages</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Clear all chat messages for this thread?
        </p>
        <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => thread.setPendingClearThreadMessages(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={thread.handleConfirmClearThreadMessages}>Clear messages</Button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={insight.pendingClearInsightMessages} onOpenChange={(o) => { if (!o) insight.setPendingClearInsightMessages(false); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Clear messages</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Clear all chat messages for this insight?
        </p>
        <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => insight.setPendingClearInsightMessages(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={insight.handleConfirmClearInsightMessages}>Clear messages</Button>
        </div>
      </DialogContent>
    </Dialog>
    <CreateMilestoneDialog
      open={milestone.createMilestoneOpen}
      onOpenChange={milestone.setCreateMilestoneOpen}
      onSubmit={milestone.handleCreateMilestone}
      clientName={selectedClient ?? ""}
    />
    <Dialog open={milestone.pendingDeleteMilestoneId !== null} onOpenChange={(o) => { if (!o) milestone.setPendingDeleteMilestoneId(null); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Delete milestone</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Permanently delete this milestone and its associated data?
        </p>
        <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => milestone.setPendingDeleteMilestoneId(null)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={milestone.handleConfirmDeleteMilestone}>Delete permanently</Button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={milestone.pendingClearMilestoneMessages} onOpenChange={(o) => { if (!o) milestone.setPendingClearMilestoneMessages(false); }}>
      <DialogContent aria-describedby={undefined}>
        <DialogTitle>Clear messages</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Clear all chat messages for this milestone?
        </p>
        <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => milestone.setPendingClearMilestoneMessages(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={milestone.handleConfirmClearMilestoneMessages}>Clear messages</Button>
        </div>
      </DialogContent>
    </Dialog>
    <NotesDialog
      open={previewNotes.notesDialogOpen}
      onOpenChange={previewNotes.setNotesDialogOpen}
      mode={previewNotes.notesDialogMode}
      objectLabel={meeting.scopeMeetings.find((m) => m.id === meeting.previewMeetingId)?.title ?? ""}
      objectTypeLabel="Meeting"
      notes={previewNotes.notesQuery.data ?? []}
      editingNote={previewNotes.editingNote}
      pendingDeleteNoteId={previewNotes.pendingDeleteNoteId}
      onStartCompose={previewNotes.handleStartCompose}
      onStartEdit={previewNotes.handleStartEdit}
      onBackToList={previewNotes.handleBackToList}
      onCreateNote={previewNotes.handleCreateNote}
      onUpdateNote={previewNotes.handleUpdateNote}
      onDeleteNote={previewNotes.handleDeleteNote}
      onConfirmDelete={previewNotes.handleConfirmDeleteNote}
      onCancelDelete={previewNotes.handleCancelDeleteNote}
    />
    <NotesDialog
      open={meetingNotes.notesDialogOpen}
      onOpenChange={meetingNotes.setNotesDialogOpen}
      mode={meetingNotes.notesDialogMode}
      objectLabel={meeting.selectedMeeting?.title ?? ""}
      objectTypeLabel="Meeting"
      notes={meetingNotes.notesQuery.data ?? []}
      editingNote={meetingNotes.editingNote}
      pendingDeleteNoteId={meetingNotes.pendingDeleteNoteId}
      onStartCompose={meetingNotes.handleStartCompose}
      onStartEdit={meetingNotes.handleStartEdit}
      onBackToList={meetingNotes.handleBackToList}
      onCreateNote={meetingNotes.handleCreateNote}
      onUpdateNote={meetingNotes.handleUpdateNote}
      onDeleteNote={meetingNotes.handleDeleteNote}
      onConfirmDelete={meetingNotes.handleConfirmDeleteNote}
      onCancelDelete={meetingNotes.handleCancelDeleteNote}
    />
    <NotesDialog
      open={threadNotes.notesDialogOpen}
      onOpenChange={threadNotes.setNotesDialogOpen}
      mode={threadNotes.notesDialogMode}
      objectLabel={thread.selectedThread?.title ?? ""}
      objectTypeLabel="Thread"
      notes={threadNotes.notesQuery.data ?? []}
      editingNote={threadNotes.editingNote}
      pendingDeleteNoteId={threadNotes.pendingDeleteNoteId}
      onStartCompose={threadNotes.handleStartCompose}
      onStartEdit={threadNotes.handleStartEdit}
      onBackToList={threadNotes.handleBackToList}
      onCreateNote={threadNotes.handleCreateNote}
      onUpdateNote={threadNotes.handleUpdateNote}
      onDeleteNote={threadNotes.handleDeleteNote}
      onConfirmDelete={threadNotes.handleConfirmDeleteNote}
      onCancelDelete={threadNotes.handleCancelDeleteNote}
    />
    <NotesDialog
      open={insightNotes.notesDialogOpen}
      onOpenChange={insightNotes.setNotesDialogOpen}
      mode={insightNotes.notesDialogMode}
      objectLabel={insight.selectedInsight ? `${insight.selectedInsight.period_start} – ${insight.selectedInsight.period_end}` : ""}
      objectTypeLabel="Insight"
      notes={insightNotes.notesQuery.data ?? []}
      editingNote={insightNotes.editingNote}
      pendingDeleteNoteId={insightNotes.pendingDeleteNoteId}
      onStartCompose={insightNotes.handleStartCompose}
      onStartEdit={insightNotes.handleStartEdit}
      onBackToList={insightNotes.handleBackToList}
      onCreateNote={insightNotes.handleCreateNote}
      onUpdateNote={insightNotes.handleUpdateNote}
      onDeleteNote={insightNotes.handleDeleteNote}
      onConfirmDelete={insightNotes.handleConfirmDeleteNote}
      onCancelDelete={insightNotes.handleCancelDeleteNote}
    />
    <NotesDialog
      open={milestoneNotes.notesDialogOpen}
      onOpenChange={milestoneNotes.setNotesDialogOpen}
      mode={milestoneNotes.notesDialogMode}
      objectLabel={milestone.selectedMilestone?.title ?? ""}
      objectTypeLabel="Milestone"
      notes={milestoneNotes.notesQuery.data ?? []}
      editingNote={milestoneNotes.editingNote}
      pendingDeleteNoteId={milestoneNotes.pendingDeleteNoteId}
      onStartCompose={milestoneNotes.handleStartCompose}
      onStartEdit={milestoneNotes.handleStartEdit}
      onBackToList={milestoneNotes.handleBackToList}
      onCreateNote={milestoneNotes.handleCreateNote}
      onUpdateNote={milestoneNotes.handleUpdateNote}
      onDeleteNote={milestoneNotes.handleDeleteNote}
      onConfirmDelete={milestoneNotes.handleConfirmDeleteNote}
      onCancelDelete={milestoneNotes.handleCancelDeleteNote}
    />
    </>
  );
}
