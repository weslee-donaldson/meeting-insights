import type { CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest } from "../../../electron/channels.js";
import { API_BASE, fetchJson, jsonPost, jsonPut, jsonDelete } from "./base.js";

export const milestonesMethods = {
  listMilestones: (clientName: string) =>
    fetchJson(`${API_BASE}/api/milestones?client=${encodeURIComponent(clientName)}`),

  createMilestone: (req: CreateMilestoneRequest) =>
    jsonPost(`${API_BASE}/api/milestones`, req),

  updateMilestone: (milestoneId: string, req: UpdateMilestoneRequest) =>
    jsonPut(`${API_BASE}/api/milestones/${milestoneId}`, req),

  deleteMilestone: (milestoneId: string) =>
    jsonDelete(`${API_BASE}/api/milestones/${milestoneId}`).then(() => undefined),

  getMilestoneMentions: (milestoneId: string) =>
    fetchJson(`${API_BASE}/api/milestones/${milestoneId}/mentions`),

  confirmMilestoneMention: (milestoneId: string, meetingId: string) =>
    jsonPost(`${API_BASE}/api/milestones/${milestoneId}/confirm-mention`, { meetingId }).then(() => undefined),

  rejectMilestoneMention: (milestoneId: string, meetingId: string) =>
    jsonPost(`${API_BASE}/api/milestones/${milestoneId}/reject-mention`, { meetingId }).then(() => undefined),

  mergeMilestones: (sourceId: string, targetId: string) =>
    jsonPost(`${API_BASE}/api/milestones/merge`, { sourceId, targetId }).then(() => undefined),

  linkMilestoneActionItem: (milestoneId: string, meetingId: string, itemIndex: number) =>
    jsonPost(`${API_BASE}/api/milestones/${milestoneId}/link-action-item`, { meetingId, itemIndex }).then(() => undefined),

  unlinkMilestoneActionItem: (milestoneId: string, meetingId: string, itemIndex: number) =>
    fetchJson(`${API_BASE}/api/milestones/${milestoneId}/link-action-item`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, itemIndex }),
    }).then(() => undefined),

  getMilestoneActionItems: (milestoneId: string) =>
    fetchJson(`${API_BASE}/api/milestones/${milestoneId}/action-items`),

  milestoneChat: (req: MilestoneChatRequest) =>
    jsonPost(`${API_BASE}/api/milestones/${req.milestoneId}/chat`, { message: req.message, includeTranscripts: req.includeTranscripts, attachments: req.attachments }),

  getMilestoneMessages: (milestoneId: string) =>
    fetchJson(`${API_BASE}/api/milestones/${milestoneId}/messages`),

  clearMilestoneMessages: (milestoneId: string) =>
    jsonDelete(`${API_BASE}/api/milestones/${milestoneId}/messages`).then(() => undefined),

  getDateSlippage: (milestoneId: string) =>
    fetchJson(`${API_BASE}/api/milestones/${milestoneId}/slippage`),
};
