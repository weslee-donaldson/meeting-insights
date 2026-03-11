import type { DatabaseSync as Database } from "node:sqlite";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { getArtifact, extractSummary, storeArtifact } from "../../core/extractor.js";
import type { Artifact } from "../../core/extractor.js";
import { parseTranscriptBody, parseWebVttBody } from "../../core/parser.js";
import { getClientByName, buildClientContext } from "../../core/client-registry.js";
import type { Participant } from "../../core/client-registry.js";
import { buildLabeledContext, buildDistilledContext } from "../../core/labeled-context.js";
import { ingestMeeting, getMeeting } from "../../core/ingest.js";
import { storeDetection } from "../../core/client-detection.js";
import { parseCitations, replaceCitations } from "../../core/display-helpers.js";
import type { LlmAdapter } from "../../core/llm-adapter.js";
import { hybridSearch } from "../../core/hybrid-search.js";
import { deepSearch } from "../../core/deep-search.js";
import { updateFts } from "../../core/fts.js";
import { createMeetingTable } from "../../core/vector-db.js";
import type { VectorDb } from "../../core/vector-db.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "../../core/meeting-pipeline.js";
import type { InferenceSession } from "onnxruntime-node";
import type { MeetingRow, ChatRequest, ChatResponse, ConversationChatRequest, ConversationChatResponse, MeetingFilters, SearchRequest, SearchResultRow, ActionItemCompletion, ItemHistoryEntry, MentionStat, ClientActionItem, CreateMeetingRequest, DeepSearchRequest, DeepSearchResultRow, CreateThreadRequest, UpdateThreadRequest, ThreadChatRequest, ThreadChatResponse, CreateInsightRequest, UpdateInsightRequest, InsightChatRequest, InsightChatResponse, CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest, MilestoneChatResponse } from "./channels.js";
import { listThreadsByClient, createThread as coreCreateThread, updateThread as coreUpdateThread, deleteThread as coreDeleteThread, getThreadMeetings, getThreadCandidates as coreGetThreadCandidates, evaluateConfirmedCandidates, removeThreadMeeting, addThreadMeeting as coreAddThreadMeeting, regenerateThreadSummary as coreRegenerateThreadSummary, getThreadMessages, appendThreadMessage, clearThreadMessages as coreClearThreadMessages, getThreadChatContext, getThread, markThreadMessagesStale } from "../../core/threads.js";
import type { Thread } from "../../core/threads.js";
import { cleanupMentions, getMentionsByCanonical, getMentionStats } from "../../core/item-dedup.js";
import { listInsightsByClient, createInsight as coreCreateInsight, updateInsight as coreUpdateInsight, deleteInsight as coreDeleteInsight, getInsightMeetings, discoverMeetingsForPeriod, addInsightMeeting, generateInsight as coreGenerateInsight, getInsightMessages, appendInsightMessage, clearInsightMessages as coreClearInsightMessages, getInsight, getInsightChatContext, removeInsightMeeting } from "../../core/insights.js";
import type { Insight, InsightMeeting, InsightMessage } from "../../core/insights.js";
import { reconcileMilestones, listMilestonesByClient, createMilestone as coreCreateMilestone, updateMilestone as coreUpdateMilestone, deleteMilestone as coreDeleteMilestone, getMilestoneMentions, getMeetingMilestones, getDateSlippage, getMilestoneMessages, appendMilestoneMessage, clearMilestoneMessages as coreClearMilestoneMessages, getMilestoneChatContext, confirmMilestoneMention as coreConfirmMilestoneMention, rejectMilestoneMention as coreRejectMilestoneMention, mergeMilestones as coreMergeMilestones, linkActionItem, unlinkActionItem, getMilestoneActionItems, getMilestone } from "../../core/timelines.js";
import type { Milestone, MilestoneMention, MilestoneMessage, MilestoneActionItem, DateSlippageEntry } from "../../core/timelines.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const CHAT_GUIDELINES_PATH = join(REPO_ROOT, "config/chat-guidelines.md");
const chatGuidelines = existsSync(CHAT_GUIDELINES_PATH) ? readFileSync(CHAT_GUIDELINES_PATH, "utf8") : "";

const EXTRACTION_PROMPT_PATH = join(REPO_ROOT, "config/prompts/extraction.md");
const extractionPrompt = existsSync(EXTRACTION_PROMPT_PATH) ? readFileSync(EXTRACTION_PROMPT_PATH, "utf8") : undefined;

const DEEP_SEARCH_PROMPT_PATH = join(REPO_ROOT, "config/prompts/deep-search.md");
const deepSearchPrompt = existsSync(DEEP_SEARCH_PROMPT_PATH) ? readFileSync(DEEP_SEARCH_PROMPT_PATH, "utf8") : undefined;

const SYSTEM_CONFIG_PATH = join(REPO_ROOT, "config/system.json");
const systemConfig = existsSync(SYSTEM_CONFIG_PATH)
  ? JSON.parse(readFileSync(SYSTEM_CONFIG_PATH, "utf8")) as { search?: { maxDistance?: number; limit?: number } }
  : {};
const SEARCH_MAX_DISTANCE = systemConfig.search?.maxDistance ?? 1.0;
const SEARCH_LIMIT = systemConfig.search?.limit ?? 50;

const CHAT_TEMPLATES_DIR = join(REPO_ROOT, "config/chat-templates");
const chatTemplates = new Map<string, string>();
if (existsSync(CHAT_TEMPLATES_DIR)) {
  for (const file of readdirSync(CHAT_TEMPLATES_DIR).filter((f) => extname(f) === ".md")) {
    chatTemplates.set(basename(file, ".md"), readFileSync(join(CHAT_TEMPLATES_DIR, file), "utf8"));
  }
}

export function handleGetTemplates(): string[] {
  return [...chatTemplates.keys()].sort();
}

interface ClientRow { name: string; }
interface DbMeetingRow { id: string; title: string; date: string; action_item_count: number; }

interface RawMeetingRow { raw_transcript: string; }

export function handleGetClients(db: Database): string[] {
  const rows = db.prepare("SELECT name FROM clients ORDER BY name").all() as unknown as ClientRow[];
  return rows.map((r) => r.name);
}

export function handleGetDefaultClient(db: Database): string | null {
  const row = db.prepare("SELECT name FROM clients WHERE is_default = 1 LIMIT 1").get() as { name: string } | undefined;
  return row?.name ?? null;
}

function normalizeSeries(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

export function resolveMeetingSources(
  db: Database,
  meetingIds: string[],
): { id: string; label: string }[] {
  if (meetingIds.length === 0) return [];
  const result: { id: string; label: string }[] = [];
  for (const id of meetingIds) {
    const row = db
      .prepare("SELECT title, date FROM meetings WHERE id = ?")
      .get(id) as { title: string; date: string } | undefined;
    if (row) {
      result.push({ id, label: `${row.title} (${row.date.slice(0, 10)})` });
    }
  }
  return result;
}

function clientNameForMeeting(
  db: Database,
  meetingId: string,
): string {
  const row = db
    .prepare(
      "SELECT c.name FROM meetings m JOIN clients c ON m.client_id = c.id WHERE m.id = ?",
    )
    .get(meetingId) as { name: string } | undefined;
  return row?.name ?? "";
}

export function handleGetMeetings(
  db: Database,
  opts: MeetingFilters,
): MeetingRow[] {
  let rows = db
    .prepare(
      "SELECT m.id, m.title, m.date, COALESCE(json_array_length(a.action_items), 0) AS action_item_count, COALESCE(c.name, '') AS client_name FROM meetings m LEFT JOIN artifacts a ON m.id = a.meeting_id LEFT JOIN clients c ON m.client_id = c.id WHERE m.ignored = 0 ORDER BY m.date DESC",
    )
    .all() as unknown as (DbMeetingRow & { client_name: string })[];

  if (opts.after) rows = rows.filter((r) => r.date >= opts.after!);
  if (opts.before)
    rows = rows.filter((r) => r.date <= opts.before! + "T23:59:59Z");

  const tagRows = db.prepare(
    "SELECT tm.meeting_id, tm.thread_id, t.title, t.shorthand FROM thread_meetings tm JOIN threads t ON tm.thread_id = t.id"
  ).all() as { meeting_id: string; thread_id: string; title: string; shorthand: string }[];
  const tagsByMeeting = new Map<string, MeetingRow["thread_tags"]>();
  for (const r of tagRows) {
    if (!tagsByMeeting.has(r.meeting_id)) tagsByMeeting.set(r.meeting_id, []);
    tagsByMeeting.get(r.meeting_id)!.push({ thread_id: r.thread_id, title: r.title, shorthand: r.shorthand });
  }

  const msRows = db.prepare(
    "SELECT mm.meeting_id, mm.milestone_id, m.title, m.target_date, m.status FROM milestone_mentions mm JOIN milestones m ON mm.milestone_id = m.id"
  ).all() as { meeting_id: string; milestone_id: string; title: string; target_date: string | null; status: string }[];
  const msByMeeting = new Map<string, MeetingRow["milestone_tags"]>();
  for (const r of msRows) {
    if (!msByMeeting.has(r.meeting_id)) msByMeeting.set(r.meeting_id, []);
    msByMeeting.get(r.meeting_id)!.push({ milestone_id: r.milestone_id, title: r.title, target_date: r.target_date, status: r.status });
  }

  return rows
    .map((r) => ({
      id: r.id,
      title: r.title,
      date: r.date,
      client: r.client_name,
      series: normalizeSeries(r.title),
      actionItemCount: r.action_item_count,
      thread_tags: tagsByMeeting.get(r.id) ?? [],
      milestone_tags: msByMeeting.get(r.id) ?? [],
    }))
    .filter((r) => !opts.client || r.client === opts.client);}

export function handleGetArtifact(
  db: Database,
  meetingId: string,
): Artifact | null {
  const row = getArtifact(db, meetingId);
  if (!row) return null;
  const rawDecisions = JSON.parse(row.decisions ?? "[]") as unknown[];
  const decisions = rawDecisions.map((d) =>
    typeof d === "string" ? { text: d, decided_by: "" } : d as Artifact["decisions"][number],
  );
  const rawActions = JSON.parse(row.action_items ?? "[]") as unknown[];
  const action_items = rawActions.map((item) => {
    const a = item as Record<string, unknown>;
    const withRequester = "requester" in a ? a : { ...a, requester: "" };
    const p = (withRequester as Record<string, unknown>).priority;
    const priority = p === "critical" || p === "normal" ? p : "normal";
    return { ...withRequester, priority } as Artifact["action_items"][number];
  });
  const rawRisks = JSON.parse(row.risk_items ?? "[]") as unknown[];
  const risk_items = rawRisks.map((r) =>
    typeof r === "string" ? { category: "engineering" as const, description: r } : r as Artifact["risk_items"][number],
  );
  return {
    summary: row.summary,
    decisions,
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items,
    open_questions: JSON.parse(row.open_questions ?? "[]"),
    risk_items,
    additional_notes: JSON.parse(row.additional_notes ?? "[]"),
  };
}

const SYSTEM_PROMPT = [
  `You are a meeting intelligence assistant. Answer the user's question using ONLY the provided meeting context.`,
  `When referencing a meeting, cite it by its title and date — for example "Sprint Planning (Mon, 3/2/2026)". Do NOT use [M1], [M2] labels in your response.`,
  `If the answer cannot be found in the context, say so clearly.`,
  chatGuidelines,
].filter(Boolean).join("\n\n");

export async function handleChat(
  db: Database,
  llm: LlmAdapter,
  req: ChatRequest,
): Promise<ChatResponse> {
  const { contextText, charCount, meetings } = buildLabeledContext(
    db,
    req.meetingIds,
  );

  const prompt = `${SYSTEM_PROMPT}\n\nMeeting Context:\n${contextText}\n\nQuestion: ${req.question}`;

  const result = await llm.complete("synthesize_answer", prompt, req.attachments);
  const rawAnswer = (result as { answer?: string }).answer ?? String(result);
  const answer = replaceCitations(rawAnswer, meetings);

  const citations = parseCitations(rawAnswer);
  const sources =
    citations.length > 0
      ? citations
          .map((i) => meetings[i - 1]?.title ?? "")
          .filter(Boolean)
      : meetings.map((m) => m.title);

  return { answer, sources, charCount };
}

export async function handleConversationChat(
  db: Database,
  llm: LlmAdapter,
  req: ConversationChatRequest,
): Promise<ConversationChatResponse> {
  let contextText: string;
  let charCount: number;
  let meetings: Array<{ id: string; title: string; date: string }>;

  if (req.includeTranscripts) {
    const labeled = buildLabeledContext(db, req.meetingIds);
    contextText = labeled.contextText;
    charCount = labeled.charCount;
    meetings = labeled.meetings;
  } else {
    contextText = buildDistilledContext(db, req.meetingIds);
    charCount = contextText.length;
    meetings = req.meetingIds.flatMap((id) => {
      const m = getMeeting(db, id);
      return m ? [{ id: m.id, title: m.title, date: m.date }] : [];
    });
  }

  const templateContent = req.template ? chatTemplates.get(req.template) : undefined;
  const templateDirective = templateContent
    ? `IMPORTANT: The user has selected the "${req.template}" output template. You MUST follow ONLY the template below for your response structure. Disregard any formatting or structure from earlier messages in this conversation.\n\n${templateContent}`
    : undefined;
  const system = [SYSTEM_PROMPT, templateDirective, `Meeting Context:\n${contextText}`].filter(Boolean).join("\n\n");

  const rawAnswer = await llm.converse(system, req.messages, req.attachments);
  const answer = replaceCitations(rawAnswer, meetings);

  const citations = parseCitations(rawAnswer);
  const sources =
    citations.length > 0
      ? citations
          .map((i) => meetings[i - 1]?.title ?? "")
          .filter(Boolean)
      : meetings.map((m) => m.title);

  return { answer, sources, charCount };
}

function clientContextForName(db: Database, clientName: string): string | undefined {
  const clientRow = getClientByName(db, clientName);
  if (!clientRow) return undefined;
  return buildClientContext(
    clientRow.name,
    JSON.parse(clientRow.client_team ?? "[]") as Participant[],
    JSON.parse(clientRow.implementation_team ?? "[]") as Participant[],
    clientRow.additional_extraction_llm_prompt ?? undefined,
  );
}

export async function handleReExtract(db: Database, llm: LlmAdapter, meetingId: string): Promise<void> {
  const row = db.prepare("SELECT raw_transcript FROM meetings WHERE id = ?").get(meetingId) as RawMeetingRow | undefined;
  if (!row) throw new Error(`Meeting ${meetingId} not found`);
  cleanupMentions(db, meetingId);
  const turns = parseTranscriptBody(row.raw_transcript ?? "");
  const clientName = clientNameForMeeting(db, meetingId);
  const clientContext = clientName ? clientContextForName(db, clientName) : undefined;
  const artifact = await extractSummary(llm, turns, 8000, extractionPrompt, clientContext);
  db.prepare("DELETE FROM artifacts WHERE meeting_id = ?").run(meetingId);
  db.prepare("DELETE FROM milestone_mentions WHERE meeting_id = ?").run(meetingId);
  storeArtifact(db, meetingId, artifact);
  if (clientName && artifact.milestones.length > 0) {
    const meetingDate = (db.prepare("SELECT date FROM meetings WHERE id = ?").get(meetingId) as { date: string }).date;
    reconcileMilestones(db, clientName, meetingId, meetingDate, artifact.milestones);
  }
  updateFts(db, meetingId);
}

export function handleSetIgnored(db: Database, meetingId: string, ignored: boolean): void {
  db.prepare("UPDATE meetings SET ignored = ? WHERE id = ?").run(ignored ? 1 : 0, meetingId);
}

export function handleReassignClient(db: Database, meetingId: string, clientName: string): void {
  db.prepare("DELETE FROM client_detections WHERE meeting_id = ?").run(meetingId);
  db.prepare(
    "INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, 1.0, 'manual')",
  ).run(meetingId, clientName);
  const clientRow = db.prepare("SELECT id FROM clients WHERE name = ?").get(clientName) as { id: string } | undefined;
  if (clientRow?.id) {
    db.prepare("UPDATE meetings SET client_id = ? WHERE id = ?").run(clientRow.id, meetingId);
  }
}

export async function handleDeleteMeetings(db: Database, vdb: VectorDb | null, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  for (const id of ids) cleanupMentions(db, id);
  db.prepare(`DELETE FROM action_item_completions WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM client_detections WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM artifact_fts WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM artifacts WHERE meeting_id IN (${placeholders})`).run(...ids);
  // Mark thread messages stale before removing associations
  for (const id of ids) {
    const threadRows = db.prepare('SELECT DISTINCT thread_id FROM thread_meetings WHERE meeting_id = ?').all(id) as { thread_id: string }[];
    const meeting = db.prepare('SELECT title FROM meetings WHERE id = ?').get(id) as { title: string } | undefined;
    for (const row of threadRows) {
      markThreadMessagesStale(db, row.thread_id, [{ id, title: meeting?.title ?? '' }]);
    }
  }
  db.prepare(`DELETE FROM thread_meetings WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM meetings WHERE id IN (${placeholders})`).run(...ids);
  if (vdb) {
    const filter = ids.map((id) => `meeting_id = '${id.replace(/'/g, "''")}'`).join(" OR ");
    const names = await vdb.tableNames();
    const targets = ["meeting_vectors", "feature_vectors", "item_vectors"].filter((n) => names.includes(n));
    await Promise.all(targets.map(async (name) => (await vdb.openTable(name)).delete(filter)));
  }
}

export function handleCompleteActionItem(db: Database, meetingId: string, itemIndex: number, note: string): void {
  db.prepare(
    "INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET note = excluded.note, completed_at = excluded.completed_at",
  ).run(`${meetingId}:${itemIndex}`, meetingId, itemIndex, new Date().toISOString(), note);
}

export function handleUncompleteActionItem(db: Database, meetingId: string, itemIndex: number): void {
  db.prepare("DELETE FROM action_item_completions WHERE id = ?").run(`${meetingId}:${itemIndex}`);
}

export function handleGetCompletions(db: Database, meetingId: string): ActionItemCompletion[] {
  return db.prepare("SELECT * FROM action_item_completions WHERE meeting_id = ?").all(meetingId) as ActionItemCompletion[];
}

export async function handleSearchMeetings(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  req: SearchRequest,
): Promise<SearchResultRow[]> {
  return hybridSearch(db, vdb, session, req.query, {
    limit: SEARCH_LIMIT,
    client: req.client,
    maxDistance: SEARCH_MAX_DISTANCE,
  }) as Promise<SearchResultRow[]>;
}

export function handleGetItemHistory(db: Database, canonicalId: string): ItemHistoryEntry[] {
  return getMentionsByCanonical(db, canonicalId);
}

export function handleGetMentionStats(db: Database, meetingId: string): MentionStat[] {
  return getMentionStats(db, meetingId);
}

export function handleGetClientActionItems(db: Database, clientName: string, filters?: { after?: string; before?: string }): ClientActionItem[] {
  const meetingIds = (db.prepare(
    "SELECT m.id AS meeting_id FROM meetings m JOIN clients c ON m.client_id = c.id WHERE c.name = ? AND m.ignored = 0",
  ).all(clientName) as { meeting_id: string }[]).map((r) => r.meeting_id);

  if (meetingIds.length === 0) return [];

  const placeholders = meetingIds.map(() => "?").join(",");
  const completed = new Set(
    (db.prepare(
      `SELECT id FROM action_item_completions WHERE meeting_id IN (${placeholders})`,
    ).all(...meetingIds) as { id: string }[]).map((r) => r.id),
  );

  const result: ClientActionItem[] = [];

  for (const meetingId of meetingIds) {
    const meeting = getMeeting(db, meetingId);
    if (!meeting) continue;
    const artifact = handleGetArtifact(db, meetingId);
    if (!artifact) continue;

    artifact.action_items.forEach((item, index) => {
      if (completed.has(`${meetingId}:${index}`)) return;
      result.push({
        meeting_id: meetingId,
        meeting_title: meeting.title,
        meeting_date: meeting.date,
        item_index: index,
        description: item.description,
        owner: item.owner,
        requester: item.requester,
        due_date: item.due_date,
        priority: item.priority,
      });
    });
  }

  let filtered = result;
  if (filters?.after) filtered = filtered.filter((i) => i.meeting_date >= filters.after!);
  if (filters?.before) filtered = filtered.filter((i) => i.meeting_date <= filters.before! + "T23:59:59Z");

  filtered.sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "critical" ? -1 : 1));
  return filtered;
}

export async function handleReEmbed(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
): Promise<{ embedded: number; skipped: number }> {
  const table = await createMeetingTable(vdb);
  const existingRows = await table.query().toArray();
  const existingIds = new Set(existingRows.map((r: Record<string, unknown>) => r.meeting_id as string));

  const meetings = db.prepare(
    "SELECT m.id, m.date, m.title FROM meetings m WHERE EXISTS (SELECT 1 FROM artifacts WHERE meeting_id = m.id)",
  ).all() as { id: string; date: string; title: string }[];

  let embedded = 0;
  let skipped = 0;

  for (const meeting of meetings) {
    if (existingIds.has(meeting.id)) {
      skipped++;
      continue;
    }
    const artifact = handleGetArtifact(db, meeting.id)!;
    const client = clientNameForMeeting(db, meeting.id);
    const vec = await embedMeeting(session, buildEmbeddingInput(artifact));
    await storeMeetingVector(table, meeting.id, vec, {
      client,
      meeting_type: meeting.title,
      date: meeting.date,
    });
    embedded++;
  }

  return { embedded, skipped };
}

export async function handleCreateMeeting(
  db: Database,
  llm: LlmAdapter,
  req: CreateMeetingRequest,
): Promise<string> {
  const timestamp = `${req.date}T00:00:00.000Z`;
  const meetingId = ingestMeeting(db, {
    title: req.title,
    timestamp,
    participants: [],
    rawTranscript: req.rawTranscript,
    turns: [],
    sourceFilename: `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });
  if (req.clientName) {
    storeDetection(db, meetingId, [{ client_name: req.clientName, confidence: 1.0, method: "manual" }]);
  }
  let turns = req.format === "webvtt"
    ? parseWebVttBody(req.rawTranscript)
    : parseTranscriptBody(req.rawTranscript);
  if (turns.length === 0) {
    turns = [{ speaker_name: "Participant", timestamp: "00:00", text: req.rawTranscript }];
  }
  const clientContext = req.clientName ? clientContextForName(db, req.clientName) : undefined;
  const artifact = await extractSummary(llm, turns, 8000, extractionPrompt, clientContext);
  storeArtifact(db, meetingId, artifact);
  updateFts(db, meetingId);
  return meetingId;
}

export async function handleDeepSearch(
  db: Database,
  llm: LlmAdapter,
  req: DeepSearchRequest,
): Promise<DeepSearchResultRow[]> {
  return deepSearch(llm, db, req.meetingIds, req.query, deepSearchPrompt);
}

export async function handleUpdateMeetingVector(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  meetingId: string,
): Promise<void> {
  const artifact = handleGetArtifact(db, meetingId);
  if (!artifact) throw new Error(`No artifact found for meeting ${meetingId}`);

  const table = await createMeetingTable(vdb);
  await table.delete(`meeting_id = '${meetingId}'`);

  const client = clientNameForMeeting(db, meetingId);

  const meeting = db.prepare("SELECT title, date FROM meetings WHERE id = ?").get(meetingId) as { title: string; date: string };
  const vec = await embedMeeting(session, buildEmbeddingInput(artifact));
  await storeMeetingVector(table, meetingId, vec, {
    client,
    meeting_type: meeting.title,
    date: meeting.date,
  });
}

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
  ).all(meetingId) as MeetingThreadRow[];
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
  return coreUpdateMilestone(db, milestoneId, req);
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
  const { systemContext, meetingIds } = await getMilestoneChatContext(db, vdb, session, req.milestoneId, req.message, req.includeTranscripts ?? false);
  appendMilestoneMessage(db, { milestoneId: req.milestoneId, role: "user", content: req.message });
  const history = getMilestoneMessages(db, req.milestoneId).map((m) => ({ role: m.role, content: m.content }));
  const answer = await llm.converse(systemContext, history);
  const sources = resolveMeetingSources(db, meetingIds);
  appendMilestoneMessage(db, { milestoneId: req.milestoneId, role: "assistant", content: answer, sources: sources.length > 0 ? JSON.stringify(sources) : undefined });
  return { answer, sources };
}

export function handleClearMilestoneMessages(db: Database, milestoneId: string): void {
  coreClearMilestoneMessages(db, milestoneId);
}
