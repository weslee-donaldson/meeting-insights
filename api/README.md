# api/ — Hono HTTP server exposing the full feature set over REST

This layer wraps the same IPC handlers used by the Electron main process and exposes them as HTTP endpoints, enabling the `web:dev` browser workflow and any external tooling that wants to talk to the backend without Electron. `server.ts` is a pure function that constructs the Hono app; `main.ts` handles all side-effectful startup concerns.

## Files

| File | Purpose |
|------|---------|
| `server.ts` | Exports `createApp(db, dbPath, llm?, searchDeps?)` — instantiates Hono, attaches CORS and request-logging middleware, then delegates to all six `registerXxxRoutes` functions. Returns the app without starting a listener; this makes it independently testable. Also exports the `SearchDeps` interface (`{ vdb: VectorDb; session: InferenceSession & { _tokenizer: unknown } }`). |
| `main.ts` | Entry point when run directly. Loads `.env.local`, configures log level and log directory from environment variables, initialises SQLite (`createDb` + `migrate`), populates the FTS index if empty, constructs an `LlmAdapter` based on `MTNINSIGHTS_LLM_PROVIDER` (anthropic / openai / local / stub), attempts to connect LanceDB and load the ONNX model for vector search (degrades gracefully on failure), then calls `createApp` and starts `@hono/node-server` on `PORT` (default 3000). |

## Key Concepts

**Environment variables** consumed by `main.ts`:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP listen port |
| `MTNINSIGHTS_APP_ROOT` | `cwd()` | Base path for DB, vectors, and logs |
| `MTNINSIGHTS_DB_PATH` | `$APP_ROOT/db/mtninsights.db` | SQLite file |
| `MTNINSIGHTS_VECTOR_PATH` | `$APP_ROOT/db/lancedb` | LanceDB directory |
| `MTNINSIGHTS_LLM_PROVIDER` | `anthropic` | `anthropic` / `openai` / `local` / `stub` |
| `ANTHROPIC_API_KEY` | — | Required when provider is `anthropic` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | — | Required when provider is `openai` |
| `MTNINSIGHTS_LOCAL_BASE_URL` / `MTNINSIGHTS_LOCAL_MODEL` | `http://localhost:11434` / `llama3.1:8b` | Ollama endpoint |
| `MTNINSIGHTS_LOG_LEVEL` | `info` | `error` / `warn` / `info` / `debug` |

**Degraded mode:** if the ONNX model files are absent or LanceDB fails to connect, the server starts without `searchDeps`. All search and re-embed endpoints return `503` rather than crashing.

## Subdirectories

| Dir | Summary | README |
|-----|---------|--------|
| `routes/` | Domain-scoped Hono route registration modules | [README](routes/README.md) |

## Related

- Parent: [Root README](../README.md)
- Route handlers in `electron-ui/electron/ipc-handlers.ts`
- Core logic in `core/`
