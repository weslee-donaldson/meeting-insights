import { embed } from "./embedder.js";
import { searchMeetingsByVector } from "./vector-search.js";
import { searchFeaturesByVector } from "./feature-embedding.js";
import { searchSimilarItemsByVector } from "./item-dedup.js";
import { searchFts } from "./fts.js";
import { createLogger } from "./logger.js";
import type { InferenceSession } from "onnxruntime-node";
import type { VectorDb } from "./vector-db.js";
import type { DatabaseSync as Database } from "node:sqlite";

const log = createLogger("hybrid:search");

interface ScoredResult {
  meeting_id: string;
  score: number;
}

interface SearchResult {
  meeting_id: string;
  score: number;
  client: string;
  meeting_type: string;
  date: string;
}

interface HybridSearchOptions {
  limit: number;
  client?: string;
  maxDistance?: number;
}

export function mergeSearchResults(
  resultArrays: ScoredResult[][],
): Map<string, number> {
  const merged = new Map<string, number>();
  for (const results of resultArrays) {
    for (const r of results) {
      const existing = merged.get(r.meeting_id);
      if (existing === undefined || r.score < existing) {
        merged.set(r.meeting_id, r.score);
      }
    }
  }
  log("merged %d arrays → %d unique meetings", resultArrays.length, merged.size);
  return merged;
}

export function reciprocalRankFusion(
  rankedLists: { meeting_id: string }[][],
  k = 60,
): Map<string, number> {
  const scores = new Map<string, number>();
  for (const list of rankedLists) {
    for (let i = 0; i < list.length; i++) {
      const id = list[i].meeting_id;
      const rrf = 1 / (k + i + 1);
      scores.set(id, (scores.get(id) ?? 0) + rrf);
    }
  }
  log("rrf merged %d lists → %d unique meetings", rankedLists.length, scores.size);
  return scores;
}

function enrichFromDb(db: Database, meetingIds: string[]): Map<string, { client: string; meeting_type: string; date: string }> {
  const meta = new Map<string, { client: string; meeting_type: string; date: string }>();
  for (const id of meetingIds) {
    const meeting = db.prepare("SELECT meeting_type, date FROM meetings WHERE id = ?").get(id) as { meeting_type: string | null; date: string } | undefined;
    const detection = db.prepare("SELECT client_name FROM client_detections WHERE meeting_id = ? ORDER BY confidence DESC LIMIT 1").get(id) as { client_name: string } | undefined;
    meta.set(id, {
      client: detection?.client_name ?? "",
      meeting_type: meeting?.meeting_type ?? "",
      date: meeting?.date ?? "",
    });
  }
  return meta;
}

export async function hybridVectorSearch(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  query: string,
  options: HybridSearchOptions,
): Promise<SearchResult[]> {
  const vec = await embed(session as Parameters<typeof embed>[0], query);

  const tableNames = await vdb.tableNames();
  const hasFeatures = tableNames.includes("feature_vectors");
  const hasItems = tableNames.includes("item_vectors");

  const [meetingResults, featureResults, itemResults] = await Promise.all([
    searchMeetingsByVector(vdb, vec, { limit: options.limit, client: options.client }),
    hasFeatures
      ? searchFeaturesByVector(vdb, vec, { limit: options.limit })
      : Promise.resolve([]),
    hasItems
      ? vdb.openTable("item_vectors").then((table) => searchSimilarItemsByVector(table, vec, { limit: options.limit }))
      : Promise.resolve([]),
  ]);

  const merged = mergeSearchResults([
    meetingResults.map((r) => ({ meeting_id: r.meeting_id, score: r.score })),
    featureResults.map((r) => ({ meeting_id: r.meeting_id, score: r.score })),
    itemResults.map((r) => ({ meeting_id: r.meeting_id, score: r.distance })),
  ]);

  const filtered = options.maxDistance !== undefined
    ? new Map([...merged].filter(([, score]) => score <= options.maxDistance!))
    : merged;

  const meetingIds = [...filtered.keys()];
  const metaFromMeetingVectors = new Map(meetingResults.map((r) => [r.meeting_id, r]));
  const metaFromDb = enrichFromDb(db, meetingIds.filter((id) => !metaFromMeetingVectors.has(id)));

  const results: SearchResult[] = meetingIds.map((id) => {
    const mvMeta = metaFromMeetingVectors.get(id);
    const dbMeta = metaFromDb.get(id);
    return {
      meeting_id: id,
      score: filtered.get(id)!,
      client: mvMeta?.client ?? dbMeta?.client ?? "",
      meeting_type: mvMeta?.meeting_type ?? dbMeta?.meeting_type ?? "",
      date: mvMeta?.date ?? dbMeta?.date ?? "",
    };
  });

  results.sort((a, b) => a.score - b.score);
  log("query=%s results=%d", query, results.length);
  return results;
}

export async function hybridSearch(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  query: string,
  options: HybridSearchOptions,
): Promise<SearchResult[]> {
  const [vectorResults, ftsResults] = await Promise.all([
    hybridVectorSearch(db, vdb, session, query, options),
    Promise.resolve(searchFts(db, query, options.limit)),
  ]);

  const vectorRanked = vectorResults.map((r) => ({ meeting_id: r.meeting_id }));
  const ftsRanked = ftsResults.map((r) => ({ meeting_id: r.meeting_id }));

  const rrfScores = reciprocalRankFusion([vectorRanked, ftsRanked]);

  const metaFromVector = new Map(vectorResults.map((r) => [r.meeting_id, r]));
  const ftsOnlyIds = ftsResults
    .map((r) => r.meeting_id)
    .filter((id) => !metaFromVector.has(id));
  const metaFromDb = enrichFromDb(db, ftsOnlyIds);

  const results: SearchResult[] = [...rrfScores.keys()].map((id) => {
    const vMeta = metaFromVector.get(id);
    const dbMeta = metaFromDb.get(id);
    return {
      meeting_id: id,
      score: rrfScores.get(id)!,
      client: vMeta?.client ?? dbMeta?.client ?? "",
      meeting_type: vMeta?.meeting_type ?? dbMeta?.meeting_type ?? "",
      date: vMeta?.date ?? dbMeta?.date ?? "",
    };
  });

  results.sort((a, b) => b.score - a.score);
  log("hybrid query=%s results=%d", query, results.length);
  return results;
}
