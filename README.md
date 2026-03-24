# krisp-meeting-insights

Transforms Krisp meeting transcripts into a searchable knowledge fabric. Transcripts are parsed, structured artifacts are extracted via LLM, and content is embedded with a local ONNX model. The resulting data is queryable through a desktop Electron app, a standalone web UI, or a REST API — supporting semantic search, multi-turn chat, action item tracking, threads, executive insights, and milestone timelines.

For setup instructions, model download, and environment variables, see [SETUP.md](SETUP.md).

---

## Architecture

```
Transcript files (data/raw-transcripts/)
  │
  ▼  pnpm process (cli/run.ts)
core/parser.ts ──► core/ingest.ts ──► SQLite (db/mtninsights.db)
                        │
                        ▼
              core/extractor.ts ──► Claude API ──► artifacts (SQLite)
              core/embedder.ts  ──► ONNX model ──► vectors (LanceDB)
                        │
                        ▼
         ┌──────────────┴──────────────────┐
         │                                 │
  Electron IPC                        HTTP REST API
  electron-ui/electron/               api/routes/
  ipc-handlers.ts                     (mirrors IPC)
         │                                 │
         └──────────────┬──────────────────┘
                        │  window.api interface
                        ▼
             electron-ui/ui/src/
             React UI (pages/, components/)
```

**Two runtime modes** share the same React UI:
- **Electron** (`pnpm ui:dev`): `window.api` is populated by the IPC preload bridge
- **Web** (`pnpm web:dev`): `window.api` is populated by the HTTP API client

---

## Directory Map

```
krisp-meeting-insights/
├── api/              HTTP REST API (Hono) — mirrors IPC handlers
│   └── routes/       Domain route handlers (one file per feature)
├── core/             Pure business logic — no UI, no IPC dependencies
├── cli/              Command-line tools for setup, processing, querying
├── electron-ui/      Desktop app + browser dual-mode UI
│   ├── electron/     Electron main process, IPC handlers, preload
│   │   ├── handlers/ Domain-grouped handler modules
│   │   ├── main/     App lifecycle and window creation
│   │   └── preload/  Context bridge (window.api in Electron mode)
│   └── ui/           React frontend (shared by Electron and web)
│       └── src/
│           ├── components/   UI components (layout, views, dialogs)
│           │   └── ui/       Radix/shadcn primitives
│           ├── hooks/        React state and query hooks
│           ├── pages/        Feature page views (one per nav section)
│           ├── api-client/   HTTP client (window.api in web mode)
│           └── lib/          Utilities (cn, merge-artifacts)
├── test/             Vitest unit and integration tests
│   ├── ui/           React component tests (jsdom)
│   └── e2e/          Playwright end-to-end tests
├── config/           LLM prompt templates, client registry, system config
│   └── prompts/      Prompt templates (extraction, insight, search, threads)
├── docs/             Operational guides
├── scripts/          Developer utilities (LLM health check, server restart)
├── data/             Runtime data directories (gitignored except structure)
│   ├── raw-transcripts/   Drop Krisp exports here
│   ├── processed/         Moved here after successful processing
│   ├── failed-processing/ Moved here on pipeline failure
│   └── audit/             Processing run logs
├── db/               SQLite + LanceDB (gitignored)
└── models/           ONNX embedding model (gitignored)
```

---

## Directory READMEs

| Directory | Purpose | README |
|-----------|---------|--------|
| `api/` | HTTP REST API server | [api/README.md](api/README.md) |
| `api/routes/` | Domain route handlers | [api/routes/README.md](api/routes/README.md) |
| `core/` | Business logic | [core/README.md](core/README.md) |
| `cli/` | Command-line tools | [cli/README.md](cli/README.md) |
| `electron-ui/` | Desktop + web app | [electron-ui/README.md](electron-ui/README.md) |
| `electron-ui/electron/` | Main process + IPC | [electron-ui/electron/README.md](electron-ui/electron/README.md) |
| `electron-ui/electron/handlers/` | Domain IPC handlers | [electron-ui/electron/handlers/README.md](electron-ui/electron/handlers/README.md) |
| `electron-ui/electron/main/` | App lifecycle | [electron-ui/electron/main/README.md](electron-ui/electron/main/README.md) |
| `electron-ui/electron/preload/` | Context bridge | [electron-ui/electron/preload/README.md](electron-ui/electron/preload/README.md) |
| `electron-ui/ui/src/` | React source root | [electron-ui/ui/src/README.md](electron-ui/ui/src/README.md) |
| `electron-ui/ui/src/components/` | UI components | [electron-ui/ui/src/components/README.md](electron-ui/ui/src/components/README.md) |
| `electron-ui/ui/src/components/ui/` | Radix/shadcn primitives | [electron-ui/ui/src/components/ui/README.md](electron-ui/ui/src/components/ui/README.md) |
| `electron-ui/ui/src/hooks/` | React hooks | [electron-ui/ui/src/hooks/README.md](electron-ui/ui/src/hooks/README.md) |
| `electron-ui/ui/src/pages/` | Feature pages | [electron-ui/ui/src/pages/README.md](electron-ui/ui/src/pages/README.md) |
| `electron-ui/ui/src/api-client/` | HTTP API client | [electron-ui/ui/src/api-client/README.md](electron-ui/ui/src/api-client/README.md) |
| `electron-ui/ui/src/lib/` | Utilities | [electron-ui/ui/src/lib/README.md](electron-ui/ui/src/lib/README.md) |
| `test/` | Test suite | [test/README.md](test/README.md) |
| `test/ui/` | Component tests | [test/ui/README.md](test/ui/README.md) |
| `test/e2e/` | End-to-end tests | [test/e2e/README.md](test/e2e/README.md) |
| `config/` | System config + client registry | [config/README.md](config/README.md) |
| `config/prompts/` | LLM prompt templates | [config/prompts/README.md](config/prompts/README.md) |
| `scripts/` | Developer utilities | [scripts/README.md](scripts/README.md) |
| `docs/` | Operational documentation | [docs/README.md](docs/README.md) |

---

## Key Design Decisions

**`core/` has no upstream dependencies.** It never imports from `electron-ui/` or `api/`. IPC handlers and HTTP routes both import from `core/`, not the other way around. This keeps the business logic independently testable.

**`window.api` is the seam between UI and transport.** In Electron, it is populated by the IPC preload bridge. In web mode, it is populated by the HTTP API client. React components never import from either — they only call `window.api.*`.

**Stub LLM adapter enables fast, deterministic tests.** Setting `MTNINSIGHTS_LLM_PROVIDER=stub` replaces all LLM calls with fixtures keyed by prompt type. The full pipeline runs without any API keys or network calls.

**`config/clients.json` defines the client registry.** It is loaded at startup by `seedClients()` and seeded into SQLite. Subsequent runs skip already-seeded clients. The path is overridable via `MTNINSIGHTS_CLIENTS_PATH`.

**Vectors are L2-normalized unit-length.** All embeddings from the ONNX model are L2-normalized after mean pooling. This makes cosine similarity equivalent to dot product, which LanceDB can index efficiently.

---

## Quick Commands

```bash
pnpm install          # install dependencies
pnpm setup            # initialize DB, vector store, seed clients
pnpm process          # ingest transcripts from data/raw-transcripts/
pnpm ui:dev           # launch Electron desktop app
pnpm api:dev          # start HTTP API server (port 3000)
pnpm web:dev          # start web UI (port 5173, requires api:dev)
pnpm test             # run all tests (1248 tests, ~10s)
pnpm test:e2e         # run Playwright end-to-end tests
```

See [SETUP.md](SETUP.md) for prerequisites, model download, and environment variable reference.
See [docs/applications.md](docs/applications.md) for detailed CLI and API documentation.

---

## Webhook Ingestion

Krisp webhook events flow through a multi-stage pipeline: Krisp sends POST events to a Firebase Cloud Function, which saves the raw JSON to Google Drive. Google Drive for Desktop syncs files locally. A background file watcher detects new files and runs them through the processing pipeline automatically.

### Firebase Cloud Function

The `krispWebhook` Cloud Function lives in `google-krisp-webhook/firebase/`. It accepts POST requests from Krisp, authenticates via a bearer token, and writes the raw JSON payload to a Google Drive folder.

**Project:** krisp-meeting-insights (Firebase Blaze plan)

**Secrets** (configured via `firebase functions:secrets:set`):

| Secret | Purpose |
|--------|---------|
| `KRISP_AUTH_TOKEN` | Bearer token Krisp sends with each webhook |
| `DRIVE_FOLDER_ID` | Google Drive folder where payloads are saved |
| `GOOGLE_CLIENT_ID` | OAuth client ID for Drive API access |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_REFRESH_TOKEN` | Long-lived OAuth refresh token |

**Deploy:**

```bash
cd google-krisp-webhook/firebase && firebase deploy --only functions
```

### Google Drive Sync

Webhook JSON files land in the configured Google Drive folder. Google Drive for Desktop syncs them to your local machine. Configure Drive sync so the folder maps to `data/webhook-rawtranscripts/` in this project (or symlink the synced directory there).

### Local Background Service

A pm2-managed Node.js process watches `data/webhook-rawtranscripts/` for new JSON files and processes them through the full pipeline (parse, ingest, detect client, extract artifacts, embed). Processed files move to `data/webhook-processed/`; failures move to `data/webhook-failed/`.

```bash
pnpm service:start    # start the file watcher via pm2
pnpm service:stop     # stop the watcher
pnpm service:logs     # tail watcher logs
pnpm service:status   # check if the watcher is running
```

The watcher uses `fs.watch` with a 30-second periodic scan fallback (macOS + Google Drive sync can miss `fs.watch` events). File writes are debounced to avoid processing partially-synced files.

### Manual Processing

`pnpm process` still works for batch processing. It processes webhook files first (from `data/webhook-rawtranscripts/`), then raw transcripts (from `data/raw-transcripts/`). Meeting IDs from webhook processing feed into the dedup set, so a meeting ingested via webhook will not be re-processed from a raw transcript.

### Troubleshooting

- **Files not being processed:** Check `pnpm service:logs` for errors. Verify the watcher is running with `pnpm service:status`.
- **Drive sync not working:** Check that Google Drive for Desktop is running and the sync folder maps to `data/webhook-rawtranscripts/`.
- **OAuth token expired:** Re-run `node google-krisp-webhook/firebase/get-refresh-token.js` and update the `GOOGLE_REFRESH_TOKEN` secret via `firebase functions:secrets:set GOOGLE_REFRESH_TOKEN`.
