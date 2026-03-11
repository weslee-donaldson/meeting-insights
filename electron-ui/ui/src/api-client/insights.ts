import type { CreateInsightRequest, UpdateInsightRequest, InsightChatRequest } from "../../../electron/channels.js";
import { API_BASE } from "./base.js";

export const insightsMethods = {
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
};
