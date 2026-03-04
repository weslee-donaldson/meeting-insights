import type { DatabaseSync as Database } from "node:sqlite";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { getArtifact, extractSummary, storeArtifact } from "../../core/extractor.js";
import type { Artifact } from "../../core/extractor.js";
import { parseTranscriptBody } from "../../core/parser.js";
import { buildLabeledContext, buildDistilledContext } from "../../core/labeled-context.js";
import { getMeeting } from "../../core/ingest.js";
import { parseCitations, replaceCitations } from "../../core/display-helpers.js";
import type { LlmAdapter } from "../../core/llm-adapter.js";
import { searchMeetings } from "../../core/vector-search.js";
import { createMeetingTable } from "../../core/vector-db.js";
import type { VectorDb } from "../../core/vector-db.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "../../core/meeting-pipeline.js";
import type { InferenceSession } from "onnxruntime-node";
import type { MeetingRow, ChatRequest, ChatResponse, ConversationChatRequest, ConversationChatResponse, MeetingFilters, SearchRequest, SearchResultRow, ActionItemCompletion, ItemHistoryEntry, MentionStat, ClientActionItem } from "./channels.js";
import { cleanupMentions, getMentionsByCanonical, getMentionStats } from "../../core/item-dedup.js";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../..");
const CHAT_GUIDELINES_PATH = join(REPO_ROOT, "config/chat-guidelines.md");
const chatGuidelines = existsSync(CHAT_GUIDELINES_PATH) ? readFileSync(CHAT_GUIDELINES_PATH, "utf8") : "";

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
interface DetectionRow { meeting_id: string; client_name: string; }
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

function topClientForMeeting(
  db: Database,
  meetingId: string,
): string {
  const row = db
    .prepare(
      "SELECT client_name FROM client_detections WHERE meeting_id = ? ORDER BY confidence DESC LIMIT 1",
    )
    .get(meetingId) as { client_name: string } | undefined;
  return row?.client_name ?? "";
}

export function handleGetMeetings(
  db: Database,
  opts: MeetingFilters,
): MeetingRow[] {
  let rows = db
    .prepare(
      "SELECT m.id, m.title, m.date, COALESCE(json_array_length(a.action_items), 0) AS action_item_count FROM meetings m LEFT JOIN artifacts a ON m.id = a.meeting_id WHERE m.ignored = 0 ORDER BY m.date DESC",
    )
    .all() as unknown as DbMeetingRow[];

  if (opts.after) rows = rows.filter((r) => r.date >= opts.after!);
  if (opts.before)
    rows = rows.filter((r) => r.date <= opts.before! + "T23:59:59Z");
  if (opts.client) {
    const clientIds = new Set(
      (
        db
          .prepare(
            "SELECT meeting_id FROM client_detections WHERE client_name = ?",
          )
          .all(opts.client) as unknown as DetectionRow[]
      ).map((r) => r.meeting_id),
    );
    rows = rows.filter((r) => clientIds.has(r.id));
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date,
    client: topClientForMeeting(db, r.id),
    series: normalizeSeries(r.title),
    actionItemCount: r.action_item_count,
  }));
}

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
  const system = [SYSTEM_PROMPT, templateContent, `Meeting Context:\n${contextText}`].filter(Boolean).join("\n\n");

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
  const artifact = await extractSummary(llm, turns, 8000);
  db.prepare("DELETE FROM artifacts WHERE meeting_id = ?").run(meetingId);
  storeArtifact(db, meetingId, artifact);
}

export function handleSetIgnored(db: Database, meetingId: string, ignored: boolean): void {
  db.prepare("UPDATE meetings SET ignored = ? WHERE id = ?").run(ignored ? 1 : 0, meetingId);
}

export function handleReassignClient(db: Database, meetingId: string, clientName: string): void {
  db.prepare("DELETE FROM client_detections WHERE meeting_id = ?").run(meetingId);
  db.prepare(
    "INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, 1.0, 'manual')",
  ).run(meetingId, clientName);
}

export async function handleDeleteMeetings(db: Database, vdb: VectorDb | null, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  for (const id of ids) cleanupMentions(db, id);
  db.prepare(`DELETE FROM action_item_completions WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM client_detections WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM artifacts WHERE meeting_id IN (${placeholders})`).run(...ids);
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
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  req: SearchRequest,
): Promise<SearchResultRow[]> {
  return searchMeetings(vdb, session, req.query, {
    limit: SEARCH_LIMIT,
    client: req.client,
    date_after: req.date_after,
    date_before: req.date_before,
    maxDistance: SEARCH_MAX_DISTANCE,
  }) as Promise<SearchResultRow[]>;
}

export function handleGetItemHistory(db: Database, canonicalId: string): ItemHistoryEntry[] {
  return getMentionsByCanonical(db, canonicalId);
}

export function handleGetMentionStats(db: Database, meetingId: string): MentionStat[] {
  return getMentionStats(db, meetingId);
}

export function handleGetClientActionItems(db: Database, clientName: string): ClientActionItem[] {
  const meetingIds = (db.prepare(
    "SELECT DISTINCT meeting_id FROM client_detections WHERE client_name = ?",
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

  result.sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "critical" ? -1 : 1));
  return result;
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
    const detection = db.prepare(
      "SELECT client_name FROM client_detections WHERE meeting_id = ? ORDER BY confidence DESC LIMIT 1",
    ).get(meeting.id) as { client_name: string } | undefined;
    const client = detection?.client_name ?? "";
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

  const detection = db.prepare(
    "SELECT client_name FROM client_detections WHERE meeting_id = ? ORDER BY confidence DESC LIMIT 1",
  ).get(meetingId) as { client_name: string } | undefined;
  const client = detection?.client_name ?? "";

  const meeting = db.prepare("SELECT title, date FROM meetings WHERE id = ?").get(meetingId) as { title: string; date: string };
  const vec = await embedMeeting(session, buildEmbeddingInput(artifact));
  await storeMeetingVector(table, meetingId, vec, {
    client,
    meeting_type: meeting.title,
    date: meeting.date,
  });
}
