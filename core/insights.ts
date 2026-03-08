import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";

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
