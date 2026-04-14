# api/ -- Hono HTTP Server

Hono-based HTTP server that mirrors every Electron IPC channel as a REST endpoint, enabling the browser-based `web:dev` workflow and external integrations without requiring the Electron shell. Routes are thin wrappers that parse HTTP parameters and delegate immediately to the same handler functions used by Electron IPC, so business logic is never duplicated.

## Quick Start

```bash
pnpm api:dev
```

The server listens on `http://localhost:3000` by default. Configuration is via environment variables (or `.env.local`):

| Variable | Default | Purpose |
|---|---|---|
| `API_PORT` | `3000` | HTTP listen port |
| `MTNINSIGHTS_APP_ROOT` | `cwd()` | Base path for DB, vectors, models, and logs |
| `MTNINSIGHTS_DB_PATH` | `$APP_ROOT/db/mtninsights.db` | SQLite file |
| `MTNINSIGHTS_VECTOR_PATH` | `$APP_ROOT/db/lancedb` | LanceDB directory |
| `MTNINSIGHTS_LLM_PROVIDER` | `anthropic` | `anthropic` / `openai` / `local` / `stub` / `claudecli` / `local-claudeapi` |
| `ANTHROPIC_API_KEY` | -- | Required when provider is `anthropic` |
| `ANTHROPIC_MODEL` | -- | Optional model override for Anthropic |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | -- | Required when provider is `openai` |
| `MTNINSIGHTS_LOCAL_BASE_URL` | `http://localhost:11434` | Ollama endpoint (provider `local`) |
| `MTNINSIGHTS_LOCAL_MODEL` | `llama3.1:8b` | Ollama model name |
| `MTNINSIGHTS_CLAUDEAPI_URL` | `http://localhost:8100` | Local Claude API proxy (provider `local-claudeapi`) |
| `MTNINSIGHTS_LOG_LEVEL` | `info` | `error` / `warn` / `info` / `debug` |

## Route Index

### Meetings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/clients` | List all clients |
| GET | `/api/default-client` | Get the default client |
| GET | `/api/meetings` | List meetings (query: `client`, `after`, `before`) |
| GET | `/api/meetings/:id` | Get a single meeting |
| POST | `/api/meetings` | Create a meeting (requires LLM) |
| DELETE | `/api/meetings` | Bulk-delete meetings by ID array |
| GET | `/api/meetings/:id/artifact` | Get extracted artifact for a meeting |
| PATCH | `/api/meetings/:id/artifact` | Update a single artifact section field |
| POST | `/api/artifacts/batch` | Get artifacts for multiple meetings |
| POST | `/api/meetings/:id/re-extract` | Re-run LLM extraction (requires LLM) |
| POST | `/api/meetings/:id/client` | Reassign meeting to a different client |
| POST | `/api/meetings/:id/ignored` | Set meeting ignored flag |
| PATCH | `/api/meetings/:id/title` | Rename a meeting |
| GET | `/api/meetings/:id/transcript` | Get raw transcript text |
| PUT | `/api/meetings/:id/action-items/:index` | Edit an action item |
| POST | `/api/meetings/:id/action-items` | Create a new action item |
| POST | `/api/meetings/:id/action-items/:index/complete` | Mark action item complete |
| DELETE | `/api/meetings/:id/action-items/:index/complete` | Unmark action item completion |
| GET | `/api/meetings/:id/completions` | Get completion records for a meeting |
| GET | `/api/items/:canonicalId/history` | Get cross-meeting history for an action item |
| GET | `/api/meetings/:id/mention-stats` | Get mention statistics |
| GET | `/api/clients/:name/action-items` | Get action items for a client (query: `after`, `before`) |
| GET | `/api/templates` | List available prompt templates |
| GET | `/api/meetings/:id/assets` | List assets attached to a meeting |
| POST | `/api/meetings/:id/assets` | Upload an asset (base64) |
| DELETE | `/api/assets/:id` | Delete an asset |
| GET | `/api/assets/:id/data` | Get asset data |
| GET | `/api/meetings/:id/messages` | List meeting chat messages |
| POST | `/api/meetings/:id/chat` | Send a chat message about a meeting (requires LLM) |
| DELETE | `/api/meetings/:id/messages` | Clear meeting chat history |

### Search and Chat

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | One-shot LLM chat over selected meetings (requires LLM) |
| POST | `/api/chat/conversation` | Multi-turn conversation chat (requires LLM) |
| POST | `/api/deep-search` | LLM-powered deep search (requires LLM) |
| GET | `/api/search` | Hybrid vector + FTS search (query: `q`, `client`, `limit`, `date_after`, `date_before`, `searchFields`) (requires search deps) |
| POST | `/api/re-embed` | Re-embed all meetings (requires search deps) |
| POST | `/api/meetings/:id/re-embed` | Re-embed a single meeting (requires search deps) |

### Threads

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/threads` | List threads (query: `client`) |
| POST | `/api/threads` | Create a thread |
| PUT | `/api/threads/:id` | Update a thread |
| DELETE | `/api/threads/:id` | Delete a thread |
| GET | `/api/threads/:id/meetings` | List meetings in a thread |
| POST | `/api/threads/:threadId/meetings` | Add a meeting to a thread |
| DELETE | `/api/threads/:threadId/meetings/:meetingId` | Remove a meeting from a thread |
| GET | `/api/threads/:id/candidates` | Get candidate meetings for a thread (requires search deps) |
| POST | `/api/threads/:id/evaluate` | Evaluate candidate meetings with LLM (requires LLM) |
| POST | `/api/threads/:id/regenerate-summary` | Regenerate thread summary (requires LLM) |
| GET | `/api/threads/:id/messages` | List thread chat messages |
| POST | `/api/threads/:id/chat` | Send a chat message in thread context (requires LLM + search deps) |
| DELETE | `/api/threads/:id/messages` | Clear thread chat history |
| GET | `/api/meetings/:id/threads` | List threads that include a meeting |

### Insights

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/insights` | List insights (query: `client`) |
| POST | `/api/insights` | Create an insight |
| PUT | `/api/insights/:id` | Update an insight |
| DELETE | `/api/insights/:id` | Delete an insight |
| GET | `/api/insights/:id/meetings` | List meetings linked to an insight |
| POST | `/api/insights/:id/discover-meetings` | Auto-discover related meetings |
| DELETE | `/api/insights/:id/meetings/:meetingId` | Remove a meeting from an insight |
| POST | `/api/insights/:id/generate` | Generate insight content from linked meetings (requires LLM) |
| GET | `/api/insights/:id/messages` | List insight chat messages |
| POST | `/api/insights/:id/chat` | Send a chat message in insight context (requires LLM + search deps) |
| DELETE | `/api/insights/:id/messages` | Clear insight chat history |

### Milestones

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/milestones` | List milestones (query: `client`) |
| POST | `/api/milestones` | Create a milestone |
| POST | `/api/milestones/merge` | Merge two milestones |
| PUT | `/api/milestones/:id` | Update a milestone |
| DELETE | `/api/milestones/:id` | Delete a milestone |
| GET | `/api/milestones/:id/mentions` | List meeting mentions of a milestone |
| GET | `/api/milestones/:id/slippage` | Get date slippage history |
| POST | `/api/milestones/:id/confirm-mention` | Confirm a milestone mention |
| POST | `/api/milestones/:id/reject-mention` | Reject a milestone mention |
| POST | `/api/milestones/:id/link-action-item` | Link an action item to a milestone |
| DELETE | `/api/milestones/:id/link-action-item` | Unlink an action item from a milestone |
| GET | `/api/milestones/:id/action-items` | List action items linked to a milestone |
| GET | `/api/milestones/:id/messages` | List milestone chat messages |
| POST | `/api/milestones/:id/chat` | Send a chat message in milestone context (requires LLM + search deps) |
| DELETE | `/api/milestones/:id/messages` | Clear milestone chat history |
| GET | `/api/meetings/:id/milestones` | List milestones referenced in a meeting |

### Notes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes/:objectType/:objectId` | List notes for an object (meeting, insight, milestone, thread) |
| POST | `/api/notes/:objectType/:objectId` | Create a note |
| GET | `/api/notes/:objectType/:objectId/count` | Get note count for an object |
| PATCH | `/api/notes/:id` | Update a user-created note |
| DELETE | `/api/notes/:id` | Delete a user-created note |

### Debug

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/debug` | DB path, client count, meeting count, vector count |

## Error Conventions

All error responses return JSON with an `error` field:

```json
{ "error": "Description of the problem" }
```

Status codes follow standard HTTP semantics with two domain-specific patterns:

| Code | Meaning |
|------|---------|
| 400 | Bad request (invalid input, query too short, invalid object type) |
| 403 | Forbidden (attempt to modify/delete non-user notes) |
| 404 | Resource not found |
| 502 | Upstream LLM call failed |
| 503 | **Degraded mode** -- the required dependency (LLM adapter or search deps) is not available |

The `503` response is the primary indicator of degraded mode. When ONNX model files are missing or LanceDB fails to connect, the server starts without `searchDeps`, and all search/embed/chat endpoints that require vector search return `503`. Similarly, if no LLM provider is configured, LLM-dependent endpoints return `503`. Non-dependent endpoints continue to function normally.

## Architecture

```
main.ts           -- entry point: env vars, DB init, LLM + search dep loading
server.ts         -- createApp(): Hono instance + CORS + logging middleware
routes/
  meetings.ts     -- registerMeetingRoutes()
  search.ts       -- registerSearchRoutes()
  threads.ts      -- registerThreadRoutes()
  insights.ts     -- registerInsightRoutes()
  milestones.ts   -- registerMilestoneRoutes()
  notes.ts        -- registerNoteRoutes()
  debug.ts        -- registerDebugRoutes()
```

`createApp(db, dbPath, llm?, searchDeps?)` is a pure function that constructs the Hono app without starting a listener. This makes it independently testable. `main.ts` handles all side-effectful startup: loading environment, initializing SQLite, connecting LanceDB, loading the ONNX model, and starting `@hono/node-server`.

Every route file exports a single `registerXxxRoutes` function with the same signature pattern. Routes delegate directly to handler functions imported from `electron-ui/electron/ipc-handlers.ts` or `core/` modules. This means the HTTP API and Electron IPC share identical business logic with zero duplication.

## Adding a New Route

1. **Create the route file** in `api/routes/` following the naming convention (e.g., `widgets.ts`). Export a `registerWidgetRoutes(app, db, llm?, searchDeps?)` function.

2. **Implement the handler** in `core/` or `electron-ui/electron/ipc-handlers.ts`. The route should only parse HTTP parameters and delegate.

3. **Register in `server.ts`** -- import and call your register function inside `createApp()`:
   ```ts
   import { registerWidgetRoutes } from "./routes/widgets.js";
   // inside createApp():
   registerWidgetRoutes(app, db, llm, searchDeps);
   ```

4. **Guard optional deps** -- if your route needs `llm` or `searchDeps`, return `503` when they are absent:
   ```ts
   if (!llm) return c.json({ error: "LLM not available" }, 503);
   ```

5. **Update `routes/llm-context.md`** with the new file and its endpoint list.
