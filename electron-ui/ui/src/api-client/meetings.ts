import type { MeetingFilters, CreateMeetingRequest, EditActionItemFields } from "../../../electron/channels.js";
import { API_BASE, fetchJson, fetchJsonOrNull, jsonPost, jsonPut, jsonPatch, jsonDelete } from "./base.js";

export const meetingsMethods = {
  getClients: async () => {
    const raw = await fetchJson<Array<{ id: string; name: string }>>(`${API_BASE}/api/clients`);
    return raw.map(c => c.name);
  },

  getMeetings: (filters: MeetingFilters) => {
    const params = new URLSearchParams();
    if (filters.client) params.set("client", filters.client);
    if (filters.after) params.set("after", filters.after);
    if (filters.before) params.set("before", filters.before);
    const qs = params.toString();
    return fetchJson(`${API_BASE}/api/meetings${qs ? `?${qs}` : ""}`);
  },

  getArtifact: (meetingId: string) =>
    fetchJsonOrNull(`${API_BASE}/api/meetings/${meetingId}/artifact`),

  deleteMeetings: (ids: string[]) =>
    fetchJson(`${API_BASE}/api/meetings`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).then(() => undefined),

  reExtract: (meetingId: string) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/re-extract`, {}).then(() => undefined),

  reEmbedMeeting: (meetingId: string) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/re-embed`, {}).then(() => undefined),

  reassignClient: (meetingId: string, clientName: string) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/client`, { clientName }).then(() => undefined),

  setIgnored: (meetingId: string, ignored: boolean) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/ignored`, { ignored }).then(() => undefined),

  editActionItem: (meetingId: string, itemIndex: number, fields: EditActionItemFields) =>
    jsonPut(`${API_BASE}/api/meetings/${meetingId}/action-items/${itemIndex}`, fields).then(() => undefined),

  createActionItem: (meetingId: string, fields: EditActionItemFields) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/action-items`, fields).then(() => undefined),

  completeActionItem: (meetingId: string, itemIndex: number, note: string) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/action-items/${itemIndex}/complete`, { note }).then(() => undefined),

  uncompleteActionItem: (meetingId: string, itemIndex: number) =>
    jsonDelete(`${API_BASE}/api/meetings/${meetingId}/action-items/${itemIndex}/complete`).then(() => undefined),

  getCompletions: (meetingId: string) =>
    fetchJson(`${API_BASE}/api/meetings/${meetingId}/completions`),

  getItemHistory: (canonicalId: string) =>
    fetchJson(`${API_BASE}/api/items/${canonicalId}/history`),

  getMentionStats: (meetingId: string) =>
    fetchJson(`${API_BASE}/api/meetings/${meetingId}/mention-stats`),

  getDefaultClient: () =>
    fetchJson(`${API_BASE}/api/default-client`),

  getGlossary: (clientName: string) =>
    fetchJson(`${API_BASE}/api/glossary?client=${encodeURIComponent(clientName)}`),

  getClientActionItems: (clientName: string, filters?: { after?: string; before?: string }) => {
    const params = new URLSearchParams();
    if (filters?.after) params.set("after", filters.after);
    if (filters?.before) params.set("before", filters.before);
    const qs = params.toString();
    return fetchJson(`${API_BASE}/api/clients/${encodeURIComponent(clientName)}/action-items${qs ? `?${qs}` : ""}`);
  },

  getTemplates: () =>
    fetchJson(`${API_BASE}/api/templates`),

  createMeeting: (req: CreateMeetingRequest) =>
    jsonPost(`${API_BASE}/api/meetings`, req) as Promise<{ meetingId: string }>,

  getMeetingThreads: (meetingId: string) =>
    fetchJson(`${API_BASE}/api/meetings/${meetingId}/threads`),

  getMeetingMilestones: (meetingId: string) =>
    fetchJson(`${API_BASE}/api/meetings/${meetingId}/milestones`),

  uploadAsset: (meetingId: string, filename: string, mimeType: string, base64: string) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/assets`, { filename, mimeType, base64 }),

  renameMeeting: (meetingId: string, newTitle: string) =>
    jsonPatch(`${API_BASE}/api/meetings/${meetingId}/title`, { title: newTitle }).then(() => undefined),

  getMeetingAssets: (meetingId: string) =>
    fetchJson(`${API_BASE}/api/meetings/${meetingId}/assets`),

  deleteAsset: (assetId: string) =>
    jsonDelete(`${API_BASE}/api/assets/${assetId}`).then(() => undefined),

  getAssetData: (assetId: string) =>
    fetchJsonOrNull(`${API_BASE}/api/assets/${assetId}/data`),

  getMeetingMessages: (meetingId: string) =>
    fetchJson(`${API_BASE}/api/meetings/${meetingId}/messages`),

  meetingChat: (meetingId: string, message: string, includeTranscripts?: boolean, template?: string, includeAssets?: boolean, attachments?: { name: string; base64: string; mimeType: string }[], noteIds?: string[]) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/chat`, { message, includeTranscripts, template, includeAssets, attachments, noteIds }),

  clearMeetingMessages: (meetingId: string) =>
    jsonDelete(`${API_BASE}/api/meetings/${meetingId}/messages`).then(() => undefined),

  getTranscript: async (meetingId: string) => {
    const result = await fetchJsonOrNull<{ transcript: string }>(`${API_BASE}/api/meetings/${meetingId}/transcript`);
    return result?.transcript ?? null;
  },

  updateArtifactSection: (meetingId: string, field: string, value: unknown) =>
    jsonPatch(`${API_BASE}/api/meetings/${meetingId}/artifact`, { field, value }).then(() => undefined),

  artifactBatch: (meetingIds: string[]) =>
    jsonPost(`${API_BASE}/api/artifacts/batch`, { meetingIds }),
};
