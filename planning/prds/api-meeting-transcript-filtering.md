# API Optimization: Exclude Raw Transcript from Meeting Detail by Default

## Problem

`GET /api/meetings/:id` always returns the full `raw_transcript` field. Transcripts are often the largest field on a meeting row — multi-thousand-line strings that dominate response payload size. Most consumers of this endpoint need meeting metadata (title, date, participants, type) but not the transcript itself.

Current behavior:

```
GET /api/meetings/:id
→ { id, title, meeting_type, date, participants, raw_transcript, source_filename, created_at }
```

`raw_transcript` is always included, even when the caller only needs metadata. A separate `GET /api/meetings/:id/transcript` endpoint already exists for explicit transcript retrieval, but the detail endpoint redundantly includes it.

## Impact

- **Bandwidth**: Every meeting detail fetch transfers the full transcript — often 10-50KB of text — when the caller typically needs ~500 bytes of metadata.
- **CLI**: The new `mti meetings get` command had to add client-side stripping (`--include-transcript` flag) to avoid dumping transcript text into terminal output. This is a workaround for a server-side problem.
- **Agents**: LLM agents calling the API waste context window tokens on transcript text they didn't ask for.
- **UI**: The Electron UI never uses `raw_transcript` from the detail endpoint — it calls the list endpoint for metadata and has a dedicated transcript viewer that uses the `/transcript` sub-route.

## Proposal

Change `GET /api/meetings/:id` to **exclude** `raw_transcript` by default. Add an opt-in query parameter to include it when explicitly requested.

### New behavior

```
GET /api/meetings/:id
→ { id, title, meeting_type, date, participants, source_filename, created_at }

GET /api/meetings/:id?include=transcript
→ { id, title, meeting_type, date, participants, raw_transcript, source_filename, created_at }
```

### `include` parameter design

- Query param: `?include=transcript`
- Multiple values supported for future extensibility: `?include=transcript,artifact`
- When `transcript` is not in the include list, `raw_transcript` is omitted from the response entirely (not set to `null`)

## Affected Code

### Core layer — `core/ingest.ts`

`getMeeting()` currently does `SELECT * FROM meetings`. Two options:

**Option A — Two queries in `getMeeting()`:**
```ts
export function getMeeting(db: Database, meetingId: string, options?: { includeTranscript?: boolean }): MeetingRow | MeetingRowLight {
  const columns = options?.includeTranscript
    ? "*"
    : "id, title, meeting_type, date, participants, source_filename, created_at";
  return db.prepare(`SELECT ${columns} FROM meetings WHERE id = ?`).get(meetingId);
}
```

**Option B — Separate function:**
```ts
export function getMeetingSummary(db: Database, meetingId: string): MeetingRowLight {
  return db.prepare("SELECT id, title, meeting_type, date, participants, source_filename, created_at FROM meetings WHERE id = ?").get(meetingId);
}
```

Option A is preferred — keeps a single function, avoids a parallel API that can drift.

### API route — `api/routes/meetings.ts`

```ts
app.get("/api/meetings/:id", (c) => {
  const id = c.req.param("id");
  const includes = (c.req.query("include") ?? "").split(",").filter(Boolean);
  const meeting = getMeeting(db, id, { includeTranscript: includes.includes("transcript") });
  if (!meeting) return c.json({ error: "Not found" }, 404);
  return c.json(meeting);
});
```

### Internal callers that DO need the transcript

These callers must be updated to pass `{ includeTranscript: true }`:

| Caller | File | Why it needs transcript |
|--------|------|----------------------|
| `detectClient` | `core/client-detection.ts:60` | Scans transcript text for client name tokens |
| `handleGetTranscript` | `electron-ui/electron/handlers/meetings.ts:511` | Returns raw transcript via dedicated endpoint |

### Internal callers that do NOT need the transcript

These callers use only metadata fields and require no changes (they'll get the lighter response):

| Caller | File | Fields used |
|--------|------|------------|
| `buildLabeledContext` | `core/labeled-context.ts:130` | `title`, `date` |
| `buildChatLabeledContext` | `core/labeled-context.ts:198` | `title`, `date` |
| Various CLI queries | `cli/query.ts` | `title`, `date`, metadata |

### CLI impact

Once this ships, the CLI's `--include-transcript` flag on `mti meetings get` becomes a thin pass-through to the `?include=transcript` query param rather than client-side stripping. Simpler and saves bandwidth.

### UI impact

No UI changes needed. The UI never calls `GET /api/meetings/:id` for the detail view — it uses the list endpoint for metadata and the `/transcript` sub-route for transcript text.

## Type changes

```ts
// Lightweight meeting row without transcript
export interface MeetingRowLight {
  id: string;
  title: string;
  meeting_type: string | null;
  date: string;
  participants: string;
  source_filename: string;
  created_at: string;
}

// Full meeting row (existing, unchanged)
export interface MeetingRow extends MeetingRowLight {
  raw_transcript: string;
}
```

## Migration / Backwards Compatibility

This is a **breaking change** for any caller that expects `raw_transcript` in the `GET /api/meetings/:id` response without the query param. Known callers:

1. **Electron IPC handlers** — `handleGetTranscript` already has its own endpoint; the detail route is not used for transcript access
2. **mti CLI** — not yet shipped; the plan already accounts for this change
3. **No external consumers** — this API is internal

Given no external consumers exist, a clean break is appropriate. No deprecation period needed.
