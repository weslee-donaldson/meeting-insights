import { embed } from "./embedder.js";
import { createLogger } from "./logger.js";
import type { InferenceSession } from "onnxruntime-node";
import type { VectorDb, VectorTable } from "./vector-db.js";

const log = createLogger("embed:feature");

interface FeatureVectorMetadata {
  client: string;
  date: string;
}

interface FeatureSearchOptions {
  limit: number;
}

interface FeatureSearchResult {
  feature_text: string;
  meeting_id: string;
  client: string;
  score: number;
}

export async function embedFeature(
  session: InferenceSession & { _tokenizer: unknown },
  featureText: string,
): Promise<Float32Array> {
  return embed(session as Parameters<typeof embed>[0], featureText);
}

export async function storeFeatureVector(
  table: VectorTable,
  featureText: string,
  meetingId: string,
  meta: FeatureVectorMetadata,
  vec: Float32Array,
): Promise<void> {
  await table.add([
    {
      feature_text: featureText,
      meeting_id: meetingId,
      client: meta.client,
      date: meta.date,
      vector: Array.from(vec),
    },
  ]);
}

export async function searchFeaturesByVector(
  vdb: VectorDb,
  vec: Float32Array,
  options: FeatureSearchOptions,
): Promise<FeatureSearchResult[]> {
  const table = await vdb.openTable("feature_vectors");
  const rows = await table.search(Array.from(vec)).limit(options.limit).toArray();
  const results: FeatureSearchResult[] = rows.map((r: Record<string, unknown>) => ({
    feature_text: r.feature_text as string,
    meeting_id: r.meeting_id as string,
    client: r.client as string,
    score: r._distance as number,
  }));
  log("results=%d", results.length);
  return results;
}

export async function searchFeatures(
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  query: string,
  options: FeatureSearchOptions,
): Promise<FeatureSearchResult[]> {
  const vec = await embed(session as Parameters<typeof embed>[0], query);
  const results = await searchFeaturesByVector(vdb, vec, options);
  log("query=%s results=%d", query, results.length);
  return results;
}
