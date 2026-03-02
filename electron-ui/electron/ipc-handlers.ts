import type { DatabaseSync as Database } from "node:sqlite";
import { getArtifact, extractSummary, storeArtifact } from "../../core/extractor.js";
import type { Artifact } from "../../core/extractor.js";
import { parseTranscriptBody } from "../../core/parser.js";
import { buildLabeledContext } from "../../core/labeled-context.js";
import { parseCitations } from "../../core/display-helpers.js";
import type { LlmAdapter } from "../../core/llm-adapter.js";
import { searchMeetings } from "../../core/vector-search.js";
import type { VectorDb } from "../../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { MeetingRow, ChatRequest, ChatResponse, MeetingFilters, SearchRequest, SearchResultRow, ActionItemCompletion } from "./channels.js";

interface ClientRow { name: string; }
interface DbMeetingRow { id: string; title: string; date: string; action_item_count: number; }
interface DetectionRow { meeting_id: string; client_name: string; }
interface RawMeetingRow { raw_transcript: string; }

export function handleGetClients(db: Database): string[] {
  const rows = db.prepare("SELECT name FROM clients ORDER BY name").all() as unknown as ClientRow[];
  return rows.map((r) => r.name);
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
    return "requester" in a ? a as Artifact["action_items"][number] : { ...a, requester: "" } as Artifact["action_items"][number];
  });
  return {
    summary: row.summary,
    decisions,
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items,
    architecture: JSON.parse(row.architecture ?? "[]"),
    open_questions: JSON.parse(row.open_questions ?? "[]"),
    risk_items: JSON.parse(row.risk_items ?? "[]"),
    additional_notes: JSON.parse(row.additional_notes ?? "[]"),
  };
}

const SYSTEM_PROMPT = `You are a meeting intelligence assistant. Answer the user's question using ONLY the provided meeting context.
Cite specific meetings using their labels [M1], [M2], etc. when referencing information.
If the answer cannot be found in the context, say so clearly.`;

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
  const answer = (result as { answer?: string }).answer ?? String(result);

  const citations = parseCitations(answer);
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

export function handleDeleteMeetings(db: Database, ids: string[]): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  db.prepare(`DELETE FROM client_detections WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM artifacts WHERE meeting_id IN (${placeholders})`).run(...ids);
  db.prepare(`DELETE FROM meetings WHERE id IN (${placeholders})`).run(...ids);
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
    limit: req.limit ?? 6,
    client: req.client,
    date_after: req.date_after,
    date_before: req.date_before,
  }) as Promise<SearchResultRow[]>;
}
