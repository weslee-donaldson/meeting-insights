import { embed } from "./embedder.js";
import { createLogger } from "./logger.js";
import type { InferenceSession } from "onnxruntime-node";
import type { VectorDb } from "./vector-db.js";
import { searchWithFilters, type VectorSearchFilter } from "./vector-db.js";

const log = createLogger("vector:search");

interface SearchOptions {
  limit: number;
  client?: string;
  client_id?: string;
  meeting_type?: string;
  date_after?: string;
  date_before?: string;
  maxDistance?: number;
}

interface SearchResult {
  meeting_id: string;
  score: number;
  client: string;
  meeting_type: string;
  date: string;
}

export async function searchMeetingsByVector(
  db: VectorDb,
  vec: Float32Array,
  options: SearchOptions,
): Promise<SearchResult[]> {
  const table = await db.openTable("meeting_vectors");

  const baseFilters: VectorSearchFilter[] = [];
  if (options.meeting_type) baseFilters.push({ field: "meeting_type", op: "=", value: options.meeting_type });
  if (options.date_after) baseFilters.push({ field: "date", op: ">=", value: options.date_after });
  if (options.date_before) baseFilters.push({ field: "date", op: "<=", value: options.date_before });

  let rows: Record<string, unknown>[];
  if (options.client_id) {
    const idFilters = [...baseFilters, { field: "client_id", op: "=" as const, value: options.client_id }];
    rows = await searchWithFilters(table, vec, idFilters, options.limit);
    if (rows.length === 0 && options.client) {
      const nameFilters = [...baseFilters, { field: "client", op: "=" as const, value: options.client }];
      rows = await searchWithFilters(table, vec, nameFilters, options.limit);
    }
  } else {
    const filters = options.client
      ? [...baseFilters, { field: "client", op: "=" as const, value: options.client }]
      : baseFilters;
    rows = await searchWithFilters(table, vec, filters, options.limit);
  }
  const results: SearchResult[] = rows.map((r: Record<string, unknown>) => ({
    meeting_id: r.meeting_id as string,
    score: r._distance as number,
    client: r.client as string,
    meeting_type: r.meeting_type as string,
    date: r.date as string,
  }));

  const filtered = options.maxDistance !== undefined
    ? results.filter((r) => r.score <= options.maxDistance!)
    : results;
  log("results=%d filtered=%d", results.length, filtered.length);
  return filtered;
}

export async function searchMeetings(
  db: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  query: string,
  options: SearchOptions,
): Promise<SearchResult[]> {
  const vec = await embed(session as Parameters<typeof embed>[0], query);
  const results = await searchMeetingsByVector(db, vec, options);
  log("query=%s results=%d", query, results.length);
  return results;
}
