import { embed } from "./embedder.js";
import { createLogger } from "./logger.js";
import type { InferenceSession } from "onnxruntime-node";
import type { VectorTable } from "./vector-db.js";
import type { DatabaseSync as Database } from "node:sqlite";

const log = createLogger("dedup:item");

interface ItemSearchResult {
  canonical_id: string;
  item_text: string;
  item_type: string;
  meeting_id: string;
  date: string;
  distance: number;
}

interface SearchSimilarItemsOptions {
  itemType?: string;
  limit?: number;
}

export async function embedItem(
  session: InferenceSession & { _tokenizer: unknown },
  text: string,
): Promise<Float32Array> {
  return embed(session as Parameters<typeof embed>[0], text);
}

export async function storeItemVector(
  table: VectorTable,
  canonicalId: string,
  text: string,
  itemType: string,
  meetingId: string,
  date: string,
  vec: Float32Array,
): Promise<void> {
  await table.add([
    {
      canonical_id: canonicalId,
      item_text: text,
      item_type: itemType,
      meeting_id: meetingId,
      date,
      vector: Array.from(vec),
    },
  ]);
  log("stored canonical=%s type=%s meeting=%s", canonicalId, itemType, meetingId);
}

export async function searchSimilarItems(
  table: VectorTable,
  session: InferenceSession & { _tokenizer: unknown },
  text: string,
  options: SearchSimilarItemsOptions = {},
): Promise<ItemSearchResult[]> {
  const vec = await embed(session as Parameters<typeof embed>[0], text);
  let query = table.search(Array.from(vec)).limit(options.limit ?? 10);
  if (options.itemType) {
    query = query.where(`item_type = '${options.itemType}'`);
  }
  const rows = await query.toArray();
  const results: ItemSearchResult[] = rows.map((r: Record<string, unknown>) => ({
    canonical_id: r.canonical_id as string,
    item_text: r.item_text as string,
    item_type: r.item_type as string,
    meeting_id: r.meeting_id as string,
    date: r.date as string,
    distance: r._distance as number,
  }));
  log("search text=%s results=%d", text.slice(0, 40), results.length);
  return results;
}

interface ItemMention {
  canonical_id: string;
  meeting_id: string;
  item_type: string;
  item_index: number;
  item_text: string;
  first_mentioned_at: string;
}

interface MentionStat {
  canonical_id: string;
  item_type: string;
  item_index: number;
  mention_count: number;
  first_mentioned_at: string;
}

export function recordMention(
  db: Database,
  canonicalId: string,
  meetingId: string,
  itemType: string,
  itemIndex: number,
  itemText: string,
  meetingDate: string,
): void {
  const existing = db
    .prepare("SELECT first_mentioned_at FROM item_mentions WHERE canonical_id = ? ORDER BY first_mentioned_at ASC LIMIT 1")
    .get(canonicalId) as { first_mentioned_at: string } | undefined;

  const firstMentioned = existing
    ? (meetingDate < existing.first_mentioned_at ? meetingDate : existing.first_mentioned_at)
    : meetingDate;

  db.prepare(
    "INSERT INTO item_mentions (canonical_id, meeting_id, item_type, item_index, item_text, first_mentioned_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(canonicalId, meetingId, itemType, itemIndex, itemText, firstMentioned);

  if (existing && meetingDate < existing.first_mentioned_at) {
    db.prepare("UPDATE item_mentions SET first_mentioned_at = ? WHERE canonical_id = ?").run(meetingDate, canonicalId);
  }

  log("recorded mention canonical=%s meeting=%s", canonicalId, meetingId);
}

export function getMentionsByCanonical(db: Database, canonicalId: string): ItemMention[] {
  return db
    .prepare(`
      SELECT im.canonical_id, im.meeting_id, im.item_type, im.item_index, im.item_text, im.first_mentioned_at
      FROM item_mentions im
      JOIN meetings m ON m.id = im.meeting_id
      WHERE im.canonical_id = ?
      ORDER BY m.date ASC
    `)
    .all(canonicalId) as ItemMention[];
}

export function getMentionStats(db: Database, meetingId: string): MentionStat[] {
  return db
    .prepare(`
      SELECT
        im.canonical_id,
        im.item_type,
        im.item_index,
        (SELECT COUNT(*) FROM item_mentions im2 WHERE im2.canonical_id = im.canonical_id) AS mention_count,
        im.first_mentioned_at
      FROM item_mentions im
      WHERE im.meeting_id = ?
    `)
    .all(meetingId) as MentionStat[];
}

export function cleanupMentions(db: Database, meetingId: string): void {
  db.prepare("DELETE FROM item_mentions WHERE meeting_id = ?").run(meetingId);
  log("cleaned up mentions for meeting=%s", meetingId);
}

export async function cleanupItemVectors(table: VectorTable, meetingId: string): Promise<void> {
  await table.delete(`meeting_id = '${meetingId}'`);
  log("cleaned up item vectors for meeting=%s", meetingId);
}
