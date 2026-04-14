import type { DatabaseSync as Database } from "node:sqlite";
import { getArtifact, extractSummary, storeArtifact, generateShortId, updateArtifact } from "../../../core/extractor.js";
import { resolveShortIds } from "../../../core/action-item-resolver.js";
import { storeAsset, getAssets, deleteAsset, getAssetData, deleteAssetsForMeeting } from "../../../core/assets.js";
import type { AssetRow } from "../../../core/assets.js";
import type { Artifact } from "../../../core/extractor.js";
import { parseTranscriptBody, parseWebVttBody } from "../../../core/parser.js";
import { getClientByName, getGlossaryForClient, buildClientContext } from "../../../core/client-registry.js";
import type { Participant, GlossaryEntry } from "../../../core/client-registry.js";
import { buildLabeledContext, buildDistilledContext } from "../../../core/labeled-context.js";
import { ingestMeeting, getMeeting, renameMeeting } from "../../../core/ingest.js";
import { splitMeeting, getChildMeetings, getSourceMeeting } from "../../../core/meeting-split.js";
import type { SplitResult } from "../../../core/meeting-split.js";
import type { MeetingRow } from "../../../core/ingest.js";
import { deleteNotesByObject } from "../../../core/notes.js";
import { storeDetection } from "../../../core/client-detection.js";
import { parseCitations, replaceCitations } from "../../../core/display-helpers.js";
import type { LlmAdapter } from "../../../core/llm/adapter.js";
import { updateFts } from "../../../core/search/fts.js";
import type { VectorDb } from "../../../core/search/vector-db.js";
import { cleanupMentions, getMentionsByCanonical, getMentionStats } from "../../../core/dedup/item-dedup.js";
import { markThreadMessagesStale } from "../../../core/threads.js";
import { getMeetingMessages, appendMeetingMessage, clearMeetingMessages } from "../../../core/meeting-messages.js";
import type { MeetingMessage } from "../../../core/meeting-messages.js";
import { reconcileMilestones } from "../../../core/timelines.js";
import type { MeetingRow, ChatRequest, ChatResponse, ConversationChatRequest, ConversationChatResponse, MeetingFilters, ActionItemCompletion, ItemHistoryEntry, MentionStat, ClientActionItem, CreateMeetingRequest } from "../channels.js";
import { chatGuidelines, chatTemplates, extractionPrompt } from "./config.js";
import { resolveClient } from "../../../core/resolve-client.js";

interface ClientRow { name: string; }
interface DbMeetingRow { id: string; title: string; date: string; action_item_count: number; }
interface RawMeetingRow { raw_transcript: string; }

function normalizeSeries(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

export function clientNameForMeeting(db: Database, meetingId: string): string {
  const row = db
    .prepare(
      "SELECT c.name FROM meetings m JOIN clients c ON m.client_id = c.id WHERE m.id = ?",
    )
    .get(meetingId) as { name: string } | undefined;
  return row?.name ?? "";
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

function clientContextForName(db: Database, clientName: string): string | undefined {
  const clientRow = getClientByName(db, clientName);
  if (!clientRow) return undefined;
  return buildClientContext(
    clientRow.name,
    JSON.parse(clientRow.client_team ?? "[]") as Participant[],
    JSON.parse(clientRow.implementation_team ?? "[]") as Participant[],
    clientRow.additional_extraction_llm_prompt ?? undefined,
    JSON.parse(clientRow.glossary ?? "[]") as GlossaryEntry[],
  );
}

const SYSTEM_PROMPT = [
  `You are a meeting intelligence assistant. Answer the user's question using ONLY the provided meeting context.`,
  `When referencing a meeting, cite it by its title and date — for example "Sprint Planning (Mon, 3/2/2026)". Do NOT use [M1], [M2] labels in your response.`,
  `If the answer cannot be found in the context, say so clearly.`,
  chatGuidelines,
].filter(Boolean).join("\n\n");

export function handleGetTemplates(): string[] {
  return [...chatTemplates.keys()].sort();
}

export function handleGetClients(db: Database): string[] {
  const rows = db.prepare("SELECT name FROM clients ORDER BY name").all() as unknown as ClientRow[];
  return rows.map((r) => r.name);
}

export function handleGetClientList(db: Database): Array<{ id: string; name: string }> {
  return db.prepare("SELECT id, name FROM clients ORDER BY name").all() as Array<{ id: string; name: string }>;
}

export function handleGetClientDetail(db: Database, clientId: string): {
  id: string;
  name: string;
  aliases: string[];
  client_team: unknown[];
  implementation_team: unknown[];
  meeting_names: string[];
  glossary_count: number;
} | null {
  const row = db.prepare("SELECT * FROM clients WHERE id = ?").get(clientId) as import("../../../core/client-registry.js").ClientRow | undefined;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    aliases: JSON.parse(row.aliases),
    client_team: JSON.parse(row.client_team),
    implementation_team: JSON.parse(row.implementation_team),
    meeting_names: JSON.parse(row.meeting_names),
    glossary_count: JSON.parse(row.glossary).length,
  };
}

export function handleGetDefaultClient(db: Database): string | null {
  const row = db.prepare("SELECT name FROM clients WHERE is_default = 1 LIMIT 1").get() as { name: string } | undefined;
  return row?.name ?? null;
}

export function handleGetGlossary(db: Database, clientName: string): import("../../../core/client-registry.js").GlossaryEntry[] {
  return getGlossaryForClient(db, clientName);
}

export function handleGetMeetings(db: Database, opts: MeetingFilters): MeetingRow[] {
  let resolvedClientName: string | undefined;
  if (opts.client) {
    const resolved = resolveClient(db, opts.client);
    resolvedClientName = resolved?.name;
    if (!resolvedClientName) return [];
  }

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
    "SELECT mm.meeting_id, mm.milestone_id, m.title, m.target_date, m.status FROM milestone_mentions mm JOIN milestones m ON mm.milestone_id = m.id WHERE m.ignored = 0"
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
    .filter((r) => !resolvedClientName || r.client === resolvedClientName);
}

export function handleGetArtifact(db: Database, meetingId: string): Artifact | null {
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

  const noteIds = req.noteIds ?? [];
  const useFullContext = req.contextMode === "full" || (!req.contextMode && req.includeTranscripts);
  if (useFullContext) {
    const labeled = buildLabeledContext(db, req.meetingIds, noteIds);
    contextText = labeled.contextText;
    charCount = labeled.charCount;
    meetings = labeled.meetings;
  } else {
    contextText = buildDistilledContext(db, req.meetingIds, noteIds);
    charCount = contextText.length;
    meetings = req.meetingIds.flatMap((id) => {
      const m = getMeeting(db, id);
      return m ? [{ id: m.id, title: m.title, date: m.date }] : [];
    });
  }

  const templateContent = req.template ? chatTemplates.get(req.template) : undefined;
  const templateDirective = templateContent
    ? `CRITICAL — OUTPUT FORMAT CONSTRAINT:\nYour response MUST contain ONLY the sections listed in the template below. Any section not listed (e.g. "Owner", "Due", "Tasks", "Sources to Investigate", "Open Question", "Requested by") is FORBIDDEN. If information does not fit into one of the listed sections, fold it into the closest matching section or omit it entirely.\n\n${templateContent}\n\nRemember: output ONLY the sections above. Nothing else.`
    : undefined;
  const system = [SYSTEM_PROMPT, `Meeting Context:\n${contextText}`, templateDirective].filter(Boolean).join("\n\n");

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
    const clientRow = db.prepare("SELECT id FROM clients WHERE name = ?").get(clientName) as { id: string } | undefined;
    const clientId = clientRow?.id ?? "";
    if (clientId) reconcileMilestones(db, clientId, meetingId, meetingDate, artifact.milestones);
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

export async function handleDeleteMeetings(db: Database, vdb: VectorDb | null, ids: string[], assetsDir?: string): Promise<void> {
  if (ids.length === 0) return;
  if (assetsDir) {
    for (const id of ids) deleteAssetsForMeeting(db, id, assetsDir);
  }
  const placeholders = ids.map(() => "?").join(",");
  for (const id of ids) cleanupMentions(db, id);
  db.prepare(`DELETE FROM action_item_completions WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM client_detections WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM artifact_fts WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM artifacts WHERE meeting_id IN (${placeholders})`).run(...ids);
  for (const id of ids) {
    const threadRows = db.prepare('SELECT DISTINCT thread_id FROM thread_meetings WHERE meeting_id = ?').all(id) as { thread_id: string }[];
    const meeting = db.prepare('SELECT title FROM meetings WHERE id = ?').get(id) as { title: string } | undefined;
    for (const row of threadRows) {
      markThreadMessagesStale(db, row.thread_id, [{ id, title: meeting?.title ?? '' }]);
    }
  }
  db.prepare(`DELETE FROM thread_meetings WHERE meeting_id IN (${placeholders})`).run(...ids);
  for (const id of ids) deleteNotesByObject(db, "meeting", id);
  db.prepare(`DELETE FROM meetings WHERE id IN (${placeholders})`).run(...ids);
  if (vdb) {
    const filter = ids.map((id) => `meeting_id = '${id.replace(/'/g, "''")}'`).join(" OR ");
    const names = await vdb.tableNames();
    const targets = ["meeting_vectors", "feature_vectors", "item_vectors"].filter((n) => names.includes(n));
    await Promise.all(targets.map(async (name) => (await vdb.openTable(name)).delete(filter)));
  }
}

export interface EditActionItemFields {
  description?: string;
  owner?: string;
  requester?: string;
  due_date?: string | null;
  priority?: "critical" | "normal" | "low";
}

export function handleEditActionItem(db: Database, meetingId: string, itemIndex: number, fields: EditActionItemFields): void {
  const row = getArtifact(db, meetingId);
  if (!row) throw new Error(`Artifact not found for meeting ${meetingId}`);
  const items = JSON.parse(row.action_items ?? "[]") as Record<string, unknown>[];
  if (itemIndex < 0 || itemIndex >= items.length) throw new Error(`Item index ${itemIndex} out of range`);
  const item = items[itemIndex];
  if (fields.description !== undefined) item.description = fields.description;
  if (fields.owner !== undefined) item.owner = fields.owner;
  if (fields.requester !== undefined) item.requester = fields.requester;
  if (fields.due_date !== undefined) item.due_date = fields.due_date;
  if (fields.priority !== undefined) item.priority = fields.priority;
  db.prepare("UPDATE artifacts SET action_items = ? WHERE meeting_id = ?").run(JSON.stringify(items), meetingId);
}

export function handleCreateActionItem(db: Database, meetingId: string, fields: EditActionItemFields): void {
  const row = getArtifact(db, meetingId);
  if (!row) throw new Error(`Artifact not found for meeting ${meetingId}`);
  const items = JSON.parse(row.action_items ?? "[]") as Record<string, unknown>[];
  const newIndex = items.length;
  items.push({
    description: fields.description ?? "",
    owner: fields.owner ?? "",
    requester: fields.requester ?? "",
    due_date: fields.due_date ?? null,
    priority: fields.priority ?? "normal",
    short_id: generateShortId(meetingId, newIndex),
  });
  db.prepare("UPDATE artifacts SET action_items = ? WHERE meeting_id = ?").run(JSON.stringify(items), meetingId);
}

export function handleCompleteActionItem(db: Database, meetingId: string, itemIndex: number, note: string): void {
  db.prepare(
    "INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET note = excluded.note, completed_at = excluded.completed_at",
  ).run(`${meetingId}:${itemIndex}`, meetingId, itemIndex, new Date().toISOString(), note);
}

export function handleUncompleteActionItem(db: Database, meetingId: string, itemIndex: number): void {
  db.prepare("DELETE FROM action_item_completions WHERE id = ?").run(`${meetingId}:${itemIndex}`);
}

export interface BatchItemResult {
  short_id: string;
  status: "completed" | "uncompleted" | "not_found";
}

export interface BatchResponse {
  results: BatchItemResult[];
}

export function handleBatchCompleteItems(db: Database, shortIds: string[], note: string): BatchResponse {
  const { resolved, not_found } = resolveShortIds(db, shortIds);
  const results: BatchItemResult[] = [];

  for (const item of resolved) {
    handleCompleteActionItem(db, item.meeting_id, item.item_index, note);
    results.push({ short_id: item.short_id, status: "completed" });
  }

  for (const sid of not_found) {
    results.push({ short_id: sid, status: "not_found" });
  }

  return { results };
}

export function handleBatchUncompleteItems(db: Database, shortIds: string[]): BatchResponse {
  const { resolved, not_found } = resolveShortIds(db, shortIds);
  const results: BatchItemResult[] = [];

  for (const item of resolved) {
    handleUncompleteActionItem(db, item.meeting_id, item.item_index);
    results.push({ short_id: item.short_id, status: "uncompleted" });
  }

  for (const sid of not_found) {
    results.push({ short_id: sid, status: "not_found" });
  }

  return { results };
}

export function handleGetCompletions(db: Database, meetingId: string): ActionItemCompletion[] {
  return db.prepare("SELECT * FROM action_item_completions WHERE meeting_id = ?").all(meetingId) as ActionItemCompletion[];
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

  const mentionRows = (db.prepare(
    `SELECT meeting_id, item_index, canonical_id,
      (SELECT COUNT(*) FROM item_mentions im2 WHERE im2.canonical_id = im.canonical_id) AS total_mentions
     FROM item_mentions im
     WHERE meeting_id IN (${placeholders}) AND item_type = 'action_items'`,
  ).all(...meetingIds) as { meeting_id: string; item_index: number; canonical_id: string; total_mentions: number }[]);

  const mentionMap = new Map<string, { canonical_id: string; total_mentions: number }>();
  for (const row of mentionRows) {
    mentionMap.set(`${row.meeting_id}:${row.item_index}`, { canonical_id: row.canonical_id, total_mentions: row.total_mentions });
  }

  const result: ClientActionItem[] = [];

  for (const meetingId of meetingIds) {
    const meeting = getMeeting(db, meetingId);
    if (!meeting) continue;
    const artifact = handleGetArtifact(db, meetingId);
    if (!artifact) continue;

    artifact.action_items.forEach((item, index) => {
      if (completed.has(`${meetingId}:${index}`)) return;
      const mention = mentionMap.get(`${meetingId}:${index}`);
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
        canonical_id: mention?.canonical_id,
        total_mentions: mention?.total_mentions,
        short_id: item.short_id,
      });
    });
  }

  let filtered = result;
  if (filters?.after) filtered = filtered.filter((i) => i.meeting_date >= filters.after!);
  if (filters?.before) filtered = filtered.filter((i) => i.meeting_date <= filters.before! + "T23:59:59Z");

  filtered.sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "critical" ? -1 : 1));
  return filtered;
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
    const clientRow = db.prepare("SELECT id FROM clients WHERE name = ?").get(req.clientName) as { id: string } | undefined;
    storeDetection(db, meetingId, [{ client_name: req.clientName, client_id: clientRow?.id ?? "", confidence: 1.0, method: "manual" }]);
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

export function handleUploadAsset(db: Database, meetingId: string, filename: string, mimeType: string, base64: string, assetsDir: string): AssetRow {
  const data = Buffer.from(base64, "base64");
  return storeAsset(db, meetingId, filename, mimeType, data, assetsDir);
}

export function handleGetMeetingAssets(db: Database, meetingId: string): AssetRow[] {
  return getAssets(db, meetingId);
}

export function handleDeleteAsset(db: Database, assetId: string, assetsDir: string): void {
  deleteAsset(db, assetId, assetsDir);
}

export function handleGetAssetData(db: Database, assetId: string, assetsDir: string): { data: string; filename: string; mimeType: string } | null {
  const result = getAssetData(db, assetId, assetsDir);
  if (!result) return null;
  return { data: result.data.toString("base64"), filename: result.filename, mimeType: result.mimeType };
}
export function handleRenameMeeting(db: Database, meetingId: string, newTitle: string): void {
  renameMeeting(db, meetingId, newTitle);
}

export function handleGetMeetingMessages(db: Database, meetingId: string): MeetingMessage[] {
  return getMeetingMessages(db, meetingId);
}

export async function handleMeetingChat(
  db: Database, llm: LlmAdapter, meetingId: string, message: string, includeTranscripts: boolean, template?: string, includeAssets?: boolean, attachments?: { name: string; base64: string; mimeType: string }[], noteIds?: string[],
): Promise<ConversationChatResponse> {
  appendMeetingMessage(db, { meeting_id: meetingId, role: "user", content: message });
  const history = getMeetingMessages(db, meetingId).map((m) => ({ role: m.role, content: m.content }));
  const result = await handleConversationChat(db, llm, {
    meetingIds: [meetingId],
    messages: history,
    attachments,
    includeTranscripts,
    template,
    includeAssets,
    noteIds,
  });
  appendMeetingMessage(db, { meeting_id: meetingId, role: "assistant", content: result.answer, sources: result.sources.length > 0 ? JSON.stringify(result.sources) : undefined });
  return result;
}

export function handleClearMeetingMessages(db: Database, meetingId: string): void {
  clearMeetingMessages(db, meetingId);
}

const ARTIFACT_SECTION_FIELDS = new Set(["summary", "decisions", "proposed_features", "open_questions", "risk_items"]);

export function handleUpdateArtifactSection(db: Database, meetingId: string, field: string, value: unknown): void {
  if (!ARTIFACT_SECTION_FIELDS.has(field)) throw new Error(`Invalid artifact field: ${field}`);
  const dbValue = field === "summary" ? String(value) : JSON.stringify(value);
  updateArtifact(db, meetingId, { [field]: dbValue });
}

export function handleGetTranscript(db: Database, meetingId: string): string | null {
  const meeting = getMeeting(db, meetingId);
  return meeting?.raw_transcript ?? null;
}

export function handleArtifactBatch(db: Database, meetingIds: string[]): Record<string, Artifact | null> {
  const result: Record<string, Artifact | null> = {};
  for (const id of meetingIds) {
    result[id] = handleGetArtifact(db, id);
  }
  return result;
}

export async function handleSplitMeeting(db: Database, meetingId: string, durations: number[]): Promise<SplitResult> {
  return splitMeeting(db, meetingId, durations);
}

export function handleGetMeetingLineage(db: Database, meetingId: string): { source: MeetingRow | null; children: MeetingRow[]; segment_index: number | null } {
  const source = getSourceMeeting(db, meetingId);
  const children = getChildMeetings(db, meetingId);
  const row = db.prepare("SELECT segment_index FROM meeting_lineage WHERE result_meeting_id = ?").get(meetingId) as { segment_index: number } | undefined;
  return { source, children, segment_index: row?.segment_index ?? null };
}
