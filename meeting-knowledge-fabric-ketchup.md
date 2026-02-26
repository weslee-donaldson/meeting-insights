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
| LLM | Anthropic API (Claude) | Real API calls | **Stubbed** — deterministic JSON fixtures |
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
├── data/
│   ├── raw-transcripts/              # Krisp export files (input)
│   │   ├──  2026-01-19T15:43:52.210ZRevenium, INT, DSU
│   │   ├──  2026-01-19T16:01:40.392ZMandalore DSU
│   │   └── ...                       # No extension, leading space
│   ├── processed/                    # Successfully ingested (moved here)
│   ├── failed-processing/            # Ingestion errors (moved here)
│   ├── clients/                      # Client registry JSON
│   │   └── clients.json
│   ├── output/                       # Generated artifacts
│   ├── audit/                        # Processing run logs
│   ├── backups/                      # DB backups
│   └── krisp-gdrive/                 # Sync source
├── src/
├── test/
│   └── fixtures/                     # Sample Krisp files for testing
├── models/                           # ONNX model binary (gitignored)
├── db/                               # Persistent storage (gitignored)
│   ├── mtninsights.db                # SQLite database
│   └── lancedb/                      # LanceDB vector files
├── ketchup-plan.md
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Krisp Export Format

Each meeting is a **single file** (no extension) under `data/raw-transcripts/` named:
```
 {ISO-8601-timestamp}{Meeting Title}
```
Note the **leading space** in the filename.

Examples:
```
 2026-01-19T15:43:52.210ZRevenium, INT, DSU
 2026-01-19T16:01:40.392ZMandalore DSU
 2026-01-19T19:25:19.375Z02:25 PM - zoom.us meeting January 19
 2026-01-20T16:45:12.856ZTQ, Internal
```

File contents have two sections:

**Attendance section** — comma-separated single-quote JSON-ish objects:
```
Attendance:
{'last_name': 'Doshi', 'id': '014200be-...', 'first_name': 'Dev', 'email': 'dev.doshi@xolv.io'},...
```

**Transcript section** — speaker-stamped dialogue:
```
Transcript:
Wesley Donaldson | 00:11
Good morning. Yep, you could come in.
Rinor Zekaj | 01:19
Here goes.
Speaker 4 | 03:41
I haven't seen with him, but yeah...
```

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

- [ ] Burst 86: `loadModel` loads all-MiniLM-L6-v2 ONNX model and returns session [depends: 2]
- [ ] Burst 87: `embed` accepts string input and returns Float32Array of length 384 [depends: 86]
- [ ] Burst 88: `embed` returns similar vectors for semantically similar inputs (cosine similarity > 0.8) [depends: 87]
- [ ] Burst 89: `embed` returns dissimilar vectors for unrelated inputs (cosine similarity < 0.3) [depends: 87]
- [ ] Burst 90: `embed` logs embedding generation time via `mtninsights:embed` [depends: 87]

### Bottle: LanceDB Foundation

- [ ] Burst 91: `connectVectorDb` accepts a path argument and opens LanceDB connection (temp dir in tests, `db/lancedb/` in live) [depends: 2]
- [ ] Burst 92: `createMeetingTable` creates meeting_vectors table with schema (meeting_id TEXT, vector FLOAT32[384], client TEXT, meeting_type TEXT, date TEXT) [depends: 91]
- [ ] Burst 93: `createFeatureTable` creates feature_vectors table with schema (feature_text TEXT, meeting_id TEXT, client TEXT, date TEXT, vector FLOAT32[384]) [depends: 91]

### Bottle: Meeting Embedding Pipeline

- [ ] Burst 94: `buildEmbeddingInput` concatenates summary + features + topics + decisions from artifact [depends: 69]
- [ ] Burst 95: `embedMeeting` generates real 384-dim vector from embedding input via ONNX [depends: 94, 87]
- [ ] Burst 96: `storeMeetingVector` inserts vector + metadata into LanceDB meeting_vectors table [depends: 95, 92]
- [ ] Burst 97: `storeMeetingVector` includes client from detection result in metadata [depends: 96, 84]
- [ ] Burst 98: `storeMeetingVector` includes meeting_type and date in metadata [depends: 96]
- [ ] Burst 99: `storeMeetingVector` logs storage via `mtninsights:embed:meeting` [depends: 96]

### Bottle: Vector Search

- [ ] Burst 100: `searchMeetings` returns top-k similar meetings for a query string [depends: 96, 87]
- [ ] Burst 101: `searchMeetings` filters results by client metadata [depends: 100, 97]
- [ ] Burst 102: `searchMeetings` filters results by meeting_type metadata [depends: 100, 98]
- [ ] Burst 103: `searchMeetings` filters results by date range [depends: 100, 98]
- [ ] Burst 104: `searchMeetings` returns meeting_id and distance score per result [depends: 100]
- [ ] Burst 105: semantically similar meetings score higher than unrelated meetings in search results [depends: 100]
- [ ] Burst 106: `searchMeetings` logs query and result count via `mtninsights:vector:search` [depends: 100]

### Bottle: Cross-Meeting Clustering

- [ ] Burst 107: `clusterMeetings` reads all vectors from LanceDB, assigns cluster_id to each [depends: 96]
- [ ] Burst 108: `clusterMeetings` groups semantically similar meetings into same cluster [depends: 107]
- [ ] Burst 109: `clusterMeetings` separates dissimilar meetings into different clusters [depends: 107]
- [ ] Burst 110: `clusterMeetings` stores cluster_id mappings in meeting_clusters table [depends: 107, 42]
- [ ] Burst 111: `clusterMeetings` stores centroid snapshot in clusters table [depends: 110, 41]
- [ ] Burst 112: `assignCluster` assigns new meeting to nearest existing centroid without full recluster [depends: 111]
- [ ] Burst 113: `recluster` performs full recomputation and updates all cluster_ids [depends: 110]
- [ ] Burst 114: `clusterMeetings` logs cluster sizes via `mtninsights:cluster` [depends: 107]

### Bottle: Cluster Topic Extraction

- [ ] Burst 115: `aggregateClusterSummaries` collects all artifact summaries for a given cluster_id [depends: 110, 69]
- [ ] Burst 116: `extractClusterTags` calls LLM adapter with aggregated summaries, returns 3–7 noun-phrase tags [depends: 115, 55]
- [ ] Burst 117: `extractClusterTags` rejects vague tags like "discussion" or "meeting" [depends: 116]
- [ ] Burst 118: `storeClusterTags` updates clusters table with generated_tags [depends: 117, 41]
- [ ] Burst 119: `extractClusterTags` logs generated tags via `mtninsights:cluster:tags` [depends: 116]

### Bottle: Feature-Level Embedding

- [ ] Burst 120: `embedFeature` generates real 384-dim vector for a single proposed_feature string [depends: 58, 87]
- [ ] Burst 121: `storeFeatureVector` inserts vector + meeting_id + client into LanceDB feature_vectors table [depends: 120, 93, 84]
- [ ] Burst 122: `searchFeatures` returns similar features across meetings for a query string [depends: 121, 87]
- [ ] Burst 123: `searchFeatures` returns meeting_id and artifact summary excerpt per result [depends: 122, 69]
- [ ] Burst 124: similar feature proposals from different meetings return high similarity [depends: 122]
- [ ] Burst 125: query "Show discussions related to Feature X" returns meetings from both demo and architecture contexts [depends: 123]
- [ ] Burst 126: `searchFeatures` logs query and result count via `mtninsights:embed:feature` [depends: 122]

### Bottle: Context Curation

- [ ] Burst 127: `buildContext` performs semantic search from query string and returns matching artifacts [depends: 100, 69]
- [ ] Burst 128: `buildContext` filters by client_filter [depends: 127, 101]
- [ ] Burst 129: `buildContext` filters by meeting_type_filter [depends: 127, 102]
- [ ] Burst 130: `buildContext` filters by date_range [depends: 127, 103]
- [ ] Burst 131: `buildContext` deduplicates results from same cluster_id [depends: 127, 110]
- [ ] Burst 132: `buildContext` ranks results by relevance score and fills to token budget [depends: 127]
- [ ] Burst 133: `buildContext` enforces token budget ceiling — output never exceeds configured limit [depends: 132]
- [ ] Burst 134: `buildContext` returns curated_context string and source_meeting_ids array [depends: 133]
- [ ] Burst 135: `buildContext` logs context size and source count via `mtninsights:context` [depends: 127]

### Bottle: Downstream Task Generation

- [ ] Burst 136: `generateTask` accepts curated_context and task_intent, calls LLM adapter [depends: 134, 55]
- [ ] Burst 137: `generateTask` returns title, description, acceptance_criteria from LLM response [depends: 136]
- [ ] Burst 138: `generateTask` output includes source_meeting_ids for traceability [depends: 137]
- [ ] Burst 139: `generateTask` rejects output containing details not present in curated_context [depends: 137]
- [ ] Burst 140: `generateTask` logs generation via `mtninsights:task` [depends: 136]

### Bottle: Evolutionary Learning

- [ ] Burst 141: `detectTagDrift` compares current cluster centroid to stored centroid_snapshot [depends: 111, 113]
- [ ] Burst 142: `detectTagDrift` triggers tag regeneration when centroid shift exceeds threshold [depends: 141, 116]
- [ ] Burst 143: `detectTagDrift` logs drift magnitude via `mtninsights:cluster:drift` [depends: 141]

### Bottle: Human Feedback Loop

- [ ] Burst 144: `overrideClient` updates client_detections table for a meeting_id [depends: 84]
- [ ] Burst 145: `overrideTag` updates generated_tags in clusters table for a cluster_id [depends: 118]
- [ ] Burst 146: `flagExtraction` marks artifact row for re-extraction [depends: 69]

### Bottle: Batch Processing Pipeline

- [ ] Burst 147: `processNewMeetings` scans raw-transcripts/, parses, ingests, extracts, and embeds all unprocessed files [depends: 32, 68, 84, 96]
- [ ] Burst 148: `processNewMeetings` skips files already in processed/ [depends: 147, 34]
- [ ] Burst 149: `processNewMeetings` logs failures to audit/ and moves failed files to failed-processing/ [depends: 147, 29]
- [ ] Burst 150: `processNewMeetings` runs client detection for each ingested meeting [depends: 147, 84]
- [ ] Burst 151: `processNewMeetings` logs full pipeline summary via `mtninsights:pipeline` [depends: 147]

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
- 100% test coverage by construction
- **Single stubbed boundary** — only LLM calls are stubbed

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
