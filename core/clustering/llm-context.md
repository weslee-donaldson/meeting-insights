# core/clustering/

Legacy clustering and tagging. Kept for backwards compatibility; not part of the active ingestion path.

## Files

| File | Purpose |
|------|---------|
| `kmeans.ts` | `clusterMeetings` (k-means++), `assignCluster`, `recluster`. Uses `table.query()` full scan, NOT KNN with zero vectors (unreliable for L2-normalized vectors) |
| `topics.ts` | `aggregateClusterSummaries`, `extractClusterTags`, `storeClusterTags`. LLM-driven cluster labeling |
| `tag-drift.ts` | `detectTagDrift(db, clusterIds)` -- cosine similarity threshold between current and historical cluster centroids |

## Parent

[core/llm-context.md](../llm-context.md)
