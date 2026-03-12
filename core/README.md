# core/ — Pure business logic for meeting ingestion, extraction, search, and domain features

This directory contains the entire domain model. It has no imports from `electron-ui/` or `api/`; both those layers import from here. Everything in `core/` is testable in isolation using the stub LLM adapter and an in-memory SQLite database.

**Design principle:** `core/` is the dependency sink. It imports from Node built-ins and npm packages only. Nothing in this directory knows about IPC channels, Hono, or React.

## Files

### Infrastructure

| File | Purpose |
|------|---------|
| `logger.ts` | `createLogger(namespace)` returns a `debug`-package logger under `mtninsights:<namespace>`. Also exports `logLlmCall` (structured JSONL logging with truncation for non-debug levels) and `logApiCall`, both of which write to date-rotated `.jsonl` files in the configured log directory. Log level is controlled by `MTNINSIGHTS_LOG_LEVEL` or `setLogLevel()`. |
| `math.ts` | Pure numeric utilities: `cosineSimilarity`, `l2ToCosineSim`, `isSemanticDuplicate` (L2-distance to cosine threshold), `jaroWinklerSimilarity`, `isStringDuplicate`, `normalizeItemText`. Used by deduplication and tag-drift detection. |
| `db.ts` | `createDb(path)` opens a SQLite connection via `node:sqlite`. `migrate(db)` applies the full schema idempotently using `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` guards for additive columns. Tables: `meetings`, `artifacts`, `clients`, `client_detections`, `clusters`, `meeting_clusters`, `action_item_completions`, `item_mentions`, `artifact_fts` (FTS5), `threads`, `thread_meetings`, `thread_messages`, `insights`, `insight_meetings`, `insight_messages`, `milestones`, `milestone_mentions`, `milestone_action_items`, `milestone_messages`. |

### Parsing & Ingestion

| File | Purpose |
|------|---------|
| `parser.ts` | Parses Krisp transcript files. `parseFilename` extracts ISO timestamp and title from the filename. `splitSections` splits raw file content on the `Transcript:` delimiter. `parseAttendance` parses the JSON-like attendance block. `parseTranscriptBody` / `parseWebVttBody` / `parseMarkdownTranscriptBody` produce arrays of `SpeakerTurn`. `parseKrispFile` combines these for single-file transcripts; `parseKrispFolder` handles the folder-based manifest format. `listTranscriptFiles` and `parseManifest` support batch discovery. |
| `chunker.ts` | `chunkTranscript(turns, tokenLimit)` splits `SpeakerTurn[]` into sub-arrays that stay within an estimated token budget (character count / 4), enabling parallel LLM extraction on long transcripts. |
| `lifecycle.ts` | `moveToProcessed` and `moveToFailed` rename files between `raw-transcripts/`, `processed/`, and `failed-processing/` directories. `processDirectory` does a batch parse-and-move pass without LLM or DB, used for file-system triage. |
| `ingest.ts` | `ingestMeeting(db, parsed)` inserts a `ParsedMeeting` into the `meetings` table, generating a UUID if no `externalId` is set. `getMeeting(db, id)` retrieves a single `MeetingRow`. |

### LLM Layer

| File | Purpose |
|------|---------|
| `llm-adapter.ts` | Defines `LlmAdapter` (two methods: `complete(capability, content, attachments?)` → `Record<string, unknown>` and `converse(system, messages, attachments?)` → `string`) and the `LlmCapability` union (`extract_artifact` / `cluster_tags` / `generate_task` / `synthesize_answer` / `deep_search_filter` / `evaluate_thread` / `generate_insight`). `createLlmAdapter(config)` is the factory that selects a provider implementation. |
| `llm-provider-anthropic.ts` | Anthropic SDK adapter. Uses `claude-sonnet-4-6` by default. Raises `max_tokens` to 8192 for `extract_artifact` and `generate_insight`. Wraps responses with `withRepair` for JSON parse retries. Logs every call via `logLlmCall`. |
| `llm-provider-openai.ts` | OpenAI SDK adapter. Uses `gpt-4o` by default. Same `withRepair` / logging pattern as the Anthropic adapter. |
| `llm-provider-local.ts` | Ollama adapter over its `/api/chat` HTTP endpoint. Handles rate-limit (429) and server errors (5xx) with typed error prefixes. |
| `llm-provider-claudecli.ts` | Claude CLI adapter. Shells out to `claude --print --output-format json` via `execFile`. Maintains an in-process `sessionCache` (prefixHash → session_id) so multi-turn `converse()` calls resume via `--resume` rather than retransmitting full history. Activated via `MTNINSIGHTS_LLM_PROVIDER=claudecli`; no API key required. |
| `llm-provider-stub.ts` | Deterministic in-memory adapter. `STUB_FIXTURES` maps each `LlmCapability` to a fixed response object used in tests. |
| `llm-helpers.ts` | `stripCodeFences` removes markdown code fences from LLM output. `parseJsonOrThrow` parses cleaned text or throws a `[json_parse]`-prefixed error. `withRepair(call, content)` retries once with a repair prefix on JSON parse failure, then falls back to `{ __fallback: true, raw_text: ... }`. |

### Extraction

| File | Purpose |
|------|---------|
| `extractor.ts` | `extractSummary(adapter, turns, tokenLimit, promptTemplate?, refinementPrompt?)` chunks the transcript, calls `adapter.complete("extract_artifact", ...)` on each chunk in parallel, validates and merges the results into a single deduplicated `Artifact`. Throws if all chunks return fallback responses. `validateArtifact` normalises field shapes (string decisions, missing requester fields, etc.). `storeArtifact` and `getArtifact` persist and retrieve from the `artifacts` table. |
| `feature-embedding.ts` | `embedFeature` and `storeFeatureVector` embed and persist proposed-feature strings into the `feature_vectors` LanceDB table. `searchFeatures` / `searchFeaturesByVector` perform KNN lookup against that table. |

### Search & Embeddings

| File | Purpose |
|------|---------|
| `embedder.ts` | `loadModel(modelPath, tokenizerPath)` loads the `all-MiniLM-L6-v2` ONNX model and attaches a hand-rolled WordPiece tokenizer. `embed(session, text)` runs tokenization → ONNX inference → mean pooling → L2 normalization, returning a 384-dimensional unit `Float32Array`. |
| `vector-db.ts` | `connectVectorDb(path)` opens a LanceDB connection. `createMeetingTable`, `createFeatureTable`, and `createItemTable` create or open LanceDB tables with typed Arrow schemas (384-dim float32 vector + metadata fields). |
| `meeting-pipeline.ts` | `buildEmbeddingInput(artifact)` concatenates all text fields of an artifact into a single string for embedding. `embedMeeting` and `storeMeetingVector` embed and persist a meeting vector to the `meeting_vectors` table. |
| `vector-search.ts` | `searchMeetings(db, session, query, options)` embeds the query and runs a KNN search on `meeting_vectors` with optional `client`, `meeting_type`, and date filters. `searchMeetingsByVector` accepts a pre-computed vector. |
| `fts.ts` | Maintains the `artifact_fts` FTS5 virtual table. `updateFts` rebuilds one meeting's entry; `populateFts` rebuilds all. `searchFts` runs a BM25 query with `sanitizeFtsQuery` stripping FTS5 special characters. |
| `hybrid-search.ts` | `hybridSearch` combines `hybridVectorSearch` (meeting + feature + item vectors merged by minimum L2 distance) with `searchFts` via Reciprocal Rank Fusion, returning results sorted by descending RRF score. `mergeSearchResults` and `reciprocalRankFusion` are exported for independent use. |
| `deep-search.ts` | `deepSearch(llm, db, meetingIds, query)` runs an LLM filter (`deep_search_filter` capability) over a candidate meeting set in parallel, returning only meetings the model judges relevant, with a relevance score and summary. |
| `labeled-context.ts` | `buildLabeledContext(db, meetingIds)` assembles a `[M1]`-labeled context block per meeting (sorted newest-first) including artifact fields, mention-count annotations, and milestone links. Used as the system prompt context for chat endpoints. `buildDistilledContext` is a simpler variant without labels or annotations. |

### Clustering

| File | Purpose |
|------|---------|
| `clustering.ts` | `clusterMeetings(db, vdb, { k })` loads all meeting vectors via `table.query().limit(10000).toArray()` (full scan, not KNN), runs k-means++ clustering, and persists cluster assignments and centroid snapshots to `clusters` / `meeting_clusters`. `assignCluster` assigns a single vector to the nearest existing centroid. `recluster` is an alias for `clusterMeetings`. |
| `cluster-topics.ts` | `aggregateClusterSummaries` queries artifact summaries for all meetings in a cluster. `extractClusterTags` calls the LLM (`cluster_tags` capability) and filters out a hardcoded vague-tag list, capping at 7 tags. `storeClusterTags` persists tags to the `clusters` table. |
| `tag-drift.ts` | `detectTagDrift(db, clusterId, currentCentroid, threshold)` compares the stored centroid snapshot against the current centroid using cosine similarity, returning `{ drifted: boolean; magnitude: number }`. |

### Domain Features

| File | Purpose |
|------|---------|
| `threads.ts` | Full CRUD for `Thread` entities and their associated `ThreadMeeting` and `ThreadMessage` rows. `evaluateMeetingAgainstThread` calls the `evaluate_thread` LLM capability with a fill-in prompt. `getThreadCandidates` finds semantically similar meetings via vector search filtered to the client. `getThreadChatContext` selects the topK most relevant associated meetings for a user message and assembles a system prompt. `regenerateThreadSummary` and `evaluateConfirmedCandidates` handle bulk evaluation workflows. |
| `insights.ts` | CRUD for `Insight` entities (period-based client summaries with RAG status). `generateInsight` assembles meeting artifact context and calls the `generate_insight` LLM capability using a prompt template loaded from `config/prompts/insight-generation.md`. `getInsightChatContext` retrieves context for chat. `discoverMeetingsForPeriod` queries meetings within a date range for a client. `computePeriodBounds` computes start/end dates for day / week / month periods. |
| `timelines.ts` | Milestone tracking across meetings. `reconcileMilestones` matches extracted milestone titles against existing records by exact normalised match, then Dice coefficient fuzzy match (threshold 0.7), creating new milestones when no match is found. `getDateSlippage` returns target-date change history. Full CRUD for milestones, mentions, action-item links, and chat messages. `getMilestoneChatContext` assembles system context for milestone chat. |
| `item-dedup.ts` | Cross-meeting deduplication for action items, decisions, features, questions, and risks. `deduplicateItems` embeds each item, searches the `item_vectors` table, and uses `isStringDuplicate` + `isSemanticDuplicate` to assign canonical IDs. Duplicate action items are auto-completed with a provenance note. `recordMention` and `getMentionStats` maintain the `item_mentions` table for cross-meeting recurrence tracking. |
| `context.ts` | `buildContext(db, vdb, session, query, options)` runs a vector search with optional client/type/date filters, applies a character-based token budget, and optionally deduplicates by cluster. Used by the general chat flow. |
| `display-helpers.ts` | `parseCitations(text)` extracts `[M1]`-style citation indices. `replaceCitations(text, meetings)` substitutes them with meeting title and formatted date. `renderNotesGroups` formats the `additional_notes` array as indented plain text. |
| `task-generation.ts` | `generateTask(llm, curatedContext, taskIntent, sourceMeetingIds)` calls the `generate_task` LLM capability and returns a structured `GeneratedTask` with title, description, and acceptance criteria. |
| `feedback.ts` | Manual override functions that write directly to the DB: `overrideClient` rewrites a meeting's client detection record; `overrideTag` replaces a cluster's generated tags; `flagExtraction` sets `needs_reextraction = 1` on an artifact. |

### Orchestration

| File | Purpose |
|------|---------|
| `pipeline.ts` | `processNewMeetings(config)` is the end-to-end batch processor. For each unprocessed transcript (manifest-folder format or legacy flat files), it runs: parse → ingest → client detection → artifact extraction → milestone reconciliation → FTS update → item deduplication → meeting vector embedding → thread evaluation (cosine pre-filter then LLM eval for open threads). Failed entries are moved to `failed-processing/` and written to `data/audit/`. Emits `PipelineEvent` progress callbacks. |

## Related

- Parent: [Root README](../README.md)
- Consumed by `api/` (HTTP layer) and `electron-ui/electron/ipc-handlers.ts` (Electron IPC layer)
- CLI tools in `cli/` import directly from here
