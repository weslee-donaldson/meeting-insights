# API Reference

HTTP API for Meeting Insights. A Hono server that mirrors the Electron IPC surface over REST. All mutations in the Electron app and CLI route through the same handlers exposed here.

## Overview

**Base URL:** `http://localhost:3000` (override via `API_PORT` env var).

**Entrypoint:**
- Development: `pnpm api:dev`
- Production / supervised: PM2 service `mti-api`

**Content types:** All request and response bodies are `application/json` unless otherwise noted. Asset uploads take a base64-encoded string inside a JSON envelope rather than `multipart/form-data`.

**Error format:** Errors return a JSON body of the shape:

```json
{ "error": "human-readable message" }
```

Status codes used across the API:

| Code | Meaning |
|------|---------|
| 200  | Success (JSON body) |
| 201  | Created (resource body) |
| 204  | Success, no body (mutations that return nothing) |
| 400  | Bad request (malformed input, invalid params) |
| 401  | Unauthorized (missing/invalid bearer token or owner secret) |
| 403  | Forbidden (attempting to modify non-user note, etc.) |
| 404  | Not found |
| 500  | Unhandled server error |
| 502  | Upstream LLM failure |
| 503  | Subsystem unavailable (LLM or vector DB not initialized) |

**Authentication:** Off by default. Enable with `MTNINSIGHTS_AUTH_ENABLED=1`. When enabled, every `/api/*` route requires a `Authorization: Bearer <token>` header and is checked against the scope table below (see **Auth scopes reference**). Tokens are issued by the `/oauth/*` endpoints or generated as API keys via `pnpm manage-auth create-api-key`. The `/oauth/register` endpoint additionally requires the server's owner secret (`MTNINSIGHTS_OWNER_SECRET`).

---

## Meetings

### GET /api/meetings
List meetings, optionally filtered.
Query: `client?`, `after?` (YYYY-MM-DD), `before?` (YYYY-MM-DD)
Response: `Meeting[]`
Scope: `meetings:read`

### GET /api/meetings/:id
Fetch a single meeting row.
Response: `Meeting` or `404 { error: "Not found" }`
Scope: `meetings:read`

### POST /api/meetings
Create a synthetic meeting from raw input (requires LLM).
Body: `CreateMeetingRequest`
Response: `201 { meetingId: string }`, `502` on LLM error, `503` if LLM unavailable
Scope: `meetings:write`

### DELETE /api/meetings
Bulk-delete meetings (also removes their vectors).
Body: `{ ids: string[] }`
Response: `204`
Scope: `meetings:write`

### PATCH /api/meetings/:id/title
Rename a meeting.
Body: `{ title: string }`
Response: `204`
Scope: `meetings:write`

### POST /api/meetings/:id/re-extract
Re-run LLM artifact extraction for a meeting.
Response: `{}`, `502` on LLM error, `503` if LLM unavailable
Scope: `meetings:write`

### POST /api/meetings/:id/client
Reassign meeting to a different client.
Body: `{ clientName: string }`
Response: `204`
Scope: `meetings:write`

### POST /api/meetings/:id/ignored
Toggle whether the meeting is hidden from listings.
Body: `{ ignored: boolean }`
Response: `204`
Scope: `meetings:write`

### GET /api/meetings/:id/mention-stats
Counts of how often this meeting is referenced across other features.
Response: `MentionStats`
Scope: `meetings:read`

---

## Clients

### GET /api/clients
List clients (minimal form).
Response: `ClientListItem[]`
Scope: `meetings:read`

### GET /api/clients/list
Alias of `GET /api/clients`.
Scope: `meetings:read`

### GET /api/clients/:id
Detailed client record including aliases, glossary metadata, refinement prompt.
Response: `ClientDetail` or `404`
Scope: `meetings:read`

### GET /api/default-client
The configured default/fallback client.
Response: `Client | null`
Scope: `meetings:read`

### GET /api/glossary
Client-scoped glossary.
Query: `client` (required -- returns `[]` if missing)
Response: `GlossaryEntry[]`
Scope: `meetings:read`

### GET /api/clients/:name/action-items
All action items across meetings for this client.
Query: `after?`, `before?` (YYYY-MM-DD)
Response: `ActionItem[]`
Scope: `meetings:read`

---

## Action items

Action items live inside meeting artifacts. Per-item endpoints take `:index` (zero-based position within that meeting's items). Batch endpoints take `short_ids`, the printable 6-character IDs rendered in CLI/UI.

### POST /api/meetings/:id/action-items
Create a new action item on a meeting.
Body: `EditActionItemFields`
Response: `204`
Scope: `meetings:write`

### PUT /api/meetings/:id/action-items/:index
Edit fields on an existing action item.
Body: `EditActionItemFields`
Response: `204`
Scope: `meetings:write`

### POST /api/meetings/:id/action-items/:index/complete
Mark one item complete with an optional completion note.
Body: `{ note: string }`
Response: `204`
Scope: `meetings:write`

### DELETE /api/meetings/:id/action-items/:index/complete
Un-complete a single item.
Response: `204`
Scope: `meetings:write`

### POST /api/action-items/complete
Batch-complete items addressed by short IDs. Resolves each `short_id` to a `(meeting_id, index)` pair before completing.
Body: `{ short_ids: string[], note?: string }`
Response: `{ results: [{ short_id, status: "completed" | "not_found" }] }`
Errors: `400 { error: "short_ids must be a non-empty array" }`
Scope: `meetings:write`

### POST /api/action-items/uncomplete
Batch-uncomplete items addressed by short IDs.
Body: `{ short_ids: string[] }`
Response: `{ results: [{ short_id, status: "uncompleted" | "not_found" }] }`
Errors: `400 { error: "short_ids must be a non-empty array" }`
Scope: `meetings:write`

### GET /api/meetings/:id/completions
List completion events for a meeting's items.
Response: `Completion[]`
Scope: `meetings:read`

### GET /api/items/:canonicalId/history
Cross-meeting history for a canonical action-item identity (post-dedup).
Response: `ItemHistoryEntry[]`
Scope: `meetings:read`

---

## Artifacts

### GET /api/meetings/:id/artifact
Fetch the structured artifact (summary, action items, decisions, risks, etc.) for a meeting.
Response: `Artifact` or `404`
Scope: `meetings:read`

### PATCH /api/meetings/:id/artifact
Update a single field of the artifact.
Body: `{ field: string, value: unknown }`
Response: `{ ok: true }`, `404` if artifact missing, `400` for invalid field
Scope: `meetings:write`

### POST /api/artifacts/batch
Bulk-fetch artifacts for many meetings in one call.
Body: `{ meetingIds: string[] }`
Response: `{ [meetingId: string]: Artifact | null }`

---

## Assets

Assets are file attachments stored on disk under `MTNINSIGHTS_DATA_DIR/assets/`. These routes are only registered when `assetsDir` is configured in `server.ts`.

### GET /api/meetings/:id/assets
List assets attached to a meeting.
Response: `Asset[]`
Scope: `meetings:read`

### POST /api/meetings/:id/assets
Upload an asset as base64.
Body: `{ filename: string, mimeType: string, base64: string }`
Response: `201 Asset`
Scope: `meetings:write`

### DELETE /api/assets/:id
Remove an asset (and its file on disk).
Response: `204`
Scope: `meetings:write`

### GET /api/assets/:id/data
Fetch asset metadata plus base64 contents.
Response: `{ filename, mimeType, base64 }` or `404`
Scope: `meetings:read`

---

## Chat and messages

### GET /api/meetings/:id/messages
Conversation history scoped to a single meeting.
Response: `Message[]`
Scope: `meetings:read`

### POST /api/meetings/:id/chat
Send a chat turn grounded on a meeting (requires LLM).
Body:
```json
{
  "message": "string",
  "includeTranscripts": false,
  "template": "optional string",
  "includeAssets": false,
  "attachments": [{ "name": "...", "base64": "...", "mimeType": "..." }],
  "noteIds": ["note-id-1"]
}
```
Response: `ChatResult`, `503` if LLM missing
Scope: `meetings:write`

### DELETE /api/meetings/:id/messages
Clear meeting conversation history.
Response: `{ ok: true }`
Scope: `meetings:write`

### POST /api/chat
Stateless single-turn chat across specified meetings.
Body: `{ meetingIds: string[], question: string }`
Response: `ChatResult`, `502` on LLM error, `503` if LLM missing
Scope: `search:execute`

### POST /api/chat/conversation
Multi-turn chat across specified meetings with explicit message history.
Body:
```json
{
  "meetingIds": ["m1"],
  "messages": [{ "role": "user", "content": "..." }],
  "attachments": [],
  "includeTranscripts": false,
  "template": "...",
  "contextMode": "full"
}
```
`contextMode` is `"full"` or `"distilled"`.
Response: `ChatResult`, `502` / `503` as above
Scope: `search:execute`

---

## Transcripts, lineage, split

### GET /api/meetings/:id/transcript
Return the raw transcript body.
Response: `{ transcript: string }` or `404`
Scope: `meetings:read`

### GET /api/meetings/:id/lineage
Split-meeting lineage: the meeting's source and children.
Response: `{ source, children, segment_index }`
Scope: `meetings:read`

### POST /api/meetings/:id/split
Split one meeting into N segments by duration (minutes); re-embeds segments if vector DB and LLM are available.
Body: `{ durations: number[] }`
Response: `SplitResult`, `404` if meeting missing, `400` on invalid input
Scope: `meetings:write`

---

## Threads

Threads are durable groupings of related meetings, with their own chat surface.

### GET /api/threads
List threads for a client.
Query: `client` (required; empty returns `[]`)
Response: `Thread[]`
Scope: `threads:read`

### POST /api/threads
Create a thread.
Body: `CreateThreadRequest` (includes `client_name`)
Response: `201 Thread`
Scope: `threads:write`

### PUT /api/threads/:id
Update a thread (title, description, status).
Body: `UpdateThreadRequest`
Response: `Thread`, `500` on error
Scope: `threads:write`

### DELETE /api/threads/:id
Delete a thread.
Response: `{ ok: true }`
Scope: `threads:write`

### GET /api/threads/:id/meetings
List meetings attached to a thread.
Scope: `threads:read`

### GET /api/threads/:id/candidates
Discover candidate meetings via vector search (requires searchDeps).
Response: `ThreadCandidatesResult`, `503` if search unavailable
Scope: `threads:read`

### POST /api/threads/:id/evaluate
Ask the LLM to score candidate meetings for membership.
Body: `{ meetingIds: string[], overrideExisting?: boolean }`
Response: `EvaluateResult`, `503` if LLM missing
Scope: `threads:write`

### POST /api/threads/:threadId/meetings
Attach a meeting to a thread with a precomputed summary/score.
Body: `{ meetingId: string, summary: string, score: number }`
Response: `{ ok: true }`
Scope: `threads:write`

### DELETE /api/threads/:threadId/meetings/:meetingId
Detach a meeting from a thread.
Response: `{ ok: true }`
Scope: `threads:write`

### POST /api/threads/:id/regenerate-summary
Regenerate the thread's rollup summary (requires LLM).
Body: `{ meetingIds?: string[] }`
Response: `RegenerateResult`, `503` if LLM missing
Scope: `threads:write`

### GET /api/threads/:id/messages
Thread conversation history.
Scope: `threads:read`

### POST /api/threads/:id/chat
Chat grounded on a thread (requires LLM + searchDeps).
Body: `{ message: string, includeTranscripts?: boolean, attachments?: [...] }`
Response: `ChatResult`, `503` if LLM or search unavailable
Scope: `threads:write`

### DELETE /api/threads/:id/messages
Clear thread conversation history.
Scope: `threads:write`

### GET /api/meetings/:id/threads
List threads that contain the given meeting.
Scope: `meetings:read`

---

## Insights

Insights are LLM-generated cross-meeting write-ups for a client.

### GET /api/insights
List insights for a client.
Query: `client` (required)
Scope: `insights:read`

### POST /api/insights
Create an insight.
Body: `CreateInsightRequest` (includes `client_name`)
Response: `201 Insight`
Scope: `insights:write`

### PUT /api/insights/:id
Update an insight.
Body: `UpdateInsightRequest`
Scope: `insights:write`

### DELETE /api/insights/:id
Delete an insight.
Response: `{ ok: true }`
Scope: `insights:write`

### GET /api/insights/:id/meetings
Meetings linked to the insight.
Scope: `insights:read`

### POST /api/insights/:id/discover-meetings
Discover candidate meetings for the insight (no LLM).
Response: `{ meetingIds: string[] }`
Scope: `insights:write`

### POST /api/insights/:id/generate
Regenerate the insight body (requires LLM).
Body: `{ meetingIds?: string[] }`
Response: `GenerateInsightResult`, `500` on failure, `503` if LLM missing
Scope: `insights:write`

### DELETE /api/insights/:id/meetings/:meetingId
Detach a meeting from an insight.
Response: `{ ok: true }`
Scope: `insights:write`

### GET /api/insights/:id/messages
Insight conversation history.
Scope: `insights:read`

### POST /api/insights/:id/chat
Chat grounded on an insight (requires LLM + searchDeps).
Body: `{ message: string, includeTranscripts?: boolean, attachments?: [...] }`
Response: `ChatResult`, `503` if LLM or search unavailable
Scope: `insights:write`

### DELETE /api/insights/:id/messages
Clear insight conversation history.
Scope: `insights:write`

---

## Milestones

Milestones are tracked commitments with target dates, mention confirmations, and linked action items.

### GET /api/milestones
List milestones for a client.
Query: `client` (required)
Scope: `milestones:read`

### POST /api/milestones
Create a milestone.
Body: `{ clientName, title, description, targetDate }`
Response: `201 Milestone`
Scope: `milestones:write`

### POST /api/milestones/merge
Merge `sourceId` into `targetId` (source is removed).
Body: `{ sourceId: string, targetId: string }`
Response: `{ ok: true }`
Scope: `milestones:write`

### PUT /api/milestones/:id
Update milestone fields.
Body: `UpdateMilestoneRequest`
Scope: `milestones:write`

### DELETE /api/milestones/:id
Delete a milestone.
Response: `{ ok: true }`
Scope: `milestones:write`

### GET /api/milestones/:id/mentions
All meeting mentions of this milestone (confirmed and candidate).
Scope: `milestones:read`

### GET /api/milestones/:id/slippage
Date-slippage history.
Scope: `milestones:read`

### POST /api/milestones/:id/confirm-mention
Confirm that a specific meeting mentions this milestone.
Body: `{ meetingId: string }`
Response: `{ ok: true }`
Scope: `milestones:write`

### POST /api/milestones/:id/reject-mention
Reject a candidate mention.
Body: `{ meetingId: string }`
Response: `{ ok: true }`
Scope: `milestones:write`

### POST /api/milestones/:id/link-action-item
Link an action item (identified by `meetingId` + `itemIndex`) to this milestone.
Body: `{ meetingId: string, itemIndex: number }`
Response: `{ ok: true }`
Scope: `milestones:write`

### DELETE /api/milestones/:id/link-action-item
Unlink an action item.
Body: `{ meetingId: string, itemIndex: number }`
Response: `{ ok: true }`
Scope: `milestones:write`

### GET /api/milestones/:id/action-items
Action items linked to the milestone.
Scope: `milestones:read`

### GET /api/milestones/:id/messages
Milestone conversation history.
Scope: `milestones:read`

### POST /api/milestones/:id/chat
Chat grounded on a milestone (requires LLM + searchDeps).
Body: `{ message: string, includeTranscripts?: boolean, attachments?: [...] }`
Response: `ChatResult`, `503` if LLM or search unavailable
Scope: `milestones:write`

### DELETE /api/milestones/:id/messages
Clear milestone conversation history.
Scope: `milestones:write`

### GET /api/meetings/:id/milestones
Milestones referenced by a given meeting.
Scope: `meetings:read`

---

## Notes

Notes are freeform attachments on any object. `objectType` is one of `meeting`, `insight`, `milestone`, `thread`.

### GET /api/notes/:objectType/:objectId
List notes for the object.
Errors: `400 { error: "Invalid object type" }`
Scope: `notes:read`

### POST /api/notes/:objectType/:objectId
Create a note.
Body: `{ title?: string, body: string, noteType?: string }`
Errors: `400` for missing body or invalid object type
Response: `201 Note`
Scope: `notes:write`

### GET /api/notes/:objectType/:objectId/count
Number of notes attached to the object.
Response: `{ count: number }`
Scope: `notes:read`

### PATCH /api/notes/:id
Edit a user note. Returns `403` if the note's `noteType !== "user"`; `404` if missing.
Body: `{ title?: string | null, body?: string }`
Response: `Note`
Scope: `notes:write`

### DELETE /api/notes/:id
Delete a user note. Non-user notes return `403`.
Response: `{ ok: true }`
Scope: `notes:write`

---

## Search

### GET /api/search
Hybrid semantic + metadata meeting search.
Query: `q` (required, min length 2), `client?`, `limit?`, `date_after?`, `date_before?`, `searchFields?` (comma-separated list)
Errors: `400` if `q` too short; `503` if search unavailable
Response: `SearchResult[]`
Scope: `search:execute`

### POST /api/deep-search
LLM-orchestrated iterative search (requires LLM).
Body: `DeepSearchRequest`
Response: `DeepSearchResult`, `502` on LLM error, `503` if LLM missing
Scope: `search:execute`

---

## Templates

### GET /api/templates
Built-in chat/prompt templates.
Response: `Template[]`
Scope: `meetings:read`

---

## Health and debug

### GET /api/health
System health snapshot (DB status, outstanding errors, etc.).
Response: `HealthStatus`

### POST /api/health/acknowledge
Acknowledge system errors. With no `errorIds`, acknowledges all.
Body: `{ errorIds?: string[] }`
Response: `{ ok: true }`

### GET /api/debug
Basic counts: DB path, client count, meeting count, vector row count.
Response: `{ db_path, client_count, meeting_count, vector_count }`
Scope: `admin`

### POST /api/re-embed
Re-embed every meeting into the vector DB (requires searchDeps).
Response: `ReEmbedResult`, `503` if search unavailable
Scope: `admin`

### POST /api/meetings/:id/re-embed
Re-embed a single meeting's vector.
Response: `{}` on success, `404` if meeting missing, `503` if search unavailable
Scope: `meetings:write`

---

## OAuth 2.1

OAuth routes are only registered when the server is started with OAuth deps (RSA key pair). They implement OAuth 2.1 with PKCE.

### POST /oauth/token
Grant types:
- `client_credentials` -- body: `{ grant_type, client_id, client_secret, scope? }`
- `authorization_code` -- body: `{ grant_type, code, redirect_uri, client_id, code_verifier }`
- `refresh_token` -- body: `{ grant_type, refresh_token, client_id }`

Response: `{ access_token, refresh_token?, token_type: "Bearer", expires_in, scope }`
Errors: `400 { error: "unsupported_grant_type" | "invalid_scope" | "invalid_grant" }`, `401 { error: "invalid_client" }`

### GET /oauth/authorize
Returns an HTML consent form. Query: `client_id`, `redirect_uri`, `scope`, `code_challenge`, `code_challenge_method` (`S256`), `state`.

### POST /oauth/authorize
Complete the consent flow. Body mirrors the GET query plus `owner_secret`. Redirects `302` to `redirect_uri?code=...&state=...` on success; otherwise `400`/`401`.

### POST /oauth/register
Dynamic client registration. Requires `Authorization: Bearer <MTNINSIGHTS_OWNER_SECRET>`.
Body: `{ client_name, grant_types, scope, redirect_uris? }`
Response: `201 { client_id, client_name, client_secret?, redirect_uris, grant_types, scope }`
Errors: `401 { error: "unauthorized" }`, `400 { error: "invalid_scope" }`

### POST /oauth/revoke
Revoke an access or refresh token (RFC 7009 -- always returns `200 {}`).
Body: `{ token: string }`

### GET /oauth/jwks
Public keys for access-token verification.
Response: `{ keys: [JWK] }`

### GET /.well-known/oauth-authorization-server
Server metadata document (RFC 8414). Advertises supported scopes, grants, PKCE methods, and endpoint URIs.

---

## Auth scopes reference

When `MTNINSIGHTS_AUTH_ENABLED=1`, each request is matched against the first rule in `core/auth/scopes.ts` that its method and path satisfy.

| Method(s)                   | Path prefix                 | Required scope      |
|-----------------------------|-----------------------------|---------------------|
| GET, DELETE                 | `/api/meetings/*/messages`  | `meetings:write`    |
| GET                         | `/api/debug`                | `admin`             |
| POST                        | `/api/re-embed`             | `admin`             |
| GET                         | `/api/clients`              | `meetings:read`     |
| GET                         | `/api/default-client`       | `meetings:read`     |
| GET                         | `/api/templates`            | `meetings:read`     |
| GET                         | `/api/meetings`             | `meetings:read`     |
| POST, PUT, PATCH, DELETE    | `/api/meetings`             | `meetings:write`    |
| GET, POST                   | `/api/chat`                 | `search:execute`    |
| GET                         | `/api/search`               | `search:execute`    |
| POST                        | `/api/deep-search`          | `search:execute`    |
| GET                         | `/api/threads`              | `threads:read`      |
| POST, PUT, DELETE           | `/api/threads`              | `threads:write`     |
| GET                         | `/api/insights`             | `insights:read`     |
| POST, PUT, DELETE           | `/api/insights`             | `insights:write`    |
| GET                         | `/api/milestones`           | `milestones:read`   |
| POST, PUT, DELETE           | `/api/milestones`           | `milestones:write`  |
| GET                         | `/api/notes`                | `notes:read`        |
| POST, PATCH, DELETE         | `/api/notes`                | `notes:write`       |

Routes not matched by any rule (for example `/api/health`, `/oauth/*`, `/.well-known/*`) bypass the scope check. OAuth routes enforce their own credentials (client id/secret, owner secret, PKCE).

Valid scope values: `meetings:read`, `meetings:write`, `search:execute`, `threads:read`, `threads:write`, `insights:read`, `insights:write`, `milestones:read`, `milestones:write`, `notes:read`, `notes:write`, `admin`.

---

## Architecture

`createApp(db, dbPath, llm?, searchDeps?)` is a pure function that constructs the Hono app without starting a listener, which makes the app independently testable. `main.ts` handles all side-effectful startup: loading environment, initializing SQLite, connecting LanceDB, loading the ONNX model, and starting `@hono/node-server`.

Every route file exports a single `registerXxxRoutes` function with the same signature pattern. Routes delegate directly to handler functions imported from `electron-ui/electron/ipc-handlers.ts` or `core/` modules. The HTTP API and Electron IPC share identical business logic with zero duplication.

### Adding a new route

1. **Create the route file** in `api/routes/` (for example `widgets.ts`). Export a `registerWidgetRoutes(app, db, llm?, searchDeps?)` function.
2. **Implement the handler** in `core/` or `electron-ui/electron/ipc-handlers.ts`. The route should only parse HTTP parameters and delegate.
3. **Register in `server.ts`** -- import and call the register function inside `createApp()`.
4. **Guard optional deps** -- if the route needs `llm` or `searchDeps`, return `503` when they are absent (for example `if (!llm) return c.json({ error: "LLM not available" }, 503);`).
5. **Update `api/routes/llm-context.md`** with the new file and its endpoint list.
