import type { CreateThreadRequest, UpdateThreadRequest, ThreadChatRequest } from "../../../electron/channels.js";
import { API_BASE } from "./base.js";

export const threadsMethods = {
  listThreads: (clientName: string) =>
    fetch(`${API_BASE}/api/threads?client=${encodeURIComponent(clientName)}`).then((r) => r.json()),

  createThread: (req: CreateThreadRequest) =>
    fetch(`${API_BASE}/api/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  updateThread: (threadId: string, req: UpdateThreadRequest) =>
    fetch(`${API_BASE}/api/threads/${threadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  deleteThread: (threadId: string) =>
    fetch(`${API_BASE}/api/threads/${threadId}`, { method: 'DELETE' }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  getThreadMeetings: (threadId: string) =>
    fetch(`${API_BASE}/api/threads/${threadId}/meetings`).then((r) => r.json()),

  getThreadCandidates: (threadId: string) =>
    fetch(`${API_BASE}/api/threads/${threadId}/candidates`).then((r) => r.json()),

  evaluateThreadCandidates: (threadId: string, meetingIds: string[], overrideExisting: boolean) =>
    fetch(`${API_BASE}/api/threads/${threadId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingIds, overrideExisting }),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  removeThreadMeeting: (threadId: string, meetingId: string) =>
    fetch(`${API_BASE}/api/threads/${threadId}/meetings/${meetingId}`, { method: 'DELETE' }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  addThreadMeeting: (threadId: string, meetingId: string, summary: string, score: number) =>
    fetch(`${API_BASE}/api/threads/${threadId}/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, summary, score }),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  regenerateThreadSummary: (threadId: string, meetingIds?: string[]) =>
    fetch(`${API_BASE}/api/threads/${threadId}/regenerate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingIds }),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  getThreadMessages: (threadId: string) =>
    fetch(`${API_BASE}/api/threads/${threadId}/messages`).then((r) => r.json()),

  threadChat: (req: ThreadChatRequest) =>
    fetch(`${API_BASE}/api/threads/${req.threadId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: req.message, includeTranscripts: req.includeTranscripts }),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  clearThreadMessages: (threadId: string) =>
    fetch(`${API_BASE}/api/threads/${threadId}/messages`, { method: 'DELETE' }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),
};
