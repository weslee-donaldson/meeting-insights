import type { ElectronAPI, MeetingFilters, ChatRequest, SearchRequest } from "../../electron/channels.js";

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
    }).then((r) => r.json()),

  search: (req: SearchRequest) => {
    const params = new URLSearchParams({ q: req.query });
    if (req.client) params.set("client", req.client);
    if (req.date_after) params.set("date_after", req.date_after);
    if (req.date_before) params.set("date_before", req.date_before);
    if (req.limit != null) params.set("limit", String(req.limit));
    return fetch(`${API_BASE}/api/search?${params}`).then((r) => r.json());
  },
};
