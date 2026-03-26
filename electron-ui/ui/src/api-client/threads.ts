import type { CreateThreadRequest, UpdateThreadRequest, ThreadChatRequest } from "../../../electron/channels.js";
import { API_BASE, fetchJson, jsonPost, jsonPut, jsonDelete } from "./base.js";

export const threadsMethods = {
  listThreads: (clientName: string) =>
    fetchJson(`${API_BASE}/api/threads?client=${encodeURIComponent(clientName)}`),

  createThread: (req: CreateThreadRequest) =>
    jsonPost(`${API_BASE}/api/threads`, req),

  updateThread: (threadId: string, req: UpdateThreadRequest) =>
    jsonPut(`${API_BASE}/api/threads/${threadId}`, req),

  deleteThread: (threadId: string) =>
    jsonDelete(`${API_BASE}/api/threads/${threadId}`),

  getThreadMeetings: (threadId: string) =>
    fetchJson(`${API_BASE}/api/threads/${threadId}/meetings`),

  getThreadCandidates: (threadId: string) =>
    fetchJson(`${API_BASE}/api/threads/${threadId}/candidates`),

  evaluateThreadCandidates: (threadId: string, meetingIds: string[], overrideExisting: boolean) =>
    jsonPost(`${API_BASE}/api/threads/${threadId}/evaluate`, { meetingIds, overrideExisting }),

  removeThreadMeeting: (threadId: string, meetingId: string) =>
    jsonDelete(`${API_BASE}/api/threads/${threadId}/meetings/${meetingId}`),

  addThreadMeeting: (threadId: string, meetingId: string, summary: string, score: number) =>
    jsonPost(`${API_BASE}/api/threads/${threadId}/meetings`, { meetingId, summary, score }),

  regenerateThreadSummary: (threadId: string, meetingIds?: string[]) =>
    jsonPost(`${API_BASE}/api/threads/${threadId}/regenerate-summary`, { meetingIds }),

  getThreadMessages: (threadId: string) =>
    fetchJson(`${API_BASE}/api/threads/${threadId}/messages`),

  threadChat: (req: ThreadChatRequest) =>
    jsonPost(`${API_BASE}/api/threads/${req.threadId}/chat`, { message: req.message, includeTranscripts: req.includeTranscripts, attachments: req.attachments }),

  clearThreadMessages: (threadId: string) =>
    jsonDelete(`${API_BASE}/api/threads/${threadId}/messages`),
};
