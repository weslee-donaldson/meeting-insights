# core/

Pure business logic for meeting ingestion, extraction, search, and domain features. This module has no dependencies on `electron-ui/` or `api/` -- both of those layers import from here. Everything in `core/` is testable in isolation using the stub LLM adapter and an in-memory SQLite database.

## Pipeline

`processNewMeetings(config)` is the end-to-end batch processor. It accepts both webhook JSON payloads and Krisp transcript files (manifest-folder or legacy flat-file format).

```
 Transcript / Webhook
         |
    1. Parse
         |
    2. Ingest (meetings table, UUID or external ID)
         |
    3. Client Detection (participant domains, alias match, meeting name tokens)
         |
    4. Artifact Extraction (LLM, chunked for long transcripts, client context injected)
         |
    5. Index & Deduplicate
         |--- FTS update (BM25)
         |--- Item dedup (embedding + string match)
         |--- Deep dedup (optional, LLM intent clustering)
         |--- Milestone reconciliation (fuzzy title match, Dice coefficient >= 0.7)
         |
    6. Embed & Thread
         |--- Meeting vector stored in LanceDB
         |--- Open threads evaluated (cosine pre-filter, then LLM eval)
```

Failed entries are moved to a failed directory and written to `data/audit/` as timestamped JSON. Progress is reported via a `PipelineEvent` callback.

**Key files:** `pipeline.ts`, `parser.ts`, `ingest.ts`, `client-detection.ts`, `extractor.ts`, `item-dedup.ts`, `deep-dedup.ts`, `meeting-pipeline.ts`, `threads.ts`, `timelines.ts`

## Database Schema

SQLite via `node:sqlite` (DatabaseSync). Schema is applied idempotently by `migrate(db)` in `db.ts`.

### Core

| Table | Purpose |
|-------|---------|
| `meetings` | One row per meeting. Title, date, type, participants, raw transcript, source filename, optional recording URL and client ID. |
| `artifacts` | One row per meeting. LLM-extracted fields: summary, decisions, proposed features, action items, architecture, open questions, risk items, additional notes, milestones. `needs_reextraction` flag for manual re-processing. |
| `clients` | Client registry. Name, aliases, known participants, client/implementation teams, glossary, refinement prompt, default flag. |
| `client_detections` | Auto-detected client-to-meeting mapping with confidence score and detection method. |
| `clusters` | K-means cluster assignments. Generated tags, centroid snapshot for drift detection. |
| `meeting_clusters` | Many-to-many join between meetings and clusters. |
| `action_item_completions` | Tracks completed action items with timestamp and provenance note (manual or auto-dedup). |
| `item_mentions` | Cross-meeting item recurrence tracking. Canonical ID groups duplicate items across meetings. |
| `assets` | File uploads tied to meetings. Filename, MIME type, file size, storage path. |

### Full-Text Search

| Table | Purpose |
|-------|---------|
| `artifact_fts` | FTS5 virtual table over artifact content. Porter stemming, unicode61 tokenizer. Field-tagged content enables per-section filtering. |

### Threads

| Table | Purpose |
|-------|---------|
| `threads` | Tracked topics tied to a client. Title, shorthand, description, status, criteria prompt, keywords. |
| `thread_meetings` | Meetings linked to threads with relevance summary and score. |
| `thread_messages` | Chat history per thread. Supports stale-context detection. |

### Insights

| Table | Purpose |
|-------|---------|
| `insights` | Period-based client summaries (day/week/month). Executive summary, topic details, RAG status, draft/final workflow. |
| `insight_meetings` | Meetings contributing to an insight, with contribution summary. |
| `insight_messages` | Chat history per insight. |

### Milestones

| Table | Purpose |
|-------|---------|
| `milestones` | Tracked deliverables per client. Title, description, target date, status, optional ignored flag. |
| `milestone_mentions` | Per-meeting mention with excerpt and target date at time of mention. Supports pending review. |
| `milestone_action_items` | Links action items to milestones. |
| `milestone_messages` | Chat history per milestone. |

### Notes & Messages

| Table | Purpose |
|-------|---------|
| `notes` | Universal annotations for meetings, insights, milestones, and threads. Polymorphic via `object_type` + `object_id`. User or auto-generated note types. |
| `meeting_messages` | Per-meeting chat history (user/assistant messages with optional JSON sources). |

## Search Architecture

Four search modes, each suited to different query types.

| Mode | File | Technique | When Used |
|------|------|-----------|-----------|
| **Vector** | `vector-search.ts` | KNN on 384-dim embeddings in LanceDB. Supports client, type, and date filters. Returns L2 distance. | Semantic similarity queries. |
| **FTS** | `fts.ts` | SQLite FTS5 with BM25 ranking. Porter stemming. Field-tagged content (`[summary]`, `[action_items]`, etc.) supports per-section filtering via `filterBySearchFields`. | Keyword/exact-term queries. |
| **Hybrid** | `hybrid-search.ts` | Combines three vector tables (meetings, features, items) via minimum L2 distance merge, then fuses with FTS via Reciprocal Rank Fusion (k=60). | Default search mode -- best of both worlds. |
| **Deep** | `deep-search.ts` | LLM-based relevance filter. Takes candidate meeting IDs, sends each meeting's artifact context to the `deep_search_filter` capability in parallel. Returns only meetings the model judges relevant, with a relevance score and summary. | High-precision filtering after an initial broad search. |

### Ranking

- **Vector/FTS merge:** `mergeSearchResults` keeps the minimum L2 distance per meeting across all vector tables.
- **Hybrid fusion:** `reciprocalRankFusion` scores each meeting as the sum of `1/(k + rank + 1)` across vector and FTS ranked lists (k=60). Higher RRF score = more relevant.
- **Deep search:** LLM returns a 0-1 relevance score per meeting.

## LLM Provider System

The `LlmAdapter` interface defines two methods:

| Method | Purpose |
|--------|---------|
| `complete(capability, content, attachments?)` | Single-turn structured output. Returns parsed JSON. |
| `converse(system, messages, attachments?)` | Multi-turn chat. Returns a string response. |

### Providers

| Provider | Config Type | Backend | Notes |
|----------|-------------|---------|-------|
| `stub` | `stub` | In-memory fixtures | Deterministic responses per capability. Used in tests. |
| `anthropic` | `anthropic` | Anthropic API | Claude Sonnet 4.6. 8192 max tokens for `extract_artifact` and `generate_insight`. |
| `openai` | `openai` | OpenAI API | GPT-4o default. |
| `local` | `local` | Ollama `/api/chat` | Rate-limit and server error handling. |
| `claudecli` | `claudecli` | Claude CLI (`claude --print`) | Session cache for multi-turn resumption via `--resume`. No API key needed. |
| `claudeapi` | `local-claudeapi` | Local Claude API proxy | Session cache for multi-turn resumption. |

### Capabilities

Eight capability types route to the appropriate prompt and model configuration:

`extract_artifact`, `cluster_tags`, `generate_task`, `synthesize_answer`, `deep_search_filter`, `evaluate_thread`, `generate_insight`, `dedup_intent`

### Error Recovery

`withRepair(call, content)` handles malformed LLM JSON output:
1. First attempt: call the LLM normally
2. On JSON parse failure: retry with a repair prefix requesting valid JSON
3. On second failure: return `{ __fallback: true, raw_text: ... }` instead of throwing

## Client System

Clients are defined in `config/clients.json` and seeded into the `clients` table via `seedClients`.

### Registry

Each client record contains:

| Field | Purpose |
|-------|---------|
| `name` / `aliases` | Primary identifier and alternative names for detection. |
| `client_team` | Named participants with roles (their words define deliverables). |
| `implementation_team` | Delivery partner participants with roles. |
| `meeting_names` | Meeting title patterns used for client detection. |
| `glossary` | Term normalization: canonical term, variants, description. Injected into LLM extraction prompts. |
| `additional_extraction_llm_prompt` | Client-specific extraction instructions appended to the LLM prompt. |
| `is_default` | Fallback client when detection finds no match. |

### Detection

`detectClient(db, meetingId)` runs three detection strategies and returns scored results:

1. **Participant email domains** -- matches against `known_participants`
2. **Alias matching** -- compares meeting metadata against client aliases
3. **Meeting name tokens** -- tokenized match against `meeting_names`

The highest-confidence detection wins and its client context (team rosters, role authority guidance, glossary, refinement prompt) is injected into the LLM extraction prompt via `buildClientContext`.

## Deduplication

Two tiers of cross-meeting item deduplication.

### Embedding-Based (per-meeting, automatic)

**File:** `item-dedup.ts`

Runs during pipeline processing for each new meeting. For each extracted item (action items, decisions, features, questions, risks):

1. Embed the item text using the ONNX model
2. Search `item_vectors` in LanceDB scoped to the same client and item type
3. Compare against the closest match using both:
   - **Jaro-Winkler similarity** on normalized text (threshold: 0.90, configurable via `MTNINSIGHTS_DEDUP_STRING_THRESHOLD`)
   - **Cosine similarity** converted from L2 distance (threshold: 0.80, configurable via `MTNINSIGHTS_DEDUP_SEMANTIC_THRESHOLD`)
4. If either threshold is met, the item shares the existing canonical ID; otherwise it gets a new UUID
5. Duplicate action items are auto-completed with an `[auto-dedup]` provenance note

### Deep (per-client, opt-in)

**File:** `deep-dedup.ts`

Enabled via `MTNINSIGHTS_DEDUP_DEEP=1`. Runs after embedding-based dedup.

1. Gathers all action items for the client across specified meetings
2. Filters out `low` priority items, caps at `MTNINSIGHTS_DEDUP_BATCH_SIZE` per priority group (most recent first)
3. Sends a single LLM call (`dedup_intent` capability) that returns intent-based groupings
4. Items in the same group share a canonical ID; duplicates are auto-completed with `[auto-dedup-deep]` notes

## Embedding Strategy

| Property | Value |
|----------|-------|
| **Model** | `all-MiniLM-L6-v2` (ONNX Runtime) |
| **Dimensions** | 384 |
| **Tokenizer** | Hand-rolled WordPiece (loaded from `tokenizer.json`) |
| **Max sequence length** | 128 tokens |
| **Pooling** | Mean pooling over attended tokens |
| **Normalization** | L2-normalized (unit vectors) |
| **Distance metric** | LanceDB uses L2 distance; since vectors are unit-length, `cosine_similarity = 1 - (L2^2 / 2)` (see `l2ToCosineSim` in `math.ts`) |

Three LanceDB vector tables share this embedding space:

| Table | Indexed Entity | Metadata Fields |
|-------|---------------|-----------------|
| `meeting_vectors` | Concatenated artifact text per meeting | client, meeting_type, date |
| `feature_vectors` | Individual proposed feature strings | meeting_id |
| `item_vectors` | Individual items (action items, decisions, etc.) | canonical_id, item_type, meeting_id, date, client |
