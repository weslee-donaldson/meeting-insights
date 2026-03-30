# api/ — Hono HTTP server exposing the full feature set over REST

This layer wraps the same IPC handlers used by the Electron main process and exposes them as HTTP endpoints, enabling the `web:dev` browser workflow and any external tooling that wants to talk to the backend without Electron. `server.ts` is a pure function that constructs the Hono app; `main.ts` handles all side-effectful startup concerns.

## Files

| File | Purpose |
|------|---------|
| `server.ts` | Exports `createApp(db, dbPath, llm?, searchDeps?, assetsDir?, authConfig?)` — instantiates Hono, attaches CORS and request-logging middleware, attaches the auth middleware (`createAuthMiddleware` from `middleware/auth.ts`), then delegates to all route registrars including `registerOAuthRoutes`. Returns the app without starting a listener; this makes it independently testable. Also re-exports `AuthConfig` and `SearchDeps` interfaces. |
| `main.ts` | Entry point when run directly. Loads `.env.local`, configures log level and log directory from environment variables, initialises SQLite (`createDb` + `migrate`), populates the FTS index if empty, constructs an `LlmAdapter` based on `MTNINSIGHTS_LLM_PROVIDER`, attempts to connect LanceDB and load the ONNX model for vector search (degrades gracefully on failure). When `MTNINSIGHTS_AUTH_ENABLED=1`, loads or creates RSA signing keys from `.keys/` via `loadOrCreateKeys` and constructs an `AuthConfig`. Then calls `createApp` and starts `@hono/node-server` on `PORT` (default 3000). |
| `middleware/auth.ts` | Exports `AuthConfig` interface (`{ publicKey, privateKey, enabled }`) and `createAuthMiddleware(db, authConfig?)`. When auth is enabled, validates Bearer tokens (API keys via `mki_` prefix, JWTs otherwise), checks token revocation, extracts `AuthIdentity`, and enforces route-level scope requirements. OAuth endpoints are bypassed. |

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
| `MTNINSIGHTS_AUTH_ENABLED` | — | Set to `1` to enable JWT/API-key auth |
| `MTNINSIGHTS_OWNER_SECRET` | — | Shared secret for `/oauth/register` and `/oauth/authorize` endpoints |

**Client resolution:** all routes that accept a `?client=` query parameter resolve it by name or UUID via `resolveClient` from `core/resolve-client.ts`, enabling callers to pass either the client name or its UUID primary key.

**Degraded mode:** if the ONNX model files are absent or LanceDB fails to connect, the server starts without `searchDeps`. All search and re-embed endpoints return `503` rather than crashing.

## Related

- Parent: [Root gather](../gather.md)
- Gather view: [gather.md](gather.md)
- Route handlers in `electron-ui/electron/ipc-handlers.ts`
- Core logic in `core/`
