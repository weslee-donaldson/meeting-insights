import type { ElectronAPI, MeetingFilters, ChatRequest, ConversationChatRequest, SearchRequest, CreateMeetingRequest, DeepSearchRequest, CreateThreadRequest, UpdateThreadRequest, ThreadChatRequest, CreateInsightRequest, UpdateInsightRequest, InsightChatRequest, CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest } from "../../electron/channels.js";

const API_BASE: string = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const apiClient: ElectronAPI = {
  getClients: () => fetch(`${API_BASE}/api/clients`).then((r) => r.json()),

  getMeetings: (filters: MeetingFilters) => {
    const params = new URLSearchParams();
    if (filters.client) params.set("client", filters.client);
    if (filters.after) params.set("after", filters.after);
    if (filters.before) params.set("before", filters.before);
    const qs = params.toString();
    return fetch(`${API_BASE}/api/meetings${qs ? `?${qs}` : ""}`).then((r) => r.json());
  },

  getArtifact: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/artifact`).then((r) =>
      r.status === 404 ? null : r.json(),
    ),

  chat: (req: ChatRequest) =>
    fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  conversationChat: (req: ConversationChatRequest) =>
    fetch(`${API_BASE}/api/chat/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  search: (req: SearchRequest) => {
    const params = new URLSearchParams({ q: req.query });
    if (req.client) params.set("client", req.client);
    if (req.date_after) params.set("date_after", req.date_after);
    if (req.date_before) params.set("date_before", req.date_before);
    if (req.limit != null) params.set("limit", String(req.limit));
    return fetch(`${API_BASE}/api/search?${params}`).then((r) => r.ok ? r.json() : []);
  },

  deleteMeetings: (ids: string[]) =>
    fetch(`${API_BASE}/api/meetings`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).then(() => undefined),

  reExtract: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/re-extract`, { method: "POST" }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
    }),

  reEmbedMeeting: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/re-embed`, { method: "POST" }).then(() => undefined),

  reassignClient: (meetingId: string, clientName: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName }),
    }).then(() => undefined),

  setIgnored: (meetingId: string, ignored: boolean) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/ignored`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ignored }),
    }).then(() => undefined),

  completeActionItem: (meetingId: string, itemIndex: number, note: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/action-items/${itemIndex}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    }).then(() => undefined),

  uncompleteActionItem: (meetingId: string, itemIndex: number) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/action-items/${itemIndex}/complete`, {
      method: "DELETE",
    }).then(() => undefined),

  getCompletions: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/completions`).then((r) => r.json()),

  getItemHistory: (canonicalId: string) =>
    fetch(`${API_BASE}/api/items/${canonicalId}/history`).then((r) => r.json()),

  getMentionStats: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/mention-stats`).then((r) => r.json()),

  getDefaultClient: () =>
    fetch(`${API_BASE}/api/default-client`).then((r) => r.json()),

  getClientActionItems: (clientName: string, filters?: { after?: string; before?: string }) => {
    const params = new URLSearchParams();
    if (filters?.after) params.set("after", filters.after);
    if (filters?.before) params.set("before", filters.before);
    const qs = params.toString();
    return fetch(`${API_BASE}/api/clients/${encodeURIComponent(clientName)}/action-items${qs ? `?${qs}` : ""}`).then((r) => r.json());
  },

  getTemplates: () =>
    fetch(`${API_BASE}/api/templates`).then((r) => r.json()),

  createMeeting: (req: CreateMeetingRequest) =>
    fetch(`${API_BASE}/api/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
      return r.json() as Promise<{ meetingId: string }>;
    }),

  deepSearch: (req: DeepSearchRequest) =>
    fetch(`${API_BASE}/api/deep-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),
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

  getMeetingThreads: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/threads`).then((r) => r.json()),

  listInsights: (clientName: string) =>
    fetch(`${API_BASE}/api/insights?client=${encodeURIComponent(clientName)}`).then((r) => r.json()),

  createInsight: (req: CreateInsightRequest) =>
    fetch(`${API_BASE}/api/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).then((r) => r.json()),

  updateInsight: (insightId: string, req: UpdateInsightRequest) =>
    fetch(`${API_BASE}/api/insights/${insightId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).then((r) => r.json()),

  deleteInsight: (insightId: string) =>
    fetch(`${API_BASE}/api/insights/${insightId}`, { method: 'DELETE' }).then(() => undefined),

  getInsightMeetings: (insightId: string) =>
    fetch(`${API_BASE}/api/insights/${insightId}/meetings`).then((r) => r.json()),

  discoverInsightMeetings: (insightId: string) =>
    fetch(`${API_BASE}/api/insights/${insightId}/discover-meetings`, { method: 'POST' }).then((r) => r.json()).then((b: { meetingIds: string[] }) => b.meetingIds),

  generateInsight: async (insightId: string) => {
    const r = await fetch(`${API_BASE}/api/insights/${insightId}/generate`, { method: 'POST' });
    if (!r.ok) {
      const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
      throw new Error(body.error);
    }
    return r.json();
  },

  getInsightMessages: (insightId: string) =>
    fetch(`${API_BASE}/api/insights/${insightId}/messages`).then((r) => r.json()),

  insightChat: (req: InsightChatRequest) =>
    fetch(`${API_BASE}/api/insights/${req.insightId}/chat`, {
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

  clearInsightMessages: (insightId: string) =>
    fetch(`${API_BASE}/api/insights/${insightId}/messages`, { method: 'DELETE' }).then(() => undefined),

  removeInsightMeeting: (insightId: string, meetingId: string) =>
    fetch(`${API_BASE}/api/insights/${insightId}/meetings/${meetingId}`, { method: 'DELETE' }).then(r => { if (!r.ok) throw new Error(`remove insight meeting: ${r.status}`); }),

  listMilestones: (clientName: string) =>
    fetch(`${API_BASE}/api/milestones?client=${encodeURIComponent(clientName)}`).then((r) => r.json()),

  createMilestone: (req: CreateMilestoneRequest) =>
    fetch(`${API_BASE}/api/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).then((r) => r.json()),

  updateMilestone: (milestoneId: string, req: UpdateMilestoneRequest) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).then((r) => r.json()),

  deleteMilestone: (milestoneId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}`, { method: 'DELETE' }).then(() => undefined),

  getMilestoneMentions: (milestoneId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/mentions`).then((r) => r.json()),

  confirmMilestoneMention: (milestoneId: string, meetingId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/confirm-mention`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId }),
    }).then(() => undefined),

  rejectMilestoneMention: (milestoneId: string, meetingId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/reject-mention`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId }),
    }).then(() => undefined),

  mergeMilestones: (sourceId: string, targetId: string) =>
    fetch(`${API_BASE}/api/milestones/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, targetId }),
    }).then(() => undefined),

  linkMilestoneActionItem: (milestoneId: string, meetingId: string, itemIndex: number) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/link-action-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, itemIndex }),
    }).then(() => undefined),

  unlinkMilestoneActionItem: (milestoneId: string, meetingId: string, itemIndex: number) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/link-action-item`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, itemIndex }),
    }).then(() => undefined),

  getMilestoneActionItems: (milestoneId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/action-items`).then((r) => r.json()),

  milestoneChat: (req: MilestoneChatRequest) =>
    fetch(`${API_BASE}/api/milestones/${req.milestoneId}/chat`, {
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

  getMilestoneMessages: (milestoneId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/messages`).then((r) => r.json()),

  clearMilestoneMessages: (milestoneId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/messages`, { method: 'DELETE' }).then(() => undefined),

  getMeetingMilestones: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/milestones`).then((r) => r.json()),

  getDateSlippage: (milestoneId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/slippage`).then((r) => r.json()),

};
