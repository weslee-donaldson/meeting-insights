# core/ — Pure business logic for meeting ingestion, extraction, search, and domain features

This directory contains the entire domain model. It has no imports from `electron-ui/` or `api/`; both those layers import from here. Everything in `core/` is testable in isolation using the stub LLM adapter and an in-memory SQLite database.

**Design principle:** `core/` is the dependency sink. It imports from Node built-ins and npm packages only. Nothing in this directory knows about IPC channels, Hono, or React.

## Files

### Infrastructure

| File | Purpose |
|------|---------|
| `logger.ts` | `createLogger(namespace)` returns a `debug`-package logger under `mtninsights:<namespace>`. Also exports `logLlmCall` (structured JSONL logging with truncation for non-debug levels) and `logApiCall`, both of which write to date-rotated `.jsonl` files in the configured log directory. Log level is controlled by `MTNINSIGHTS_LOG_LEVEL` or `setLogLevel()`. |
| `math.ts` | Pure numeric utilities: `cosineSimilarity`, `l2ToCosineSim`, `isSemanticDuplicate` (L2-distance to cosine threshold), `jaroWinklerSimilarity`, `isStringDuplicate`, `normalizeItemText`. Used by deduplication and tag-drift detection. |
| `db.ts` | `createDb(path)` opens a SQLite connection via `node:sqlite`. `migrate(db)` applies the full schema idempotently using `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` guards for additive columns. Tables: `meetings`, `artifacts`, `clients`, `client_detections`, `clusters`, `meeting_clusters`, `action_item_completions`, `item_mentions`, `artifact_fts` (FTS5), `threads`, `thread_meetings`, `thread_messages`, `insights`, `insight_meetings`, `insight_messages`, `milestones`, `milestone_mentions`, `milestone_action_items`, `milestone_messages`, `meeting_messages`, `notes`, `assets`, `tenants`, `users`, `tenant_memberships`. Migration includes a client PK migration from name-based to UUID-based primary keys (clients → clients_v2 rename) and backfills `client_id` columns on `threads`, `insights`, `milestones`, and `client_detections`. |
| `errors.ts` | Typed error hierarchy: `AppError` (base with `code` field), `ExtractionError`, `LlmError`, `ValidationError`, `PipelineError`. All extend `AppError` and carry a machine-readable `code` string for error discrimination. |
| `schemas.ts` | Zod v4 validation schemas for artifact fields: `DecisionSchema` (object or string coercion), `ActionItemSchema` (with priority, short_id, requester defaults), `RiskItemSchema` (with category enum), `MilestoneSchema`, and `ArtifactSchema` (top-level composite). Used by `extractor.ts` for LLM output validation. |

### Parsing & Ingestion

| File | Purpose |
|------|---------|
| `parser.ts` | Parses Krisp transcript files. `parseFilename` extracts ISO timestamp and title from the filename. `splitSections` splits raw file content on the `Transcript:` delimiter. `parseAttendance` parses the JSON-like attendance block. `parseTranscriptBody` / `parseWebVttBody` / `parseMarkdownTranscriptBody` produce arrays of `SpeakerTurn`. `parseKrispFile` combines these for single-file transcripts; `parseKrispFolder` handles the folder-based manifest format. `listTranscriptFiles` and `parseManifest` support batch discovery. `parseWebhookPayload` parses Krisp webhook JSON payloads into `ParsedMeeting` (returns null for non-`transcript_created` events or malformed input). `listWebhookFiles` returns sorted `*.json` filenames from a directory, returning `[]` for empty or non-existent paths. |
| `chunker.ts` | `chunkTranscript(turns, tokenLimit)` splits `SpeakerTurn[]` into sub-arrays that stay within an estimated token budget (character count / 4), enabling parallel LLM extraction on long transcripts. |
| `lifecycle.ts` | `moveToProcessed` and `moveToFailed` rename files between `raw-transcripts/`, `processed/`, and `failed-processing/` directories. `processDirectory` does a batch parse-and-move pass without LLM or DB, used for file-system triage. |
| `ingest.ts` | `ingestMeeting(db, parsed)` inserts a `ParsedMeeting` into the `meetings` table, generating a UUID if no `externalId` is set. `getMeeting(db, id)` retrieves a single `MeetingRow`. |
| `client-registry.ts` | `seedClients(db, clients)` inserts client records from `config/clients.json` into the `clients` table, upserting existing entries. `getClientByName`, `getClientByAlias`, `getClientById`, `getAllClients`, and `getDefaultClient` query the registry. All query functions accept an optional `tenantId` parameter for tenant-scoped lookups. `ClientRow` includes `id` (UUID) and `tenant_id` fields. Each client carries aliases, known_participants, meeting_names, client_team, implementation_team, glossary, and an optional refinement_prompt for LLM extraction. |
| `resolve-client.ts` | `resolveClient(db, clientParam, tenantId?)` accepts a `?client=` parameter that may be a client name or UUID and returns the matching `ClientRow` or `null`. UUID detection uses a leading hex-octet regex. Supports optional `tenantId` scoping. Used by all API route files to normalize client parameters. |
| `client-detection.ts` | `detectClient(db, meeting)` auto-detects which client a meeting belongs to via participant email domains, alias matching, and meeting name token matching. `storeDetection(db, meetingId, result)` persists the detection with a confidence score. Also exports `normalizeTokens` and `parseSpeakerNames` for text normalization. |

### LLM Layer

| File | Purpose |
|------|---------|
| `llm-adapter.ts` | Defines `LlmAdapter` (two methods: `complete(capability, content, attachments?)` → `Record<string, unknown>` and `converse(system, messages, attachments?)` → `string`) and the `LlmCapability` union (`extract_artifact` / `cluster_tags` / `generate_task` / `synthesize_answer` / `deep_search_filter` / `evaluate_thread` / `generate_insight` / `dedup_intent`). `createLlmAdapter(config)` is the factory that selects a provider implementation. |
| `llm-provider-anthropic.ts` | Anthropic SDK adapter. Uses `claude-sonnet-4-6` by default. Raises `max_tokens` to 8192 for `extract_artifact` and `generate_insight`. Wraps responses with `withRepair` for JSON parse retries. Logs every call via `logLlmCall`. |
| `llm-provider-openai.ts` | OpenAI SDK adapter. Uses `gpt-4o` by default. Same `withRepair` / logging pattern as the Anthropic adapter. |
| `llm-provider-local.ts` | Ollama adapter over its `/api/chat` HTTP endpoint. Handles rate-limit (429) and server errors (5xx) with typed error prefixes. |
| `llm-provider-claudecli.ts` | Claude CLI adapter. Shells out to `claude --print --output-format json` via `execFile`. Maintains an in-process `sessionCache` (prefixHash → session_id) so multi-turn `converse()` calls resume via `--resume` rather than retransmitting full history. Activated via `MTNINSIGHTS_LLM_PROVIDER=claudecli`; no API key required. |
| `llm-provider-claudeapi.ts` | Claude API HTTP adapter. Posts to a local Claude API proxy server (configurable `baseUrl`). Maintains a `sessionCache` (hash → session_id) for multi-turn `converse()` resumption. Handles rate limits (429) and server errors (5xx). Activated via `MTNINSIGHTS_LLM_PROVIDER=claudeapi`. |
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
| `item-dedup.ts` | Cross-meeting deduplication for action items, decisions, features, questions, and risks. `deduplicateItems` embeds each item, searches the `item_vectors` table (scoped by client), and uses `isStringDuplicate` + `isSemanticDuplicate` to assign canonical IDs. Duplicate action items are auto-completed with an `[auto-dedup]` provenance note. `recordMention` and `getMentionStats` maintain the `item_mentions` table for cross-meeting recurrence tracking. Also exports `getItemText`, `getMeetingTitle`, and `DEDUP_FIELDS` for use by `deep-dedup.ts`. |
| `deep-dedup.ts` | LLM-based intent clustering for action item deduplication. `deepScanClient` gathers all action items for a client, filters out `"low"` priority items, caps at `MTNINSIGHTS_DEDUP_BATCH_SIZE` per priority group (most recent by meeting date), and makes a single LLM call (`dedup_intent` capability) that returns intent groupings. Items in the same group share a canonical_id; duplicates are auto-completed with `[auto-dedup-deep]` notes. Helper functions: `buildBatchDedupPrompt` (template + item list → prompt), `filterAndCapItems` (priority filter + batch size cap), `parseBatchDedupResponse` (validates LLM output), `assignCanonicalGroups` (UUID assignment from groups). |
| `context.ts` | `buildContext(db, vdb, session, query, options)` runs a vector search with optional client/type/date filters, applies a character-based token budget, and optionally deduplicates by cluster. Used by the general chat flow. |
| `display-helpers.ts` | `parseCitations(text)` extracts `[M1]`-style citation indices. `replaceCitations(text, meetings)` substitutes them with meeting title and formatted date. `renderNotesGroups` formats the `additional_notes` array as indented plain text. |
| `task-generation.ts` | `generateTask(llm, curatedContext, taskIntent, sourceMeetingIds)` calls the `generate_task` LLM capability and returns a structured `GeneratedTask` with title, description, and acceptance criteria. |
| `feedback.ts` | Manual override functions that write directly to the DB: `overrideClient` rewrites a meeting's client detection record; `overrideTag` replaces a cluster's generated tags; `flagExtraction` sets `needs_reextraction = 1` on an artifact. |
| `notes.ts` | Universal annotation CRUD for meetings, insights, milestones, and threads. `createNote`, `listNotes`, `getNote`, `updateNote`, `deleteNote`, `countNotes`. Notes have `objectType` (meeting/insight/milestone/thread), `objectId`, `title`, `body`, and `noteType` (user vs auto-generated). |
| `assets.ts` | File upload and storage tied to meetings. `storeAsset` writes a binary file to disk and records metadata (filename, mime_type, file_size, storage_path) in the `assets` table. `deleteAsset` removes both the file and DB record. `getAssetData` retrieves the binary content by asset ID. |
| `meeting-messages.ts` | Per-meeting stateful chat history. `appendMeetingMessage` inserts a user or assistant message with optional JSON sources. `getMeetingMessages` returns the conversation for a meeting sorted by creation date. `clearMeetingMessages` wipes the history. Used by the meeting detail chat panel. |
| `format-owner.ts` | `formatOwner(name, mode)` formats a person's name by density mode: `comfortable` returns the full name, `compact` returns first name + last initial, `dense` returns initials only. Used in action item displays across density settings. |
| `meeting-split.ts` | Splits a multi-meeting recording into separate `meetings` rows. `computeCutPoints(durations)` converts minute-based durations to millisecond cut timestamps. `rebaseTimestamps(turns, offset, duration)` filters and re-origins transcript turns into a segment's time window. `partitionTurns(transcript, cutPoints)` divides turns into N arrays. `reconstructTranscript(turns)` serialises a turn array back to string. `deriveParticipants(turns)` extracts distinct speaker names. `validateSplitRequest(totalMs, durations)` ensures durations sum ≤ total and are all positive. `cleanupArchivedMeeting(db, meetingId, vdb?)` deletes artifacts, FTS, detections, cluster links, and item_mentions for the source meeting, and removes LanceDB vectors from the meeting and item tables. `splitMeeting(db, meetingId, durations, vdb?)` orchestrates the full split: validates, partitions transcript, inserts N new meeting rows with rebased data, writes `meeting_lineage` rows, marks source as `ignored=1`, calls `cleanupArchivedMeeting`, and returns `SplitResult`. `reprocessSplitSegments(db, result, deps)` runs `detectClient` + `extractSummary` + `embedMeeting` for each segment, catching per-segment errors so partial failures don't block. `getSourceMeeting(db, meetingId)` and `getChildMeetings(db, meetingId)` query the `meeting_lineage` table for lineage navigation. `getSplitLineage(db, meetingId)` returns the full lineage subtree. |

### Authentication & Authorization (`auth/`)

| File | Purpose |
|------|---------|
| `auth/scopes.ts` | Defines `VALID_SCOPES` constant array, `Scope` type, `isValidScope` guard, `AuthIdentity` interface, and `scopesForRoute(method, path)` which maps HTTP method + path to required scopes via a `ROUTE_RULES` table. |
| `auth/jwt.ts` | RSA key management and JWT signing/verification. `generateKeyPair()` creates RS256 keys. `loadOrCreateKeys(keysDir)` loads PEM files from disk or generates and persists new ones. `signAccessToken`/`verifyAccessToken` (1h, audience `mtninsights-api`) and `signRefreshToken`/`verifyRefreshToken` (30d, audience `mtninsights-refresh`). |
| `auth/api-keys.ts` | API key lifecycle. `generateApiKey()` produces `mki_`-prefixed keys with SHA-256 hashes. `createApiKey` inserts into `api_keys` table. `validateApiKey` verifies and updates `last_used_at`. `revokeApiKey` sets `revoked = 1`. `listApiKeys` returns all keys for a tenant (without exposing hashes). |
| `auth/oauth-clients.ts` | OAuth client registration and management. `registerOAuthClient` creates a client with optional `client_secret` (generated for `client_credentials` grant type). `authenticateOAuthClient` verifies client_id + secret. `getOAuthClient`, `listOAuthClients`, `revokeOAuthClient` for CRUD. |
| `auth/token-service.ts` | Token issuance and rotation. `issueTokenPair` mints access + optional refresh JWTs and records them in `oauth_tokens`. `refreshTokens` validates and rotates a refresh token (single-use). `revokeToken` and `isTokenRevoked` for revocation checks. |
| `auth/pkce.ts` | PKCE utilities. `generateCodeVerifier`, `computeCodeChallenge` (S256), and `verifyCodeChallenge`. |
| `auth/auth-codes.ts` | Authorization code grant flow. `createAuthorizationCode` stores a time-limited code with PKCE challenge. `exchangeAuthorizationCode` validates code, client, redirect URI, and PKCE verifier, then marks the code as used. |

### Health Monitoring

| File | Purpose |
|------|---------|
| `system-health.ts` | Error tracking and health status. `recordSystemError(db, { error_type, message, meeting_filename?, provider? })` inserts a row into `system_errors`, derives severity (`api_error` → critical, others → warning), and auto-acknowledges new errors matching an active 1-hour cooldown window. Wrapped in try/catch so monitoring never crashes the pipeline. `getHealthStatus(db)` returns `HealthStatus`: prunes rows older than 90 days, groups unacknowledged critical errors into `ErrorGroup[]` with resolution hints, counts meetings without artifacts (time-gated to >5 min old), and derives overall status. `acknowledgeErrors(db, ids)` and `acknowledgeAllErrors(db)` set `acknowledged=1` and `acknowledged_until=+1 hour` to suppress repeat banners during sustained outages. |
| `notifier.ts` | SMTP email alerting. `createNotifier(config)` returns a `Notifier` with `sendAlert(db, error)`. When config is null, returns a no-op. Throttle: skips sending if any row has `last_notified_at > now()-15min`; on send, sets `notified=1, last_notified_at=now()`. Email body includes error type, provider, message, meeting filename, affected meeting count, and resolution hint. Send failures are logged to stderr and never propagate. |

### Orchestration

| File | Purpose |
|------|---------|
| `pipeline.ts` | `processNewMeetings(config)` is the end-to-end batch processor. When optional `webhookRawDir`/`webhookProcessedDir`/`webhookFailedDir` fields are set, it first delegates to `processWebhookMeetings` to process webhook JSON payloads; webhook-ingested meeting IDs are then naturally deduplicated by the manifest path. For each unprocessed transcript (manifest-folder format or legacy flat files), it runs: parse → ingest → client detection → artifact extraction → milestone reconciliation → FTS update → item deduplication → optional deep scan (`MTNINSIGHTS_DEDUP_DEEP=1`) → meeting vector embedding → thread evaluation (cosine pre-filter then LLM eval for open threads). `processWebhookMeetings(config)` scans a webhook directory for `*.json` files, parses via `parseWebhookPayload`, deduplicates by meeting ID, and delegates to the shared `processEntry` inner loop. Both functions return `PipelineResult` and emit `PipelineEvent` progress callbacks. Failed entries are moved to their respective failed directories and written to `data/audit/`. |

## Related

- Parent: [root llm-context-summary](../llm-context-summary.md)
- Consumed by `api/` (HTTP layer) and `electron-ui/electron/ipc-handlers.ts` (Electron IPC layer)
- CLI tools in `cli/` import directly from here
