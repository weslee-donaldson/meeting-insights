import type { MeetingFilters, CreateMeetingRequest, EditActionItemFields } from "../../../electron/channels.js";
import { API_BASE } from "./base.js";

export const meetingsMethods = {
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

  editActionItem: (meetingId: string, itemIndex: number, fields: EditActionItemFields) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/action-items/${itemIndex}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
    }),

  createActionItem: (meetingId: string, fields: EditActionItemFields) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/action-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
    }),

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

  getMeetingThreads: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/threads`).then((r) => r.json()),

  getMeetingMilestones: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/milestones`).then((r) => r.json()),

  uploadAsset: (meetingId: string, filename: string, mimeType: string, base64: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, mimeType, base64 }),
    }).then((r) => r.json()),

  renameMeeting: (meetingId: string, newTitle: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/title`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    }).then(() => undefined),

  getMeetingAssets: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/assets`).then((r) => r.json()),

  deleteAsset: (assetId: string) =>
    fetch(`${API_BASE}/api/assets/${assetId}`, { method: "DELETE" }).then(() => undefined),

  getAssetData: (assetId: string) =>
    fetch(`${API_BASE}/api/assets/${assetId}/data`).then((r) =>
      r.status === 404 ? null : r.json(),
    ),

  getMeetingMessages: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/messages`).then((r) => r.json()),

  meetingChat: (meetingId: string, message: string, includeTranscripts?: boolean) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, includeTranscripts }),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({ error: r.statusText })) as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  clearMeetingMessages: (meetingId: string) =>
    fetch(`${API_BASE}/api/meetings/${meetingId}/messages`, { method: "DELETE" }).then(() => undefined),
};
