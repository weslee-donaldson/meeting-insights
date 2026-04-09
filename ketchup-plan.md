# Ketchup Plan: Meeting Split

## Context

Krisp sometimes records what were actually two (or more) separate meetings as a single continuous transcript. This happens when meetings run back-to-back on the same call, or when a recording wasn't stopped between sessions. The result is a single meeting record containing multiple distinct conversations, producing a merged artifact with muddled summaries, mixed action items, and inaccurate client detection.

**Problem statement:** When a transcript contains multiple meetings, the system treats them as one. The extracted artifact conflates distinct conversations, action items get attributed to the wrong context, and client detection may be wrong for portions of the recording. The operator has no way to correct this without manually editing database records.

**What this plan delivers:**
1. A `core/meeting-split.ts` module that partitions a meeting's `SpeakerTurn[]` by duration-based cut points
2. A `meeting_lineage` table to track provenance (which meetings were split from which source)
3. An API endpoint `POST /api/meetings/:id/split` that accepts a durations array and creates N new meetings
4. A CLI command `pnpm cli split <meeting-id> --durations 60,15,15`
5. Automatic re-extraction pipeline run for each new meeting segment
6. UI split dialog (slider-based, gated behind "Split Meeting" action on meeting detail)

**What this plan does NOT deliver:**
- Automatic split detection (gap analysis, topic shift detection) -- future work
- Merge (combining two meetings into one) -- inverse operation, future work
- Undo/unsplit -- the original meeting is archived with full data, but there's no one-click reversal

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| User input model | Array of durations (minutes per segment) | More natural than cut-point timestamps -- user thinks "first meeting was ~60 min" not "cut at 01:00:00" |
| Last segment handling | Implicit remainder | User provides N durations for N segments; last duration is advisory, system takes whatever's left |
| Cut-point resolution | Last turn at or before cumulative timestamp | Turns share HH:MM timestamps; cut at turn boundary, never mid-turn |
| Timestamp rebasing | Rebase each segment to 00:00 | Each new meeting is independent; keeping absolute offsets from original recording is confusing |
| Original meeting fate | Archived (ignored=1) + lineage row | Preserved for audit, excluded from queries, lineage tracks children |
| Participant derivation | Per-segment from speaker names | Each segment only lists speakers who actually appear in it |
| Artifact handling | Full re-extraction per segment | Splitting an existing artifact is unreliable; LLM re-extraction on smaller transcripts is more accurate |
| Association migration | None -- new meetings build their own | Clean slate per segment; old associations stay on archived original |
| Source filename convention | `{original}::split:{N}` | Preserves UNIQUE constraint, clearly marks provenance |
| Title convention | `{original} (1 of N)`, `(2 of N)`, etc. | User can rename later via existing rename flow |

## Tooling & Stack

- **Runtime**: Node.js (ESM, `"type": "module"` in package.json)
- **Language**: TypeScript 5.9, strict mode, `module: "NodeNext"`, `moduleResolution: "NodeNext"`
- **HTTP framework**: Hono 4.12
- **Database**: SQLite via `node:sqlite` (`DatabaseSync` -- synchronous API, no async)
- **Testing**: Vitest 4.0, test files at `test/**/*.test.ts`, 100% branch coverage enforced
- **Package manager**: pnpm
- **No new dependencies** -- this feature uses only existing infrastructure

**Key patterns agents must follow:**
- All `core/` modules export pure functions that take `db: DatabaseSync` as first arg
- `core/` is the dependency sink -- never imports from `api/` or `electron-ui/`
- `api/routes/` files export `registerXxxRoutes(app, db, ...)` functions
- API tests use `app.request(path)` on a Hono app created with in-memory SQLite
- Core tests use `createDb(":memory:")` + `migrate(db)` for isolation
- TCR: `pnpm test --run && git add -A && git commit -m "..." || git checkout -- .`

## Framework Quirks

1. **SQLite `node:sqlite` is synchronous** -- `db.prepare().run()`, `.get()`, `.all()`. No promises. No `await`.
2. **SpeakerTurn timestamps are HH:MM strings** -- relative to recording start, not absolute. Multiple turns can share a timestamp. Parse with simple string split, not Date objects.
3. **`ingestMeeting` generates UUID if no externalId** -- split segments have no externalId, so each gets a random UUID.
4. **`source_filename` has a UNIQUE constraint** -- split segments must use a derived filename (e.g., `original::split:1`) to avoid collision.
5. **Pipeline is async** -- `processEntry` is async due to LLM calls and vector DB writes. The split endpoint must handle this (either await all segments or return immediately and process in background).
6. **`raw_transcript` is the original text file content** -- for split segments, this must be reconstructed from the `SpeakerTurn[]` slice since we don't have the original text boundaries per turn.
7. **`participants` is a JSON-stringified array of `Participant` objects** -- but participants from the original file have `id`, `first_name`, `last_name`, `email`. When reconstructing per-segment participants from speaker names alone, we can match against the original participant list by `first_name + " " + last_name`.

## Data Shapes

### `meeting_lineage` Table

```sql
CREATE TABLE IF NOT EXISTS meeting_lineage (
  id TEXT PRIMARY KEY,
  source_meeting_id TEXT NOT NULL,
  result_meeting_id TEXT NOT NULL,
  segment_index INTEGER NOT NULL,
  split_at_turn INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (source_meeting_id) REFERENCES meetings(id),
  FOREIGN KEY (result_meeting_id) REFERENCES meetings(id)
);
```

- `source_meeting_id`: the original (now archived) meeting
- `result_meeting_id`: one of the N new segments
- `segment_index`: 1-based position within the split (1, 2, ..., N)
- `split_at_turn`: the turn index (0-based) where this segment starts in the original turns array

### Split Request Shape

```ts
interface SplitRequest {
  durations: number[];  // minutes per segment, length = number of resulting meetings
}
```

### Split Response Shape

```ts
interface SplitResult {
  source_meeting_id: string;
  segments: Array<{
    meeting_id: string;
    segment_index: number;
    title: string;
    turn_count: number;
    actual_start: string;    // HH:MM -- where this segment actually starts
    actual_end: string;      // HH:MM -- where this segment actually ends
    requested_duration: number;  // what the user asked for (minutes)
    actual_duration: number;     // what they got based on turn boundaries (minutes)
  }>;
}
```

### Core Function Signatures

```ts
// Compute cut points from durations
function computeCutPoints(
  turns: SpeakerTurn[],
  durations: number[],
): { turnIndex: number; timestamp: string }[];

// Partition turns at cut points, rebase timestamps
function partitionTurns(
  turns: SpeakerTurn[],
  cutPoints: { turnIndex: number }[],
): SpeakerTurn[][];

// Rebase turn timestamps so first turn starts at 00:00
function rebaseTimestamps(turns: SpeakerTurn[]): SpeakerTurn[];

// Reconstruct raw transcript text from turns
function reconstructTranscript(turns: SpeakerTurn[]): string;

// Derive participant subset from turns + original participant list
function deriveParticipants(
  turns: SpeakerTurn[],
  originalParticipants: Participant[],
): Participant[];

// Full split operation: archive original, create N new meetings, write lineage
function splitMeeting(
  db: Database,
  meetingId: string,
  durations: number[],
): SplitResult;
```

## Error Propagation Path

```
API/CLI receives split request
  |
  core/meeting-split.ts splitMeeting()
    |
    1. getMeeting(db, meetingId)           --> throws if not found
    2. Parse raw_transcript back to turns  --> throws if no turns
    3. Validate durations                  --> throws if sum exceeds transcript duration
    4. computeCutPoints()                  --> pure math, no errors
    5. partitionTurns()                    --> pure array slicing
    6. For each segment:
       a. rebaseTimestamps()
       b. deriveParticipants()
       c. reconstructTranscript()
       d. ingestMeeting(db, segment)      --> creates new meeting row
       e. Write lineage row
    7. Archive original: UPDATE meetings SET ignored = 1 WHERE id = ?
    |
    Returns SplitResult with all new meeting IDs
```

Re-extraction happens separately -- the caller (API endpoint or CLI) triggers pipeline processing for each new meeting after split completes.

## Reference Files

| File | Why |
|------|-----|
| `core/parser.ts` | `SpeakerTurn`, `Participant`, `ParsedMeeting` types; `parseTranscriptBody` for understanding turn format |
| `core/ingest.ts` | `ingestMeeting`, `getMeeting`, `MeetingRow` -- creating new meeting records |
| `core/db.ts` | Migration target -- add `meeting_lineage` table |
| `core/pipeline.ts` | `processEntry` -- re-extraction entry point for new segments |
| `core/chunker.ts` | `chunkTranscript` -- used during re-extraction, no changes needed |
| `core/extractor.ts` | `extractSummary`, `storeArtifact` -- used during re-extraction |
| `core/meeting-pipeline.ts` | `embedMeeting`, `storeMeetingVector` -- used during re-extraction |
| `api/routes/meetings.ts` | `registerMeetingRoutes` -- add split endpoint here |
| `api/server.ts` | `createApp` -- may need to pass additional deps to meeting routes |
| `electron-ui/electron/channels.ts` | `CHANNELS` const + `ElectronAPI` interface |
| `electron-ui/ui/src/api-client/index.ts` | `apiClient` -- add split method |

## Testing Strategy

- **Per-burst TDD**: Every burst starts with a failing test, writes minimal passing code, then TCR
- **In-memory SQLite**: All tests use `createDb(":memory:")` + `migrate(db)`
- **100% coverage enforced**: No escape hatches on new files
- **Existing tests must pass**: Migration adds new table, does not alter existing tables

### Test Fixture: Meeting with Two Back-to-Back Calls

```ts
// A 90-minute recording containing two meetings:
//   Meeting A: 00:00 - 01:00 (turns 0-19, speakers: Alice, Bob)
//   Meeting B: 01:02 - 01:28 (turns 20-29, speakers: Alice, Charlie)
//
// Realistic patterns included:
//   - Multiple turns sharing the same timestamp (rapid speaker alternation)
//   - A gap between meetings (00:58 -> 01:02, representing inter-meeting silence)
//   - A turn exactly on a likely cut boundary
const turns: SpeakerTurn[] = [
  { speaker_name: "Alice", timestamp: "00:00", text: "Welcome to the standup" },
  { speaker_name: "Bob",   timestamp: "00:05", text: "Here's my update" },
  { speaker_name: "Alice", timestamp: "00:05", text: "Go ahead" },       // same timestamp as previous
  { speaker_name: "Bob",   timestamp: "00:05", text: "We shipped the fix" }, // three turns at 00:05
  { speaker_name: "Alice", timestamp: "00:12", text: "Nice work" },
  { speaker_name: "Bob",   timestamp: "00:20", text: "Next topic" },
  { speaker_name: "Alice", timestamp: "00:32", text: "Let's review the metrics" },
  { speaker_name: "Bob",   timestamp: "00:32", text: "Sure, pulling them up" },  // shared timestamp
  { speaker_name: "Alice", timestamp: "00:45", text: "Numbers look good" },
  { speaker_name: "Bob",   timestamp: "00:50", text: "Agreed" },
  { speaker_name: "Alice", timestamp: "00:55", text: "Any blockers?" },
  { speaker_name: "Bob",   timestamp: "00:58", text: "None from me" },
  { speaker_name: "Alice", timestamp: "00:58", text: "Alright, that wraps up standup" },  // shared with previous
  // --- GAP: 4 minutes of silence between meetings ---
  // Meeting B starts
  { speaker_name: "Alice",   timestamp: "01:02", text: "OK Charlie, let's discuss the design" },
  { speaker_name: "Charlie", timestamp: "01:05", text: "Sure, I have the mockups ready" },
  { speaker_name: "Alice",   timestamp: "01:10", text: "These look great" },
  { speaker_name: "Charlie", timestamp: "01:15", text: "I'll walk through the flow" },
  { speaker_name: "Alice",   timestamp: "01:20", text: "Makes sense" },
  { speaker_name: "Charlie", timestamp: "01:25", text: "One more thing" },
  { speaker_name: "Charlie", timestamp: "01:28", text: "I'll send the updated designs" },
];

const participants: Participant[] = [
  { id: "1", first_name: "Alice",   last_name: "Smith",   email: "alice@co.com" },
  { id: "2", first_name: "Bob",     last_name: "Jones",   email: "bob@co.com" },
  { id: "3", first_name: "Charlie", last_name: "Lee",     email: "charlie@co.com" },
];
```

### Test Fixture: Split Request

```ts
// "Two meetings: first was 60 minutes, second was 30 minutes"
const durations = [60, 30];

// Expected: cumulative cut at minute 60 (01:00)
// Last turn at or before 01:00 is turn index 12 (00:58, "Alright, that wraps up standup")
// Segment 1: turns 0-12 (00:00 to 00:58), rebased to 00:00-00:58
// Segment 2: turns 13-20 (01:02 to 01:28), rebased to 00:00-00:26
```

### Test Fixture: Participants After Split

```ts
// Segment 1 speakers: Alice, Bob -> participants: [Alice Smith, Bob Jones]
// Segment 2 speakers: Alice, Charlie -> participants: [Alice Smith, Charlie Lee]
```

### Test Fixture: Three-Way Split

```ts
// Same 90-minute recording, user says 3 meetings: [30, 30, 30]
// Cumulative cuts at minute 30 and minute 60
// Cut 1: last turn at or before 00:30 -> turn 7 at 00:32? No, turn 6 at 00:20. 
//         Actually: turn at 00:32 is AFTER 30, so last at-or-before is turn 5 at 00:20
// Cut 2: last turn at or before 01:00 -> turn 12 at 00:58
// Segment 1: turns 0-5 (00:00-00:20), rebased 00:00-00:20
// Segment 2: turns 6-12 (00:32-00:58), rebased 00:00-00:26
// Segment 3: turns 13-20 (01:02-01:28), rebased 00:00-00:26
```

### Test Fixture: Boundary Edge Cases

```ts
// Cut exactly on a turn timestamp:
// durations = [32, 60] on above fixture
// Cumulative cut at minute 32 -> turns at 00:32 exist (indices 6 and 7)
// "At or before 32" includes the 00:32 turns -> last 00:32 turn is index 7
// This tests that cuts ON a timestamp include all turns at that timestamp in the earlier segment

// Unknown speaker name:
// If a turn has speaker_name "Unknown Speaker 1" and no participant matches,
// deriveParticipants creates: { id: "", first_name: "Unknown Speaker 1", last_name: "", email: "" }
```

---

## Phase 1: Core Split Logic

### Dependency Graph (Phase 1)

```
Section 1 -- Sequential (schema + pure functions)
  Burst 1 -> 2 -> 3 -> 4 -> 5

Section 2 -- Sequential (split orchestration)
  Burst 6 -> 7 -> 8
```

### Phase 1 Bursts

#### Section 1: Schema & Pure Functions

- [x] Burst 1: Add `meeting_lineage` table to `core/db.ts` `migrate()`. Test: verify table exists after migration, verify columns and defaults, verify foreign keys. Verify existing tables are unaffected. File: `test/db.test.ts` (add to existing).

- [x] Burst 2: Create `core/meeting-split.ts` -- `computeCutPoints(turns, durations)`. Takes a `SpeakerTurn[]` and a `number[]` of durations in minutes. Converts durations to cumulative minute thresholds (e.g., `[60, 15]` -> cuts at minute 60 and minute 75). Walks the turns array; for each cut threshold, finds the index of the last turn whose `HH:MM` timestamp (parsed to total minutes) is <= the threshold. Returns `{ turnIndex, timestamp }[]` where `turnIndex` is the first turn of the NEXT segment and `timestamp` is the actual turn timestamp at that boundary. Edge case: if a cut falls before the first turn or after the last turn, throw a validation error. Test: `test/meeting-split.test.ts` -- exact cut on a turn boundary, cut between turns (snaps to last turn before), cut at very start (error), cut past end (error), three-way split.

- [x] Burst 3: `core/meeting-split.ts` -- `rebaseTimestamps(turns)`. Takes a `SpeakerTurn[]` and returns a new array where the first turn's timestamp becomes `00:00` and all subsequent turns are offset by the same delta. Parse `HH:MM` to minutes, subtract the first turn's minutes, format back to `HH:MM`. Test: turns starting at `01:02` with subsequent turns at `01:05`, `01:28` rebase to `00:00`, `00:03`, `00:26`. Test: turns already starting at `00:00` are unchanged. Test: does not mutate the input array.

- [x] Burst 4: `core/meeting-split.ts` -- `partitionTurns(turns, cutPoints)`. Takes the full `SpeakerTurn[]` and the cut points from `computeCutPoints`. Returns `SpeakerTurn[][]` -- an array of N segments, where segment boundaries are at the cut point turn indices. Each segment's timestamps are rebased via `rebaseTimestamps`. Test: 2-way split produces 2 arrays with correct turns. 3-way split produces 3 arrays. Verify timestamps are rebased in each segment. Verify original array is not mutated.

- [x] Burst 5: `core/meeting-split.ts` -- `reconstructTranscript(turns)` and `deriveParticipants(turns, originalParticipants)`.

  `reconstructTranscript`: Takes a `SpeakerTurn[]` and produces a plain text transcript in the same format the parser expects: `"Speaker Name | HH:MM\ntext\n\n"` for each turn. This becomes the `raw_transcript` for the new meeting.

  `deriveParticipants`: Takes a `SpeakerTurn[]` and the original meeting's `Participant[]` array. Collects unique speaker names from turns, matches each against `first_name + " " + last_name` in the original participant list. Returns only matching participants. Unmatched speaker names (e.g., "Unknown Speaker 1") are included as synthetic participants with empty `id`, `last_name`, `email`.

  Test: reconstruct a 3-turn transcript and verify exact string output. Derive participants from segment with 2 of 3 original speakers -- verify only those 2 returned. Test unknown speaker name produces synthetic participant. **Round-trip fidelity test:** verify `parseTranscriptBody(reconstructTranscript(turns))` produces turns equivalent to the input (same speaker_name, timestamp, and text for each turn). This guarantees that `reprocessSplitSegments` (Burst 12) can re-parse stored transcripts without data loss.

#### Section 2: Split Orchestration

- [x] Burst 6: `core/meeting-split.ts` -- `validateSplitRequest(db, meetingId, durations)`. Validates:
  1. Meeting exists and is not already archived (`ignored != 1`)
  2. Meeting has a `raw_transcript` that produces at least 2 turns when parsed
  3. `durations` has at least 2 elements (splitting into 1 meeting is a no-op)
  4. Cumulative duration of all-but-last does not exceed the transcript's time span
  5. Meeting is not already a split source (no rows in `meeting_lineage` with `source_meeting_id = meetingId`)

  Returns `{ meeting: MeetingRow, turns: SpeakerTurn[], participants: Participant[] }` on success, throws descriptive errors on failure. Test: valid meeting passes. Missing meeting throws. Already-ignored meeting throws. Single-element durations array throws. Durations exceeding transcript length throws. Already-split meeting throws.

- [x] Burst 7: `core/meeting-split.ts` -- `splitMeeting(db, meetingId, durations)`. The main orchestration function:
  1. Calls `validateSplitRequest`
  2. Calls `computeCutPoints` then `partitionTurns`
  3. For each segment (1..N):
     - `reconstructTranscript(segmentTurns)`
     - `deriveParticipants(segmentTurns, originalParticipants)`
     - Build a `ParsedMeeting` with title `"{original} (K of N)"`, timestamp adjusted for segment offset, sourceFilename `"{original}::split:{K}"`
     - Call `ingestMeeting(db, parsedSegment)` to create the new meeting row
     - Insert a `meeting_lineage` row linking source to result
  4. Archive original: `UPDATE meetings SET ignored = 1 WHERE id = ?`
  5. Return `SplitResult` with all segment details

  Test: Split a meeting into 2 -- verify 2 new meeting rows exist with correct titles, participants, transcripts. Verify original is `ignored=1`. Verify 2 lineage rows exist with correct `segment_index` and `source_meeting_id`. Verify source_filenames are unique and follow convention.

- [x] Burst 8: `core/meeting-split.ts` -- `getSplitLineage(db, meetingId)`. Two queries:
  1. `getChildMeetings(db, sourceMeetingId)` -- returns all result meetings for a given source, ordered by `segment_index`
  2. `getSourceMeeting(db, resultMeetingId)` -- returns the source meeting if this meeting was created by a split, or null

  Test: After splitting meeting A into B and C, `getChildMeetings(A)` returns `[B, C]` ordered. `getSourceMeeting(B)` returns A. `getSourceMeeting(A)` returns null (A is the source, not a result). `getChildMeetings(B)` returns empty (B has no children).

---

## Phase 2: API & CLI

### Dependency Graph (Phase 2)

```
Section 3 -- Sequential (API endpoint)
  Burst 9 -> 10

Section 4 -- Sequential (CLI command)
  Burst 11
```

### Phase 2 Bursts

#### Section 3: API Endpoint

- [x] Burst 9: Add `POST /api/meetings/:id/split` to `api/routes/meetings.ts`. Accepts JSON body `{ durations: number[] }`. Calls `splitMeeting(db, id, durations)`. Returns the `SplitResult` as JSON with status 200. Error cases:
  - Meeting not found: 404
  - Validation failure (bad durations, already split, etc.): 400 with `{ error: string }`
  - Internal error: 500

  This burst does NOT trigger re-extraction -- it only creates the split meeting rows. Re-extraction is Phase 3.

  Test: `test/api-meetings.test.ts` -- POST with valid durations returns 200 + correct SplitResult shape. POST on nonexistent meeting returns 404. POST with single-element durations returns 400. POST on already-ignored meeting returns 400.

- [x] Burst 10: Add `GET /api/meetings/:id/lineage` to `api/routes/meetings.ts`. Returns:
  ```ts
  {
    source: MeetingRow | null,       // if this meeting was split from another
    children: MeetingRow[],          // if this meeting has been split into children
    segment_index: number | null,    // this meeting's position in its split (if applicable)
  }
  ```

  Test: `test/api-meetings.test.ts` -- lineage of a split source returns null source + N children. Lineage of a child returns the source + empty children + correct segment_index. Lineage of an unsplit meeting returns null source + empty children.

#### Section 4: CLI Command

- [x] Burst 11: Create `cli/split.ts`. Parses args: `<meeting-id> --durations 60,15,15`. Validates meeting ID is provided and durations parse as comma-separated positive numbers. Opens the database, calls `splitMeeting`, prints the result table:

  ```
  Split meeting "Weekly Standup" into 3 segments:
    1 of 3: a1b2c3d4  "Weekly Standup (1 of 3)"  turns: 20  00:00-00:58  (requested: 60m, actual: 58m)
    2 of 3: e5f6g7h8  "Weekly Standup (2 of 3)"  turns: 6   00:00-00:14  (requested: 15m, actual: 14m)
    3 of 3: i9j0k1l2  "Weekly Standup (3 of 3)"  turns: 4   00:00-00:12  (requested: 15m, actual: 12m)
  Original meeting archived (ignored=1)
  Run pipeline to extract insights for new meetings.
  ```

  Test: `test/cli-split.test.ts` -- call the split function with a seeded meeting, verify output includes all segment IDs and the "archived" confirmation. Verify error output when meeting not found. Verify error output when durations are invalid.

---

## Phase 3: Re-extraction Integration

### Dependency Graph (Phase 3)

```
Section 5 -- Sequential (pipeline trigger)
  Burst 12 -> 13
```

### Phase 3 Bursts

#### Section 5: Pipeline Re-extraction for Split Segments

- [x] Burst 12: Create `core/meeting-split.ts` -- `reprocessSplitSegments(db, splitResult, pipelineDeps)`. Takes the `SplitResult` from `splitMeeting` plus the pipeline dependencies (`llm`, `session`, `vdb`, etc.). For each segment in `splitResult.segments`:
  1. Loads the new meeting row via `getMeeting(db, segment.meeting_id)`
  2. Parses the `raw_transcript` back into turns
  3. Runs `detectClient` + `storeDetection`
  4. Runs `extractSummary` + `storeArtifact`
  5. Runs `embedMeeting` + `storeMeetingVector`
  6. Runs thread evaluation + milestone reconciliation

  This mirrors the `processEntry` pipeline steps but operates on already-ingested meetings rather than raw files. Error on one segment does not abort the others -- collect results as `{ meeting_id, status: "ok" | "failed", error?: string }[]`.

  Test: `test/meeting-split.test.ts` -- use stub LLM adapter. Split a meeting, call `reprocessSplitSegments`, verify each segment has an artifact row, verify client detection ran for each. Verify a failure in one segment still processes the others.

  **Note:** This burst depends on the pipeline dependencies being available. The function signature should mirror what `processEntry` needs, but extracted into a reusable shape. If a `PipelineDeps` type doesn't already exist, define one:
  ```ts
  interface PipelineDeps {
    llm: LlmAdapter;
    session: InferenceSession & { _tokenizer: unknown };
    vdb: VectorDb;
    tokenLimit?: number;
    extractionPromptPath?: string;
    threadSimilarityThreshold?: number;
  }
  ```

- [x] Burst 13: Wire re-extraction into the API endpoint from Burst 9. After `splitMeeting` returns, call `reprocessSplitSegments` for each new segment. Since re-extraction is async (LLM calls), the endpoint should either:
  - **Option A:** Await all re-extractions and return the full result (simple, but slow -- user waits)
  - **Option B:** Return the split result immediately, trigger re-extraction in the background

  Choose Option A for v1 (simpler, and splits are infrequent operations). The CLI from Burst 11 also calls `reprocessSplitSegments` after split.

  Update the API endpoint to accept pipeline dependencies from `createApp`. Update `registerMeetingRoutes` signature if needed.

  Test: `test/api-meetings.test.ts` -- POST split with stub LLM, verify response includes segment IDs, verify each segment has an artifact row after the response returns.

---

## Phase 4: Cleanup of Archived Meeting Downstream Data

### Dependency Graph (Phase 4)

```
Section 6 -- Sequential (cleanup)
  Burst 14 -> 15
```

### Phase 4 Bursts

#### Section 6: Archive Cleanup

- [x] Burst 14: `core/meeting-split.ts` -- `cleanupArchivedMeeting(db, vdb, meetingId)`. When a meeting is archived after split, its downstream data becomes stale. This function:
  1. Deletes the archived meeting's artifact row (`DELETE FROM artifacts WHERE meeting_id = ?`)
  2. Deletes the archived meeting's FTS index entry (`DELETE FROM artifact_fts WHERE meeting_id = ?`)
  3. Deletes client detection rows (`DELETE FROM client_detections WHERE meeting_id = ?`)
  4. Deletes cluster assignments (`DELETE FROM meeting_clusters WHERE meeting_id = ?`)
  5. Deletes item mentions (`DELETE FROM item_mentions WHERE meeting_id = ?`)
  6. Removes the meeting vector from LanceDB (`meeting_vectors` table, delete by meeting_id)
  7. Removes item vectors from LanceDB (`item_vectors` table, delete by meeting_id)

  Does NOT delete: `meeting_messages` (chat history is conversational, user may want to keep it), `thread_meetings` (thread relevance was valid at the time), `milestone_mentions` / `milestone_action_items` (these reference specific content that may still be relevant via the new segments), `action_item_completions` (historical record of what was marked done).

  Test: seed a meeting with artifact, FTS entry, client detection, cluster assignment, item mention. Call `cleanupArchivedMeeting`. Verify all cleaned rows are gone. Verify meeting row itself still exists with `ignored=1`. Verify un-cleaned associations still exist.

- [x] Burst 15: Integrate `cleanupArchivedMeeting` into `splitMeeting` (Burst 7). After archiving the original meeting and before returning the result, call cleanup. This ensures the archived meeting's stale data doesn't pollute search results or cluster assignments while the new segments are being re-extracted.

  Test: split a meeting that has an artifact + FTS entry + client detection. After split, verify archived meeting has no artifact, no FTS entry, no client detection. Verify new segment meetings exist correctly.

---

## Phase 5: End-to-End Integration Tests

### Dependency Graph (Phase 5)

```
Section 7 -- Sequential (E2E tests)
  Burst 16 -> 17 -> 18
```

### Phase 5 Bursts

#### Section 7: Integration & E2E Verification

- [x] Burst 16: Create `test/split-e2e.test.ts` -- full lifecycle test through the API. This test exercises the complete split flow as a real consumer would use it. Setup:
  1. Create an in-memory DB + migrate
  2. Seed a meeting via `ingestMeeting` with the full 21-turn fixture (both shared timestamps and gap)
  3. Seed a client and store a detection for the meeting
  4. Store an artifact for the meeting (use stub LLM fixture output)
  5. Insert an FTS entry via `updateFts`
  6. Create a Hono app via `createApp(db, ":memory:", stubLlm)`

  **Test: "split via API creates correct segments and cleans up original"**
  1. `POST /api/meetings/:id/split` with `{ durations: [60, 30] }`
  2. Verify response is 200 with `SplitResult` shape
  3. Verify `segments` array has 2 entries with correct `segment_index`, `turn_count`, `actual_start`, `actual_end`
  4. Verify `actual_duration` is approximate (within 2 minutes of requested)

  **Test: "new segments appear in meeting list, original does not"**
  1. After split, `GET /api/meetings` 
  2. Verify response contains both new segment meetings (by ID from split result)
  3. Verify response does NOT contain the original meeting ID
  4. Verify each segment's title follows `(1 of 2)` / `(2 of 2)` convention

  **Test: "each new segment has correct participants"**
  1. `GET /api/meetings/:segmentId` for segment 1
  2. Verify participants include Alice and Bob, NOT Charlie
  3. `GET /api/meetings/:segmentId` for segment 2
  4. Verify participants include Alice and Charlie, NOT Bob

  **Test: "archived meeting's stale data is removed"**
  1. After split, query `artifacts` table directly -- no row for original meeting ID
  2. Query `artifact_fts` -- no row for original meeting ID
  3. Query `client_detections` -- no rows for original meeting ID
  4. Verify original meeting row still exists with `ignored = 1`

  **Test: "lineage is queryable from both directions"**
  1. `GET /api/meetings/:originalId/lineage` -- verify `children` contains both segments ordered by index, `source` is null
  2. `GET /api/meetings/:segment1Id/lineage` -- verify `source` is the original meeting, `children` is empty, `segment_index` is 1
  3. `GET /api/meetings/:segment2Id/lineage` -- verify `segment_index` is 2

  **Test: "split is idempotent-safe -- cannot split an already-split meeting"**
  1. `POST /api/meetings/:originalId/split` with `{ durations: [30, 30] }`
  2. Verify response is 400 (original is now ignored)
  3. `POST /api/meetings/:segment1Id/split` with `{ durations: [15, 15] }`
  4. This SHOULD succeed (splitting a child is allowed -- it's a normal meeting). Verify 200.

  Note: If the design decision is to prevent splitting children too, adjust the validation and this test accordingly.

- [x] Burst 17: Add re-extraction verification to `test/split-e2e.test.ts`. After the split + re-extraction flow:

  **Test: "re-extraction produces artifacts for each new segment"**
  1. Split a meeting via the API (which triggers re-extraction per Burst 13)
  2. For each segment ID in the result:
     - `GET /api/meetings/:segmentId` -- verify `artifact` field is populated (not null/empty)
     - Verify `artifact.summary` is a non-empty string
     - Verify `artifact.action_items` is an array (may be empty for short segments, but must exist)
  3. Verify the stub LLM was called once per segment (not once total)

  **Test: "FTS indexes new segments after re-extraction"**
  1. After split + re-extraction, query `artifact_fts` table directly
  2. Verify rows exist for each new segment meeting ID
  3. Verify no row exists for the original meeting ID

  **Test: "client detection runs independently per segment"**
  1. After split + re-extraction, query `client_detections` table
  2. Verify detection rows exist for each new segment meeting ID
  3. Verify each segment's detection was derived independently (not copied from original)

  **Test: "re-extraction failure on one segment does not block the other"**
  1. Create a stub LLM that fails on the second call but succeeds on the first
  2. Split a meeting into 2 segments
  3. Verify segment 1 has an artifact
  4. Verify segment 2 has NO artifact (extraction failed)
  5. Verify segment 2's meeting row still exists (not deleted or corrupted)
  6. Verify the error is surfaced in the response (either in SplitResult or via health endpoint)

- [x] Burst 18: Create CLI integration test in `test/cli-split.test.ts` that exercises the CLI entry point against a real Hono app.

  **Test: "CLI split hits the API endpoint and prints correct output"**
  1. Create an in-memory DB + Hono app + stub LLM
  2. Seed a meeting with realistic turns
  3. Call the CLI split function with the meeting ID and `--durations 60,30`
  4. Verify the CLI calls `POST /api/meetings/:id/split` (or calls the core function -- either way, verify the full stack)
  5. Verify stdout contains all segment IDs from the result
  6. Verify stdout contains "archived" confirmation
  7. Verify stdout shows actual vs requested durations for each segment

  **Test: "CLI prints error for nonexistent meeting"**
  1. Call CLI split with a fake meeting ID
  2. Verify stderr/stdout contains a descriptive error message
  3. Verify process exit code is non-zero (or function throws)

  **Test: "CLI prints error for invalid durations"**
  1. Call CLI split with `--durations abc,def`
  2. Verify error message about invalid duration format
  3. Call CLI split with `--durations 60` (only one segment)
  4. Verify error message about needing at least 2 segments

  **Test: "CLI split followed by meeting list excludes archived meeting"**
  1. After a successful CLI split, query the DB directly (or call the meetings list API)
  2. Verify the original meeting is not in the active list
  3. Verify both new segments are in the active list

---

## Phase 6: UI Split Dialog

### Dependency Graph (Phase 6)

```
Section 8 -- Sequential (ElectronAPI + api-client)
  Burst 19

Section 9 -- Sequential (React UI)
  Burst 20 -> 21 -> 22
```

### Phase 6 Bursts

#### Section 8: ElectronAPI & API Client

- [x] Burst 19: Add split and lineage methods to `ElectronAPI` interface + `CHANNELS` const + IPC handler + `api-client/`.

  **channels.ts changes:**
  ```ts
  // CHANNELS const:
  SPLIT_MEETING: "split-meeting",
  GET_MEETING_LINEAGE: "get-meeting-lineage",

  // ElectronAPI interface:
  splitMeeting: (meetingId: string, durations: number[]) => Promise<SplitResult>;
  getMeetingLineage: (meetingId: string) => Promise<{ source: MeetingRow | null; children: MeetingRow[]; segment_index: number | null }>;
  ```

  **api-client additions:**
  ```ts
  splitMeeting: (meetingId: string, durations: number[]) =>
    jsonPost(`${API_BASE}/api/meetings/${meetingId}/split`, { durations }),
  getMeetingLineage: (meetingId: string) =>
    fetchJson(`${API_BASE}/api/meetings/${meetingId}/lineage`),
  ```

  **IPC handler** (`electron-ui/electron/handlers/meetings.ts`): register handlers that call `splitMeeting` from core and `getSplitLineage` from core.

  Test: `test/ipc-handlers.test.ts` -- verify split handler calls core function with correct args. Verify lineage handler returns expected shape.

#### Section 9: React UI

- [ ] Burst 20: Create `electron-ui/ui/src/components/SplitMeetingDialog.tsx`. A modal dialog with:
  1. Prompt: "How many meetings are in this recording?" -- number input, min 2, max 10, default 2
  2. For each segment: a row showing "Meeting K of N" with a duration input (minutes). Last segment shows "remainder" as placeholder.
  3. Below inputs: a summary bar showing the transcript's total duration and how the durations map: "Segment 1: 00:00-01:00 | Segment 2: 01:00-01:15 | Segment 3: 01:15-end"
  4. Confirm button ("Split Meeting") and Cancel button
  5. On confirm: calls `window.api.splitMeeting(meetingId, durations)`, shows loading state, then success/error toast

  Props: `meetingId: string`, `meetingTitle: string`, `totalDurationMinutes: number`, `onClose: () => void`, `onSuccess: (result: SplitResult) => void`.

  Test: `test/ui/split-meeting-dialog.test.tsx` -- render with props, verify number input changes segment count. Fill in durations, click confirm, verify `window.api.splitMeeting` called with correct args. Verify error state renders on API failure.

- [x] Burst 21: Add "Split Meeting" action to meeting detail view. This is a button or menu item in the meeting detail header/actions area. Clicking it opens the `SplitMeetingDialog`. The button should be hidden/disabled if:
  1. Meeting is already archived (`ignored=1`)
  2. Meeting was created by a split (has a source in lineage -- show "Split from {source title}" info instead)

  Requires calling `getMeetingLineage` when loading meeting detail to determine button visibility and show lineage info.

  Test: `test/ui/meeting-detail.test.tsx` -- render meeting detail with mock API. Verify "Split Meeting" button appears for normal meetings. Verify button is hidden for ignored meetings. Verify lineage info appears for split-child meetings.

- [ ] Burst 22: After a successful split, the UI should navigate away from the archived meeting and show the first new segment. Invalidate the meetings list query so it refreshes. Show a success toast: "Meeting split into N parts. Re-extraction in progress."

  Test: `test/ui/split-meeting-dialog.test.tsx` -- after successful split, verify `onSuccess` callback fired with result, verify meeting list query invalidated.

---

## Phase 7: Documentation & Scatter Updates

- [ ] Burst 23: Update scatter.md files for new/changed files: `core/scatter.md` (add `meeting-split.ts`), `api/routes/scatter.md` (update `meetings.ts` entry), `cli/scatter.md` (add `split.ts`), `electron-ui/electron/handlers/scatter.md` (update `meetings.ts`), `electron-ui/ui/src/components/scatter.md` (add `SplitMeetingDialog.tsx`), `test/scatter.md` (add `split-e2e.test.ts`, `cli-split.test.ts`).

---

## Verification

### Functional Requirements Checklist

| # | Requirement | Verified by (unit) | Verified by (E2E) |
|---|-------------|--------------------|--------------------|
| FR-1 | User can split a meeting into N segments by specifying durations | Burst 7: splitMeeting with 2 and 3 segments | Burst 16: POST split returns correct SplitResult |
| FR-2 | Cut points snap to turn boundaries (last turn at or before cumulative timestamp) | Burst 2: computeCutPoints with between-turn cuts, shared-timestamp boundary | Burst 16: actual_start/actual_end in response match expected boundaries |
| FR-3 | Each segment gets rebased timestamps starting at 00:00 | Burst 3: rebaseTimestamps on non-zero-start turns | -- (covered by unit) |
| FR-4 | Each segment has only the participants who spoke in it | Burst 5: deriveParticipants filters correctly | Burst 16: GET each segment verifies participant subset |
| FR-5 | Original meeting is archived (ignored=1) after split | Burst 7: verify ignored flag | Burst 16: original absent from GET /api/meetings |
| FR-6 | Lineage table tracks source -> result relationships | Burst 7 + 8: lineage rows, queries both directions | Burst 16: GET lineage from parent and child |
| FR-7 | Split source_filenames are unique and follow convention | Burst 7: verify `::split:N` suffix | -- (covered by unit) |
| FR-8 | API endpoint returns SplitResult with actual vs requested durations | Burst 9: POST returns correct shape | Burst 16: full response shape validation |
| FR-9 | CLI accepts `--durations` flag and prints result table | Burst 11: CLI output verification | Burst 18: CLI integration against real app |
| FR-10 | Re-extraction runs for each new segment | Burst 12: artifacts exist after reprocess | Burst 17: GET each segment has populated artifact |
| FR-11 | Re-extraction failure on one segment doesn't abort others | Burst 12: one fails, others succeed | Burst 17: failing LLM stub, segment 1 has artifact, segment 2 does not |
| FR-12 | Archived meeting's stale data is cleaned up | Burst 14: artifact, FTS, detections removed | Burst 16: no artifact/FTS/detections for original after split |
| FR-13 | Cannot split an already-archived meeting | Burst 6: validation rejects ignored meeting | Burst 16: POST on archived returns 400 |
| FR-14 | Cannot split a meeting that was already split | Burst 6: validation rejects meeting with lineage children | Burst 16: POST on already-split source returns 400 |
| FR-15 | UI shows "Split Meeting" action on eligible meetings | Burst 21: button visibility | -- (UI unit test with mock) |
| FR-16 | UI hides split action on archived or already-split meetings | Burst 21: button hidden | -- (UI unit test with mock) |
| FR-17 | Last segment duration is the remainder of the transcript | Burst 2: last cut uses remaining turns | Burst 16: last segment in response has remaining turns |
| FR-18 | Durations exceeding transcript length are rejected | Burst 6: validation error | Burst 16: POST with excessive durations returns 400 |
| FR-19 | Meeting title follows "(K of N)" convention | Burst 7: verify title format | Burst 16: GET /api/meetings shows correct titles |
| FR-20 | Lineage endpoint returns source, children, and segment_index | Burst 10: all three lineage queries | Burst 16: GET lineage from both directions |
| FR-21 | reconstructTranscript round-trips through parseTranscriptBody | Burst 5: parse(reconstruct(turns)) equals original | -- (covered by unit) |
| FR-22 | FTS indexes new segments after re-extraction | -- | Burst 17: artifact_fts rows exist for new segments |
| FR-23 | Client detection runs independently per segment | -- | Burst 17: client_detection rows per segment |
| FR-24 | CLI prints descriptive errors for invalid input | Burst 11: error output tests | Burst 18: nonexistent meeting, bad durations |
| FR-25 | New segments appear in meeting list after split | -- | Burst 16 + 18: API and CLI both verify active list |
| FR-26 | Splitting a child meeting is allowed (it's a normal meeting) | -- | Burst 16: split a segment, verify 200 |
