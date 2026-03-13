import React, { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ConversationMessage, ConversationChatResponse } from "../../electron/channels.js";
import { LinearShell } from "./components/LinearShell.js";
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
import { useMeetingState } from "./hooks/useMeetingState.js";
import { useThreadState } from "./hooks/useThreadState.js";
import { useInsightState } from "./hooks/useInsightState.js";
import { useMilestoneState } from "./hooks/useMilestoneState.js";
import { MeetingsPage } from "./pages/MeetingsPage.js";
import { ActionItemsPage } from "./pages/ActionItemsPage.js";
import { ThreadsPage } from "./pages/ThreadsPage.js";
import { InsightsPage } from "./pages/InsightsPage.js";
import { TimelinesPage } from "./pages/TimelinesPage.js";

export function App() {
  const { theme, setTheme, themes } = useTheme();
  const { toasts, addToast, removeToast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
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
    if (!defaultApplied.current && defaultClientQuery.data) {
      defaultApplied.current = true;
      setSelectedClient(defaultClientQuery.data);
    }
  }, [defaultClientQuery.data]);

  const meeting = useMeetingState(selectedClient, currentView, addToast, setCurrentView);
  const thread = useThreadState(selectedClient, currentView, addToast);
  const insight = useInsightState(selectedClient, currentView, addToast);
  const milestone = useMilestoneState(selectedClient, currentView, addToast);

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
    async (messages: ConversationMessage[], attachments?: { name: string; base64: string; mimeType: string }[], includeTranscripts?: boolean, template?: string): Promise<ConversationChatResponse> => {
      return window.api.conversationChat({ meetingIds: activeMeetingIdsRef.current, messages, attachments, includeTranscripts, template: template || undefined });
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
  });

  const actionItemsPanels = ActionItemsPage({
    selectedClient,
    items: meeting.clientActionItemsQuery.data ?? [],
    onPreviewMeeting: meeting.setPreviewMeetingId,
    onComplete: meeting.handleCompleteClientActionItem,
    onUncomplete: meeting.handleUncompleteClientActionItem,
    onEditActionItem: meeting.handleEditClientActionItem,
    previewMeetingId: meeting.previewMeetingId,
    previewMeeting: meeting.scopeMeetings.find((m) => m.id === meeting.previewMeetingId) ?? null,
    previewArtifact: meeting.previewArtifactQuery.data ?? null,
    previewArtifactLoading: meeting.previewArtifactQuery.isLoading,
    previewCompletions: meeting.previewCompletionsQuery.data ?? [],
    previewMentionStats: meeting.previewMentionStatsQuery.data ?? [],
    onCompletePreview: meeting.handleCompletePreviewActionItem,
    onUncompletePreview: meeting.handleUncompletePreviewActionItem,
    onEditPreviewActionItem: meeting.handleEditPreviewActionItem,
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
        onSaveAsThread={selectedClient ? handleSaveAsThreadAndOpen : undefined}
      />
    );

  return (
    <>
    <LinearShell
      viewId={currentView}
      chatOpen={chatOpenForCurrentView}
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
    </>
  );
}
