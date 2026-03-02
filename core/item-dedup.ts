import { embed } from "./embedder.js";
import { createLogger } from "./logger.js";
import type { InferenceSession } from "onnxruntime-node";
import type { VectorTable } from "./vector-db.js";

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
