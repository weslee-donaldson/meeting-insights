import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "../../../core/llm-adapter.js";
import type { VectorDb } from "../../../core/vector-db.js";
import { hybridSearch } from "../../../core/hybrid-search.js";
import { deepSearch } from "../../../core/deep-search.js";
import { createMeetingTable } from "../../../core/vector-db.js";
import { buildEmbeddingInput, embedMeeting, storeMeetingVector } from "../../../core/meeting-pipeline.js";
import type { InferenceSession } from "onnxruntime-node";
import type { SearchRequest, SearchResultRow, DeepSearchRequest, DeepSearchResultRow } from "../channels.js";
import { SEARCH_MAX_DISTANCE, SEARCH_LIMIT, deepSearchPrompt } from "./config.js";
import { handleGetArtifact, clientNameForMeeting } from "./meetings.js";

function enrichSearchResults(db: Database, results: Array<{ meeting_id: string; score: number; client: string; meeting_type: string; date: string }>): SearchResultRow[] {
  const meetingIds = results.map((r) => r.meeting_id);
  if (meetingIds.length === 0) return [];

  const clusterRows = db.prepare(
    "SELECT mc.meeting_id, c.generated_tags FROM meeting_clusters mc JOIN clusters c ON mc.cluster_id = c.cluster_id"
  ).all() as { meeting_id: string; generated_tags: string | null }[];
  const tagsByMeeting = new Map<string, string[]>();
  for (const row of clusterRows) {
    if (!meetingIds.includes(row.meeting_id)) continue;
    const tags = row.generated_tags ? JSON.parse(row.generated_tags) as string[] : [];
    tagsByMeeting.set(row.meeting_id, tags);
  }

  const titleRows = db.prepare(
    "SELECT id, title FROM meetings WHERE id IN (" + meetingIds.map(() => "?").join(",") + ")"
  ).all(...meetingIds) as { id: string; title: string }[];
  const titleById = new Map(titleRows.map((r) => [r.id, r.title]));

  return results.map((r) => ({
    ...r,
    cluster_tags: tagsByMeeting.get(r.meeting_id) ?? [],
    series: (titleById.get(r.meeting_id) ?? "").toLowerCase().replace(/\s+/g, " ").trim(),
  }));
}

export async function handleSearchMeetings(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  req: SearchRequest,
): Promise<SearchResultRow[]> {
  const raw = await hybridSearch(db, vdb, session, req.query, {
    limit: SEARCH_LIMIT,
    client: req.client,
    maxDistance: SEARCH_MAX_DISTANCE,
    date_after: req.date_after,
    date_before: req.date_before,
  });
  return enrichSearchResults(db, raw);
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

export async function handleDeepSearch(
  db: Database,
  llm: LlmAdapter,
  req: DeepSearchRequest,
): Promise<DeepSearchResultRow[]> {
  return deepSearch(llm, db, req.meetingIds, req.query, deepSearchPrompt);
}
