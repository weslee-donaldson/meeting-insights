import { embed } from "../embedder.js";
import { createLogger } from "../logger.js";
import type { InferenceSession } from "onnxruntime-node";
import { searchWithFilters, type VectorSearchFilter, type VectorTable } from "../search/vector-db.js";
import type { DatabaseSync as Database } from "node:sqlite";

const log = createLogger("dedup:item");

interface ItemSearchResult {
  canonical_id: string;
  item_text: string;
  item_type: string;
  meeting_id: string;
  date: string;
  client: string;
  distance: number;
}

interface SearchSimilarItemsOptions {
  itemType?: string;
  client?: string;
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
  client: string,
  vec: Float32Array,
): Promise<void> {
  await table.add([
    {
      canonical_id: canonicalId,
      item_text: text,
      item_type: itemType,
      meeting_id: meetingId,
      date,
      client,
      vector: Array.from(vec),
    },
  ]);
  log("stored canonical=%s type=%s meeting=%s", canonicalId, itemType, meetingId);
}

export async function searchSimilarItemsByVector(
  table: VectorTable,
  vec: Float32Array,
  options: SearchSimilarItemsOptions = {},
): Promise<ItemSearchResult[]> {
  const filters: VectorSearchFilter[] = [];
  if (options.itemType) filters.push({ field: "item_type", op: "=", value: options.itemType });
  if (options.client) filters.push({ field: "client", op: "=", value: options.client });
  const rows = await searchWithFilters(table, vec, filters, options.limit ?? 10);
  const results: ItemSearchResult[] = rows.map((r: Record<string, unknown>) => ({
    canonical_id: r.canonical_id as string,
    item_text: r.item_text as string,
    item_type: r.item_type as string,
    meeting_id: r.meeting_id as string,
    date: r.date as string,
    client: r.client as string,
    distance: r._distance as number,
  }));
  log("results=%d", results.length);
  return results;
}

export async function searchSimilarItems(
  table: VectorTable,
  session: InferenceSession & { _tokenizer: unknown },
  text: string,
  options: SearchSimilarItemsOptions = {},
): Promise<ItemSearchResult[]> {
  const vec = await embed(session as Parameters<typeof embed>[0], text);
  const results = await searchSimilarItemsByVector(table, vec, options);
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
  meeting_title: string;
  meeting_date: string;
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
      SELECT im.canonical_id, im.meeting_id, im.item_type, im.item_index, im.item_text, im.first_mentioned_at,
             m.title AS meeting_title, m.date AS meeting_date
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

import { randomUUID } from "node:crypto";
import { isSemanticDuplicate, isStringDuplicate } from "../math.js";
import type { Artifact } from "../extractor.js";

interface DeduplicateItemsResult {
  mentionsCreated: number;
  duplicatesAutoCompleted: number;
}

export function getItemText(item: unknown, fieldType: string): string {
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;
    if (fieldType === "action_items" || fieldType === "risk_items") return (obj.description as string) ?? "";
    if (fieldType === "decisions") return (obj.text as string) ?? "";
  }
  return String(item);
}

export function getMeetingTitle(db: Database, meetingId: string): string {
  const row = db.prepare("SELECT title FROM meetings WHERE id = ?").get(meetingId) as { title: string } | undefined;
  return row?.title ?? "Unknown Meeting";
}

export const DEDUP_FIELDS: (keyof Artifact)[] = [
  "action_items",
  "decisions",
  "proposed_features",
  "open_questions",
  "risk_items",
];

function readDedupConfig(): { semanticThreshold: number; stringThreshold: number } {
  return {
    semanticThreshold: parseFloat(process.env.MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD ?? "0.80"),
    stringThreshold: parseFloat(process.env.MTNINSIGHTS_DEDUP_STRING_THRESHOLD ?? "0.90"),
  };
}

export async function deduplicateItems(
  db: Database,
  itemTable: VectorTable,
  session: InferenceSession & { _tokenizer: unknown },
  meetingId: string,
  artifact: Artifact,
  meetingDate: string,
  client: string,
): Promise<DeduplicateItemsResult> {
  let mentionsCreated = 0;
  let duplicatesAutoCompleted = 0;
  const { semanticThreshold, stringThreshold } = readDedupConfig();

  for (const field of DEDUP_FIELDS) {
    const items = artifact[field];
    if (!Array.isArray(items)) continue;

    for (let i = 0; i < items.length; i++) {
      const text = getItemText(items[i], field);
      if (!text) continue;

      const existing = await searchSimilarItems(itemTable, session, text, { itemType: field, client, limit: 1 });
      let canonicalId: string;
      let isDuplicate = false;

      if (existing.length > 0 && existing[0].meeting_id !== meetingId) {
        const match = existing[0];
        if (isStringDuplicate(text, match.item_text, stringThreshold) || isSemanticDuplicate(match.distance, semanticThreshold)) {
          canonicalId = match.canonical_id;
          isDuplicate = true;
        } else {
          canonicalId = randomUUID();
        }
      } else {
        canonicalId = randomUUID();
      }

      const vec = await embedItem(session, text);
      await storeItemVector(itemTable, canonicalId, text, field, meetingId, meetingDate, client, vec);
      recordMention(db, canonicalId, meetingId, field, i, text, meetingDate);
      mentionsCreated++;

      if (isDuplicate && field === "action_items") {
        const match = existing[0];
        const matchTitle = getMeetingTitle(db, match.meeting_id);
        const note = `[auto-dedup] First raised ${match.date} in '${matchTitle}'`;
        db.prepare(
          "INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET note = excluded.note, completed_at = excluded.completed_at",
        ).run(`${meetingId}:${i}`, meetingId, i, new Date().toISOString(), note);
        duplicatesAutoCompleted++;
        log("auto-completed duplicate action_item index=%d canonical=%s", i, canonicalId);
      }
    }
  }

  log("meeting=%s mentions=%d dupes_completed=%d", meetingId, mentionsCreated, duplicatesAutoCompleted);
  return { mentionsCreated, duplicatesAutoCompleted };
}
