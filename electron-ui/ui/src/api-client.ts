import type { ElectronAPI, MeetingFilters, ChatRequest, ConversationChatRequest, SearchRequest, CreateMeetingRequest, DeepSearchRequest } from "../../electron/channels.js";

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

  getClientActionItems: (clientName: string) =>
    fetch(`${API_BASE}/api/clients/${encodeURIComponent(clientName)}/action-items`).then((r) => r.json()),

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
};
