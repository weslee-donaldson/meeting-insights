import type { DatabaseSync as Database } from "node:sqlite";
import { getArtifact } from "../core/extractor.js";
import type { Artifact } from "../core/extractor.js";
import { buildLabeledContext } from "../core/labeled-context.js";
import { parseCitations } from "../core/display-helpers.js";
import type { LlmAdapter } from "../core/llm-adapter.js";
import { searchMeetings } from "../core/vector-search.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";
import type { MeetingRow, ChatRequest, ChatResponse, MeetingFilters, SearchRequest, SearchResultRow } from "./channels.js";

interface ClientRow { name: string; }
interface DbMeetingRow { id: string; title: string; date: string; }
interface DetectionRow { meeting_id: string; client_name: string; }

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
    .prepare("SELECT id, title, date FROM meetings ORDER BY date DESC")
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
  }));
}

export function handleGetArtifact(
  db: Database,
  meetingId: string,
): Artifact | null {
  const row = getArtifact(db, meetingId);
  if (!row) return null;
  return {
    summary: row.summary,
    decisions: JSON.parse(row.decisions ?? "[]"),
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items: JSON.parse(row.action_items ?? "[]"),
    technical_topics: JSON.parse(row.technical_topics ?? "[]"),
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

  const result = await llm.complete("synthesize_answer", prompt);
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
