import type { CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest } from "../../../electron/channels.js";
import { API_BASE } from "./base.js";

export const milestonesMethods = {
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

  getDateSlippage: (milestoneId: string) =>
    fetch(`${API_BASE}/api/milestones/${milestoneId}/slippage`).then((r) => r.json()),
};
