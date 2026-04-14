import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../../../core/llm/adapter.js";
import type { VectorDb } from "../../../core/search/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { CreateThreadRequest, UpdateThreadRequest, ThreadChatRequest, ThreadChatResponse } from "../channels.js";
import { listThreadsByClient, createThread as coreCreateThread, updateThread as coreUpdateThread, deleteThread as coreDeleteThread, getThreadMeetings, getThreadCandidates as coreGetThreadCandidates, evaluateConfirmedCandidates, removeThreadMeeting, addThreadMeeting as coreAddThreadMeeting, regenerateThreadSummary as coreRegenerateThreadSummary, getThreadMessages, appendThreadMessage, clearThreadMessages as coreClearThreadMessages, getThreadChatContext, getThread } from "../../../core/threads.js";
import type { Thread } from "../../../core/threads.js";
import { resolveMeetingSources } from "./meetings.js";
import { resolveClient } from "../../../core/clients/resolve.js";

export function handleListThreads(db: Database, clientParam: string): Thread[] {
  if (!clientParam) return [];
  const resolved = resolveClient(db, clientParam);
  if (!resolved) return [];
  return listThreadsByClient(db, resolved.id);
}

export function handleCreateThread(db: Database, req: CreateThreadRequest): Thread {
  const clientId = req.clientId ?? resolveClient(db, req.client_name)?.id ?? "";
  return coreCreateThread(db, { ...req, client_id: clientId });
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
  const { systemContext, meetingIds } = await getThreadChatContext(db, vdb, session, req.threadId, req.message, req.includeTranscripts ?? false);
  appendThreadMessage(db, { thread_id: req.threadId, role: 'user', content: req.message });
  const history = getThreadMessages(db, req.threadId).map((m) => ({ role: m.role, content: m.content }));
  const answer = await llm.converse(systemContext, history, req.attachments);
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
