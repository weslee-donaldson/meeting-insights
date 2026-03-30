import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../../../core/llm-adapter.js";
import type { VectorDb } from "../../../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { CreateInsightRequest, UpdateInsightRequest, InsightChatRequest, InsightChatResponse } from "../channels.js";
import { listInsightsByClient, createInsight as coreCreateInsight, updateInsight as coreUpdateInsight, deleteInsight as coreDeleteInsight, getInsightMeetings, discoverMeetingsForPeriod, addInsightMeeting, generateInsight as coreGenerateInsight, getInsightMessages, appendInsightMessage, clearInsightMessages as coreClearInsightMessages, getInsight, getInsightChatContext, removeInsightMeeting } from "../../../core/insights.js";
import type { Insight, InsightMeeting, InsightMessage } from "../../../core/insights.js";
import { resolveMeetingSources } from "./meetings.js";
import { resolveClient } from "../../../core/resolve-client.js";

export function handleListInsights(db: Database, clientParam: string): Insight[] {
  if (!clientParam) return [];
  const resolved = resolveClient(db, clientParam);
  if (!resolved) return [];
  return listInsightsByClient(db, resolved.id);
}

export function handleCreateInsight(db: Database, req: CreateInsightRequest): Insight {
  const clientId = req.clientId ?? resolveClient(db, req.client_name)?.id ?? "";
  return coreCreateInsight(db, { ...req, client_id: clientId });
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
  const meetingIds = discoverMeetingsForPeriod(db, insight.client_id, insight.period_start, insight.period_end);
  for (const meetingId of meetingIds) {
    addInsightMeeting(db, { insight_id: insightId, meeting_id: meetingId, contribution_summary: "" });
  }
  return meetingIds;
}

export async function handleGenerateInsight(db: Database, llm: LlmAdapter, insightId: string, meetingIds?: string[]): Promise<Insight> {
  return coreGenerateInsight(db, llm, insightId, meetingIds);
}

export function handleGetInsightMessages(db: Database, insightId: string): InsightMessage[] {
  return getInsightMessages(db, insightId);
}

export async function handleInsightChat(
  db: Database, llm: LlmAdapter, vdb: VectorDb, session: InferenceSession & { _tokenizer: unknown }, req: InsightChatRequest
): Promise<InsightChatResponse> {
  const { systemContext, meetingIds } = await getInsightChatContext(db, vdb, session, req.insightId, req.message, req.includeTranscripts ?? false);
  appendInsightMessage(db, { insight_id: req.insightId, role: "user", content: req.message });
  const history = getInsightMessages(db, req.insightId).map((m) => ({ role: m.role, content: m.content }));
  const answer = await llm.converse(systemContext, history, req.attachments);
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
