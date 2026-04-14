# core/search/

Search implementations: full-text, vector, hybrid, deep re-rank.

## Files

| File | Purpose |
|------|---------|
| `vector-db.ts` | `connectVectorDb`, `createMeetingTable`, `createFeatureTable`, `createItemTable`, `searchWithFilters`. LanceDB connection + typed Arrow schemas (384-dim float32) |
| `vector-search.ts` | `searchMeetings(db, session, query, options)` -- embeds and runs KNN with optional client / meeting_type / date filters. `searchMeetingsByVector` for pre-computed vectors |
| `feature-embedding.ts` | Per-feature vectors for improved recall. `embedFeatures`, `searchFeaturesByVector` |
| `fts.ts` | SQLite FTS5 virtual table. `updateFts(db, meetingId)`, `populateFts(db)`, `searchFts` (BM25), `sanitizeFtsQuery` |
| `hybrid-search.ts` | `hybridSearch` combines vector + FTS via Reciprocal Rank Fusion. `mergeSearchResults`, `reciprocalRankFusion` |
| `deep-search.ts` | `deepSearch(llm, db, meetingIds, query)` -- parallel LLM filter over candidate meetings using `deep_search_filter` capability |

**Critical note:** Bulk vector retrieval uses `table.query().limit(N).toArray()` (full scan), NOT `table.search(zeroVec)`, which is unreliable for L2-normalized vectors.

## Parent

[core/llm-context.md](../llm-context.md)
