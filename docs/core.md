# Core (Business Logic Layer)

The `core/` directory is the domain model. It contains everything that turns a raw Krisp transcript into structured, searchable, clustered knowledge.

## Overview

**Design principle:** `core/` is the dependency sink. Nothing in this directory imports from `api/` or `electron-ui/`. Both layers depend on `core/`, never the other way around. `core/` imports only Node built-ins and npm packages.

**Testability:** Every module is testable in isolation. Tests use:

- An in-memory SQLite database via `createDb(":memory:")`
- The stub LLM adapter (`llm-provider-stub.ts`) for deterministic fixture responses
- An in-memory LanceDB connection for vector operations

Because `core/` has no knowledge of IPC channels, Hono handlers, or React components, behavioral tests drive design directly without mocking the transport layer.

## Pipeline (`core/pipeline.ts`)

`processNewMeetings(config)` is the end-to-end batch processor that turns unprocessed transcripts into fully indexed, embedded, cross-referenced meetings. It emits `PipelineEvent` progress callbacks and returns a `PipelineResult` summary.

The flow for each meeting:

1. **Parse** -- Read the Krisp file (manifest folder, legacy flat file, or webhook JSON) via `parser.ts` into a `ParsedMeeting`.
2. **Ingest** -- Insert the meeting row via `ingestMeeting()`, generating a UUID if no externalId exists.
3. **Detect client** -- Run `detectClient()` against the participant list, aliases, and meeting name; store the result via `storeDetection()`.
4. **Extract artifact** -- Call `extractSummary()` which chunks the transcript, runs parallel LLM extractions, validates with Zod, and merges into a single `Artifact`.
5. **Reconcile milestones** -- Match extracted milestone titles against existing records via `reconcileMilestones()` using exact then Dice coefficient fuzzy matching (threshold 0.7).
6. **Update FTS** -- Rebuild the meeting's entry in `artifact_fts` via `updateFts()`.
7. **Dedup items** -- Run `deduplicateItems()` for action items, decisions, features, questions, and risks. Optional `MTNINSIGHTS_DEDUP_DEEP=1` triggers `deepScanClient()` for LLM-based intent clustering.
8. **Embed** -- Compute a meeting vector via `embedMeeting()` and persist to LanceDB via `storeMeetingVector()`.
9. **Evaluate threads** -- Cosine pre-filter followed by LLM evaluation for open threads within the meeting's client.

When webhook directories are configured, `processWebhookMeetings()` runs first, parsing `*.json` payloads and feeding them through the shared `processEntry` inner loop. Failed entries are moved to the configured failed directory and a row is written to `data/audit/`.

## Parser (`core/parser.ts`)

**Input:** A Krisp transcript `.md` file (single-file or manifest-folder format) or a Krisp webhook JSON payload.
**Output:** `ParsedMeeting` with `SpeakerTurn[]` and `Participant[]`.

Key functions:

- `parseFilename(name)` -- Extracts ISO timestamp and title from the filename.
- `splitSections(content)` -- Splits raw file content on the `Transcript:` delimiter.
- `parseAttendance(block)` -- Parses the JSON-like attendance block into participants.
- `parseTranscriptBody(body)` / `parseWebVttBody(body)` / `parseMarkdownTranscriptBody(body)` -- Produce `SpeakerTurn[]` from different transcript formats.
- `parseKrispFile(path)` -- Combines the above for single-file transcripts.
- `parseKrispFolder(path)` -- Handles the folder-based manifest format.
- `parseWebhookPayload(json)` -- Parses Krisp webhook JSON; returns `null` for non-`transcript_created` events or malformed input.
- `listTranscriptFiles(dir)` and `listWebhookFiles(dir)` -- Batch discovery helpers.

## Ingestion and lifecycle (`core/ingest.ts`, `core/lifecycle.ts`)

`ingest.ts`:
- `ingestMeeting(db, parsed)` inserts into `meetings`, generating a UUID if absent.
- `getMeeting(db, id)` retrieves a single `MeetingRow`.

`lifecycle.ts`:
- `moveToProcessed(filePath)` and `moveToFailed(filePath)` rename files between `raw-transcripts/`, `processed/`, and `failed/` directories.
- `processDirectory(dir)` batch parse-and-move pass without LLM or DB calls, used for file-system triage.

## Extraction (`core/extractor.ts`)

LLM-driven artifact extraction with chunking, Zod validation, and storage.

- `extractSummary(adapter, turns, tokenLimit, promptTemplate?, refinementPrompt?)` -- Chunks the transcript via `chunkTranscript()`, calls `adapter.complete("extract_artifact", ...)` on each chunk in parallel, validates each result against `ArtifactSchema`, and merges deduplicated fields into a single `Artifact`. Throws `ExtractionError` if all chunks return fallback responses.
- `validateArtifact(raw)` -- Normalizes field shapes (string decisions coerced to objects, missing requester fields backfilled).
- `storeArtifact(db, meetingId, artifact)` and `getArtifact(db, meetingId)` -- Persist and retrieve from the `artifacts` table.
- `generateShortId(meetingId, itemIndex)` -- Produces a stable 6-char SHA256 hash used as a printable identifier for action items.

**Artifact shape:** `summary`, `decisions[]`, `proposed_features[]`, `action_items[]`, `open_questions[]`, `risk_items[]`, `additional_notes[]`, `milestones[]`.

**Zod schemas** (`core/schemas.ts`): `DecisionSchema`, `ActionItemSchema` (with priority, short_id, requester defaults), `RiskItemSchema` (category enum), `MilestoneSchema`, and top-level `ArtifactSchema`.

## Embedding (`core/embedder.ts`, `core/meeting-pipeline.ts`)

`embedder.ts`:
- `loadModel(modelPath, tokenizerPath)` loads the `all-MiniLM-L6-v2` ONNX model and attaches a hand-rolled WordPiece tokenizer.
- `embed(session, text)` runs tokenization, ONNX inference, mean pooling over token vectors, and L2 normalization, returning a 384-dimensional unit `Float32Array`.

`meeting-pipeline.ts`:
- `buildEmbeddingInput(artifact)` concatenates all text fields of an artifact into one embedding input string.
- `embedMeeting(session, artifact)` produces the meeting vector.
- `storeMeetingVector(vdb, meetingId, vector, metadata)` persists to the `meeting_vectors` LanceDB table.

## Vector store (`core/vector-db.ts`, `core/vector-search.ts`)

LanceDB tables:
- `meeting_vectors` -- One vector per meeting artifact.
- `feature_vectors` -- One vector per extracted proposed feature.
- `item_vectors` -- One vector per action item (for dedup).

Key functions:
- `connectVectorDb(path)` -- Opens a LanceDB connection.
- `createMeetingTable(vdb)`, `createFeatureTable(vdb)`, `createItemTable(vdb)` -- Create or open tables with typed Arrow schemas (384-dim float32 vector plus metadata fields).
- `searchMeetings(db, session, query, options)` -- Embeds the query and runs KNN with optional `client`, `meeting_type`, and date filters.
- `searchMeetingsByVector(db, vdb, vector, options)` -- Same with a pre-computed vector.

**Critical note:** Clustering loads vectors via `table.query().limit(10000).toArray()` -- a full scan. It does NOT use `table.search(zeroVec)` because KNN with a zero vector is unreliable for bulk retrieval of L2-normalized vectors.

## Client registry and detection (`core/client-registry.ts`, `core/client-detection.ts`, `core/resolve-client.ts`)

`client-registry.ts`:
- `seedClients(db, path)` upserts records from `config/clients.json` into the `clients` table.
- `getClientByName`, `getClientByAlias`, `getClientById`, `getAllClients`, `getDefaultClient` -- All accept an optional `tenantId` for tenant-scoped lookups.

`client-detection.ts`:
- `detectClient(db, meeting)` -- Multi-tier detection: participant email domains, exact and alias name matching, and meeting-name token matching. Returns a `DetectionResult` with confidence.
- `storeDetection(db, meetingId, result)` -- Persists detection.
- `normalizeTokens` and `parseSpeakerNames` -- Text normalization helpers.

`resolve-client.ts`:
- `resolveClient(db, clientParam, tenantId?)` -- Accepts a `?client=` parameter that may be a client name or UUID and returns the matching `ClientRow` or `null`.

## Client glossary and context

Each client in the registry carries structured context used by extraction and display:

- `glossary` -- Domain terms specific to the client.
- `refinement_prompt` -- Extra LLM extraction instructions appended to the base prompt for this client.
- `client_team` -- Names and roles on the customer side.
- `implementation_team` -- Names and roles on the implementation side.
- `additional_extraction_llm_prompt` -- Further free-form extraction guidance.

`labeled-context.ts`:
- `buildLabeledContext(db, meetingIds)` -- Assembles a `[M1]`-labeled context block per meeting (sorted newest-first) including artifact fields, mention-count annotations, and milestone links. Used as the system prompt context for chat endpoints.
- `buildDistilledContext(db, meetingIds)` -- Simpler variant without labels or annotations.

## Item dedup (`core/item-dedup.ts`, `core/deep-dedup.ts`)

Cross-meeting deduplication for action items, decisions, features, questions, and risks.

`item-dedup.ts`:
- `deduplicateItems(db, vdb, session, meetingId, artifact)` -- Embeds each item, searches `item_vectors` scoped by client, then applies `isStringDuplicate` (Jaro-Winkler) and `isSemanticDuplicate` (cosine from L2 distance) to assign a `canonical_id`. Duplicate action items are auto-completed with `[auto-dedup]` provenance notes.
- `recordMention(db, canonicalId, meetingId, itemText)` and `getMentionStats(db, canonicalId)` -- Maintain the `item_mentions` table for cross-meeting recurrence tracking.

`deep-dedup.ts`:
- `deepScanClient(llm, db, clientId)` -- Gathers all action items for a client, filters out `"low"` priority items, caps at `MTNINSIGHTS_DEDUP_BATCH_SIZE` per priority group (most recent by meeting date), and makes a single `dedup_intent` LLM call that returns intent groupings. Items in the same group share a canonical_id; duplicates are auto-completed with `[auto-dedup-deep]` notes.

The dedup prompt template lives at `config/prompts/dedup-intent.md`.

## Action item resolver (`core/action-item-resolver.ts`)

- `resolveShortIds(db, short_ids)` -- Scans every artifact row looking for action items whose `short_id` matches one of the inputs, and returns a map from `short_id` to `{ meetingId, itemIndex }`. Used by the batch complete/uncomplete API endpoints so callers can reference items by short IDs without tracking meeting membership.

## Meeting split (`core/meeting-split.ts`)

Splits a multi-meeting recording into separate `meetings` rows while preserving lineage.

- `computeCutPoints(durations)` -- Converts minute-based durations to millisecond cut timestamps.
- `rebaseTimestamps(turns, offset, duration)` -- Filters and re-origins transcript turns into a segment's time window.
- `partitionTurns(transcript, cutPoints)` -- Divides turns into N arrays.
- `validateSplitRequest(totalMs, durations)` -- Ensures durations are positive and sum to at most the total.
- `cleanupArchivedMeeting(db, meetingId, vdb?)` -- Deletes artifacts, FTS, detections, cluster links, and item_mentions for the source meeting.
- `splitMeeting(db, meetingId, durations, vdb?)` -- Orchestrates the full split: validates, partitions, inserts N new meeting rows, writes `meeting_lineage`, marks source as `ignored=1`, cleans up, and returns a `SplitResult`.
- `reprocessSplitSegments(db, result, deps)` -- Runs detection + extraction + embedding for each segment.
- `getSourceMeeting(db, meetingId)`, `getChildMeetings(db, meetingId)`, `getSplitLineage(db, meetingId)` -- Lineage navigation via `meeting_lineage`.

## Search layers (`core/fts.ts`, `core/hybrid-search.ts`, `core/deep-search.ts`)

Three layers compose into hybrid search:

- `fts.ts` -- Maintains the `artifact_fts` FTS5 virtual table. `updateFts(db, meetingId)` rebuilds one entry. `searchFts(db, query)` runs a BM25 ranked query with `sanitizeFtsQuery` stripping FTS5 special characters.
- `hybrid-search.ts` -- `hybridSearch(db, vdb, session, query, options)` combines `hybridVectorSearch` (meeting + feature + item vectors merged by minimum L2 distance) with `searchFts` via Reciprocal Rank Fusion. Returns results sorted by descending RRF score.
- `deep-search.ts` -- `deepSearch(llm, db, meetingIds, query)` runs an LLM filter (`deep_search_filter` capability) over a candidate meeting set in parallel, returning only meetings the model judges relevant with a relevance score and summary.

## Threads, insights, milestones, notes

`threads.ts` -- Full CRUD for `Thread`, `ThreadMeeting`, and `ThreadMessage`. `evaluateMeetingAgainstThread` calls `evaluate_thread`. `getThreadCandidates` finds semantically similar meetings via vector search filtered to the client. `getThreadChatContext` selects the top-K most relevant associated meetings for a user message.

`insights.ts` -- CRUD for `Insight` entities (period-based client summaries with RAG status). `generateInsight` assembles artifact context and calls `generate_insight` with a prompt loaded from `config/prompts/insight-generation.md`.

`timelines.ts` -- Milestone tracking across meetings. `reconcileMilestones` matches extracted titles against existing records by exact normalized match, then Dice coefficient fuzzy match (threshold 0.7), creating new milestones on no match. `getDateSlippage` returns target-date change history.

`notes.ts` -- Universal annotation CRUD. Notes have `objectType` (meeting/insight/milestone/thread), `objectId`, `title`, `body`, and `noteType` (user vs auto-generated).

## Assets (`core/assets.ts`)

File attachments tied to meetings.

- `storeAsset(db, meetingId, filename, mimeType, data)` -- Writes the binary payload to disk at `{MTNINSIGHTS_DATA_DIR}/assets/{meetingId}/{uuid}-{filename}` and records metadata in the `assets` table.
- `deleteAsset(db, assetId)` -- Removes both the file and the DB row.
- `getAssetData(db, assetId)` -- Retrieves the binary content by asset ID.

## LLM adapter (`core/llm-adapter.ts`, `core/llm-provider-*.ts`)

Unified interface:
- `LlmAdapter.complete(capability, content, attachments?)` returns a `Record<string, unknown>`.
- `LlmAdapter.converse(system, messages, attachments?)` returns a string.
- `LlmCapability` union: `extract_artifact`, `cluster_tags`, `generate_task`, `synthesize_answer`, `deep_search_filter`, `evaluate_thread`, `generate_insight`, `dedup_intent`.

Providers selected by `createLlmAdapter(config)`:

1. **anthropic** -- Anthropic SDK. `claude-sonnet-4-6` default.
2. **openai** -- OpenAI SDK. `gpt-4o` default.
3. **local** -- Ollama over `/api/chat`.
4. **claudecli** -- Shells out to `claude --print --output-format json`. No API key required.
5. **local-claudeapi** -- HTTP adapter for a local Claude API proxy (port 8100 by default).
6. **stub** -- Deterministic in-memory adapter. `STUB_FIXTURES` maps each capability to a fixed response for tests.

`llm-helpers.ts` provides `withRepair(call, content)` -- retries once with a repair prefix on JSON parse failure, then falls back to `{ __fallback: true, raw_text: ... }`. All providers wrap completions with `withRepair`.

## Database (`core/db.ts`, `core/migrations/`)

- `createDb(path)` opens a SQLite connection via `node:sqlite`. Use `":memory:"` for tests.
- `migrate(db)` is a thin wrapper over `runMigrations(db, allMigrations)`. Schema versioning is tracked via the `schema_version` table.
- `core/migrations/001-baseline.ts` contains the full baseline schema. Later migrations are additive.
- `core/migrations/runner.ts` exports `runMigrations` and `getCurrentVersion`. Each migration runs inside a transaction; on failure the transaction rolls back.

See [database.md](database.md) for the full schema and migration flow.

## Path resolution (`core/paths.ts`)

- `resolveDataPaths(dataDir)` returns a `DataPaths` record with absolute paths for manual (raw / processed / failed / external-transcripts), webhook (raw / processed / failed), assets, audit, and eval directories.
- `ensureDataDirs(paths)` creates any missing directories.

See [reference.md](reference.md) for the data directory layout.

## Authentication primitives (`core/auth/`)

Brief mention; full endpoint details in [api.md](api.md).

- `api-keys.ts` -- `mki_`-prefixed API keys with SHA-256 hashes.
- `jwt.ts` -- RSA key management, access (1h) and refresh (30d) JWT signing and verification.
- `oauth-clients.ts` -- OAuth client registration and authentication.
- `scopes.ts` -- `VALID_SCOPES`, `scopesForRoute(method, path)` route-to-scope mapping.
- `token-service.ts` -- `issueTokenPair`, `refreshTokens`, `revokeToken`, `isTokenRevoked`.
- `pkce.ts` -- PKCE S256 code challenge utilities.
- `auth-codes.ts` -- Authorization code grant flow with PKCE verification.

## Logging and errors (`core/logger.ts`, `core/errors.ts`)

`logger.ts`:
- `createLogger(namespace)` returns a `debug` logger scoped to `mtninsights:<namespace>`.
- `setLogDir(dir)` configures the directory for structured JSONL output.
- Log level is controlled by `MTNINSIGHTS_LOG_LEVEL` or `setLogLevel()`.

`errors.ts`:
- `AppError` (base class with `code` field).
- `ExtractionError`, `LlmError`, `ValidationError`, `PipelineError` -- all extend `AppError`.
