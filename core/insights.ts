import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";
import type { InferenceSession } from "onnxruntime-node";
import type { LlmAdapter } from "./llm-adapter.js";
import { getArtifact } from "./extractor.js";
import type { ArtifactRow } from "./extractor.js";
import { embed } from "./embedder.js";
import type { VectorDb } from "./vector-db.js";
import { createLogger } from "./logger.js";

export interface Insight {
  id: string;
  client_name: string;
  period_type: "day" | "week" | "month";
  period_start: string;
  period_end: string;
  status: "draft" | "final";
  rag_status: "red" | "yellow" | "green";
  rag_rationale: string;
  executive_summary: string;
  topic_details: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
  meeting_count?: number;
}

interface InsightRow {
  id: string;
  client_name: string;
  period_type: string;
  period_start: string;
  period_end: string;
  status: string;
  rag_status: string;
  rag_rationale: string;
  executive_summary: string;
  topic_details: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
  meeting_count?: number;
}

function rowToInsight(row: InsightRow): Insight {
  return {
    id: row.id,
    client_name: row.client_name,
    period_type: row.period_type as Insight["period_type"],
    period_start: row.period_start,
    period_end: row.period_end,
    status: row.status as Insight["status"],
    rag_status: row.rag_status as Insight["rag_status"],
    rag_rationale: row.rag_rationale,
    executive_summary: row.executive_summary,
    topic_details: row.topic_details,
    generated_at: row.generated_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...(row.meeting_count !== undefined ? { meeting_count: row.meeting_count } : {}),
  };
}

export interface CreateInsightInput {
  client_name: string;
  period_type: "day" | "week" | "month";
  period_start: string;
  period_end: string;
}

export function createInsight(db: Database, input: CreateInsightInput): Insight {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO insights (id, client_name, period_type, period_start, period_end, status, rag_status, rag_rationale, executive_summary, topic_details, generated_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'draft', 'green', '', '', '[]', ?, ?, ?)
  `).run(id, input.client_name, input.period_type, input.period_start, input.period_end, now, now, now);
  return rowToInsight(db.prepare("SELECT * FROM insights WHERE id = ?").get(id) as InsightRow);
}

export function getInsight(db: Database, id: string): Insight | null {
  const row = db.prepare("SELECT * FROM insights WHERE id = ?").get(id) as InsightRow | undefined;
  return row ? rowToInsight(row) : null;
}

export function listInsightsByClient(db: Database, clientName: string): Insight[] {
  const rows = db.prepare(`
    SELECT i.*, COUNT(im.meeting_id) AS meeting_count
    FROM insights i
    LEFT JOIN insight_meetings im ON i.id = im.insight_id
    WHERE i.client_name = ?
    GROUP BY i.id
    ORDER BY i.created_at DESC
  `).all(clientName) as InsightRow[];
  return rows.map(rowToInsight);
}

export interface UpdateInsightInput {
  status?: "draft" | "final";
  rag_status?: "red" | "yellow" | "green";
  rag_rationale?: string;
  executive_summary?: string;
  topic_details?: string;
}

export function updateInsight(db: Database, id: string, input: UpdateInsightInput): Insight {
  const current = db.prepare("SELECT * FROM insights WHERE id = ?").get(id) as InsightRow;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE insights SET
      status = ?,
      rag_status = ?,
      rag_rationale = ?,
      executive_summary = ?,
      topic_details = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    input.status ?? current.status,
    input.rag_status ?? current.rag_status,
    input.rag_rationale ?? current.rag_rationale,
    input.executive_summary ?? current.executive_summary,
    input.topic_details ?? current.topic_details,
    now,
    id,
  );
  return rowToInsight(db.prepare("SELECT * FROM insights WHERE id = ?").get(id) as InsightRow);
}

export function deleteInsight(db: Database, id: string): void {
  db.prepare("DELETE FROM insight_messages WHERE insight_id = ?").run(id);
  db.prepare("DELETE FROM insight_meetings WHERE insight_id = ?").run(id);
  db.prepare("DELETE FROM insights WHERE id = ?").run(id);
}

export interface InsightMeeting {
  insight_id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  contribution_summary: string;
}

export interface AddInsightMeetingInput {
  insight_id: string;
  meeting_id: string;
  contribution_summary: string;
}

export function addInsightMeeting(db: Database, input: AddInsightMeetingInput): void {
  db.prepare(`
    INSERT INTO insight_meetings (insight_id, meeting_id, contribution_summary)
    VALUES (?, ?, ?)
    ON CONFLICT(insight_id, meeting_id) DO UPDATE SET
      contribution_summary = excluded.contribution_summary
  `).run(input.insight_id, input.meeting_id, input.contribution_summary);
}

interface InsightMeetingRow {
  insight_id: string;
  meeting_id: string;
  contribution_summary: string;
  meeting_title: string;
  meeting_date: string;
}

export function getInsightMeetings(db: Database, insightId: string): InsightMeeting[] {
  const rows = db.prepare(`
    SELECT im.*, m.title AS meeting_title, m.date AS meeting_date
    FROM insight_meetings im
    JOIN meetings m ON im.meeting_id = m.id
    WHERE im.insight_id = ?
    ORDER BY m.date ASC
  `).all(insightId) as InsightMeetingRow[];
  return rows.map((r) => ({
    insight_id: r.insight_id,
    meeting_id: r.meeting_id,
    meeting_title: r.meeting_title,
    meeting_date: r.meeting_date,
    contribution_summary: r.contribution_summary,
  }));
}

export function discoverMeetingsForPeriod(db: Database, clientName: string, periodStart: string, periodEnd: string): string[] {
  const rows = db.prepare(`
    SELECT DISTINCT m.id FROM meetings m
    JOIN client_detections cd ON m.id = cd.meeting_id
    WHERE cd.client_name = ? AND m.date >= ? AND m.date <= ? AND m.ignored = 0
      AND cd.confidence = (SELECT MAX(cd2.confidence) FROM client_detections cd2 WHERE cd2.meeting_id = m.id)
    ORDER BY m.date ASC
  `).all(clientName, periodStart, periodEnd) as { id: string }[];
  return rows.map((r) => r.id);
}

export interface InsightMessage {
  id: string;
  insight_id: string;
  role: "user" | "assistant";
  content: string;
  sources: string | null;
  context_stale: boolean;
  stale_details: string | null;
  created_at: string;
}

export interface AppendInsightMessageInput {
  insight_id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string;
}

interface InsightMessageRow {
  id: string;
  insight_id: string;
  role: string;
  content: string;
  sources: string | null;
  context_stale: number;
  stale_details: string | null;
  created_at: string;
}

function rowToMessage(row: InsightMessageRow): InsightMessage {
  return {
    id: row.id,
    insight_id: row.insight_id,
    role: row.role as "user" | "assistant",
    content: row.content,
    sources: row.sources,
    context_stale: row.context_stale === 1,
    stale_details: row.stale_details,
    created_at: row.created_at,
  };
}

export function appendInsightMessage(db: Database, input: AppendInsightMessageInput): InsightMessage {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO insight_messages (id, insight_id, role, content, sources, context_stale, stale_details, created_at)
    VALUES (?, ?, ?, ?, ?, 0, NULL, ?)
  `).run(id, input.insight_id, input.role, input.content, input.sources ?? null, now);
  return rowToMessage(db.prepare("SELECT * FROM insight_messages WHERE id = ?").get(id) as InsightMessageRow);
}

export function getInsightMessages(db: Database, insightId: string): InsightMessage[] {
  const rows = db.prepare("SELECT * FROM insight_messages WHERE insight_id = ? ORDER BY created_at ASC").all(insightId) as InsightMessageRow[];
  return rows.map(rowToMessage);
}

export function clearInsightMessages(db: Database, insightId: string): void {
  db.prepare("DELETE FROM insight_messages WHERE insight_id = ?").run(insightId);
}

export function markInsightMessagesStale(db: Database, insightId: string, deletedMeetings: { id: string; title: string }[]): void {
  const staleDetails = JSON.stringify(deletedMeetings);
  db.prepare("UPDATE insight_messages SET context_stale = 1, stale_details = ? WHERE insight_id = ?").run(staleDetails, insightId);
}

const log = createLogger("insights");

function buildMeetingArtifactContext(meetingId: string, title: string, art: ArtifactRow): string {
  const parts: string[] = [`### Meeting: ${title} (${meetingId})`];
  parts.push(`Summary: ${art.summary}`);
  const decisions = JSON.parse(art.decisions ?? "[]") as Array<{ text: string }>;
  if (decisions.length > 0) {
    parts.push("Decisions:");
    for (const d of decisions) parts.push(`- ${d.text}`);
  }
  const actions = JSON.parse(art.action_items ?? "[]") as Array<{ description: string; owner: string }>;
  if (actions.length > 0) {
    parts.push("Action Items:");
    for (const a of actions) parts.push(`- ${a.description} (owner: ${a.owner})`);
  }
  const risks = JSON.parse(art.risk_items ?? "[]") as Array<{ description: string }>;
  if (risks.length > 0) {
    parts.push("Risks:");
    for (const r of risks) parts.push(`- ${r.description}`);
  }
  return parts.join("\n");
}

export async function generateInsight(db: Database, llm: LlmAdapter, insightId: string): Promise<Insight> {
  const insight = getInsight(db, insightId)!;
  const meetings = getInsightMeetings(db, insightId);
  if (meetings.length === 0) {
    log("no meetings linked to insight %s, skipping generation", insightId);
    return insight;
  }
  const contextParts: string[] = [];
  for (const m of meetings) {
    const art = getArtifact(db, m.meeting_id);
    if (art) contextParts.push(buildMeetingArtifactContext(m.meeting_id, m.meeting_title, art));
  }
  const prompt = `Client: ${insight.client_name}\nPeriod: ${insight.period_type} (${insight.period_start} to ${insight.period_end})\n\n${contextParts.join("\n\n")}`;
  const result = await llm.complete("generate_insight", prompt);
  const now = new Date().toISOString();
  const topicDetails = JSON.stringify(result.topic_details ?? []);
  db.prepare(`
    UPDATE insights SET
      rag_status = ?,
      rag_rationale = ?,
      executive_summary = ?,
      topic_details = ?,
      generated_at = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    result.rag_status as string,
    result.rag_rationale as string,
    result.executive_summary as string,
    topicDetails,
    now,
    now,
    insightId,
  );
  log("generated insight %s rag=%s meetings=%d", insightId, result.rag_status, meetings.length);
  return getInsight(db, insightId)!;
}

export async function getInsightChatContext(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  insightId: string,
  userMessage: string,
  includeTranscripts: boolean,
  topK: number = 7,
): Promise<{ systemContext: string; meetingIds: string[] }> {
  const insight = getInsight(db, insightId)!;
  const associated = getInsightMeetings(db, insightId);
  const parts: string[] = [
    `Insight: ${insight.client_name} — ${insight.period_type} (${insight.period_start} to ${insight.period_end})`,
  ];
  if (insight.executive_summary) parts.push(`Executive Summary: ${insight.executive_summary}`);
  if (associated.length === 0) {
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
  if (selectedIds.length > 0) {
    parts.push("\nRelevant Meetings:");
    for (const id of selectedIds) {
      const art = getArtifact(db, id);
      const meta = associated.find((m) => m.meeting_id === id);
      if (art && meta) {
        const content = includeTranscripts ? buildMeetingArtifactContext(id, meta.meeting_title, art) : `Summary: ${art.summary}`;
        parts.push(`- ${meta.meeting_title} (${meta.meeting_date}):\n  ${content.replace(/\n/g, "\n  ")}`);
      }
    }
  }
  return { systemContext: parts.join("\n"), meetingIds: selectedIds };
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computePeriodBounds(
  periodType: "day" | "week" | "month",
  referenceDate: string,
): { start: string; end: string } {
  const [year, month, day] = referenceDate.split("-").map(Number);
  if (periodType === "day") {
    return { start: referenceDate, end: referenceDate };
  }
  if (periodType === "week") {
    const d = new Date(year, month - 1, day);
    const dow = d.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(year, month - 1, day + mondayOffset);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return { start: formatDate(monday), end: formatDate(sunday) };
  }
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  return { start: formatDate(firstDay), end: formatDate(lastDay) };
}
