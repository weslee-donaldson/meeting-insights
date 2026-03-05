# Meeting Knowledge Fabric
## Ketchup Plan

---

# 0. SYSTEM GOAL

Build an incremental POC that transforms raw Krisp meeting transcripts into a structured, searchable, semantically clustered knowledge fabric that:

- Extracts structured meaning from transcripts
- Embeds structured outputs using local ONNX model

- Detects recurring themes automatically
- Associates meetings to clients
- Supports cross-meeting semantic retrieval
- Provides curated context for downstream LLM workflows
- Avoids passing large raw transcript context to LLMs

This plan follows **The Ketchup Technique**. Each Burst is atomic: one test, one behavior, one commit. Bottles group related bursts by capability. TCR discipline enforced throughout.

---

# APPLICATION STACK

| Layer | Technology | Live | In Tests |
|---|---|---|---|
| Relational storage | SQLite (`better-sqlite3`) | Persistent file at `db/mtninsights.db` | `:memory:` per suite |
| Vector storage | LanceDB (`@lancedb/lancedb`) | Persistent directory at `db/lancedb/` | Temp dir per suite |
| Embeddings | ONNX Runtime (`onnxruntime-node` + `all-MiniLM-L6-v2`, 384-dim) | In-process | In-process |
| LLM | Provider interface: `anthropic` (Claude API), `local` (Ollama `/api/chat`), `stub` — selected via `MTNINSIGHTS_LLM_PROVIDER` | Real API / Ollama calls | **Stubbed** — deterministic JSON fixtures |
| Logging | `debug` npm package | Namespaced per module | Namespaced per module |
| Runtime | Node.js 18+ / TypeScript / pnpm | | |
| Test framework | Vitest | | |
| Tooling | claude-auto / Ketchup Technique / TCR | | |

### Persistence

All state survives restarts. No in-memory-only storage in the live app.

- **SQLite:** `db/mtninsights.db` — single file, portable, backupable via `cp`
- **LanceDB:** `db/lancedb/` — directory of Lance columnar files on disk
- **Both paths configurable** via environment variables (`MTNINSIGHTS_DB_PATH`, `MTNINSIGHTS_VECTOR_PATH`)

### Project Structure

```
/Users/wdonaldson/tools/krisp-meeting-insights/
├── config/
│   └── prompts/
│       └── extraction.md             # LLM extraction prompt template ({{transcript}} placeholder)
├── data/
│   ├── raw-transcripts/              # Krisp batch export (input)
│   │   ├── manifest.json             # Meeting metadata index
│   │   ├── mandalore_dsu-{id}/       # Per-meeting folder
│   │   │   ├── transcript.md         # Markdown transcript (# Transcript + **Name | MM:SS** turns)
│   │   │   └── recording_download_link.md
│   │   └── ...
│   ├── processed/                    # Successfully ingested folders (moved here)
│   ├── failed-processing/            # Ingestion errors (moved here)
│   ├── clients/                      # Client registry JSON
│   │   └── clients.json
│   ├── output/                       # Generated artifacts
│   ├── audit/                        # Processing run logs
│   └── backups/                      # DB backups
├── api/
│   └── server.ts                     # HTTP API server (Bottle 10)
├── cli/
│   ├── setup.ts                      # Idempotent DB init + client seeding
│   ├── run.ts                        # Process new meetings through full pipeline
│   ├── reset.ts                      # Clear DB + restore files to raw-transcripts
│   ├── query.ts                      # CLI query tool
│   ├── eval.ts                       # Evaluation harness
│   └── assign-client.ts              # Manual client assignment
├── core/
├── electron-ui/
│   ├── electron/                     # Main process + preload + IPC handlers
│   └── ui/                           # React renderer
├── test/
│   └── fixtures/                     # Sample Krisp files for testing (legacy format)
├── models/                           # ONNX model binary (gitignored)
├── db/                               # Persistent storage (gitignored)
│   ├── mtninsights.db                # SQLite database
│   └── lancedb/                      # LanceDB vector files
├── .env.local                        # API keys (gitignored)
├── meeting-knowledge-fabric-ketchup.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Krisp Export Format

#### Batch Export Format (current)

Krisp's batch export creates a folder per meeting under `data/raw-transcripts/`, plus a `manifest.json` index:

**`manifest.json`** — meeting metadata array:
```json
[
  {
    "meeting_id": "019c9061563f76198534216c21bb4f3d",
    "meeting_title": "Mandalore DSU",
    "meeting_date": "2026-02-24T15:59:49.727Z",
    "meeting_files": [
      "mandalore_dsu-019c9061563f76198534216c21bb4f3d/transcript.md",
      "mandalore_dsu-019c9061563f76198534216c21bb4f3d/recording_download_link.md"
    ]
  }
]
```

**`{slug}-{meeting_id}/transcript.md`** — markdown transcript:
```markdown
# Mandalore DSU - Feb, 24

# Transcript
**Wesley Donaldson | 00:11**
Good morning. Yep, you could come in.

**Rinor Zekaj | 01:19**
Here goes.

**Speaker 2 | 03:41**
I haven't seen with him, but yeah...
```

The pipeline detects `manifest.json` in `rawDir` and switches to folder-based processing automatically. Deduplication uses `meeting_id` from the manifest checked against the `meetings` table (DB-based, not filesystem-based).

#### Legacy Format (flat-file, used by test fixtures)

Each meeting is a **single file** (no extension) under `data/raw-transcripts/` named:
```
 {ISO-8601-timestamp}{Meeting Title}
```
Note the **leading space** in the filename. File contents:
```
Attendance:
{'last_name': 'Doshi', 'id': '014200be-...', 'first_name': 'Dev', 'email': 'dev.doshi@xolv.io'},...
Transcript:
Wesley Donaldson | 00:11
Good morning. Yep, you could come in.
Speaker 4 | 03:41
I haven't seen with him, but yeah...
```
The pipeline falls back to this path when no `manifest.json` is present (test suites use it).

### Logging Namespaces

All logging uses the `debug` npm package with hierarchical namespaces rooted at `mtninsights`:

```
mtninsights:parser           — Krisp file parsing (top-level)
mtninsights:parser:dir       — directory listing, file discovery
mtninsights:parser:filename  — filename parsing (timestamp, title extraction)
mtninsights:parser:attend    — attendance section parsing
mtninsights:parser:body      — transcript body parsing, speaker turns
mtninsights:ingest           — meeting ingestion into SQLite
mtninsights:ingest:file      — file lifecycle (move to processed/failed)
mtninsights:ingest:dedup     — duplicate detection
mtninsights:extract          — LLM structured extraction
mtninsights:extract:chunk    — transcript chunking
mtninsights:extract:validate — artifact validation
mtninsights:client           — client registry and detection
mtninsights:client:detect    — detection logic and confidence scoring
mtninsights:embed            — ONNX embedding generation
mtninsights:embed:meeting    — meeting-level embedding pipeline
mtninsights:embed:feature    — feature-level embedding pipeline
mtninsights:vector           — LanceDB vector operations
mtninsights:vector:search    — similarity search
mtninsights:cluster          — clustering operations
mtninsights:cluster:tags     — topic extraction per cluster
mtninsights:cluster:drift    — tag drift detection
mtninsights:context          — context curation
mtninsights:task             — downstream task generation
mtninsights:pipeline         — batch processing orchestration
```

Enable selectively: `DEBUG=mtninsights:parser*,mtninsights:ingest* node ...`
Enable all: `DEBUG=mtninsights:* node ...`

### Boundary Stubs

Only **one** stubbed boundary. Everything else is real in tests.

| Boundary | Stub Behavior | Real Implementation |
|---|---|---|
| LLM (extraction, tag generation, task generation) | Returns deterministic JSON fixtures per call type | Anthropic Claude API |

### Test Isolation

- **SQLite:** `:memory:` database created in `beforeAll`, destroyed on suite teardown
- **LanceDB:** temp directory via `os.tmpdir()` created in `beforeAll`, removed in `afterAll`
- **ONNX:** model loaded once per suite (slow to init, deterministic after)
- **File system:** test fixtures in `test/fixtures/` mimic Krisp files; temp dirs for move operations

---

# PLANNING RULES

- **TCR Discipline:** `pnpm test --run && git add -A && git commit -m "<MSG>" || git checkout -- .`
- **100% coverage by construction.** No code without a failing test first.
- **Strong assertions only.** No `toBeDefined`, `toBeTruthy`, `not.toBeNull`. Assert exact shape and value.
- **Stubs over mocks.** Stub only the LLM boundary. Everything else is real.
- **One assertion per behavior.** Title = Spec.
- **RETHINK after revert.** Split smaller, try different approach, or clarify requirement.
- **No comments.** Write self-expressing code.
- **Emergent design.** Types/interfaces emerge from tests, not upfront.

---

# ketchup-plan.md

## TODO

### Bottle: Project Bootstrap

- [x] Burst 1: `pnpm test` runs and exits clean with zero tests [depends: none]
- [x] Burst 2: project has src/ and test/ with tsconfig, vitest.config, and dependencies installed (better-sqlite3, @lancedb/lancedb, onnxruntime-node, debug, @types/debug) [depends: 1]

### Bottle: Logging Foundation

- [x] Burst 3: `createLogger` accepts namespace string and returns debug logger instance namespaced under `mtninsights:` [depends: 2]
- [x] Burst 4: `createLogger` child loggers inherit parent namespace (e.g., `createLogger('parser:dir')` → `mtninsights:parser:dir`) [depends: 3]

### Bottle: Krisp File Parser

- [x] Burst 5: `listTranscriptFiles` returns array of filenames from data/raw-transcripts/ directory [depends: 4]
- [x] Burst 6: `listTranscriptFiles` handles empty directory returning empty array [depends: 5]
- [x] Burst 7: `listTranscriptFiles` logs file count via `mtninsights:parser:dir` [depends: 5]
- [x] Burst 8: `parseFilename` extracts ISO timestamp from Krisp filename (strips leading space) [depends: 4]
- [x] Burst 9: `parseFilename` extracts meeting title from Krisp filename [depends: 8]
- [x] Burst 10: `parseFilename` handles titles with commas (e.g., "Revenium, INT, DSU") [depends: 9]
- [x] Burst 11: `parseFilename` handles unnamed meetings (e.g., "02:25 PM - zoom.us meeting January 19") [depends: 9]
- [x] Burst 12: `parseFilename` handles duplicate suffix (e.g., filename ending in "(1)") [depends: 9]
- [x] Burst 13: `parseFilename` logs parsed result via `mtninsights:parser:filename` [depends: 8]
- [x] Burst 14: `readTranscriptFile` reads file contents from full path and returns string [depends: 4]
- [x] Burst 15: `readTranscriptFile` handles UTF-8 encoding [depends: 14]
- [x] Burst 16: `splitSections` splits file contents into attendance string and transcript string at "Transcript:" delimiter [depends: 14]
- [x] Burst 17: `parseAttendance` extracts array of participant objects (first_name, last_name, email, id) from attendance string [depends: 16]
- [x] Burst 18: `parseAttendance` handles single-quote JSON-ish format Krisp uses (converts to valid JSON) [depends: 17]
- [x] Burst 19: `parseAttendance` logs participant count via `mtninsights:parser:attend` [depends: 17]
- [x] Burst 20: `parseTranscriptBody` extracts array of speaker turns with speaker_name and timestamp from transcript string [depends: 16]
- [x] Burst 21: `parseTranscriptBody` preserves multi-line dialogue blocks per speaker turn [depends: 20]
- [x] Burst 22: `parseTranscriptBody` normalizes "Speaker N" entries to "Unknown Speaker N" [depends: 20]
- [x] Burst 23: `parseTranscriptBody` logs turn count via `mtninsights:parser:body` [depends: 20]
- [x] Burst 24: `parseKrispFile` combines parseFilename + parseAttendance + parseTranscriptBody into complete parsed meeting object [depends: 9, 18, 21]
- [x] Burst 25: `parseKrispFile` returns null and logs error for unparseable files [depends: 24]

### Bottle: File Lifecycle

- [x] Burst 26: `moveToProcessed` moves file from raw-transcripts/ to processed/ preserving filename [depends: 5]
- [x] Burst 27: `moveToProcessed` creates processed/ directory if it doesn't exist [depends: 26]
- [x] Burst 28: `moveToProcessed` logs move via `mtninsights:ingest:file` [depends: 26]
- [x] Burst 29: `moveToFailed` moves file from raw-transcripts/ to failed-processing/ preserving filename [depends: 5]
- [x] Burst 30: `moveToFailed` creates failed-processing/ directory if it doesn't exist [depends: 29]
- [x] Burst 31: `moveToFailed` logs move with error reason via `mtninsights:ingest:file` [depends: 29]
- [x] Burst 32: `processDirectory` parses each file in raw-transcripts/, moves successful to processed/, failed to failed-processing/ [depends: 24, 26, 29]
- [x] Burst 33: `processDirectory` logs summary (total, succeeded, failed) via `mtninsights:pipeline` [depends: 32]
- [x] Burst 34: `processDirectory` skips files already present in processed/ (dedup by filename) [depends: 32]
- [x] Burst 35: `processDirectory` logs skipped duplicates via `mtninsights:ingest:dedup` [depends: 34]

### Bottle: SQLite Foundation

- [x] Burst 36: `createDb` accepts a path argument and returns a better-sqlite3 connection (`:memory:` in tests, `db/mtninsights.db` in live) [depends: 2]
- [x] Burst 37: `migrate` creates meetings table (id TEXT PK, title TEXT, meeting_type TEXT, date TEXT, participants TEXT, raw_transcript TEXT, source_filename TEXT, created_at TEXT) [depends: 36]
- [x] Burst 38: `migrate` creates artifacts table (meeting_id TEXT PK FK, summary TEXT, decisions TEXT, proposed_features TEXT, action_items TEXT, technical_topics TEXT, open_questions TEXT, risk_items TEXT) [depends: 37]
- [x] Burst 39: `migrate` creates clients table (name TEXT PK, aliases TEXT, known_participants TEXT) [depends: 37]
- [x] Burst 40: `migrate` creates client_detections table (meeting_id TEXT FK, client_name TEXT FK, confidence REAL, method TEXT) [depends: 39]
- [x] Burst 41: `migrate` creates clusters table (cluster_id TEXT PK, generated_tags TEXT, centroid_snapshot TEXT, updated_at TEXT) [depends: 37]
- [x] Burst 42: `migrate` creates meeting_clusters table (meeting_id TEXT FK, cluster_id TEXT FK) [depends: 41]

### Bottle: Transcript Ingestion

- [x] Burst 43: `ingestMeeting` inserts parsed Krisp meeting into meetings table, returns meeting_id [depends: 37, 24]
- [x] Burst 44: `ingestMeeting` stores participant list as JSON string in participants column [depends: 43]
- [x] Burst 45: `ingestMeeting` stores source filename in source_filename column [depends: 43]
- [x] Burst 46: `getMeeting` retrieves stored meeting row by meeting_id [depends: 43]
- [x] Burst 47: `ingestMeeting` rejects duplicate source_filename [depends: 45]
- [x] Burst 48: `ingestMeeting` logs ingestion via `mtninsights:ingest` [depends: 43]

### Bottle: Transcript Chunking

- [x] Burst 49: `chunkTranscript` splits transcript exceeding token limit into chunks [depends: 46]
- [x] Burst 50: `chunkTranscript` preserves speaker turns — never splits mid-turn [depends: 49]
- [x] Burst 51: `chunkTranscript` returns single chunk when transcript is under limit [depends: 49]
- [x] Burst 52: `chunkTranscript` logs chunk count and sizes via `mtninsights:extract:chunk` [depends: 49]

### Bottle: LLM Adapter

- [x] Burst 53: `createLlmAdapter` accepts Anthropic config, returns adapter with `complete` method [depends: 2]
- [x] Burst 54: `createLlmAdapter` accepts stub config, returns adapter that returns fixture response [depends: 53]
- [x] Burst 55: stub adapter `complete` returns different fixtures keyed by prompt type (extraction, tags, task) [depends: 54]

### Bottle: Structured Summary Extraction

- [x] Burst 56: `extractSummary` calls LLM adapter with transcript text and returns meeting_summary string [depends: 55, 46]
- [x] Burst 57: `extractSummary` returns decisions array from LLM response [depends: 56]
- [x] Burst 58: `extractSummary` returns proposed_features array [depends: 56]
- [x] Burst 59: `extractSummary` returns action_items with description, owner, due_date [depends: 56]
- [x] Burst 60: `extractSummary` returns technical_topics array [depends: 56]
- [x] Burst 61: `extractSummary` returns open_questions array [depends: 56]
- [x] Burst 62: `extractSummary` returns risk_items array [depends: 56]
- [x] Burst 63: `validateArtifact` rejects LLM response missing required keys [depends: 56]
- [x] Burst 64: `validateArtifact` rejects LLM response containing non-JSON prose [depends: 63]
- [x] Burst 65: `validateArtifact` logs validation failures via `mtninsights:extract:validate` [depends: 63]
- [x] Burst 66: `extractSummary` uses chunkTranscript for long transcripts and merges chunk results [depends: 51, 56]
- [x] Burst 67: `extractSummary` logs extraction timing via `mtninsights:extract` [depends: 56]
- [x] Burst 68: `storeArtifact` inserts validated artifact into artifacts table [depends: 38, 63]
- [x] Burst 69: `getArtifact` retrieves structured artifact from artifacts table by meeting_id [depends: 68]

### Bottle: Client Registry

- [x] Burst 70: `seedClients` inserts client records into clients table from JSON file in data/clients/ [depends: 39]
- [x] Burst 71: `getClientByName` retrieves client row by name [depends: 70]
- [x] Burst 72: `getClientByAlias` retrieves client row when alias matches [depends: 70]
- [x] Burst 73: `seedClients` rejects malformed client entries (missing name or aliases) [depends: 70]
- [x] Burst 74: `getAllClients` returns all client rows [depends: 70]
- [x] Burst 75: `seedClients` logs loaded client count via `mtninsights:client` [depends: 70]

### Bottle: Client Detection

- [x] Burst 76: `detectClient` returns client when participant email domain matches known_participants [depends: 71, 46]
- [x] Burst 77: `detectClient` returns client when meeting title contains client alias [depends: 72, 46]
- [x] Burst 78: `detectClient` returns client when transcript text contains alias [depends: 72, 46]
- [x] Burst 79: `detectClient` returns high confidence (0.8) for participant match [depends: 76]
- [x] Burst 80: `detectClient` returns medium confidence (0.5) for alias-only match [depends: 78]
- [x] Burst 81: `detectClient` returns very high confidence (0.95) when both participant and alias match [depends: 79, 80]
- [x] Burst 82: `detectClient` returns empty array when no match found [depends: 76]
- [x] Burst 83: `detectClient` returns multiple clients for multi-client meetings [depends: 76, 78]
- [x] Burst 84: `storeDetection` inserts detection results into client_detections table [depends: 40, 76]
- [x] Burst 85: `detectClient` logs detection results and confidence via `mtninsights:client:detect` [depends: 76]

### Bottle: ONNX Embedding Engine

- [x] Burst 86: `loadModel` loads all-MiniLM-L6-v2 ONNX model and returns session [depends: 2]
- [x] Burst 87: `embed` accepts string input and returns Float32Array of length 384 [depends: 86]
- [x] Burst 88: `embed` returns similar vectors for semantically similar inputs (cosine similarity > 0.8) [depends: 87]
- [x] Burst 89: `embed` returns dissimilar vectors for unrelated inputs (cosine similarity < 0.3) [depends: 87]
- [x] Burst 90: `embed` logs embedding generation time via `mtninsights:embed` [depends: 87]

### Bottle: LanceDB Foundation

- [x] Burst 91: `connectVectorDb` accepts a path argument and opens LanceDB connection (temp dir in tests, `db/lancedb/` in live) [depends: 2]
- [x] Burst 92: `createMeetingTable` creates meeting_vectors table with schema (meeting_id TEXT, vector FLOAT32[384], client TEXT, meeting_type TEXT, date TEXT) [depends: 91]
- [x] Burst 93: `createFeatureTable` creates feature_vectors table with schema (feature_text TEXT, meeting_id TEXT, client TEXT, date TEXT, vector FLOAT32[384]) [depends: 91]

### Bottle: Meeting Embedding Pipeline

- [x] Burst 94: `buildEmbeddingInput` concatenates summary + features + topics + decisions from artifact [depends: 69]
- [x] Burst 95: `embedMeeting` generates real 384-dim vector from embedding input via ONNX [depends: 94, 87]
- [x] Burst 96: `storeMeetingVector` inserts vector + metadata into LanceDB meeting_vectors table [depends: 95, 92]
- [x] Burst 97: `storeMeetingVector` includes client from detection result in metadata [depends: 96, 84]
- [x] Burst 98: `storeMeetingVector` includes meeting_type and date in metadata [depends: 96]
- [x] Burst 99: `storeMeetingVector` logs storage via `mtninsights:embed:meeting` [depends: 96]

### Bottle: Vector Search

- [x] Burst 100: `searchMeetings` returns top-k similar meetings for a query string [depends: 96, 87]
- [x] Burst 101: `searchMeetings` filters results by client metadata [depends: 100, 97]
- [x] Burst 102: `searchMeetings` filters results by meeting_type metadata [depends: 100, 98]
- [x] Burst 103: `searchMeetings` filters results by date range [depends: 100, 98]
- [x] Burst 104: `searchMeetings` returns meeting_id and distance score per result [depends: 100]
- [x] Burst 105: semantically similar meetings score higher than unrelated meetings in search results [depends: 100]
- [x] Burst 106: `searchMeetings` logs query and result count via `mtninsights:vector:search` [depends: 100]

### Bottle: Cross-Meeting Clustering

- [x] Burst 107: `clusterMeetings` reads all vectors from LanceDB, assigns cluster_id to each [depends: 96]
- [x] Burst 108: `clusterMeetings` groups semantically similar meetings into same cluster [depends: 107]
- [x] Burst 109: `clusterMeetings` separates dissimilar meetings into different clusters [depends: 107]
- [x] Burst 110: `clusterMeetings` stores cluster_id mappings in meeting_clusters table [depends: 107, 42]
- [x] Burst 111: `clusterMeetings` stores centroid snapshot in clusters table [depends: 110, 41]
- [x] Burst 112: `assignCluster` assigns new meeting to nearest existing centroid without full recluster [depends: 111]
- [x] Burst 113: `recluster` performs full recomputation and updates all cluster_ids [depends: 110]
- [x] Burst 114: `clusterMeetings` logs cluster sizes via `mtninsights:cluster` [depends: 107]

### Bottle: Cluster Topic Extraction

- [x] Burst 115: `aggregateClusterSummaries` collects all artifact summaries for a given cluster_id [depends: 110, 69]
- [x] Burst 116: `extractClusterTags` calls LLM adapter with aggregated summaries, returns 3–7 noun-phrase tags [depends: 115, 55]
- [x] Burst 117: `extractClusterTags` rejects vague tags like "discussion" or "meeting" [depends: 116]
- [x] Burst 118: `storeClusterTags` updates clusters table with generated_tags [depends: 117, 41]
- [x] Burst 119: `extractClusterTags` logs generated tags via `mtninsights:cluster:tags` [depends: 116]

### Bottle: Feature-Level Embedding

- [x] Burst 120: `embedFeature` generates real 384-dim vector for a single proposed_feature string [depends: 58, 87]
- [x] Burst 121: `storeFeatureVector` inserts vector + meeting_id + client into LanceDB feature_vectors table [depends: 120, 93, 84]
- [x] Burst 122: `searchFeatures` returns similar features across meetings for a query string [depends: 121, 87]
- [x] Burst 123: `searchFeatures` returns meeting_id and artifact summary excerpt per result [depends: 122, 69]
- [x] Burst 124: similar feature proposals from different meetings return high similarity [depends: 122]
- [x] Burst 125: query "Show discussions related to Feature X" returns meetings from both demo and architecture contexts [depends: 123]
- [x] Burst 126: `searchFeatures` logs query and result count via `mtninsights:embed:feature` [depends: 122]

### Bottle: Context Curation

- [x] Burst 127: `buildContext` performs semantic search from query string and returns matching artifacts [depends: 100, 69]
- [x] Burst 128: `buildContext` filters by client_filter [depends: 127, 101]
- [x] Burst 129: `buildContext` filters by meeting_type_filter [depends: 127, 102]
- [x] Burst 130: `buildContext` filters by date_range [depends: 127, 103]
- [x] Burst 131: `buildContext` deduplicates results from same cluster_id [depends: 127, 110]
- [x] Burst 132: `buildContext` ranks results by relevance score and fills to token budget [depends: 127]
- [x] Burst 133: `buildContext` enforces token budget ceiling — output never exceeds configured limit [depends: 132]
- [x] Burst 134: `buildContext` returns curated_context string and source_meeting_ids array [depends: 133]
- [x] Burst 135: `buildContext` logs context size and source count via `mtninsights:context` [depends: 127]

### Bottle: Downstream Task Generation

- [x] Burst 136: `generateTask` accepts curated_context and task_intent, calls LLM adapter [depends: 134, 55]
- [x] Burst 137: `generateTask` returns title, description, acceptance_criteria from LLM response [depends: 136]
- [x] Burst 138: `generateTask` output includes source_meeting_ids for traceability [depends: 137]
- [x] Burst 139: `generateTask` rejects output containing details not present in curated_context [depends: 137]
- [x] Burst 140: `generateTask` logs generation via `mtninsights:task` [depends: 136]

### Bottle: Evolutionary Learning

- [x] Burst 141: `detectTagDrift` compares current cluster centroid to stored centroid_snapshot [depends: 111, 113]
- [x] Burst 142: `detectTagDrift` triggers tag regeneration when centroid shift exceeds threshold [depends: 141, 116]
- [x] Burst 143: `detectTagDrift` logs drift magnitude via `mtninsights:cluster:drift` [depends: 141]

### Bottle: Human Feedback Loop

- [x] Burst 144: `overrideClient` updates client_detections table for a meeting_id [depends: 84]
- [x] Burst 145: `overrideTag` updates generated_tags in clusters table for a cluster_id [depends: 118]
- [x] Burst 146: `flagExtraction` marks artifact row for re-extraction [depends: 69]

### Bottle: Batch Processing Pipeline

- [x] Burst 147: `processNewMeetings` scans raw-transcripts/, parses, ingests, extracts, and embeds all unprocessed files [depends: 32, 68, 84, 96]
- [x] Burst 148: `processNewMeetings` skips files already in processed/ [depends: 147, 34]
- [x] Burst 149: `processNewMeetings` logs failures to audit/ and moves failed files to failed-processing/ [depends: 147, 29]
- [x] Burst 150: `processNewMeetings` runs client detection for each ingested meeting [depends: 147, 84]
- [x] Burst 151: `processNewMeetings` logs full pipeline summary via `mtninsights:pipeline` [depends: 147]

### Bottle: CLI & Runtime Infrastructure

- [x] Burst 152: `data/clients/clients.json` seeded with real clients derived from actual transcript attendance (Mandalore/@llsa.com, Revenium/@revenium.io+@revenium.com, Hypercurrent/@hypercurrent.io, TQ/title-only) [depends: none]
- [x] Burst 153: `seedClients` uses `INSERT OR IGNORE` for idempotent re-seeding [depends: 71]
- [x] Burst 154: `scripts/setup.ts` creates DB directories, runs migrations, seeds clients, creates LanceDB tables — safe to re-run repeatedly [depends: 37, 72, 92]
- [x] Burst 155: `scripts/run.ts` processes all new meetings through full pipeline using env-based config; validates `ANTHROPIC_API_KEY` before starting [depends: 147, 154]
- [x] Burst 156: `scripts/reset.ts` deletes DB files and restores processed/failed folders to raw-transcripts for a clean development iteration [depends: none]
- [x] Burst 157: `package.json` gains `setup`, `process`, and `reset` scripts backed by `tsx` [depends: 154, 155, 156]
- [x] Burst 158: `.env.local` stores `ANTHROPIC_API_KEY`; loaded via `process.loadEnvFile()` (Node 21+ built-in); added to `.gitignore` [depends: none]

### Bottle: Prompt Externalization

- [x] Burst 159: `config/prompts/extraction.md` externalizes the LLM extraction prompt — defines all structured fields (summary, decisions, proposed_features, action_items, technical_topics, open_questions, risk_items, notes) with `{{transcript}}` placeholder [depends: none]
- [x] Burst 160: `extractSummary` accepts optional fourth parameter `promptTemplate?: string`; when provided replaces `{{transcript}}` with speaker turns, otherwise sends raw transcript [depends: 63]
- [x] Burst 161: `processNewMeetings` accepts `extractionPromptPath?: string` in `PipelineConfig`; loads template once from disk and passes to each `extractSummary` call [depends: 147, 160]

### Fix: LanceDB Local Connection

- [x] Burst 162: `connectVectorDb` resolves relative paths to absolute via `resolve()` before passing to `lancedb.connect()` — prevents newer `@lancedb/lancedb` versions from interpreting relative paths as cloud URIs [depends: 91]

### Bottle: Batch Export Format

- [x] Burst 163: `ManifestEntry` interface and `parseManifest(rawDir)` reads `manifest.json` from a raw-transcripts directory and returns typed meeting metadata array [depends: none]
- [x] Burst 164: `parseMarkdownTranscriptBody` parses `**Name | MM:SS**` bold-markdown speaker turns (Krisp batch export format); normalises `Speaker N` → `Unknown Speaker N` [depends: 20]
- [x] Burst 165: `parseKrispFolder(rawDir, folderName, entry)` builds a `ParsedMeeting` from a manifest entry and its folder's `transcript.md`, using `meeting_id` as `externalId` [depends: 163, 164]
- [x] Burst 166: `ParsedMeeting` gains optional `externalId?: string`; `ingestMeeting` uses `externalId ?? randomUUID()` so manifest-provided IDs are preserved in the DB [depends: 43]
- [x] Burst 167: `processNewMeetings` detects `manifest.json` in `rawDir` and switches to folder-based processing using `parseKrispFolder`; falls back to legacy flat-file path when no manifest present (backward-compatible for test suites) [depends: 147, 165]
- [x] Burst 168: `processNewMeetings` uses DB-based deduplication in manifest mode — checks meeting_id against `meetings` table rather than `processed/` directory listing [depends: 167, 148]

### Bottle: Pipeline Progress & Run Logging

- [x] Burst 169: `PipelineEvent` discriminated union exported from `src/pipeline.ts` — four variants: `processing` (index, total), `ok` (client, elapsed_ms), `failed` (reason, elapsed_ms), `skipped` (index, total) [depends: none]
- [x] Burst 170: `PipelineConfig` gains optional `onProgress?: (event: PipelineEvent) => void`; pipeline emits `processing` event before each unprocessed meeting with 1-based index and total count [depends: 169, 147]
- [x] Burst 171: pipeline emits `ok` event with detected client name and wall-clock `elapsed_ms` after each successful meeting [depends: 170]
- [x] Burst 172: pipeline emits `failed` event with error reason and `elapsed_ms` when parse or processing fails [depends: 170]
- [x] Burst 173: pipeline emits `skipped` event (with index and total) for meetings already present in DB or processed directory [depends: 170]
- [x] Burst 174: `scripts/run.ts` implements `onProgress` — prints per-meeting status line to console (`[i/N] title ... ✓ [client] (ms)` or `✗ FAILED\n  reason`) and writes full run log to `data/audit/run-{iso}.json` including all events, summary counts, and timing [depends: 169–173]

### Bottle: Query CLI

- [x] Burst 175: `scripts/query.ts` parses all flags (`--client`, `--meeting`, `--after`, `--before`, `--list`, `--search`, `--limit`) and implements `resolveMeetingIds()` helper that applies all filters — date range and title/ID substring via in-memory filter on all meetings, client via `client_detections` join [depends: 37, 100]
- [x] Burst 176: `--list meetings` prints a padded table of matched meetings: 8-char ID prefix, title (truncated at 40 chars), date, detected client, confidence score [depends: 175, 84]
- [x] Burst 177: `--list summary` prints full artifact dump per matched meeting — header bar with title/date/client, then SUMMARY / DECISIONS / PROPOSED FEATURES / ACTION ITEMS / TECHNICAL TOPICS / OPEN QUESTIONS / RISKS sections, each only printed when non-empty [depends: 175, 69]
- [x] Burst 178: `--list decisions|actions|questions|risks|features` prints focused single-field dumps with per-meeting header; action items include owner and optional due date; all modes respect `--client`, `--meeting`, `--after`, `--before` [depends: 177]
- [x] Burst 179: `--search` runs `searchMeetings()` with active filters and prints results with score, title, date, client tag, and summary excerpt (first 200 chars); default ask mode runs `searchMeetings()` + `buildRichContext()` (all artifact fields concatenated) + Anthropic SDK direct call for a plain-text answer with `Sources:` footer [depends: 175, 100, 69]
- [x] Burst 180: `package.json` gains `query` script: `"query": "tsx scripts/query.ts"` [depends: 175]
- [x] Burst 181: `README.md` documents prerequisites, setup (model download, .env.local, pnpm setup), processing (pnpm process, extraction prompt), all query modes with concrete examples (list/filter/summary/focused/search/ask), reset workflow, transcript folder format, and environment variables [depends: 175–180]

### Bottle: Additional Notes Field

- [x] Burst 182: `migrate()` in `src/db.ts` checks `PRAGMA table_info(artifacts)` for column existence; if absent executes `ALTER TABLE artifacts ADD COLUMN additional_notes TEXT DEFAULT '[]'` — idempotent on new and existing databases [depends: 38]
- [x] Burst 183: `Artifact` interface gains `additional_notes: Array<Record<string, unknown>>`; added to `REQUIRED_KEYS`; `validateArtifact` verifies field exists, is an array, and every element is a plain object (not null, not array, not primitive) [depends: 182]
- [x] Burst 184: `validateArtifact` normalizes malformed `additional_notes` to `[]` rather than throwing — if value is not an array or contains non-objects, logs the malformation and replaces with `[]`; pipeline never aborts for this field [depends: 183]
- [x] Burst 185: `ArtifactRow` gains `additional_notes: string`; `storeArtifact` serializes with `JSON.stringify`; `mergeArtifacts` concatenates note arrays across chunks [depends: 182, 183]
- [x] Burst 186: `STUB_FIXTURES.extraction` in `src/llm-adapter.ts` includes `additional_notes: [{ category: "Context", notes: ["Stub note about constraints and tradeoffs."] }]` [depends: 183]
- [x] Burst 187: `buildEmbeddingInput` in `src/meeting-pipeline.ts` canonicalizes `additional_notes` into embedding text — iterates top-level objects, emits first string-valued key as section header and remaining string values as lines; deterministic and readable regardless of model-chosen key names [depends: 185, 186]
- [x] Burst 188: `--list notes` (alias `--list additional_notes`) added to `scripts/query.ts` dispatch — renders per-meeting header then each note group with top-level key as section label and nested content indented with `•` [depends: 185]
- [x] Burst 189: `buildRichContext` in `scripts/query.ts` appends canonicalized notes after all higher-signal fields, capped at 1000 chars per meeting; content exceeding cap truncated with `…` [depends: 185]
- [x] Burst 190: `extractSummary` logs `notes_count` (array length) and `notes_size` (char count of serialized notes) via `mtninsights:extract` after each extraction [depends: 183, 186]

### Bottle: LLM Provider Interface

- [x] Burst 191: `PromptType` renamed to `LlmCapability`; values renamed: `"extraction"` → `"extract_artifact"`, `"tags"` → `"cluster_tags"`, `"task"` → `"generate_task"`; `"synthesize_answer"` added with stub fixture `{ answer: "Stub answer based on meeting context." }`; callers updated: `src/extractor.ts`, `src/cluster-topics.ts`, `src/task-generation.ts` [depends: none]
- [x] Burst 192: `createLlmAdapter` accepts `LocalConfig { type: "local"; baseUrl: string; model: string }` and implements Ollama provider via `fetch` — `POST {baseUrl}/api/chat` with `{ model, messages, stream: false }`; `extract_artifact`/`cluster_tags`/`generate_task` parse response JSON; `synthesize_answer` returns `{ answer: content }` directly [depends: 191]
- [x] Burst 193: Both providers classify errors before any repair attempt — Anthropic checks `instanceof Anthropic.RateLimitError` / `APIError`; local checks HTTP status 429/5xx; all throw with typed prefix: `"[rate_limit] ..."`, `"[api_error] ..."`, `"[json_parse] ..."`; `processEntry` in `src/pipeline.ts` extracts prefix and adds `error_type` field to audit JSON entries — making run logs scannable for rate limit patterns [depends: 192]
- [x] Burst 194: JSON repair loop fires on `[json_parse]` errors only — retries once with repair prefix `"The previous response was not valid JSON. Return only a valid JSON object with no prose.\n\nOriginal request:\n"`; on second failure returns `{ __fallback: true, raw_text: firstResponseText.slice(0, 500) }`; `extractSummary` detects `__fallback` sentinel and returns minimal artifact (empty arrays, `summary: ""`, `additional_notes: []`) without throwing; API errors (`[rate_limit]`, `[api_error]`) bypass repair loop entirely [depends: 193, 185]
- [x] Burst 195: All providers log via `mtninsights:llm` after each call: `provider capability model latency_ms` + token count (Anthropic: `usage.output_tokens`; local: response char count; stub: `0`) [depends: 192]
- [x] Burst 196: `scripts/run.ts` and `scripts/query.ts` read `MTNINSIGHTS_LLM_PROVIDER` (default `"anthropic"`), `MTNINSIGHTS_LOCAL_BASE_URL` (default `"http://localhost:11434"`), `MTNINSIGHTS_LOCAL_MODEL` (default `"llama3.1:8b"`) and build `createLlmAdapter` config accordingly; `ANTHROPIC_API_KEY` only required when `provider=anthropic`; `scripts/query.ts` removes direct Anthropic SDK import and routes ask mode through `llm.complete("synthesize_answer", ...)` [depends: 191, 193, 194]
- [x] Burst 197: `scripts/setup.ts` validates Ollama server reachable when `MTNINSIGHTS_LLM_PROVIDER=local` — `GET {baseUrl}/api/tags`; on failure prints error with install/start instructions and exits [depends: 196]
- [x] Burst 198: `scripts/setup.ts` verifies configured model exists in Ollama tag list; if absent auto-pulls via `POST {baseUrl}/api/pull { "name": model, "stream": false }` and waits for completion [depends: 197]
- [x] Burst 199: `buildRichContext` renamed to `buildLabeledContext` in `scripts/query.ts` — prefixes each meeting block `[M1]`, `[M2]`, …`[Mn]`; system prompt instructs model to cite only those IDs; after response, `parseCitations()` extracts `[Mn]` references; `Sources:` line derived from cited IDs mapped to meeting titles; falls back to all retrieved titles if no citations found [depends: 196]
- [x] Burst 200: `scripts/eval.ts` evaluation harness reads `data/eval/questions.json` (array of `{ question: string, client?: string }`), runs each via `searchMeetings` + `buildLabeledContext` + `llm.complete("synthesize_answer", ...)`, writes `data/eval/results-{provider}-{timestamp}.jsonl` with fields: `question`, `retrieved_meeting_ids`, `cited_ids`, `latency_ms`, `answer_length`, `provider`, `model`; `data/eval/questions.json` pre-populated with 5 questions spanning Mandalore, TQ, Revenium, Hypercurrent [depends: 199]
- [x] Burst 201: `package.json` gains `eval` script: `"eval": "tsx scripts/eval.ts"` [depends: 200]

### Bottle: UI Foundation — Electron + IPC

- [x] Burst 202: Install `electron`, `electron-vite`, `react`, `react-dom`, `@vitejs/plugin-react`; `electron.vite.config.ts` with custom paths (main=`electron/main/`, preload=`electron/preload/`, renderer=`ui/`); `electron/main/index.ts` opens a BrowserWindow loading the renderer; `ui/index.html` + `ui/src/main.tsx` + `ui/src/App.tsx` stubs; `pnpm ui:dev` starts Electron dev server [depends: none, infra]
- [x] Burst 203: `electron/channels.ts` exports `CHANNELS` const with 4 string values (`GET_CLIENTS`, `GET_MEETINGS`, `GET_ARTIFACT`, `CHAT`); `electron/preload/index.ts` exposes `window.api` via contextBridge using those channels; `ElectronAPI` interface exported from `electron/channels.ts`; test: all 4 channel strings are unique, non-empty, and match between preload and ipc-handler imports [depends: 202]
- [x] Burst 204: `handleGetClients(db)` in `electron/ipc-handlers.ts` queries `SELECT name FROM clients ORDER BY name` and returns `string[]`; test: in-memory db seeded with clients returns all names [depends: 203]
- [x] Burst 205: `handleGetMeetings(db, opts: { client?, after?, before? })` returns `Array<{ id, title, date, client, series }>` where `client` is top confidence detection and `series` is normalized title (lowercased, whitespace-collapsed); date range and client filters applied; test: all three filters work independently [depends: 204]
- [x] Burst 206: `handleGetArtifact(db, meetingId)` returns `Artifact` with all fields JSON-parsed or `null` if not found; test: found returns full artifact, not-found returns null [depends: 205]
- [x] Burst 207: `src/labeled-context.ts` exports `buildLabeledContext(db, meetingIds: string[])` — fetches meetings + artifacts from SQLite for given IDs, sorts newest-first, builds `[M1]…[Mn]` labeled blocks (title · date · section headers with content), returns `{ contextText: string, charCount: number, meetings: Array<{id, title, date}> }`; test: 2 meeting IDs produce labeled blocks with [M1] and [M2] prefixes and correct char count [depends: 68]
- [x] Burst 208: `handleChat(db, llm, { meetingIds, question })` in `electron/ipc-handlers.ts` calls `buildLabeledContext`, builds system+user prompt, calls `llm.complete("synthesize_answer", context+question)`, calls `parseCitations`, returns `{ answer: string, sources: string[], charCount: number }`; test: stub llm returns expected response shape [depends: 207, 203]

### Bottle: Renderer Scaffold

- [x] Burst 209: Install `tailwindcss`, `@tailwindcss/vite`, `react-resizable-panels`, `lucide-react`, `@tanstack/react-query`, `@radix-ui/react-collapsible`, `@radix-ui/react-select`; devDependencies: `@testing-library/react`, `jsdom`, `@types/react`, `@types/react-dom`; `ui/tailwind.config.ts` + `ui/src/index.css` with dark mode; `vitest.config.ts` gains `environmentMatchGlobs: [["test/ui/**", "jsdom"]]` and `include` covers `test/ui/**/*.test.tsx`; test: `App` renders without crashing in jsdom smoke test [depends: 202]

### Bottle: Layout Shell

- [x] Burst 210: `ui/src/components/ScopeBar.tsx` — receives `clients: string[]`, `selectedClient: string | null`, `dateRange: { after: string; before: string }`, `onClientChange`, `onDateChange`, `onReset` props; renders Radix Select for clients, two `<input type="date">` for range, Reset button; test: all clients rendered as options, Reset click fires onReset, client select fires onClientChange [depends: 209]
- [x] Burst 211: `ui/src/components/AppLayout.tsx` uses `react-resizable-panels` `PanelGroup direction="horizontal"` with 4 panels (Clients, Meetings, Context, Chat) and resize handles; each panel has data-testid; test: all 4 panel testids present in DOM [depends: 209]
- [x] Burst 212: Context panel and Chat panel each have a collapse toggle button; collapsed Context panel sets its `defaultSize` to 0; collapsed Chat panel sets its `defaultSize` to 0; other panel expands; test: toggle buttons present, clicking one fires onCollapseContext / onCollapseChat callback [depends: 211]

### Bottle: Clients Column

- [x] Burst 213: `ui/src/components/ClientsColumn.tsx` — receives `clients: string[]`, `selected: string | null`, `onSelect: (name: string) => void`; renders a scrollable list of client names; selected item has `aria-selected="true"`; clicking calls `onSelect`; test: renders clients, click fires onSelect with correct name [depends: 209]

### Bottle: Meetings Column

- [x] Burst 214: `ui/src/components/MeetingsColumn.tsx` — receives `meetings: MeetingRow[]`, `selected: Set<string>`, `onToggle: (id: string) => void`, `onToggleGroup: (ids: string[]) => void`; derives series groups from meetings sharing the same normalized title; renders one group header + meeting rows per series; test: 3 meetings with "DSU" in title render under one group label, 1 other title is its own group [depends: 209]
- [x] Burst 215: each meeting row has a checkbox; checking fires `onToggle(meetingId)`; group header has "Select all" button that fires `onToggleGroup` with all IDs in the group; test: checkbox change fires onToggle, Select-all fires onToggleGroup [depends: 214]
- [x] Burst 216: meetings within each group sorted newest-first (descending ISO date); test: of two meetings in same series, later date renders first in DOM [depends: 214]

### Bottle: Context View Column

- [x] Burst 217: `ui/src/components/ContextViewColumn.tsx` — receives `meetings: MeetingWithArtifact[]`; renders one block per meeting with title + ISO date in a header; test: 2 meetings → 2 headers with correct titles [depends: 209]
- [x] Burst 218: each meeting block has 8 collapsible sections (Summary, Decisions, Action Items, Open Questions, Risks, Proposed Features, Technical Topics, Additional Notes) using `@radix-ui/react-collapsible`; all sections closed by default; clicking a section trigger opens it; test: section content element has `data-state="closed"` initially, click changes it to `data-state="open"` [depends: 217]
- [x] Burst 219: a section is not rendered when its content is empty (empty string, empty array, or array of empty objects); test: meeting with empty `decisions` array has no Decisions section in DOM [depends: 218]

### Bottle: Chat Column

- [x] Burst 220: `ui/src/components/ChatColumn.tsx` — receives `contextInfo: { meetingCount: number; charCount: number }`, `onChat: (q: string) => Promise<ChatResponse>`; renders textarea, Send button, and indicator "Context: N meetings | M characters"; test: indicator shows correct meeting count and char count from props [depends: 209]
- [x] Burst 221: pressing Enter (non-shifted) or clicking Send submits the question, calls `onChat` with trimmed text, clears the textarea; test: after submit, onChat called with trimmed question and textarea is empty [depends: 220]
- [x] Burst 222: after `onChat` resolves, the Q/A pair renders: question text in muted style, answer below it, Sources list with meeting titles from `response.sources`; test: Q/A pair and sources list appear in DOM [depends: 221]
- [x] Burst 223: multiple submissions accumulate as separate Q/A pairs; updating contextInfo does not clear history; test: 2 submits → 2 Q/A pairs visible simultaneously [depends: 222]

### Bottle: Data Hooks

- [x] Burst 224: `ui/src/hooks/useClients.ts` — calls `window.api.getClients()` via `useQuery({ queryKey: ['clients'] })`; test: mock `window.api.getClients` resolves with client array, hook returns it [depends: 209]
- [x] Burst 225: `ui/src/hooks/useMeetings.ts` — calls `window.api.getMeetings(filters)` with queryKey `['meetings', filters]`; refetches when filters object changes; test: changing filter object triggers new invocation [depends: 224]
- [x] Burst 226: `ui/src/hooks/useArtifact.ts` — calls `window.api.getArtifact(meetingId)` only when meetingId is defined (`enabled: !!meetingId`); test: with undefined meetingId, `window.api.getArtifact` is never called [depends: 224]

### Bottle: App Wiring + Scripts + Docs

- [x] Burst 227: `ui/src/App.tsx` composes ScopeBar + AppLayout with all 4 columns; state: `selectedClient`, `dateRange`, `selectedMeetingIds: Set<string>`; client change resets `selectedMeetingIds`; date change prunes meetings outside range from selectedMeetingIds; ContextViewColumn receives selected meetings (or all scope meetings when selection empty); test: App renders all 4 panel testids [depends: 210–226]
- [x] Burst 228: App wires chat — `onChat` in App builds context from `selectedMeetingIds` (or all scope IDs when empty), calls `window.api.chat(...)`, returns result to ChatColumn; `package.json` gains `"ui:dev": "electron-vite dev"` and `"ui:build": "electron-vite build"`; README gains "Meeting Intelligence Explorer UI" section: prerequisites, `pnpm setup`, `pnpm ui:dev`, 4-column layout description, chat usage [depends: 227, 208]

### Bottle: node:sqlite Migration (Refactor — DONE)

- [x] Burst 229: Replace `better-sqlite3` (native C++ addon, ABI mismatch between system Node.js v25 / ABI 141 and Electron's embedded Node.js v24 / different ABI) with Node.js built-in `node:sqlite` (`DatabaseSync`) — zero native files, no ABI conflicts, available in both runtimes; update `src/db.ts` runtime import; replace `import type { Database } from "better-sqlite3"` with `import type { DatabaseSync as Database } from "node:sqlite"` in all 26 source/test/script files; fix `db.open` test with behavioral `SELECT 1` assertion; fix `storeArtifact` undefined binding bug (`additional_notes ?? []`); add `as unknown as T[]` double-casts in `ipc-handlers.ts` and `scripts/query.ts`; remove `better-sqlite3`, `@types/better-sqlite3`, `@electron/rebuild` from `package.json`; drop `preui:dev` and `ui:restore` scripts; simplify `ui:dev` to `"electron-vite dev"`; all 212 tests pass (commit: `8baf65a`) [depends: 37]

---

### Bottle: Theme System

- [x] Burst 230: Theme foundation — `ui/src/theme.ts` defines 3 named theme objects (`deepSea`, `daylight`, `midnight`), each a record of CSS custom-property key/value pairs; `ui/src/ThemeContext.tsx` exports `ThemeProvider` (wraps app, writes `data-theme` attr on `<html>`, persists choice in `localStorage`) and `useTheme()` hook returning `{ theme, setTheme, themes }`; `ui/src/index.css` defines `[data-theme="deep-sea"]`, `[data-theme="daylight"]`, `[data-theme="midnight"]` blocks each declaring: `--color-bg-base`, `--color-bg-panel`, `--color-bg-surface`, `--color-bg-elevated`, `--color-bg-input`, `--color-border`, `--color-border-focus`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-accent`, `--color-accent-hover`, `--color-accent-muted`, `--color-danger`, `--color-success`; Deep Sea: dark navy base `#0b1120`; Daylight: white/slate base `#f8fafc`; Midnight: near-black `#09090b` with indigo accents; test: `ThemeProvider` sets correct `data-theme` on `document.documentElement`, persists to `localStorage`, `useTheme` returns correct theme and setter [depends: 209]

- [x] Burst 231: Theme switcher in ScopeBar — ScopeBar accepts `theme`, `setTheme`, `themes` props; compact cycle button at right edge of scope bar (after Reset) cycles through 3 themes; icon changes per theme (Sun/Daylight, Moon/Midnight, Droplets/Deep Sea); test: clicking switcher cycles `theme` value, `setTheme` called with next theme name [depends: 230, 205]

- [x] Burst 232: Apply theme to AppLayout structural chrome — replace all hardcoded hex colors (`#27272a`, `#18181b`) and `bg-zinc-*` / `border-zinc-*` classes in `AppLayout.tsx` with CSS-var arbitrary values (`bg-[var(--color-bg-base)]`, `border-[var(--color-border)]`, etc.); App.tsx root div uses `bg-[var(--color-bg-base)] text-[var(--color-text-primary)]`; ThemeProvider wraps App in `ui/src/main.tsx`; test: switching theme updates `data-theme` and root div bg class [depends: 231]

- [x] Burst 233: Apply theme to all 4 column components — `ClientsColumn`: replace `bg-zinc-800/900`, `text-zinc-100/400/700` with CSS-var classes; `MeetingsColumn`: hover, selected, muted metadata; `ScopeBar`: Select trigger/content, date inputs, Reset button; `ContextViewColumn`: section headers, dividers, content text; `ChatColumn`: context indicator, textarea, send button, Q/A text, sources, copy button; test: each component snapshot contains no `zinc-` class strings [depends: 232]

---

### Bottle: Electron Data Path Fix

- [x] Burst 234: Fix DB and LanceDB paths in `electron/main/index.ts` — relative paths (`"db/mtninsights.db"`, `"db/lancedb"`) resolve against Electron binary working directory (not project root), causing "No meetings in scope" in the UI; resolve using `path.join(app.getPath('userData'), ...)` for writable data or detect project root via `process.cwd()` / `import.meta.dirname`; log resolved paths at startup; test: infra commit — verified manually that meetings populate in `pnpm ui:dev` [depends: 204]

---

### Bottle: Semantic Search Integration

- [x] Burst 235: `SEARCH_MEETINGS` IPC channel + types — add `SEARCH_MEETINGS: "search-meetings"` to `electron/channels.ts`; export `SearchRequest` (`query: string`, `client?: string`, `date_after?: string`, `date_before?: string`, `limit?: number`) and `SearchResultRow` (`meeting_id: string`, `score: number`, `client: string`, `meeting_type: string`, `date: string`) interfaces; test: channel constant and both interface shapes are exported and type-safe [depends: 202]

- [x] Burst 236: `handleSearchMeetings` + preload exposure — add `handleSearchMeetings(vdb, session, req: SearchRequest): Promise<SearchResultRow[]>` to `electron/ipc-handlers.ts` wrapping existing `searchMeetings()` from `src/vector-search.ts`; add `search: (req: SearchRequest) => ipcRenderer.invoke(Channels.SEARCH_MEETINGS, req)` to contextBridge in `electron/preload/index.ts`; update `window.api` type declaration; test: stub vdb + session, assert handler returns correctly shaped results [depends: 235, 100]

- [x] Burst 237: Main process loads VectorDB + ONNX at startup — after `createWindow()`, load `connectVectorDb(VECTOR_PATH)` and `loadModel(MODEL_PATH, TOKENIZER_PATH)` in background; register `ipcMain.handle(Channels.SEARCH_MEETINGS, ...)` once both resolve; use same env-based path constants as CLI scripts (`MTNINSIGHTS_VECTOR_PATH`, etc.); infra commit, no new tests [depends: 236, 234]

- [x] Burst 238: `useSearch` hook — `ui/src/hooks/useSearch.ts` wraps `window.api.search` in `useQuery` with `queryKey: ['search', query, client]`, `queryFn: () => window.api.search({ query, client })`, `enabled: query.trim().length >= 2`, `staleTime: 60_000`; test: mock `window.api.search`, hook fires only when query ≥ 2 chars, returns empty array when disabled [depends: 230, 235]

- [x] Burst 239: SearchBar component + App wiring — `ui/src/components/SearchBar.tsx` renders a text input (magnifying glass icon, CSS theme vars) in the ScopeBar row; results dropdown shows meeting title + date + relevance score; selecting a result calls `onSelectResults` in App, sets `selectedMeetingIds` and `pinnedSearchResults`, feeds ContextViewColumn and ChatColumn without requiring client/meeting drill-down; test: renders input, typing ≥ 2 chars shows results, clicking result calls onSelectResults [depends: 238, 231]

---

### Bottle: Client-Specific Extraction Refinement

- [x] Burst 240: `refinement_prompt` in client schema + DB — add `refinement_prompt TEXT` column to `clients` table via `ALTER TABLE` in `migrate()` (`src/db.ts`); update `ClientRow` interface to include `refinement_prompt: string | null`; update `seedClients` INSERT to include `refinement_prompt ?? null`; add `refinement_prompt` to LLSA entry in `data/clients/clients.json`; test: seed client with refinement_prompt → `getClientByName` returns field; seed without → field is null [depends: 10]

- [x] Burst 241: `extractSummary` injects refinement into prompt — add `{{client_context}}` placeholder to `config/prompts/extraction.md` before `## Transcript` section; add optional `refinementPrompt?: string` parameter to `extractSummary` in `src/extractor.ts`; when present replace `{{client_context}}` with `## Client Context\n\n{text}\n\n`, when absent replace with empty string; test: recording adapter captures content arg — assert `## Client Context` + refinement text appear when provided; assert placeholder is gone when omitted [depends: 240]

- [x] Burst 242: Pipeline reorders detect→extract, threads client refinement — reorder `processNewMeetings` in `src/pipeline.ts` to run `detectClient + storeDetection` before `extractSummary`; after detection look up top client's `refinement_prompt` via `getClientByName`, pass as `refinementPrompt` to `extractSummary`; test: seed DB with client with refinement, ingest matching meeting, run pipeline with recording adapter, assert captured prompt contains refinement text [depends: 241]

### Bottle: Meeting Name Matching + Speaker Name Detection + Client Assignment Utility

- [x] Burst 243: `meeting_names` field in client schema + DB — add `meeting_names TEXT DEFAULT '[]'` column via idempotent `ALTER TABLE` in `migrate()` (`src/db.ts`); update `ClientRow.meeting_names: string`, `ClientEntry.meeting_names?: string[]`, and `seedClients` INSERT to 5-column form; add `meeting_names` array to LLSA in `data/clients/clients.json`; tests: seed with meeting_names → `getClientByName` returns parseable array; seed without → field is `'[]'`
- [x] Burst 244: Fuzzy meeting_names matching in detectClient — export `normalizeTokens(s): Set<string>` (lowercase + non-alphanum→space + split); add `meetingNameMatches()` predicate (all name tokens in title tokens); integrate into `detectClient` with updated confidence table: meeting_name only → 0.7, participant+meeting_name → 0.95; tests: exact title match → detected method `meeting_name` confidence 0.7; folder-derived title `appdev_leads_dsu-019cabc` matches `AppDev Leads DSU`; participant+meeting_name → 0.95 [depends: 243]
- [x] Burst 245: Speaker name → participant email matching in detectClient — export `nameTokensFromParticipant(entry)` (extracts local-part tokens from email, or whole entry for plain names, empty set for `@domain` patterns); export `parseSpeakerNames(rawTranscript)` (parse `Name | HH:MM` lines, deduplicated); integrate `speakerMatchesParticipants()` into `detectClient` with method prefix `speaker_name` vs `participant`; tests: full name match, first-name-only match, plain-name match, domain-pattern is skipped, speaker_name+meeting_name combo [depends: 244]
- [x] Burst 246: `assign-client` utility script — create `scripts/assign-client.ts` with exported `assignClient(db, identifier, clientName): AssignResult`; try exact ID match then title LIKE substring; throw if client unknown or no meeting found; DELETE then INSERT with `confidence=1.0, method='manual'`; CLI wrapper via `isMain` check; add `"assign-client": "tsx scripts/assign-client.ts"` to `package.json`; tests: exact ID match, title substring (updates all), no match throws, unknown client throws, replaces pre-existing detection [depends: 243]

### Bottle: Project Directory Reorganization

- [x] Burst 247: `src/` → `core/` — `git mv src core`; update `tsconfig.json` include glob; bulk-replace `../src/` → `../core/` in all `test/` and `cli/` files; replace `../src/` and `../../src/` → `../../core/` in `electron/` files; 256 tests pass (commit: `1a5edc5`)
- [x] Burst 248: `scripts/` → `cli/` — `git mv scripts cli`; update 6 `package.json` script entries; fix `test/assign-client.test.ts` import from `../scripts/` → `../cli/`; 256 tests pass (commit: `0076986`)
- [x] Burst 249: `electron/` + `ui/` → `electron-ui/` — `git mv electron electron-ui/electron && git mv ui electron-ui/ui`; update `electron.vite.config.ts` (4 paths); add `electron-ui/**/*` to `tsconfig.json` include; fix import depths in moved files (+1 level); update all test imports; 256 tests pass (commit: `98c4218`)
- [x] Burst 250: `api/` stub — create `api/server.ts` with placeholder comment for Bottle 10 (commit: `9a75083`)
- [x] Burst 251: Update project structure in ketchup plan + MEMORY.md [depends: 247–250]

### Bottle: HTTP API (Hono)

- [x] Burst 252: Hono skeleton + `GET /api/debug` — install `hono` + `@hono/node-server`; `api/server.ts` exports `app` (Hono instance) + `startServer(port)`; `/api/debug` returns `{db_path, client_count, meeting_count}`; test: `app.request("/api/debug")` asserts shape
- [x] Burst 253: `GET /api/clients` + `GET /api/meetings` — reuse `handleGetClients`/`handleGetMeetings` from `electron-ui/electron/ipc-handlers.ts`; parse `?client=&after=&before=` query params; test: seed DB, assert client list and filtered meeting list
- [x] Burst 254: `GET /api/meetings/:id/artifact` + `POST /api/chat` — reuse `handleGetArtifact`/`handleChat`; stub LLM; 404 when artifact missing; test: valid id returns Artifact shape, unknown id → 404, chat returns answer/sources
- [x] Burst 255: `GET /api/search` — reuse `handleSearchMeetings`; lazy-load embedder + vector DB; guard: 400 if query < 2 chars; test: mock `searchMeetings`, assert route calls it with correct params + 400 on short query [depends: 252]
- [x] Burst 256: `api:dev` script (chore) — `"api:dev": "tsx api/server.ts"` in `package.json`; `isMain` guard calls `startServer(PORT ?? 3000)` [depends: 255]

### Bottle: Linear UI Redesign

- [x] Burst 257: `Sidebar` component — replaces `ClientsColumn`; props: `{clients, selected, onSelect}`; fixed 240px, indigo dot indicator; test: renders list, click fires onSelect, selected has aria-selected
- [x] Burst 258: `TopBar` component — replaces `ScopeBar`; same scope props (client dropdown, date range, reset, theme toggle) + SearchBar inline; test: date change, reset, theme cycle
- [x] Burst 259: `MeetingList` component — replaces `MeetingsColumn`; adds `selectedId`/`onSelect` (single-click → detail) alongside existing `checked`/`onCheck`/`onCheckGroup` (multi-select); series grouping preserved; test: series grouping, row click fires onSelect, checkbox fires onCheck
- [x] Burst 260: `MeetingDetail` component — combines `ContextViewColumn` + `ChatColumn`; props: `{meeting, artifact, chatContext: {meetingIds, charCount}, onChat}`; artifact sections at top (collapsible), chat at bottom; null meeting → placeholder; test: renders artifact sections, chat submit, placeholder
- [x] Burst 261: `LinearShell` layout — replaces `AppLayout`; props: `{topBar, sidebar, main, detail, detailOpen}`; flex column layout, 240px fixed sidebar, flex-1 main, 480px detail panel (CSS transition); no react-resizable-panels; test: all zones render, detail hidden when detailOpen=false
- [x] Burst 262: App.tsx rewrite + delete old components — add `selectedMeetingId` state; wire new components; `activeMeetingIds` = checked set or [selectedMeetingId]; delete 6 old components + 6 old test files; update app.test.tsx [depends: 257–261]
- [x] Burst 263: Design tokens (chore) — update `index.css` + `theme.ts` with indigo accent `#6366f1` across all 3 themes [depends: 262]
- [x] Burst 264: `web:dev` mode — `api-client.ts` (HTTP fetch impl of `ElectronAPI`); `main-web.tsx` (web entry assigns apiClient to `window.api`); `vite.web.config.ts` (standalone Vite config); `"web:dev": "vite --config vite.web.config.ts"` script; test: all 5 apiClient methods mock fetch and verify URL + return value

### Bottle: Web UI Bug Fixes (Playwright audit 2026-03-01)

Findings from full Playwright MCP UI audit against `web:dev` + `api:dev`. Functional features confirmed working: client sidebar filter, client dropdown sync, meeting list load + grouping, meeting click → detail panel, all 8 artifact tabs (Summary/Decisions/Action Items/Open Questions/Risks/Proposed Features/Technical Topics/Additional Notes), Select all / Deselect all per group, individual checkboxes, context counter (meeting count + char count), chat input send-button enable/disable, date range filter, Reset (partial), theme cycle (deep-sea → daylight → midnight).

- [x] Burst 265: Fix Reset not clearing search text — lift `query`/`setQuery` to App.tsx; SearchBar controlled via TopBar props; `handleReset` sets to `""`; test: after Reset click, search input value is empty (commit: `6beb1ca`)
- [x] Burst 266: Add CORS middleware to `api/server.ts` — `app.use(cors())` via `hono/cors`; done 2026-03-01 (code in place)
- [x] Burst 267: Fix `web:dev` root URL — `configureServer` plugin in `vite.web.config.ts` rewrites `GET /` → `/index-web.html` (commit: `189d2c2`)
- [x] Burst 268: Search error feedback — `isError` from `useSearch`; SearchBar renders "Search unavailable" inline chip on error; test: stub fetch to reject, verify chip renders (commit: `edd64ee`)
- [x] Burst 269: Fix "1 meetings" grammar — `${n} meeting${n !== 1 ? "s" : ""}`; test: 1 → "1 meeting", 2 → "2 meetings" (commit: `0bdcd21`)

### Bottle: Meeting List Grouping + Resizable Columns (completed 2026-03-01)

- [x] Burst 270: Add `actionItemCount` to `MeetingRow` — LEFT JOIN artifacts in `handleGetMeetings` query; `COALESCE(json_array_length(a.action_items), 0)`; map `action_item_count` → `actionItemCount` in return; test: meeting with artifact returns count=1, meeting without artifact returns 0 (commit: `dd0e3d7`)
- [x] Burst 271: GroupBy selector above meeting list — `GroupBy = "series"|"day"|"week"|"month"` type; `groupBy`/`onGroupBy` props on `MeetingList`; pill bar with 4 buttons; active button `fontWeight: 600` + accent background; `groupBy` state in `App.tsx`; test: 4 buttons render, click "Day" calls `onGroupBy("day")`, active button has correct weight (commit: `ee8a8ab`)
- [x] Burst 272+273: Group meetings by day, week, month with stat headers — `groupByDay` (key=YYYY-MM-DD, label="Friday, Feb 27, 2026"), `groupByWeek` (ISO week, label="Week of Feb 23, 2026"), `groupByMonth` (key=YYYY-MM, label="February 2026"); `statLine` helper ("N meetings · N action items"); stat line shown for all temporal modes; full dispatcher switching all 4 modes; 8 tests (commit: `41a07d9`)
- [x] Burst 274+275: Resizable sidebar and detail columns — `sidebarWidth` state (default 240, min 140, max 400); `detailWidth` state (default 480, min 280, no max); drag handles (4px, `col-resize`) between sidebar↔main and main↔detail; detail handle only renders when `detailOpen`; main panel `minWidth: 200px`, `overflowX: auto`; 5 new tests (commit: `58c2413`)

### Bottle: UI Typography + Series Row Display (completed 2026-03-02)

- [x] Burst 276: Typography hierarchy — MeetingList: series mode rows show formatted date ("Feb 26, 2026") + client tag instead of duplicate title; group headers 0.9rem/700/primary color; items indented 24px with accent left-border on selection; `data-testid="meeting-row-{id}"` on rows. MeetingDetail: title 1rem/700; Section triggers 0.8rem with top-border dividers; Summary `defaultOpen`; action items render owner/due-date as pill tags; item spacing 6-8px; client as chip in header (commit: `b796a4b`)

### Bottle: shadcn/ui Migration (next)

**Goal:** Replace all bespoke inline-style components with shadcn/ui primitives built on Radix UI + Tailwind v4. Gives access to the full shadcn component library, consistent accessible patterns, and a design token system that matches our multi-theme CSS variable setup.

**Prerequisites already met:**
- `tailwindcss ^4.2.1` + `@tailwindcss/vite` installed
- `@radix-ui/react-collapsible`, `@radix-ui/react-select` already used
- `@import "tailwindcss"` in `index.css`; all 3 themes via `[data-theme]` selectors

**New packages needed:**
- `tailwind-merge` — for `cn()` utility
- `class-variance-authority` — for component variants
- `clsx` — conditional class composition
- `react-markdown` + `remark-gfm` — rich text rendering for AI chat responses (GFM: tables, strikethrough, task lists)

**Tailwind v4 theming bridge:** Use `@theme inline` in `index.css` to map our existing `--color-*` CSS vars to shadcn's color token names, so Tailwind utilities (`bg-background`, `text-primary`, etc.) dynamically pick up the active theme:
```css
@theme inline {
  --color-background:         var(--color-bg-base);
  --color-foreground:         var(--color-text-primary);
  --color-card:               var(--color-bg-panel);
  --color-card-foreground:    var(--color-text-primary);
  --color-primary:            var(--color-accent);
  --color-primary-foreground: oklch(1 0 0);
  --color-secondary:          var(--color-bg-elevated);
  --color-secondary-foreground: var(--color-text-secondary);
  --color-muted:              var(--color-bg-elevated);
  --color-muted-foreground:   var(--color-text-muted);
  --color-border:             var(--color-border-val);  /* see note */
  --color-input:              var(--color-bg-input);
  --color-ring:               var(--color-accent);
  --color-destructive:        var(--color-danger);
  --radius: 0.375rem;
}
```
Note: rename `--color-border` → `--color-border-val` in `[data-theme]` blocks to avoid the self-referential `var(--color-border)` issue in `@theme inline`.

**Component migration order (one burst per component):**
1. `lib/utils.ts` + `components/ui/` scaffold + deps install (infra, no tests)
2. `components/ui/button.tsx` + `components/ui/badge.tsx`
3. `MeetingList.tsx` → Tailwind classes; group buttons → shadcn `Button`; pills → `Badge`
4. `LinearShell.tsx` → Tailwind classes for flex layout; drag handles keep inline width
5. `MeetingDetail.tsx` → shadcn `Collapsible`; `ScrollArea`; action item badges; `Button`
6. `Sidebar.tsx` + `TopBar.tsx` → Tailwind + shadcn `Button`, `Select`
7. `ChatPanel.tsx` (new 4th column) — rich conversational interface with meeting context; `react-markdown` for AI responses; image paste + file upload attached to messages; copy response as rich text (markdown) for Jira/Confluence
8. Wire 4th column into `LinearShell` + `App.tsx`; add `chatOpen` prop; resize handle

**Chat interface requirements:**
- Messages include meeting context (selected/checked meetings) sent to the configured LLM provider
- Images can be pasted (clipboard) or uploaded (file picker) and attached to a message
- AI responses rendered as rich text: headings, bullet lists, bold, inline code, code blocks
- Each response has a "Copy as Markdown" button for pasting into Jira, Confluence, Notion, etc.
- Conversation history maintained in session; context bar shows active meeting count + char budget

**Test strategy:** Tests that currently check `style.fontWeight` or `style.background` will be updated to check class names or accessible roles. Tests that check dynamic `style.width` (resize) remain inline-style assertions. No coverage gaps.

- [x] Burst 277: shadcn infra — install `tailwind-merge`, `class-variance-authority`, `clsx`; create `lib/utils.ts` with `cn()`; add `@theme inline` block to `index.css` mapping `--color-*` vars to shadcn token names; rename internal `--color-border` → `--color-line` in themes to avoid circular ref (chore, no tests) (commit: `59c6b45`)
- [x] Burst 278: `components/ui/button.tsx` + `components/ui/badge.tsx` — add shadcn Button and Badge; test: each renders with correct variant class (commit: `29cdff5`)
- [x] Burst 279: Migrate `MeetingList.tsx` — Tailwind classes; group pills → `Button`; client chip → `Badge`; update tests to check class/role not inline fontWeight (commit: `bd333b0`)
- [x] Burst 280: Migrate `LinearShell.tsx` — Tailwind flex layout; drag handles keep inline dynamic width; update tests (commit: `0020667`)
- [x] Burst 281: Migrate `MeetingDetail.tsx` — shadcn `Collapsible`, `Button`, `Badge`; update tests (commit: `b97f02a`)
- [x] Burst 282: Migrate `Sidebar.tsx` + `TopBar.tsx` — Tailwind + shadcn `Button`, `Select`; update tests (commit: `bf9dca9`)
- [x] Burst 283: `ChatPanel.tsx` — standalone 4th-column component; `react-markdown` + `remark-gfm` renders AI answers (headings, lists, bold, code, tables); context bar (N meetings · N chars); copy-to-clipboard per response; `Button`; conversation history resets when `activeMeetingIds` changes; test: markdown renders h2/list/bold, submit calls onChat, copy button fires clipboard, history clears on meeting change (commit: `4bc0cef`)
- [x] Burst 284: Wire `ChatPanel` into `LinearShell` + `App.tsx` — `chat` slot + `chatOpen` prop; resize handle; `chatOpen = activeMeetingIds.length > 0`; remove chat from `MeetingDetail`; update shell + app tests (commit: `fccddc7`)
- [x] Burst 285: Chat input — shadcn `Textarea` with paste-to-attach image support (`onPaste` reads `DataTransfer.files`); file picker button (`<input type="file" accept="image/*">`); attached images shown as thumbnails below textarea with remove button; test: pasting a file populates attachment list; test: clicking remove clears it (commit: `fd02cd7`)
- [x] Burst 286: Chat IPC — extend `channels.ts` `ChatRequest` with `attachments: { name: string; base64: string; mimeType: string }[]`; update `handleChat` to include image content blocks in Anthropic messages API call (using vision); test: handler forwards attachment as image_url content block (commit: `098cf7c`)
- [x] Burst 287: Copy response as rich text — two buttons per response: "Copy as Markdown" copies raw markdown source; "Copy for Jira" converts to Jira classic wiki markup (`*bold*`, `h2.`, `- bullet`, `{code}`) for Jira Server/Data Center/older Cloud; test: each format produces correct output for a fixture response containing heading, list, bold, and code block (commit: `3c9628c`)

### Bottle: Cross-Cutting Search

- [x] Burst 288: Lift search state to App.tsx — `searchQuery` controlled in App; `handleReset` clears it; SearchBar becomes controlled via TopBar; test: reset clears search value (already complete from burst 265)
- [x] Burst 289: Search filters meeting list — `searchQuery >= 2 chars` → search API call; `scopeMeetings` filtered to matching IDs; empty query = all meetings; test: meeting list updates when search returns results (commit: `4a680d7`)
- [x] Burst 290: Search respects Client + date filters — pass current `client`/`after`/`before` to search call; test: results change with client param (commit: `7be605d`)
- [x] Burst 291: Search loading + no-results state — spinner while in-flight; "No results for '…'" in list when empty; test: loading + empty states render (commit: `e3fc5a5`)

### Bottle: Export + Clipboard

- [x] Burst 292: Copy meeting summary — button in `MeetingDetail` header copies title + date + summary + decisions as markdown; test: `clipboard.writeText` called with correct format (commit: `5c73537`)
- [x] Burst 293: Copy action items — button in Action Items section copies items as `- [ ] description (owner, due)` checklist; test: correct markdown format (commit: `dde7c95`)

### Bottle: Meeting Management

- [x] Burst 294: Delete selected meetings — danger button in TopBar when checked > 0; `window.api.deleteMeetings(ids)` IPC + handler cascades delete from `meetings`, `artifacts`, `client_detections`; test: handler removes correct rows (d7abcd7)
- [x] Burst 295: Re-extract artifact — icon button in `MeetingDetail` header; `window.api.reExtract(id)` IPC + handler calls `extractSummary` + `storeArtifact`; invalidates artifact query; test: handler stores updated artifact (e73d382)
- [x] Burst 296: Reassign meeting client — icon button in `MeetingDetail` header opens a shadcn `Dialog` with a searchable client list; `window.api.reassignClient(meetingId, clientName)` IPC + handler upserts `client_detections` row; meeting list refreshes; test: handler inserts/replaces detection row with new client (e0775ca)
- [x] Burst 297: Ignore meeting flag — `meetings` table adds `ignored INTEGER DEFAULT 0` column; toggle button in `MeetingDetail` header; `window.api.setIgnored(id, true/false)` IPC; ignored meetings excluded from all queries (`WHERE ignored = 0`); shown dimmed in list with "(ignored)" label; test: toggling ignored excludes meeting from `handleGetMeetings` results (37edfb8)

### Bottle: Action Item Completion

Action items extracted per meeting need a completion lifecycle: check off, add a note, bulk complete. Completions stored persistently in DB.

- [x] Burst 298: DB schema for action item completions — new table `action_item_completions (id TEXT PK, meeting_id TEXT, item_index INTEGER, completed_at TEXT, note TEXT)`; migrate; test: insert + query round-trip (dd46cda)
- [x] Burst 299: IPC handlers for completion — `handleCompleteActionItem(db, meetingId, itemIndex, note)` inserts/upserts completion row; `handleGetCompletions(db, meetingId)` returns all for meeting; add to `channels.ts`; test: complete → get returns record
- [x] Burst 300: Render completion state in `MeetingDetail` — action items rendered as checkboxes; clicking calls `onComplete(meetingId, index)`; completed items show checkmark + strikethrough + note tooltip; completions loaded via `window.api.getCompletions`; completed items collapse into a "N completed ▸" summary row at the bottom of the section, expandable on click; test: checked item renders with completion indicator, collapsed summary shows correct count, expand reveals completed items
- [x] Burst 301: Completion note dialog — clicking a completed item opens a shadcn `Dialog` (`@radix-ui/react-dialog`) with editable `Textarea` showing the stored note; Save calls `handleCompleteActionItem` with updated note; Cancel discards; test: note displays after save, cancel leaves note unchanged
- [x] Burst 302: Bulk complete action items — "Mark all complete" button in Action Items section header opens a shadcn `Dialog` with a shared note `Textarea`; Confirm saves a completion row for every item with the same note; test: bulk complete creates N completion rows

### Bottle: UX Polish

- [x] Burst 303: Toast notification system — lightweight `Toast` component (top-right, auto-dismiss 4s); `useToast()` hook in App; all API errors surface as error toast; success actions (copy, delete, reassign) show success toast; test: toast renders and auto-hides
- [x] Burst 304: Loading states — `meetingsQuery.isLoading` → skeleton rows in meeting list; `selectedArtifactQuery.isLoading` → skeleton in detail panel; test: skeleton renders during pending query
- [x] Burst 305: Empty states — no meetings + filter active → "No meetings match your filters"; no meetings + no filter → "No meetings yet"; test: each variant renders correct message (commit: `3e2d7bf`)

### Bottle: UI Design Tweaks

- [x] Burst 306: Remove client badge from meeting list rows — client already visible via sidebar/combobox filter; remove `<Badge>` from both series and non-series row views in `MeetingList`; test: meeting row does not render client badge text
- [x] Burst 307: Sidebar client toggle — clicking an already-selected client deselects it (calls `onSelect(null)`); test: clicking selected client calls onSelect with null
- [x] Burst 308: Group command palette — replace inline "Select all" text with a menu button (⋯) on group headers; clicking opens a popover/dropdown with "Select all" option; extensible for future commands; update existing tests that assert on "Select all" button; test: menu button opens popover, clicking "Select all" fires onCheckGroup
- [x] Burst 309: Ignore command in group palette — add "Ignore all" option to group command palette; new `onIgnoreGroup?: (ids: string[]) => void` prop on MeetingList; test: clicking "Ignore all" calls onIgnoreGroup with group meeting ids
- [x] Burst 310: Sort toggle on meeting list — add ascending/descending sort button to the group-by bar; default desc (newest first); toggling reverses date order within groups; test: toggling sort reverses meeting order
- [x] Burst 311: Action items inline with strikethrough — completed items stay in place in original order with ✓ and `line-through` text instead of being hidden in collapsed section; remove the "N completed ▸" collapse toggle; completed item description still opens note dialog on click; update existing tests; test: completed item renders inline with line-through style
- [x] Burst 312: Action items counter with percent-complete progress — show "N/M" counter and a small progress bar next to "Action Items" section header; test: header renders count text and progress element with correct width
- [x] Burst 313: Indent sub-items in artifact sections — add left padding to item lists (action items, decisions, open questions, risks, etc.) within collapsible sections for clear visual hierarchy; test: item list container has left padding class
- [x] Burst 314: Decisions become structured objects with decided_by attribution
- [x] Burst 315: Add requester field to action_items type
- [x] Burst 316: Update extraction prompt for person attribution fields
- [x] Burst 317: Format structured decisions with person attribution in labeled context
- [x] Burst 318: Extract text from structured decisions for embedding
- [x] Burst 319: Normalize legacy artifact formats in CLI and IPC handlers
- [x] Burst 320: Update all artifact fixtures to structured decision and requester shapes
- [x] Burst 321: Render requester badge on action items and decided_by in decisions
- [x] Burst 322: Add person filter dropdowns for action items and decisions sections
- [x] Burst 323: Fix person filter dropdown labels with "Person: All" prefix
- [x] Burst 324: Move owner and due_date badges inline with action item description
- [x] Burst 325: Add uncomplete action item button
- [x] Burst 326: Add uncomplete action item handler, API route, full-stack wiring
- [x] Burst 327: Rename technical_topics to architecture across entire codebase
- [x] Burst 328: Refine extraction prompt for concise summary, architecture focus, account-level risks
- [x] Burst 329: Fixed-width meeting list, detail panel always visible
- [x] Burst 330: mergeArtifactsDeduped for multi-meeting artifact aggregation
- [x] Burst 331: MeetingDetail multi-meeting header and read-only mode
- [x] Burst 332: Wire multi-meeting artifact aggregation in App
- [x] Burst 333: Move Delete button from TopBar to MeetingList
- [x] Burst 334: Increase meeting list default width to 500px
- [x] Burst 335: Show day of week in meeting list dates
- [x] Burst 336: Add ScrollArea to collapsible detail sections
- [x] Burst 337: Constrain ScrollArea sections with explicit 300px maxHeight
- [x] Burst 338: Expand/collapse all controls for Meeting Detail sections
- [x] Burst 339: Replace group dropdown with inline select/deselect toggle and ignore icons
- [x] Burst 340: Extract cosineSimilarity to shared math module
- [x] Burst 341: Add isSemanticDuplicate predicate
- [x] Burst 342: Add Jaro-Winkler string similarity for fast pre-filter dedup
- [x] Burst 343: Add item_mentions table for cross-meeting dedup tracking
- [x] Burst 344: Add item_vectors table for semantic item dedup
- [x] Burst 345: Add item embedding, storage, and semantic search for dedup
- [x] Burst 346: Add mention tracking — record, query, stats, cleanup
- [x] Burst 347: Add deduplicateItems orchestrator with auto-complete for duplicates
- [x] Burst 348: Integrate deduplicateItems + cascade cleanup on delete/re-extract
- [x] Burst 349: Add IPC channels, handlers, HTTP routes for item history and mention stats
- [x] Burst 350: Annotate items with mention count in LLM context
- [x] Burst 351–352: Fetch mention stats and render mention badges on action items
- [x] Burst 353: Add ItemHistoryDialog component with enriched history data
- [x] Burst 354–355: Wire item history dialog into App with meeting navigation
- [x] Burst 356: Add converse method to LlmAdapter for multi-turn chat
- [x] Burst 357: Implement converse in anthropic and local adapters
- [x] Burst 358: Add handleConversationChat for multi-turn conversation
- [x] Burst 359: Add conversation chat types and api-client method
- [x] Burst 360: Add POST /api/chat/conversation route
- [x] Burst 361: Rewrite ChatPanel with conversation bubble layout
- [x] Burst 362: ChatPanel sends full conversation history, App uses conversationChat
- [x] Burst 363: Wire conversationChat IPC channel and preload
- [x] Burst 364: Add scoped markdown typography for chat bubble
- [x] Burst 365: Remove rigid max-width caps on resizable columns
- [x] Burst 366: Standardize decisions attribution to use Badge like action items
- [x] Burst 367: Replace [M1] citation markers with meeting name and date
- [x] Burst 368: Fix chat LLM to cite meetings by name and date
- [x] Burst 369: Sort completed action items to bottom of list
- [x] Burst 370: Add 15px edge padding to meeting list and rightmost panel
- [x] Burst 381: Remove sidebar column, rely on TopBar client dropdown
- [x] Burst 382: Add Client label and instruction text to TopBar
- [x] Burst 383: Highlight checked meeting rows with elevated background
- [x] Burst 384: Replace group checkbox with ListChecks command icon
- [x] Burst 385: Add Group by label before group-by buttons
- [x] Burst 386: Default client auto-selection from is_default flag in clients.json
- [x] Burst 387: Darken TopBar labels from muted to foreground
- [x] Burst 387b: Add title tooltips to MeetingDetail icon buttons
- [x] Burst 388: Single expand/collapse toggle button in MeetingDetail
- [x] Burst 389: Replace client reassign dropdown with Dialog modal
- [x] Burst 390: Increase section content maxHeight from 300 to 400
- [x] Burst 392: Clicking meeting row also checks its checkbox
- [x] Burst 393: Image attachment support in chat — flow attachments through ChatPanel → App → IPC → API → LLM converse
- [x] Burst 394: Remove architecture field end-to-end — drop from Artifact type, extraction prompt, MeetingDetail, labeled-context, merge-artifacts, ipc-handlers, all tests
- [x] Burst 395: Update ClientEntry type — Participant shape { name, email?, role }, client_team[], implementation_team[], additional_extraction_llm_prompt?; remove known_participants and refinement_prompt (c190d9e)
- [x] Burst 396: Migrate clients.json to new structure — full LLSA roster + all 4 clients with structured participant arrays (ae3ab68)
- [x] Burst 397: Update client detection to read from client_team[].email and implementation_team[].email arrays (9d74924)
- [x] Burst 398: buildClientContext() — generate structured context string from participant data with role authority guidance (f5f7898)
- [x] Burst 399: Wire buildClientContext() into pipeline — replace refinement_prompt usage (3d552f3)
- [ ] Burst 400: Rewrite extraction.md — fidelity criteria, Trigger A/B for critical, priority field, tightened decisions, typed risk_items, LLM agency on additional_notes
- [ ] Burst 401: Add priority to action_items + restructure risk_items in Artifact type — priority: "critical"|"normal"; risk_items: { category, description }[]
- [ ] Burst 402: handleGetArtifact normalizes priority on read — missing priority defaults to "normal"; legacy string risk items normalized to { category: "engineering", description }
- [ ] Burst 403: labeled-context prefixes [CRITICAL] on critical action items in formatted output
- [ ] Burst 404: MeetingDetail — CRITICAL badge + priority sort + risk category badge (relationship/architecture/engineering)
- [ ] Burst 405: buildDistilledContext() — format artifact as chat context with summary/decisions/action_items/notes sections
- [ ] Burst 406: handleConversationChat uses distilled context by default; includeTranscripts: true falls back to buildLabeledContext
- [ ] Burst 407: Wire includeTranscripts through channels, API server, and api-client
- [ ] Burst 408: ChatPanel "Include full transcripts" checkbox — unchecked by default, passes flag through onChat callback
- [ ] Burst 409: NavRail component — Meetings + Action Items items, CalendarDays/CircleCheck icons, selected state
- [x] Burst 410: LinearShell dynamic panels + NavRail — refactor from fixed slots to panels: ReactNode[] prop (7758e7f)
- [x] Burst 411: App.tsx currentView + previewMeetingId state — panel composition per view (98dc15c)
- [x] Burst 412: ClientActionItem type + IPC channel GET_CLIENT_ACTION_ITEMS (1149161)
- [x] Burst 413: handleGetClientActionItems — query incomplete items by client, normalize priority, sort critical first, attach meeting metadata (807bf47)
- [x] Burst 414: API route GET /api/clients/:name/action-items (3f53d06)
- [x] Burst 415: ClientActionItemsView component — header with count, critical/normal sections, CRITICAL badge, owner badge, meeting source link (05aded4)
- [x] Burst 416: ClientActionItemsView preview + completion callbacks — onPreviewMeeting, onComplete (8947ea6)
- [x] Burst 417: Wire action-items view into App + LinearShell — fetch items, preview column, completion invalidation (98a0008)
- [x] Burst 418: Chat context in action-items preview mode — activeMeetingIds = [previewMeetingId] when preview is set (98a0008)
- [x] Burst 419: ClientActionItemsView collapsible Completed section — local state captures completed items, displays at bottom with strikethrough (72bb714)
- [x] Burst 420: Sync preview MeetingDetail completion on ClientActionItemsView complete — dedicated previewArtifactQuery/previewCompletionsQuery keyed by previewMeetingId (6277327)
- [x] Burst 421: Chat output templates — config/chat-templates/ auto-discovery at startup, template injected into system prompt per-request (3d56ab0)
- [x] Burst 422: GET_TEMPLATES IPC channel + API route + api-client + Electron main/preload registration (a7a62da)
- [x] Burst 423: ChatPanel template dropdown — selectedTemplate state, reset on meeting change, templates prop, 4th onChat arg (5fc336e)

### Bottle: Search Quality + Sort By (2026-03-03)

- [x] Burst 424: Configurable search distance threshold + limit — `config/system.json` with `maxDistance` and `limit`; `searchMeetings` filters post-KNN by `maxDistance`; `handleSearchMeetings` reads config at module load; tests validate config passthrough (8fe801b)
- [x] Burst 425: Sort By control in MeetingList — `SortBy` type (`date-desc`|`date-asc`|`client`|`relevance`); group functions receive pre-sorted array; `searchScores` map from search results; auto-switch to Relevance on search; Newest/Oldest/Client/Relevance buttons in header (680441b)
- [x] Burst 426: Single panel fills full width in action items view — LinearShell single-panel mode uses `flex-1` on panel-0 (e5afa5b)
- [x] Burst 427-428: Search on Enter only; remove client filter from search bar — TopBar fires search on Enter keypress only; client param dropped from search request (57796a5)
- [x] Burst 429: Vector count in debug endpoint — `GET /api/debug` returns `vector_count` from LanceDB table; test added (14bfbcf)

### Bottle: Vector Re-Embedding API (2026-03-03)

- [x] Burst 430: `POST /api/re-embed` — `handleReEmbed` bulk-embeds all meetings with artifacts that have no existing vector; skips already-embedded; returns `{ embedded, skipped }`; 2 tests (2087068)
- [x] Burst 431: `POST /api/meetings/:id/re-embed` — `handleUpdateMeetingVector` deletes existing vector then stores fresh one from current artifact; throws if no artifact; `test/re-embed-handler.test.ts` with 4 tests; search-handler tests dynamically read maxDistance from config (cf0eae8)

### Bottle: Inline Action Item Layout + Auto Re-Embed (2026-03-04)

- [x] Burst 432: Compact inline action item layout in ClientActionItemsView — CRITICAL badge inline before description text; owner/requester/meeting title inline at end as muted text; single-row card replaces two-row card (833a1b4)
- [x] Burst 433: CRITICAL badge inline in MeetingDetail — badge moved inside description `<span>` as `inline` element; no longer a sibling flex item that could wrap independently (22f5a00)
- [x] Burst 434: Action item attributes inline in MeetingDetail — owner/requester/due_date/mention all inline after description separated by `·`; mention stays a button; dropped `flex-wrap` container (e6b539c)
- [x] Burst 435: Auto re-embed after re-extract — `reEmbedMeeting(meetingId)` added to `ElectronAPI`, `api-client`, `preload`, `main` (IPC under search deps); App.tsx fires re-embed background after successful re-extract; toasts: "Search index updated" / "Search index update failed"; 2 new app tests (0133cf7)

### Bottle: Delete Meeting — Complete Cleanup (2026-03-04)

- [x] Burst 436: `handleDeleteMeetings` also removes vectors — accept `vdb: VectorDb | null`; async; delete from `meeting_vectors`, `feature_vectors`, `item_vectors` when vdb provided; test: mock vdb tables, verify `delete` called with correct filter; update existing tests to pass `null` (e6208a3)
- [x] Burst 437: Confirmation dialog before delete — `pendingDeleteIds` state in App.tsx; clicking Delete sets state rather than immediately deleting; Dialog shows count + "This cannot be undone"; Confirm executes delete, Cancel clears state; 3 new tests (110ec86)
- [x] Burst 438: Optimistic delete — `setQueriesData` filters deleted IDs from cache immediately before API call so list updates without waiting for refetch; `invalidateQueries` still runs after for server sync (6d689a9)

### Bottle: Create Meeting Manually (2026-03-04)

- [x] Burst 439: `handleCreateMeeting` + `POST /api/meetings` + 4 tests — `CreateMeetingRequest` type + `CREATE_MEETING` channel in channels.ts; handler ingests meeting, stores manual client detection, parses transcript (falls back to single turn for plain text), extracts artifact via LLM; API route returns `{ meetingId }` with 201; channel count test 18→19 (953939d)
- [x] Burst 440: Wire createMeeting through preload, main, api-client — preload invokes `CREATE_MEETING` IPC; main registers handler; api-client POSTs to `/api/meetings`; api-client test added (974a37f)
- [x] Burst 441: NewMeetingDialog + MeetingList `+ New` button + App wiring + NEW badge — dialog with client/date/title/transcript form; fire-and-forget handler with toasts (importing → imported → indexed); `newMeetingIds` Set tracks session-created meetings for NEW badge; 4 dialog tests + 3 button tests + 3 app integration tests (7889f8c)

---

# DEPENDENCY GRAPH — PARALLELIZATION MAP

### Phase 1: Bootstrap + File Processing (Bursts 1–35)

```
Burst 1 → 2 (bootstrap)
     └→ 3 → 4 (logging)
          └→ 5 → 6, 7 (list files)
          └→ 8 → 9 → 10, 11, 12, 13 (parse filename)
          └→ 14 → 15 → 16 (read + split)
               ├→ 17 → 18, 19 (attendance)
               └→ 20 → 21, 22, 23 (transcript body)
          9 + 18 + 21 → 24 → 25 (full parser)
          5 + 24 → 26 → 27, 28 (move processed)
                   29 → 30, 31 (move failed)
          24 + 26 + 29 → 32 → 33, 34 → 35 (processDirectory)
```

### Phase 2: SQLite + Ingestion (Bursts 36–52)

```
36 → 37 → 38, 39 → 40, 41 → 42 (schema)
37 + 24 → 43 → 44, 45, 46, 47, 48 (ingestion)
46 → 49 → 50, 51, 52 (chunking)
```

### Phase 3: LLM + Extraction (Bursts 53–69)

```
53 → 54 → 55 (LLM adapter)
55 + 46 → 56 → 57–62 (extraction fields)
56 → 63 → 64, 65 (validation)
51 + 56 → 66 (chunked extraction)
38 + 63 → 68 → 69 (store/get artifact)
```

### Phase 4: Clients (Bursts 70–85)

```
39 → 70 → 71, 72, 73, 74, 75 (registry)
71 + 46 → 76 → 79, 82, 83 (participant detection)
72 + 46 → 77, 78 → 80 (alias detection)
79 + 80 → 81 (combined confidence)
40 + 76 → 84 (store detection)
76 → 85 (logging)
```

### Phase 5: Embeddings + Search (Bursts 86–106)

```
86 → 87 → 88, 89, 90 (ONNX engine)
91 → 92, 93 (LanceDB tables)
69 → 94 → 95 (build + embed)
95 + 92 → 96 → 97, 98, 99 (store vectors)
96 + 87 → 100 → 101–106 (search)
```

### Phase 6: Clustering + Topics + Features (Bursts 107–126)

```
96 → 107 → 108–114 (clustering)
110 + 69 → 115 → 116 → 117 → 118, 119 (topics)
58 + 87 → 120 → 121 → 122 → 123–126 (features)
```

### Phase 7: Context + Downstream (Bursts 127–151)

```
100 + 69 → 127 → 128–135 (context)
134 + 55 → 136 → 137 → 138, 139, 140 (task gen)
111 + 113 → 141 → 142, 143 (evolution)
84 → 144, 118 → 145, 69 → 146 (feedback)
32 + 68 + 84 + 96 → 147 → 148–151 (batch pipeline)
```

### Phase 8: CLI, Prompt Externalization & Batch Export (Bursts 152–168)

```
71 → 153 (idempotent seed)
37 + 72 + 92 → 154 (setup script)
147 + 154 → 155 (run script)
154 + 155 + 156 → 157 (package.json scripts)
63 → 160 (prompt template param)
147 + 160 → 161 (pipeline prompt path)
91 → 162 (lancedb path fix)
20 → 164 → 163 + 164 → 165 (folder parser)
43 → 166 (externalId in ingest)
147 + 165 + 166 → 167 → 168 (manifest pipeline mode)
```

### Phase 9: Pipeline Progress & Run Logging (Bursts 169–174)

```
169 → 170 → 171, 172, 173 (progress events)
170–173 → 174 (run.ts console output + run log)
```

### Phase 10: Query CLI (Bursts 175–181)

```
37 + 100 → 175 (flag parsing + resolveMeetingIds)
175 + 84 → 176 (--list meetings table)
175 + 69 → 177 (--list summary full dump)
177 → 178 (--list decisions|actions|questions|risks|features)
175 + 100 + 69 → 179 (--search + ask mode)
175 → 180 (package.json query script)
175–180 → 181 (README.md)
```

### Phase 11: Additional Notes (Bursts 182–190)

```
182 → 183 → 184, 185 (schema + validation + normalization)
185 + 186 → 187 (embedding canonicalization)
185 → 188, 189 (query display + context cap)
183 → 190 (logging)
```

### Phase 12: LLM Provider Interface (Bursts 191–201)

```
191 → 192 → 193 → 194 (providers + error classification + repair loop)
192 + 193 + 194 → 195 (per-call observability)
195 → 196 (scripts routing)
196 → 197 → 198 (setup Ollama validation)
196 → 199 (labeled context + citations)
199 → 200 → 201 (eval harness)
```

---

# CLIENT REGISTRY FORMAT

Stored in `data/clients/clients.json`:

```json
[
  {
    "name": "Revenium",
    "aliases": ["Revenium", "REV"],
    "known_participants": ["@revenium.com"]
  },
  {
    "name": "Mandalore",
    "aliases": ["Mandalore"],
    "known_participants": ["@mandalore.com"]
  },
  {
    "name": "TQ",
    "aliases": ["TQ"],
    "known_participants": ["@tq.com"]
  }
]
```

`known_participants` matches against email domains from Krisp attendance data.
`aliases` matches against meeting filename title and transcript body.

Internal meetings (xolv.io / xolvio.com participants only) return no client match.

---

# SUCCESS METRICS FOR POC

- File processing pipeline parses real Krisp exports and moves to processed/ (Bursts 32–35 green)
- Cross-meeting feature retrieval works (Bursts 122–125 green)
- Client auto-detection accuracy ≥ 85% (Bursts 76–85 green)
- Clusters produce coherent noun-phrase tags (Bursts 116–118 green)
- Downstream task generation traces to source meetings (Bursts 138–139 green)
- No large transcript dumps required for task generation (Bursts 132–133 green)
- Batch pipeline processes real Krisp exports end-to-end (Bursts 147–151 green)
- `pnpm setup` initializes DB idempotently; `pnpm process` runs pipeline; `pnpm reset` restores clean state (Bursts 154–157 green)
- Batch export format (`manifest.json` + per-folder `transcript.md`) parsed correctly (Bursts 163–168 green)
- Extraction prompt editable without code changes (Bursts 159–161 green)
- Per-meeting console progress with timing and client name; full run log written to `data/audit/run-*.json` (Bursts 169–174 green)
- `pnpm query` CLI supports structured listing, focused field dumps, semantic search, and natural-language Q&A — all filterable by client, meeting, and date range (Bursts 175–181 green)
- `additional_notes` freeform field extracted, stored, embedded, and displayed — with graceful normalization for malformed output and per-meeting observability logging (Bursts 182–190 green)
- Provider-based LLM boundary supports `anthropic`, `local` (Ollama), and `stub` — switchable via env var; API errors classified (`[rate_limit]`, `[json_parse]`) and surfaced in run log `error_type` field; JSON repair loop fires only on parse failures, never on rate limits; ask mode uses labeled context blocks with deterministic citation extraction (Bursts 191–201 green)
- 100% test coverage by construction
- **Single stubbed boundary** — only LLM calls are stubbed

### Bottle: Delete Meeting — Complete Cleanup (2026-03-04)

- [x] Burst 436: `handleDeleteMeetings` also removes vectors — accept `vdb: VectorDb | null`; async; delete from `meeting_vectors`, `feature_vectors`, `item_vectors` when vdb provided; test: mock vdb tables, verify `delete` called with correct filter; update existing tests to pass `null` (commit: `e6208a3`)
- [x] Burst 437: Confirmation dialog before delete — `pendingDeleteIds` state in App.tsx; clicking Delete sets state rather than immediately deleting; Dialog shows count + "This cannot be undone"; Confirm executes delete, Cancel clears state; 3 new tests (commit: `110ec86`)
- [x] Burst 438: Optimistic delete — `setQueriesData` filters deleted IDs from cache immediately before API call so list updates without waiting for refetch; `invalidateQueries` still runs after for server sync (commit: `6d689a9`)
- [x] Burst 439: `handleCreateMeeting` + `POST /api/meetings` + 4 tests — `CreateMeetingRequest` type + `CREATE_MEETING` channel; handler ingests meeting, stores manual client detection, parses transcript, extracts artifact; channel count 18→19 (commit: `953939d`)
- [x] Burst 440: Wire createMeeting through preload, main, api-client — IPC + fetch plumbing + test (commit: `974a37f`)
- [x] Burst 441: NewMeetingDialog + MeetingList `+ New` button + App wiring + NEW badge — form dialog, fire-and-forget handler with toasts, `newMeetingIds` Set, 10 new tests (commit: `7889f8c`)
- [x] Burst 442: Clear chat history on template change — `useEffect` clears messages when `selectedTemplate` changes so LLM does not follow prior template pattern; test: send message with jira-ticket, switch to jira-epic, verify old answer disappears (commit: `80ecd38`)
- [x] Burst 443: Fix user bubble text cutoff — add `break-words` class to user bubble div so long words wrap instead of overflowing; test: verify `break-words` in user-bubble className (commit: `80ecd38`)
- [x] Burst 444: Align send/attach buttons vertically centered — change button column from `self-end` to `self-center` so buttons sit at vertical middle of input area; test: verify `self-center` present and `self-end` absent on button column (commit: `80ecd38`)
- [x] Burst 445: Fix API type assertion — add `template?: string` to conversation chat endpoint type assertion in server.ts (commit: `58d2e46`)
- [x] Burst 446: Template directive injection — instead of clearing chat history on template change, inject strong directive in system prompt telling LLM to follow ONLY current template; revert useEffect clear (commit: `57a4092`)
- [x] Burst 447: Expand `buildEmbeddingInput` — include action_items, open_questions, risk_items in meeting embedding text for richer semantic search (commit: `192f4f8`)
- [x] Burst 448: Extract `searchMeetingsByVector` — accept pre-computed Float32Array, `searchMeetings` delegates to it; avoids redundant embed calls in hybrid search (commit: `cd9eb0f`)
- [x] Burst 449: Extract `searchFeaturesByVector` + `searchSimilarItemsByVector` — vector-accepting variants for feature and item search; `searchFeatures` and `searchSimilarItems` delegate to them (commit: `01cc8d5`)
- [x] Burst 450: `mergeSearchResults` pure function — merge `{ meeting_id, score }[]` arrays, pick min score per meeting_id (commit: `c630977`)
- [x] Burst 451: `hybridVectorSearch` orchestrator — single embed, search 3 tables in parallel, merge, enrich metadata from SQLite
- [x] Burst 452: Wire `hybridVectorSearch` into `handleSearchMeetings` — handler gains `db` param
- [x] Burst 453: FTS5 table migration — `CREATE VIRTUAL TABLE artifact_fts USING fts5(...)` in `migrate()`
- [x] Burst 454: `populateFts` + `updateFts` — build/rebuild FTS content from artifact fields
- [x] Burst 455: `searchFts` — sanitize query, run FTS5 MATCH, return ranked results
- [x] Burst 456: Reciprocal Rank Fusion — `reciprocalRankFusion` merges ranked lists with RRF scoring
- [x] Burst 457: Full hybrid search — vector + FTS5 + RRF merge
- [x] Burst 458: Wire FTS5 into pipeline + handler — `updateFts` after store/re-extract, `populateFts` at startup
- [x] Burst 459: Update docs/applications.md search documentation

### Bottle: Deep Search — LLM-Powered Post-Filtering (2026-03-05)

- [ ] Burst 460: Add `deep_search_filter` LlmCapability + stub fixture — new capability type, deterministic fixture with `relevant`, `relevance_summary`, `relevance_score`
- [ ] Burst 461: Create `config/prompts/deep-search.md` — prompt template with `{{query}}` + `{{meeting_context}}` placeholders, two-axis scoring guidance (specificity + breadth, 0-100 calibration bands)
- [ ] Burst 462: `deepSearch` core function happy path — per-meeting LLM evaluation via `Promise.all`, returns `{ meeting_id, relevanceSummary, relevanceScore }[]` for relevant meetings
- [x] Burst 463: `deepSearch` filters out irrelevant meetings — spy LLM returns `relevant: false`, assert excluded from results
- [x] Burst 464: `deepSearch` handles missing artifact — skip meeting if `getArtifact` returns null, no error thrown
- [x] Burst 465: `deepSearch` handles LLM error gracefully — per-meeting catch, one failure does not kill the batch
- [x] Burst 466: Add `DeepSearchResultRow`, `DeepSearchRequest`, `DEEP_SEARCH` channel to `channels.ts`
- [x] Burst 467: `handleDeepSearch` in `ipc-handlers.ts` — load deep-search prompt, delegate to core `deepSearch`
- [x] Burst 468: Register `DEEP_SEARCH` IPC in Electron main + preload
- [x] Burst 469: `POST /api/deep-search` route in `server.ts` — requires LLM dep, returns 503 without
- [ ] Burst 470: `deepSearch` method in `api-client.ts` — POST fetch wrapper
- [ ] Burst 471: `--deepsearch` flag in CLI `query.ts` — LLM filter after vector search, display relevance summary + score
- [ ] Burst 472: Add `--color-search-deep` CSS variable to all 3 themes (orange values)
- [ ] Burst 473: `useDeepSearch` React Query hook — fires after hybrid search, returns filtered results
- [ ] Burst 474: Deep Search checkbox in `SearchBar` — default checked, toggles deep search feature
- [ ] Burst 475: Wire deep search state in `App.tsx` — `deepSearchEnabled`, scores override `searchScores`, summaries + loading to MeetingList
- [ ] Burst 476: MeetingList blocking overlay + orange border + relevance summary — semi-transparent overlay during loading, orange `borderLeft` + summary text when active
- [ ] Burst 477: NavRail navigation clears deep search state — clicking Meetings/Action Items resets search
- [ ] Burst 478: Update `docs/applications.md` — Deep Search docs, `--deepsearch` flag, config file

---

# INFRASTRUCTURE COMMITS (NO TESTS REQUIRED)

Committed as `chore(scope): description`:

- `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- `ketchup-plan.md` (this file)
- `.claude-auto/` configuration files
- Validator and reminder markdown files
- `models/` directory with ONNX model binary (gitignored, fetched via setup script)
- `data/clients/clients.json` initial client registry
- Test fixture files mimicking Krisp export format in `test/fixtures/`

---

# POSSIBLE ENHANCEMENTS

- **Semantic item deduplication**: Embed each artifact item at extraction time, compare against existing items via cosine similarity + Jaro-Winkler string distance. Auto-complete duplicate action items with dedup notes. Track `first_mentioned` timestamp and `mention_count` per canonical item. Show mention badges in the UI with scrollable history dialog. Enrich LLM chat context with `[raised Nx, first mentioned DATE]` annotations. (Plan: `.claude/plans/nested-wishing-galaxy.md`, Bursts 340–367)
- **Two-tier NLP dedup strategy**: Line item deduplication uses a fast-then-deep approach: (1) **String-level pre-filter** — normalize text (lowercase, strip punctuation, collapse whitespace) then compute Jaro-Winkler similarity (zero-dependency implementation in `core/math.ts`). Near-exact matches (>0.9 Jaro-Winkler) are flagged as duplicates immediately without embedding. (2) **Semantic pass** — for items that pass the string filter, embed via all-MiniLM-L6-v2 (384-dim, ONNX) and search LanceDB `item_vectors` table for cosine similarity >0.85 to detect paraphrased duplicates (e.g., "Deploy to prod" vs "Push app to production"). This two-tier approach minimizes embedding compute while catching both surface-level and semantic duplicates. Alternative libraries considered: `natural` (13.8 MB, overkill), `fuzzball`, `string-similarity` — opted for zero-dependency Jaro-Winkler implementation (~30 lines).
- **Multi-meeting artifact aggregation**: Select multiple meetings and view merged/deduplicated artifacts in the detail panel. String-level normalization for obvious duplicates, semantic matching for paraphrased items.
- **Trend detection across meetings**: Identify topics/items that recur over time windows. Surface trending action items that haven't been resolved.
- **Meeting health scoring**: Score meetings on coverage (decisions made, action items assigned, questions resolved) to highlight unproductive patterns.
- **Automated follow-up reminders**: Track incomplete action items across meetings and surface reminders when the same participants meet again.
- **Speaker analytics**: Attribution heatmaps showing who drives decisions, raises concerns, or generates the most action items.
- **Custom extraction refinement per client**: Client-specific extraction prompts that adapt to domain terminology and meeting formats.
