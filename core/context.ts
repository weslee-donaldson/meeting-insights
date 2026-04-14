import { embed } from "./embedder.js";
import { createLogger } from "./logger.js";
import type { InferenceSession } from "onnxruntime-node";
import type { DatabaseSync as Database } from "node:sqlite";
import { searchWithFilters, type VectorSearchFilter, type VectorDb } from "./search/vector-db.js";
import type { ArtifactRow } from "./extractor.js";

const log = createLogger("context");

const APPROX_CHARS_PER_TOKEN = 5;

interface ContextOptions {
  limit: number;
  token_budget: number;
  client_filter?: string;
  client_id_filter?: string;
  meeting_type_filter?: string;
  date_after?: string;
  date_before?: string;
  deduplicate_clusters?: boolean;
}

interface ContextResult {
  curated_context: string;
  source_meeting_ids: string[];
}

export async function buildContext(
  db: Database,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  query: string,
  options: ContextOptions,
): Promise<ContextResult> {
  const vec = await embed(session as Parameters<typeof embed>[0], query);
  const table = await vdb.openTable("meeting_vectors");

  const baseFilters: VectorSearchFilter[] = [];
  if (options.meeting_type_filter) baseFilters.push({ field: "meeting_type", op: "=", value: options.meeting_type_filter });
  if (options.date_after) baseFilters.push({ field: "date", op: ">=", value: options.date_after });
  if (options.date_before) baseFilters.push({ field: "date", op: "<=", value: options.date_before });

  let rows: Record<string, unknown>[];
  if (options.client_id_filter) {
    const idFilters = [...baseFilters, { field: "client_id", op: "=" as const, value: options.client_id_filter }];
    rows = await searchWithFilters(table, vec, idFilters, options.limit);
    if (rows.length === 0 && options.client_filter) {
      const nameFilters = [...baseFilters, { field: "client", op: "=" as const, value: options.client_filter }];
      rows = await searchWithFilters(table, vec, nameFilters, options.limit);
    }
  } else {
    const filters = options.client_filter
      ? [...baseFilters, { field: "client", op: "=" as const, value: options.client_filter }]
      : baseFilters;
    rows = await searchWithFilters(table, vec, filters, options.limit);
  }

  const charBudget = options.token_budget * APPROX_CHARS_PER_TOKEN;
  const seenClusters = new Set<string>();
  const parts: string[] = [];
  const sourceIds: string[] = [];

  for (const row of rows as Array<Record<string, unknown>>) {
    const meetingId = row.meeting_id as string;

    if (options.deduplicate_clusters) {
      const clusterRow = db
        .prepare("SELECT cluster_id FROM meeting_clusters WHERE meeting_id = ?")
        .get(meetingId) as { cluster_id: string } | undefined;
      if (clusterRow) {
        if (seenClusters.has(clusterRow.cluster_id)) continue;
        seenClusters.add(clusterRow.cluster_id);
      }
    }

    const artifact = db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meetingId) as ArtifactRow | undefined;
    if (!artifact) continue;

    const chunk = `[Meeting: ${meetingId}]\n${artifact.summary}`;
    if (parts.reduce((sum, p) => sum + p.length, 0) + chunk.length > charBudget) continue;

    parts.push(chunk);
    sourceIds.push(meetingId);
  }

  const curatedContext = parts.join("\n\n");
  log("context size=%d chars sources=%d", curatedContext.length, sourceIds.length);
  return { curated_context: curatedContext, source_meeting_ids: sourceIds };
}
