import type { CreateInsightRequest, UpdateInsightRequest, InsightChatRequest } from "../../../electron/channels.js";
import { API_BASE, fetchJson, jsonPost, jsonPut, jsonDelete } from "./base.js";

export const insightsMethods = {
  listInsights: (clientName: string) =>
    fetchJson(`${API_BASE}/api/insights?client=${encodeURIComponent(clientName)}`),

  createInsight: (req: CreateInsightRequest) =>
    jsonPost(`${API_BASE}/api/insights`, req),

  updateInsight: (insightId: string, req: UpdateInsightRequest) =>
    jsonPut(`${API_BASE}/api/insights/${insightId}`, req),

  deleteInsight: (insightId: string) =>
    jsonDelete(`${API_BASE}/api/insights/${insightId}`).then(() => undefined),

  getInsightMeetings: (insightId: string) =>
    fetchJson(`${API_BASE}/api/insights/${insightId}/meetings`),

  discoverInsightMeetings: (insightId: string) =>
    jsonPost(`${API_BASE}/api/insights/${insightId}/discover-meetings`, {}).then((b) => (b as { meetingIds: string[] }).meetingIds),

  generateInsight: (insightId: string, meetingIds?: string[]) =>
    jsonPost(`${API_BASE}/api/insights/${insightId}/generate`, { meetingIds }),

  getInsightMessages: (insightId: string) =>
    fetchJson(`${API_BASE}/api/insights/${insightId}/messages`),

  insightChat: (req: InsightChatRequest) =>
    jsonPost(`${API_BASE}/api/insights/${req.insightId}/chat`, { message: req.message, includeTranscripts: req.includeTranscripts, attachments: req.attachments }),

  clearInsightMessages: (insightId: string) =>
    jsonDelete(`${API_BASE}/api/insights/${insightId}/messages`).then(() => undefined),

  removeInsightMeeting: (insightId: string, meetingId: string) =>
    jsonDelete(`${API_BASE}/api/insights/${insightId}/meetings/${meetingId}`).then(() => undefined),
};
