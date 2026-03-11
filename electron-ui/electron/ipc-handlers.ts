import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../../core/llm-adapter.js";
import type { VectorDb } from "../../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { CreateInsightRequest, UpdateInsightRequest, InsightChatRequest, InsightChatResponse, CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest, MilestoneChatResponse } from "./channels.js";
import { listInsightsByClient, createInsight as coreCreateInsight, updateInsight as coreUpdateInsight, deleteInsight as coreDeleteInsight, getInsightMeetings, discoverMeetingsForPeriod, addInsightMeeting, generateInsight as coreGenerateInsight, getInsightMessages, appendInsightMessage, clearInsightMessages as coreClearInsightMessages, getInsight, getInsightChatContext, removeInsightMeeting } from "../../core/insights.js";
import type { Insight, InsightMeeting, InsightMessage } from "../../core/insights.js";
import { listMilestonesByClient, createMilestone as coreCreateMilestone, updateMilestone as coreUpdateMilestone, deleteMilestone as coreDeleteMilestone, getMilestoneMentions, getMeetingMilestones, getDateSlippage, getMilestoneMessages, appendMilestoneMessage, clearMilestoneMessages as coreClearMilestoneMessages, getMilestoneChatContext, confirmMilestoneMention as coreConfirmMilestoneMention, rejectMilestoneMention as coreRejectMilestoneMention, mergeMilestones as coreMergeMilestones, linkActionItem, unlinkActionItem, getMilestoneActionItems, getMilestone } from "../../core/timelines.js";
import type { Milestone, MilestoneMention, MilestoneMessage, MilestoneActionItem, DateSlippageEntry } from "../../core/timelines.js";

export {
  handleGetTemplates,
  handleGetClients,
  handleGetDefaultClient,
  handleGetMeetings,
  handleGetArtifact,
  handleChat,
  handleConversationChat,
  handleReExtract,
  handleSetIgnored,
  handleReassignClient,
  handleDeleteMeetings,
  handleCompleteActionItem,
  handleUncompleteActionItem,
  handleGetCompletions,
  handleGetItemHistory,
  handleGetMentionStats,
  handleGetClientActionItems,
  handleCreateMeeting,
  resolveMeetingSources,
  clientNameForMeeting,
} from "./handlers/meetings.js";

export {
  handleSearchMeetings,
  handleReEmbed,
  handleDeepSearch,
  handleUpdateMeetingVector,
} from "./handlers/search.js";

export {
  handleListThreads,
  handleCreateThread,
  handleUpdateThread,
  handleDeleteThread,
  handleGetThreadMeetings,
  handleGetThreadCandidates,
  handleEvaluateThreadCandidates,
  handleRemoveThreadMeeting,
  handleAddThreadMeeting,
  handleRegenerateThreadSummary,
  handleGetThreadMessages,
  handleThreadChat,
  handleClearThreadMessages,
  handleGetMeetingThreads,
} from "./handlers/threads.js";

export function handleListInsights(db: Database, clientName: string): Insight[] {
  return listInsightsByClient(db, clientName);
}

export function handleCreateInsight(db: Database, req: CreateInsightRequest): Insight {
  return coreCreateInsight(db, req);
}

export function handleUpdateInsight(db: Database, insightId: string, req: UpdateInsightRequest): Insight {
  return coreUpdateInsight(db, insightId, req);
}

export function handleDeleteInsight(db: Database, insightId: string): void {
  coreDeleteInsight(db, insightId);
}

export function handleGetInsightMeetings(db: Database, insightId: string): InsightMeeting[] {
  return getInsightMeetings(db, insightId);
}

export function handleDiscoverInsightMeetings(db: Database, insightId: string): string[] {
  const insight = getInsight(db, insightId)!;
  const meetingIds = discoverMeetingsForPeriod(db, insight.client_name, insight.period_start, insight.period_end);
  for (const meetingId of meetingIds) {
    addInsightMeeting(db, { insight_id: insightId, meeting_id: meetingId, contribution_summary: "" });
  }
  return meetingIds;
}

export async function handleGenerateInsight(db: Database, llm: LlmAdapter, insightId: string): Promise<Insight> {
  return coreGenerateInsight(db, llm, insightId);
}

export function handleGetInsightMessages(db: Database, insightId: string): InsightMessage[] {
  return getInsightMessages(db, insightId);
}

export async function handleInsightChat(
  db: Database, llm: LlmAdapter, vdb: VectorDb, session: InferenceSession & { _tokenizer: unknown }, req: InsightChatRequest
): Promise<InsightChatResponse> {
  const { resolveMeetingSources } = await import("./handlers/meetings.js");
  const { systemContext, meetingIds } = await getInsightChatContext(db, vdb, session, req.insightId, req.message, req.includeTranscripts ?? false);
  appendInsightMessage(db, { insight_id: req.insightId, role: "user", content: req.message });
  const history = getInsightMessages(db, req.insightId).map((m) => ({ role: m.role, content: m.content }));
  const answer = await llm.converse(systemContext, history);
  const sources = resolveMeetingSources(db, meetingIds);
  appendInsightMessage(db, { insight_id: req.insightId, role: "assistant", content: answer, sources: sources.length > 0 ? JSON.stringify(sources) : undefined });
  return { answer, sources };
}

export function handleClearInsightMessages(db: Database, insightId: string): void {
  coreClearInsightMessages(db, insightId);
}

export function handleRemoveInsightMeeting(db: Database, insightId: string, meetingId: string): void {
  removeInsightMeeting(db, insightId, meetingId);
}

export function handleListMilestones(db: Database, clientName: string) {
  return listMilestonesByClient(db, clientName);
}

export function handleCreateMilestone(db: Database, req: CreateMilestoneRequest): Milestone {
  return coreCreateMilestone(db, req);
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
  coreRejectMilestoneMention(db, milestoneId, meetingId, ms?.client_name ?? "");
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
  const { resolveMeetingSources } = await import("./handlers/meetings.js");
  const { systemContext, meetingIds } = await getMilestoneChatContext(db, vdb, session, req.milestoneId, req.message, req.includeTranscripts ?? false);
  appendMilestoneMessage(db, { milestoneId: req.milestoneId, role: "user", content: req.message });
  const history = getMilestoneMessages(db, req.milestoneId).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  const answer = await llm.converse(systemContext, history);
  const sources = resolveMeetingSources(db, meetingIds);
  appendMilestoneMessage(db, { milestoneId: req.milestoneId, role: "assistant", content: answer, sources: sources.length > 0 ? JSON.stringify(sources) : undefined });
  return { answer, sources };
}

export function handleClearMilestoneMessages(db: Database, milestoneId: string): void {
  coreClearMilestoneMessages(db, milestoneId);
}
