import { createLogger } from "./logger.js";
import type { DatabaseSync as Database } from "node:sqlite";
import type { LlmAdapter } from "./llm/adapter.js";

const log = createLogger("cluster:tags");

const VAGUE_TAGS = new Set([
  "discussion",
  "meeting",
  "conversation",
  "talk",
  "review",
  "update",
  "call",
  "session",
]);

export function aggregateClusterSummaries(db: Database, clusterId: string): string[] {
  const rows = db
    .prepare(
      `SELECT a.summary
       FROM meeting_clusters mc
       JOIN artifacts a ON a.meeting_id = mc.meeting_id
       WHERE mc.cluster_id = ?`,
    )
    .all(clusterId) as Array<{ summary: string }>;
  return rows.map((r) => r.summary);
}

export async function extractClusterTags(llm: LlmAdapter, summaries: string[]): Promise<string[]> {
  const content = summaries.join("\n\n");
  const result = await llm.complete("cluster_tags", content);
  const rawTags = (result.tags as string[]) ?? [];
  const tags = rawTags.filter((t) => !VAGUE_TAGS.has(t.toLowerCase())).slice(0, 7);
  log("generated tags: %o", tags);
  return tags;
}

export function storeClusterTags(db: Database, clusterId: string, tags: string[]): void {
  db.prepare("UPDATE clusters SET generated_tags = ? WHERE cluster_id = ?").run(JSON.stringify(tags), clusterId);
}
