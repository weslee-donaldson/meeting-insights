import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../../core/llm-adapter.js";
import type { VectorDb } from "../../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { CreateThreadRequest, UpdateThreadRequest, ThreadChatRequest, ThreadChatResponse, CreateInsightRequest, UpdateInsightRequest, InsightChatRequest, InsightChatResponse, CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest, MilestoneChatResponse } from "./channels.js";
import { listThreadsByClient, createThread as coreCreateThread, updateThread as coreUpdateThread, deleteThread as coreDeleteThread, getThreadMeetings, getThreadCandidates as coreGetThreadCandidates, evaluateConfirmedCandidates, removeThreadMeeting, addThreadMeeting as coreAddThreadMeeting, regenerateThreadSummary as coreRegenerateThreadSummary, getThreadMessages, appendThreadMessage, clearThreadMessages as coreClearThreadMessages, getThreadChatContext, getThread } from "../../core/threads.js";
import type { Thread } from "../../core/threads.js";
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

export function handleListThreads(db: Database, clientName: string): Thread[] {
  return listThreadsByClient(db, clientName);
}

export function handleCreateThread(db: Database, req: CreateThreadRequest): Thread {
  return coreCreateThread(db, req);
}

export function handleUpdateThread(db: Database, threadId: string, req: UpdateThreadRequest): Thread {
  return coreUpdateThread(db, threadId, req);
}

export function handleDeleteThread(db: Database, threadId: string): void {
  coreDeleteThread(db, threadId);
}

export function handleGetThreadMeetings(db: Database, threadId: string) {
  return getThreadMeetings(db, threadId);
}

export async function handleGetThreadCandidates(
  db: Database, vdb: VectorDb, session: InferenceSession & { _tokenizer: unknown }, threadId: string
) {
  const thread = getThread(db, threadId);
  if (!thread) return [];
  const clientName = db.prepare('SELECT client_name FROM threads WHERE id = ?').get(threadId) as { client_name: string };
  return coreGetThreadCandidates(db, vdb, session, thread, clientName.client_name);
}

export async function handleEvaluateThreadCandidates(
  db: Database, llm: LlmAdapter, threadId: string, meetingIds: string[], overrideExisting: boolean
) {
  const thread = getThread(db, threadId)!;
  return evaluateConfirmedCandidates(db, llm, thread, meetingIds, overrideExisting);
}

export function handleRemoveThreadMeeting(db: Database, threadId: string, meetingId: string): void {
  removeThreadMeeting(db, threadId, meetingId);
}

export function handleAddThreadMeeting(db: Database, threadId: string, meetingId: string, summary: string, score: number): void {
  coreAddThreadMeeting(db, { thread_id: threadId, meeting_id: meetingId, relevance_summary: summary, relevance_score: score });
}

export async function handleRegenerateThreadSummary(db: Database, llm: LlmAdapter, threadId: string, meetingIds?: string[]) {
  const summary = await coreRegenerateThreadSummary(db, llm, threadId, meetingIds);
  return { summary };
}

export function handleGetThreadMessages(db: Database, threadId: string) {
  return getThreadMessages(db, threadId);
}

export async function handleThreadChat(
  db: Database, llm: LlmAdapter, vdb: VectorDb, session: InferenceSession & { _tokenizer: unknown }, req: ThreadChatRequest
): Promise<ThreadChatResponse> {
  const { resolveMeetingSources } = await import("./handlers/meetings.js");
  const { systemContext, meetingIds } = await getThreadChatContext(db, vdb, session, req.threadId, req.message, req.includeTranscripts ?? false);
  appendThreadMessage(db, { thread_id: req.threadId, role: 'user', content: req.message });
  const history = getThreadMessages(db, req.threadId).map((m) => ({ role: m.role, content: m.content }));
  const answer = await llm.converse(systemContext, history);
  const sources = resolveMeetingSources(db, meetingIds);
  appendThreadMessage(db, { thread_id: req.threadId, role: 'assistant', content: answer, sources: sources.length > 0 ? JSON.stringify(sources) : undefined });
  return { answer, sources };
}

export function handleClearThreadMessages(db: Database, threadId: string): void {
  coreClearThreadMessages(db, threadId);
}

interface MeetingThreadRow { thread_id: string; title: string; shorthand: string; }

export function handleGetMeetingThreads(db: Database, meetingId: string): MeetingThreadRow[] {
  return db.prepare(
    'SELECT tm.thread_id, t.title, t.shorthand FROM thread_meetings tm JOIN threads t ON tm.thread_id = t.id WHERE tm.meeting_id = ?'
  ).all(meetingId) as unknown as MeetingThreadRow[];
}

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
