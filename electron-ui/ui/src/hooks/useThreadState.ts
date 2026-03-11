import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Thread, ThreadMeeting, ThreadMessage } from "../../../../core/threads.js";

export function useThreadState(
  selectedClient: string | null,
  currentView: string,
  addToast: (message: string, type: "success" | "error") => void,
) {
  const queryClient = useQueryClient();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [editThreadOpen, setEditThreadOpen] = useState(false);
  const [createThreadOpen, setCreateThreadOpen] = useState(false);
  const [threadCandidates, setThreadCandidates] = useState<Array<{ meeting_id: string; title: string; date: string; similarity: number }>>([]);
  const [threadPreviewCandidateIds, setThreadPreviewCandidateIds] = useState<Set<string>>(new Set());
  const [pendingDeleteThreadId, setPendingDeleteThreadId] = useState<string | null>(null);
  const [pendingClearThreadMessages, setPendingClearThreadMessages] = useState(false);

  const threadsQuery = useQuery<Thread[]>({
    queryKey: ["threads", selectedClient],
    queryFn: () => window.api.listThreads(selectedClient!),
    enabled: currentView === "threads" && !!selectedClient,
  });

  const threadMeetingsQuery = useQuery<ThreadMeeting[]>({
    queryKey: ["threadMeetings", selectedThreadId],
    queryFn: () => window.api.getThreadMeetings(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  const threadMessagesQuery = useQuery<ThreadMessage[]>({
    queryKey: ["threadMessages", selectedThreadId],
    queryFn: () => window.api.getThreadMessages(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  const selectedThread = useMemo(() => {
    return threadsQuery.data?.find((t) => t.id === selectedThreadId) ?? null;
  }, [threadsQuery.data, selectedThreadId]);

  const handleCreateThread = useCallback(async (data: { title: string; shorthand: string; description: string; criteria_prompt: string; keywords: string }, linkedMeetingIds?: string[]) => {
    if (!selectedClient) return;
    try {
      const thread = await window.api.createThread({ ...data, client_name: selectedClient });
      setCreateThreadOpen(false);
      if (linkedMeetingIds && linkedMeetingIds.length > 0) {
        for (const meetingId of linkedMeetingIds) {
          await window.api.addThreadMeeting(thread.id, meetingId, "Linked from chat", 100);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["threads", selectedClient] });
      addToast("Thread created", "success");
    } catch (err) {
      console.error("Create thread failed:", err);
      addToast(`Create thread failed: ${(err as Error).message}`, "error");
    }
  }, [selectedClient, queryClient, addToast]);

  const handleUpdateThread = useCallback(async (data: { title: string; shorthand: string; description: string; criteria_prompt: string; keywords: string }) => {
    if (!selectedThreadId) return;
    try {
      await window.api.updateThread(selectedThreadId, data);
      setEditThreadOpen(false);
      queryClient.invalidateQueries({ queryKey: ["threads", selectedClient] });
      addToast("Thread updated", "success");
    } catch (err) {
      console.error("Update thread failed:", err);
      addToast(`Update thread failed: ${(err as Error).message}`, "error");
    }
  }, [selectedThreadId, selectedClient, queryClient, addToast]);

  const handleDeleteThread = useCallback(() => {
    if (!selectedThreadId) return;
    setPendingDeleteThreadId(selectedThreadId);
  }, [selectedThreadId]);

  const handleConfirmDeleteThread = useCallback(async () => {
    const id = pendingDeleteThreadId;
    setPendingDeleteThreadId(null);
    if (!id) return;
    setSelectedThreadId(null);
    try {
      await window.api.deleteThread(id);
      queryClient.invalidateQueries({ queryKey: ["threads", selectedClient] });
      addToast("Thread deleted", "success");
    } catch (err) {
      console.error("Delete thread failed:", err);
      addToast(`Delete thread failed: ${(err as Error).message}`, "error");
      queryClient.invalidateQueries({ queryKey: ["threads", selectedClient] });
    }
  }, [pendingDeleteThreadId, selectedClient, queryClient, addToast]);

  const handleResolveThread = useCallback(async (status: "open" | "resolved") => {
    if (!selectedThreadId) return;
    try {
      await window.api.updateThread(selectedThreadId, { status });
      queryClient.invalidateQueries({ queryKey: ["threads", selectedClient] });
      addToast(status === "resolved" ? "Thread resolved" : "Thread reopened", "success");
    } catch (err) {
      console.error("Resolve thread failed:", err);
      addToast(`Resolve thread failed: ${(err as Error).message}`, "error");
    }
  }, [selectedThreadId, selectedClient, queryClient, addToast]);

  const handleFindCandidates = useCallback(async () => {
    if (!selectedThreadId) return;
    try {
      const result = await window.api.getThreadCandidates(selectedThreadId);
      setThreadCandidates(result);
    } catch (err) {
      console.error("Find candidates failed:", err);
      addToast(`Find candidates failed: ${(err as Error).message}`, "error");
    }
  }, [selectedThreadId, addToast]);

  const handleCandidateCheck = useCallback((checkedIds: Set<string>) => {
    setThreadPreviewCandidateIds(new Set(checkedIds));
  }, []);

  const handleEvaluateCandidates = useCallback(async (meetingIds: string[], overrideExisting: boolean) => {
    if (!selectedThreadId) return;
    try {
      const result = await window.api.evaluateThreadCandidates(selectedThreadId, meetingIds, overrideExisting);
      const total = result.added + result.updated;
      if (total > 0) {
        setThreadCandidates([]);
        setThreadPreviewCandidateIds(new Set());
        queryClient.invalidateQueries({ queryKey: ["threadMeetings", selectedThreadId] });
        addToast(`Evaluated: ${result.added} added, ${result.updated} updated`, "success");
      } else if (result.errors.length > 0) {
        addToast(`Evaluation failed: ${result.errors.map((e) => e.reason).join(", ")}`, "error");
      } else {
        addToast("No meetings were evaluated as related", "error");
      }
    } catch (err) {
      console.error("Evaluate candidates failed:", err);
      addToast(`Evaluate candidates failed: ${(err as Error).message}`, "error");
    }
  }, [selectedThreadId, queryClient, addToast]);

  const handleRemoveThreadMeetings = useCallback(async (meetingIds: string[]) => {
    if (!selectedThreadId) return;
    try {
      for (const meetingId of meetingIds) {
        await window.api.removeThreadMeeting(selectedThreadId, meetingId);
      }
      queryClient.invalidateQueries({ queryKey: ["threadMeetings", selectedThreadId] });
      addToast(`${meetingIds.length} meeting${meetingIds.length !== 1 ? "s" : ""} removed from thread`, "success");
    } catch (err) {
      console.error("Remove thread meetings failed:", err);
      addToast(`Remove meetings failed: ${(err as Error).message}`, "error");
    }
  }, [selectedThreadId, queryClient, addToast]);

  const handleRegenerateThreadSummary = useCallback(async (meetingIds?: string[]) => {
    if (!selectedThreadId) return;
    try {
      addToast("Regenerating summary...", "success");
      await window.api.regenerateThreadSummary(selectedThreadId, meetingIds);
      queryClient.invalidateQueries({ queryKey: ["threads", selectedClient] });
      addToast("Summary regenerated", "success");
    } catch (err) {
      console.error("Regenerate summary failed:", err);
      addToast(`Regenerate summary failed: ${(err as Error).message}`, "error");
    }
  }, [selectedThreadId, selectedClient, queryClient, addToast]);

  const handleThreadSendMessage = useCallback(async (message: string, includeTranscripts: boolean) => {
    if (!selectedThreadId) return;
    try {
      await window.api.threadChat({ threadId: selectedThreadId, message, includeTranscripts });
      queryClient.invalidateQueries({ queryKey: ["threadMessages", selectedThreadId] });
    } catch (err) {
      console.error("Thread chat failed:", err);
      addToast(`Thread chat failed: ${(err as Error).message}`, "error");
    }
  }, [selectedThreadId, queryClient, addToast]);

  const handleClearThreadMessages = useCallback(() => {
    if (!selectedThreadId) return;
    setPendingClearThreadMessages(true);
  }, [selectedThreadId]);

  const handleConfirmClearThreadMessages = useCallback(async () => {
    setPendingClearThreadMessages(false);
    if (!selectedThreadId) return;
    try {
      await window.api.clearThreadMessages(selectedThreadId);
      queryClient.invalidateQueries({ queryKey: ["threadMessages", selectedThreadId] });
      addToast("Messages cleared", "success");
    } catch (err) {
      console.error("Clear messages failed:", err);
      addToast(`Clear messages failed: ${(err as Error).message}`, "error");
    }
  }, [selectedThreadId, queryClient, addToast]);

  return {
    selectedThreadId,
    setSelectedThreadId,
    editThreadOpen,
    setEditThreadOpen,
    createThreadOpen,
    setCreateThreadOpen,
    threadCandidates,
    threadPreviewCandidateIds,
    setThreadPreviewCandidateIds,
    pendingDeleteThreadId,
    setPendingDeleteThreadId,
    pendingClearThreadMessages,
    setPendingClearThreadMessages,
    threadsQuery,
    threadMeetingsQuery,
    threadMessagesQuery,
    selectedThread,
    handleCreateThread,
    handleUpdateThread,
    handleDeleteThread,
    handleConfirmDeleteThread,
    handleResolveThread,
    handleFindCandidates,
    handleCandidateCheck,
    handleEvaluateCandidates,
    handleRemoveThreadMeetings,
    handleRegenerateThreadSummary,
    handleThreadSendMessage,
    handleClearThreadMessages,
    handleConfirmClearThreadMessages,
  };
}
