export function parseKeywords(input: string): string[] {
  const terms: string[] = [];
  const regex = /"([^"]+)"|(\S+)/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    terms.push(match[1] ?? match[2]);
  }
  return terms;
}

export interface Thread {
  id: string;
  client_name: string;
  client_id: string;
  title: string;
  shorthand: string;
  description: string;
  status: "open" | "resolved";
  summary: string;
  criteria_prompt: string;
  keywords: string;
  criteria_changed_at: string;
  created_at: string;
  updated_at: string;
  meeting_count?: number;
}

export interface ThreadMeeting {
  thread_id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  relevance_summary: string;
  relevance_score: number;
  evaluated_at: string;
}

export interface ThreadMessage {
  id: string;
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  sources: string | null;
  context_stale: boolean;
  stale_details: string | null;
  created_at: string;
}

export interface CreateThreadInput {
  client_name: string;
  client_id?: string | null;
  title: string;
  shorthand: string;
  description: string;
  criteria_prompt: string;
  keywords?: string;
}

import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";
import { getArtifact } from "./extractor.js";
import { deleteNotesByObject } from "./notes.js";
import type { LlmAdapter } from "./llm-adapter.js";
import { embed } from "./embedder.js";
import type { InferenceSession } from "onnxruntime-node";
import type { VectorDb } from "./vector-db.js";

interface ThreadRow {
  id: string;
  client_name: string;
  client_id: string;
  title: string;
  shorthand: string;
  description: string;
  status: string;
  summary: string;
  criteria_prompt: string;
  keywords: string;
  criteria_changed_at: string;
  created_at: string;
  updated_at: string;
  meeting_count?: number;
}

function rowToThread(row: ThreadRow): Thread {
  return {
    id: row.id,
    client_name: row.client_name,
    client_id: row.client_id,
    title: row.title,
    shorthand: row.shorthand,
    description: row.description,
    status: row.status as "open" | "resolved",
    summary: row.summary,
    criteria_prompt: row.criteria_prompt,
    keywords: row.keywords,
    criteria_changed_at: row.criteria_changed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...(row.meeting_count !== undefined ? { meeting_count: row.meeting_count } : {}),
  };
}

export function createThread(db: Database, input: CreateThreadInput): Thread {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO threads (id, client_name, client_id, title, shorthand, description, status, summary, criteria_prompt, keywords, criteria_changed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'open', '', ?, ?, ?, ?, ?)
  `).run(id, input.client_name, input.client_id ?? null, input.title, input.shorthand, input.description, input.criteria_prompt, input.keywords ?? "", now, now, now);
  return rowToThread(db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow);
}

export function getThread(db: Database, id: string): Thread | null {
  const row = db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow | undefined;
  return row ? rowToThread(row) : null;
}

export interface UpdateThreadInput {
  title?: string;
  shorthand?: string;
  description?: string;
  status?: "open" | "resolved";
  summary?: string;
  criteria_prompt?: string;
  keywords?: string;
}

export function updateThread(db: Database, id: string, input: UpdateThreadInput): Thread {
  const current = db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow;
  const now = new Date().toISOString();
  const criteriaChanged =
    (input.criteria_prompt !== undefined && input.criteria_prompt !== current.criteria_prompt) ||
    (input.keywords !== undefined && input.keywords !== current.keywords);
  db.prepare(`
    UPDATE threads SET
      title = ?,
      shorthand = ?,
      description = ?,
      status = ?,
      summary = ?,
      criteria_prompt = ?,
      keywords = ?,
      criteria_changed_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    input.title ?? current.title,
    input.shorthand ?? current.shorthand,
    input.description ?? current.description,
    input.status ?? current.status,
    input.summary ?? current.summary,
    input.criteria_prompt ?? current.criteria_prompt,
    input.keywords ?? current.keywords,
    criteriaChanged ? now : current.criteria_changed_at,
    now,
    id,
  );
  return rowToThread(db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow);
}

export function deleteThread(db: Database, id: string): void {
  db.prepare("DELETE FROM thread_messages WHERE thread_id = ?").run(id);
  db.prepare("DELETE FROM thread_meetings WHERE thread_id = ?").run(id);
  deleteNotesByObject(db, "thread", id);
  db.prepare("DELETE FROM threads WHERE id = ?").run(id);
}

export interface AddThreadMeetingInput {
  thread_id: string;
  meeting_id: string;
  relevance_summary: string;
  relevance_score: number;
}

export function addThreadMeeting(db: Database, input: AddThreadMeetingInput): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO thread_meetings (thread_id, meeting_id, relevance_summary, relevance_score, evaluated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(thread_id, meeting_id) DO UPDATE SET
      relevance_summary = excluded.relevance_summary,
      relevance_score = excluded.relevance_score,
      evaluated_at = excluded.evaluated_at
  `).run(input.thread_id, input.meeting_id, input.relevance_summary, input.relevance_score, now);
}

export function removeThreadMeeting(db: Database, threadId: string, meetingId: string): void {
  db.prepare("DELETE FROM thread_meetings WHERE thread_id = ? AND meeting_id = ?").run(threadId, meetingId);
}

interface ThreadMeetingRow {
  thread_id: string;
  meeting_id: string;
  relevance_summary: string;
  relevance_score: number;
  evaluated_at: string;
  meeting_title: string;
  meeting_date: string;
}

export function getThreadMeetings(db: Database, threadId: string): ThreadMeeting[] {
  const rows = db.prepare(`
    SELECT tm.*, m.title AS meeting_title, m.date AS meeting_date
    FROM thread_meetings tm
    JOIN meetings m ON tm.meeting_id = m.id
    WHERE tm.thread_id = ?
    ORDER BY tm.relevance_score DESC
  `).all(threadId) as ThreadMeetingRow[];
  return rows.map((r) => ({
    thread_id: r.thread_id,
    meeting_id: r.meeting_id,
    meeting_title: r.meeting_title,
    meeting_date: r.meeting_date,
    relevance_summary: r.relevance_summary,
    relevance_score: r.relevance_score,
    evaluated_at: r.evaluated_at,
  }));
}

export interface AppendThreadMessageInput {
  thread_id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string;
}

interface ThreadMessageRow {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  sources: string | null;
  context_stale: number;
  stale_details: string | null;
  created_at: string;
}

function rowToMessage(row: ThreadMessageRow): ThreadMessage {
  return {
    id: row.id,
    thread_id: row.thread_id,
    role: row.role as "user" | "assistant",
    content: row.content,
    sources: row.sources,
    context_stale: row.context_stale === 1,
    stale_details: row.stale_details,
    created_at: row.created_at,
  };
}

export function appendThreadMessage(db: Database, input: AppendThreadMessageInput): ThreadMessage {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO thread_messages (id, thread_id, role, content, sources, context_stale, stale_details, created_at)
    VALUES (?, ?, ?, ?, ?, 0, NULL, ?)
  `).run(id, input.thread_id, input.role, input.content, input.sources ?? null, now);
  return rowToMessage(db.prepare("SELECT * FROM thread_messages WHERE id = ?").get(id) as ThreadMessageRow);
}

export function getThreadMessages(db: Database, threadId: string): ThreadMessage[] {
  const rows = db.prepare("SELECT * FROM thread_messages WHERE thread_id = ? ORDER BY created_at ASC").all(threadId) as ThreadMessageRow[];
  return rows.map(rowToMessage);
}

export function clearThreadMessages(db: Database, threadId: string): void {
  db.prepare("DELETE FROM thread_messages WHERE thread_id = ?").run(threadId);
}

export function markThreadMessagesStale(db: Database, threadId: string, deletedMeetings: { id: string; title: string }[]): void {
  const staleDetails = JSON.stringify(deletedMeetings);
  db.prepare("UPDATE thread_messages SET context_stale = 1, stale_details = ? WHERE thread_id = ?").run(staleDetails, threadId);
}

const DEFAULT_EVAL_TEMPLATE = `You are evaluating whether a meeting is related to a tracked thread.

## Thread
Title: {{thread_title}}
Description: {{thread_description}}
Evaluation criteria: {{criteria_prompt}}
Keywords to look for: {{keywords}}

## Meeting Context
{{meeting_context}}

## Instructions
Determine if this meeting contains discussion, decisions, or actions related to the thread.
Return ONLY valid JSON with fields: related (boolean), relevance_summary (string), relevance_score (integer 0-100)`;

function buildMeetingContextFromArtifact(art: import("./extractor.js").ArtifactRow): string {
  const parts: string[] = [`Summary: ${art.summary}`];
  const actions = JSON.parse(art.action_items ?? "[]") as Array<{ description: string; owner: string }>;
  if (actions.length > 0) {
    parts.push("Action Items:");
    for (const a of actions) parts.push(`- ${a.description} (owner: ${a.owner})`);
  }
  const decisions = JSON.parse(art.decisions ?? "[]") as Array<{ text: string }>;
  if (decisions.length > 0) {
    parts.push("Decisions:");
    for (const d of decisions) parts.push(`- ${d.text}`);
  }
  return parts.join("\n");
}

export async function evaluateMeetingAgainstThread(
  db: Database,
  llm: LlmAdapter,
  meetingId: string,
  thread: Thread,
  promptTemplate?: string,
): Promise<{ related: boolean; relevance_summary: string; relevance_score: number }> {
  const art = getArtifact(db, meetingId);
  if (!art) return { related: false, relevance_summary: "", relevance_score: 0 };
  const context = buildMeetingContextFromArtifact(art);
  const template = promptTemplate ?? DEFAULT_EVAL_TEMPLATE;
  const prompt = template
    .replace("{{thread_title}}", thread.title)
    .replace("{{thread_description}}", thread.description)
    .replace("{{criteria_prompt}}", thread.criteria_prompt)
    .replace("{{keywords}}", thread.keywords)
    .replace("{{meeting_context}}", context);
  const result = await llm.complete("evaluate_thread", prompt);
  return {
    related: result.related === true,
    relevance_summary: typeof result.relevance_summary === "string" ? result.relevance_summary : "",
    relevance_score: typeof result.relevance_score === "number" ? result.relevance_score : 0,
  };
}

export function listThreadsByClient(db: Database, clientId: string): Thread[] {
  const rows = db.prepare(`
    SELECT t.*, COUNT(tm.meeting_id) AS meeting_count
    FROM threads t
    LEFT JOIN thread_meetings tm ON t.id = tm.thread_id
    WHERE t.client_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `).all(clientId) as ThreadRow[];
  return rows.map(rowToThread);
}

export async function regenerateThreadSummary(
  db: Database,
  llm: LlmAdapter,
  threadId: string,
  meetingIds?: string[],
): Promise<string> {
  const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as ThreadRow;
  const allMeetings = getThreadMeetings(db, threadId);
  const meetings = meetingIds
    ? allMeetings.filter((m) => meetingIds.includes(m.meeting_id))
    : allMeetings;
  const context = [
    `Thread: ${thread.title}`,
    thread.description ? `Description: ${thread.description}` : null,
    meetings.length > 0 ? "\nAssociated Meetings:" : null,
    ...meetings.map((m) => `- ${m.meeting_title} (${m.meeting_date}): ${m.relevance_summary}`),
  ].filter(Boolean).join("\n");
  const summary = await llm.converse(
    "Summarize the current state of this thread based on the associated meetings. Be concise.",
    [{ role: "user", content: context }],
  );
  updateThread(db, threadId, { summary });
  return summary;
}

export async function evaluateConfirmedCandidates(
  db: Database,
  llm: LlmAdapter,
  thread: Thread,
  meetingIds: string[],
  overrideExisting: boolean,
): Promise<{ added: number; updated: number; errors: Array<{ meetingId: string; reason: string }> }> {
  const existingRows = db.prepare("SELECT meeting_id FROM thread_meetings WHERE thread_id = ?").all(thread.id) as { meeting_id: string }[];
  const existingSet = new Set(existingRows.map((r) => r.meeting_id));
  const toEvaluate = overrideExisting ? meetingIds : meetingIds.filter((id) => !existingSet.has(id));
  let added = 0;
  let updated = 0;
  const errors: Array<{ meetingId: string; reason: string }> = [];
  for (const meetingId of toEvaluate) {
    const art = getArtifact(db, meetingId);
    if (!art) {
      errors.push({ meetingId, reason: "No artifact found" });
      continue;
    }
    const evalResult = await evaluateMeetingAgainstThread(db, llm, meetingId, thread);
    if (evalResult.related) {
      const isExisting = existingSet.has(meetingId);
      addThreadMeeting(db, { thread_id: thread.id, meeting_id: meetingId, relevance_summary: evalResult.relevance_summary, relevance_score: evalResult.relevance_score });
      if (isExisting) {
        updated++;
      } else {
        added++;
      }
    }
  }
  return { added, updated, errors };
}

interface MeetingTitleRow { id: string; title: string; date: string; }

export async function getThreadCandidates(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  thread: Thread,
  clientName: string,
  topN: number = 20,
): Promise<Array<{ meeting_id: string; title: string; date: string; similarity: number }>> {
  const query = [thread.title, thread.description, thread.criteria_prompt].filter(Boolean).join(" ");
  const vec = await embed(session as Parameters<typeof embed>[0], query);
  const table = await vdb.openTable("meeting_vectors");
  const rows = await table
    .search(Array.from(vec))
    .limit(topN)
    .where(`client = '${clientName.replace(/'/g, "''")}'`)
    .toArray() as Array<Record<string, unknown>>;
  const meetingRows = db.prepare("SELECT id, title, date FROM meetings WHERE id IN (" + rows.map(() => "?").join(",") + ")")
    .all(...rows.map((r) => r.meeting_id as string)) as MeetingTitleRow[];
  const titleMap = new Map(meetingRows.map((m) => [m.id, { title: m.title, date: m.date }]));
  return rows.map((r) => {
    const meta = titleMap.get(r.meeting_id as string);
    return {
      meeting_id: r.meeting_id as string,
      title: meta?.title ?? "",
      date: meta?.date ?? "",
      similarity: 1 - (r._distance as number),
    };
  });
}

export async function getThreadChatContext(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  threadId: string,
  userMessage: string,
  includeTranscripts: boolean,
  topK: number = 7,
): Promise<{ systemContext: string; meetingIds: string[] }> {
  const thread = db.prepare("SELECT * FROM threads WHERE id = ?").get(threadId) as ThreadRow;
  const associated = getThreadMeetings(db, threadId);
  if (associated.length === 0) {
    const parts = [`Thread: ${thread.title}`];
    if (thread.description) parts.push(`Description: ${thread.description}`);
    if (thread.summary) parts.push(`Summary: ${thread.summary}`);
    return { systemContext: parts.join("\n"), meetingIds: [] };
  }
  const vec = await embed(session as Parameters<typeof embed>[0], userMessage);
  const associatedIds = associated.map((m) => m.meeting_id);
  const idList = associatedIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(",");
  const table = await vdb.openTable("meeting_vectors");
  const rows = await table
    .search(Array.from(vec))
    .limit(topK)
    .where(`meeting_id IN (${idList})`)
    .toArray() as Array<Record<string, unknown>>;
  const selectedIds = rows.map((r) => r.meeting_id as string);
  const parts: string[] = [`Thread: ${thread.title}`];
  if (thread.description) parts.push(`Description: ${thread.description}`);
  if (thread.summary) parts.push(`Summary: ${thread.summary}`);
  if (selectedIds.length > 0) {
    parts.push("\nRelevant Meetings:");
    for (const id of selectedIds) {
      const art = getArtifact(db, id);
      const meta = associated.find((m) => m.meeting_id === id);
      if (art && meta) {
        const content = includeTranscripts ? buildMeetingContextFromArtifact(art) : `Summary: ${art.summary}`;
        parts.push(`- ${meta.meeting_title} (${meta.meeting_date}):\n  ${content.replace(/\n/g, "\n  ")}`);
      }
    }
  }
  return { systemContext: parts.join("\n"), meetingIds: selectedIds };
}
