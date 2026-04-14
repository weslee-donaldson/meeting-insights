# routes/ — Hono route registration modules, one file per domain

Each file in this directory exports a single `registerXxxRoutes(app, db, llm?, searchDeps?)` function that mounts all HTTP endpoints for one domain onto the shared Hono app instance. Routes delegate immediately to the matching `ipc-handlers` function, keeping this layer thin. LLM-dependent routes return `503` when the adapter is absent; search-dependent routes return `503` when `searchDeps` is absent.

## Files

| File | Purpose |
|------|---------|
| `debug.ts` | `GET /api/debug` — returns DB path, client count, meeting count, and vector count. |
| `meetings.ts` | Client and meeting CRUD: `GET /api/clients` (returns `{id, name}[]`), `GET /api/clients/list`, `GET /api/clients/:id`, `GET /api/default-client`, `GET/POST /api/meetings`, `GET /api/meetings/:id`, `GET /api/meetings/:id/artifact`, `DELETE /api/meetings`, `POST /api/meetings/:id/re-extract`, `POST /api/meetings/:id/client`, `POST /api/meetings/:id/ignored`, action-item completion endpoints (`POST/DELETE /api/meetings/:id/action-items/:index/complete`), action-item editing (`PUT /api/meetings/:id/action-items/:index`), `GET /api/meetings/:id/completions`, `GET /api/items/:canonicalId/history`, `GET /api/meetings/:id/mention-stats`, `GET /api/clients/:name/action-items`, `GET /api/templates`, `POST /api/meetings/:id/split` (accepts `{durations: number[]}`, calls `splitMeeting` then optionally `reprocessSplitSegments` when llm+vdb are available), `GET /api/meetings/:id/lineage` (returns `{source, children, segment_index}`). Uses `resolveClient` for `?client=` query params (accepts name or UUID). |
| `search.ts` | Semantic and LLM search: `POST /api/chat`, `POST /api/chat/conversation`, `POST /api/re-embed`, `POST /api/meetings/:id/re-embed`, `POST /api/deep-search`, `GET /api/search` (hybrid vector + FTS). |
| `threads.ts` | Thread lifecycle and chat: `GET/POST /api/threads`, `PUT/DELETE /api/threads/:id`, thread–meeting management (`GET/POST/DELETE /api/threads/:id/meetings`, `/api/threads/:threadId/meetings/:meetingId`), `GET /api/threads/:id/candidates`, `POST /api/threads/:id/evaluate`, `POST /api/threads/:id/regenerate-summary`, thread messages (`GET/POST/DELETE /api/threads/:id/messages`), `GET /api/meetings/:id/threads`. Uses `resolveClient` for `?client=` query params. |
| `insights.ts` | Insight lifecycle and chat: `GET/POST /api/insights`, `PUT/DELETE /api/insights/:id`, `GET /api/insights/:id/meetings`, `POST /api/insights/:id/discover-meetings`, `POST /api/insights/:id/generate`, insight messages (`GET/POST/DELETE /api/insights/:id/messages`), `POST /api/insights/:id/chat`, `DELETE /api/insights/:id/meetings/:meetingId`. Uses `resolveClient` for `?client=` query params. |
| `milestones.ts` | Milestone lifecycle and chat: `GET/POST /api/milestones`, `POST /api/milestones/merge`, `PUT/DELETE /api/milestones/:id`, `GET /api/milestones/:id/mentions`, `GET /api/milestones/:id/slippage`, milestone messages (`GET/POST/DELETE /api/milestones/:id/messages`), `POST /api/milestones/:id/chat`, confirm/reject mention endpoints, action-item linking (`POST/DELETE /api/milestones/:id/link-action-item`), `GET /api/milestones/:id/action-items`, `GET /api/meetings/:id/milestones`. Uses `resolveClient` for `?client=` query params. |
| `notes.ts` | Universal annotation CRUD: `GET/POST /api/notes/:objectType/:objectId`, `GET /api/notes/:objectType/:objectId/count`, `PATCH/DELETE /api/notes/:id`. Supports four object types: meeting, insight, milestone, thread. User-created notes are editable; non-user notes are read-only. |
| `health.ts` | System health: `GET /api/health` returns `HealthStatus` (status, error_groups, meetings_without_artifact, last_error_at). No auth required. `POST /api/health/acknowledge` accepts optional `{ errorIds }` to acknowledge specific or all errors with 1-hour cooldown. |

## Key Concepts

All route files share the same signature pattern:

```ts
export function registerXxxRoutes(
  app: Hono,
  db: Database,
  llm?: LlmAdapter,
  searchDeps?: SearchDeps,
): void
```

`SearchDeps` is `{ vdb: VectorDb; session: InferenceSession & { _tokenizer: unknown } }` — the vector database connection and loaded ONNX inference session. Both are optional because the server starts without them when models are unavailable.

## Related

- Parent: [api/README.md](../README.md)
- Route handlers delegate to `electron-ui/electron/ipc-handlers.ts`
- `SearchDeps` type defined in `../server.ts`
