import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../../../core/llm/adapter.js";
import type { VectorDb } from "../../../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest, MilestoneChatResponse } from "../channels.js";
import { listMilestonesByClient, createMilestone as coreCreateMilestone, updateMilestone as coreUpdateMilestone, deleteMilestone as coreDeleteMilestone, getMilestoneMentions, getMeetingMilestones, getDateSlippage, getMilestoneMessages, appendMilestoneMessage, clearMilestoneMessages as coreClearMilestoneMessages, getMilestoneChatContext, confirmMilestoneMention as coreConfirmMilestoneMention, rejectMilestoneMention as coreRejectMilestoneMention, mergeMilestones as coreMergeMilestones, linkActionItem, unlinkActionItem, getMilestoneActionItems, getMilestone } from "../../../core/timelines.js";
import type { Milestone, MilestoneMention, MilestoneMessage, MilestoneActionItem, DateSlippageEntry } from "../../../core/timelines.js";
import { resolveMeetingSources } from "./meetings.js";
import { resolveClient } from "../../../core/resolve-client.js";

export function handleListMilestones(db: Database, clientParam: string) {
  if (!clientParam) return [];
  const resolved = resolveClient(db, clientParam);
  if (!resolved) return [];
  return listMilestonesByClient(db, resolved.id);
}

export function handleCreateMilestone(db: Database, req: CreateMilestoneRequest): Milestone {
  const clientId = req.clientId ?? resolveClient(db, req.clientName)?.id ?? "";
  return coreCreateMilestone(db, { clientId, title: req.title, description: req.description, targetDate: req.targetDate });
}

export function handleUpdateMilestone(db: Database, milestoneId: string, req: UpdateMilestoneRequest): Milestone {
  return coreUpdateMilestone(db, milestoneId, req) as Milestone;
}

export function handleDeleteMilestone(db: Database, milestoneId: string): void {
  coreDeleteMilestone(db, milestoneId);
}

export function handleGetMilestoneMentions(db: Database, milestoneId: string): MilestoneMention[] {
  return getMilestoneMentions(db, milestoneId);
}

export function handleConfirmMilestoneMention(db: Database, milestoneId: string, meetingId: string): void {
  coreConfirmMilestoneMention(db, milestoneId, meetingId);
}

export function handleRejectMilestoneMention(db: Database, milestoneId: string, meetingId: string): void {
  const ms = getMilestone(db, milestoneId);
  coreRejectMilestoneMention(db, milestoneId, meetingId, ms?.client_id ?? "");
}

export function handleMergeMilestones(db: Database, sourceId: string, targetId: string): void {
  coreMergeMilestones(db, sourceId, targetId);
}

export function handleLinkMilestoneActionItem(db: Database, milestoneId: string, meetingId: string, itemIndex: number): void {
  linkActionItem(db, milestoneId, meetingId, itemIndex);
}

export function handleUnlinkMilestoneActionItem(db: Database, milestoneId: string, meetingId: string, itemIndex: number): void {
  unlinkActionItem(db, milestoneId, meetingId, itemIndex);
}

export function handleGetMilestoneActionItems(db: Database, milestoneId: string): MilestoneActionItem[] {
  return getMilestoneActionItems(db, milestoneId);
}

export function handleGetMeetingMilestones(db: Database, meetingId: string) {
  return getMeetingMilestones(db, meetingId).map((m) => ({ milestone_id: m.id, title: m.title, target_date: m.target_date, status: m.status }));
}

export function handleGetDateSlippage(db: Database, milestoneId: string): DateSlippageEntry[] {
  return getDateSlippage(db, milestoneId);
}

export function handleGetMilestoneMessages(db: Database, milestoneId: string): MilestoneMessage[] {
  return getMilestoneMessages(db, milestoneId);
}

export async function handleMilestoneChat(
  db: Database, llm: LlmAdapter, vdb: VectorDb, session: InferenceSession & { _tokenizer: unknown }, req: MilestoneChatRequest
): Promise<MilestoneChatResponse> {
  const { systemContext, meetingIds } = await getMilestoneChatContext(db, vdb, session, req.milestoneId, req.message, req.includeTranscripts ?? false);
  appendMilestoneMessage(db, { milestoneId: req.milestoneId, role: "user", content: req.message });
  const history = getMilestoneMessages(db, req.milestoneId).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  const answer = await llm.converse(systemContext, history, req.attachments);
  const sources = resolveMeetingSources(db, meetingIds);
  appendMilestoneMessage(db, { milestoneId: req.milestoneId, role: "assistant", content: answer, sources: sources.length > 0 ? JSON.stringify(sources) : undefined });
  return { answer, sources };
}

export function handleClearMilestoneMessages(db: Database, milestoneId: string): void {
  coreClearMilestoneMessages(db, milestoneId);
}
