# krisp-meeting-insights

Transforms Krisp meeting transcripts into a searchable knowledge fabric. Transcripts are parsed, structured artifacts are extracted via LLM, and content is embedded with a local ONNX model. The resulting data is queryable through a desktop Electron app, a standalone web UI, or a REST API — supporting semantic search, multi-turn chat, action item tracking, threads, executive insights, and milestone timelines.

For setup instructions, model download, and environment variables, see [SETUP.md](SETUP.md).

---

## Capabilities

- **Semantic Search** — Hybrid search combining vector embeddings (384-dim ONNX model) with SQLite FTS5 full-text indexing, merged via Reciprocal Rank Fusion. Optional LLM-powered deep search re-ranks results by relevance.
- **Multi-Turn Chat** — Stateful AI conversations scoped to a single meeting, a thread, an insight, or a milestone. Supports file attachments, template selection, and transcript inclusion. Citations reference source meetings via `[M1]`-style labels.
- **Executive Insights** — Generate periodic executive summaries (daily, weekly, monthly) with RAG status indicators. Draft/final workflow with editable rich text summaries and topic breakdowns linked back to source meetings.
- **Thread Tracking** — Create topic threads with criteria prompts. The system auto-discovers relevant meetings via vector similarity, then LLM-evaluates each candidate for relevance scoring. Conversation history is maintained per thread.
- **Milestone Timelines** — Track deliverables across meetings with calendar and Gantt chart views. Auto-extracted from meeting artifacts with fuzzy title matching. Date slippage tracking shows how target dates shift over time.
- **Action Item Management** — Consolidated cross-meeting action items with priority levels, ownership, due dates, and completion tracking. Automatic deduplication via embedding similarity + Jaro-Winkler distance, with optional LLM intent clustering for deep dedup.
- **Notes** — Universal annotation system attachable to meetings, insights, milestones, or threads.
- **Multi-Client Support** — Client registry with aliases, glossary terms, and per-client refinement prompts. Auto-detection matches meetings to clients via email domains, aliases, and meeting name patterns.
- **Webhook Ingestion** — Krisp webhook events flow through Firebase Cloud Functions to Google Drive, synced locally, and auto-processed by a background file watcher service.

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
├── data/             Runtime data directories (gitignored)
│   ├── manual/            Operator drop zone: raw-transcripts, processed, failed, external-transcripts
│   ├── webhook/           Webhook-delivered transcripts: raw-transcripts, processed, failed
│   ├── assets/            Meeting file attachments
│   ├── audit/             Processing run logs
│   └── eval/              Eval harness config and results
├── db/               SQLite + LanceDB (gitignored)
└── models/           ONNX embedding model (gitignored)
```

---

## Package Documentation

| Package | Purpose | README |
|---------|---------|--------|
| `core/` | Pure business logic — pipeline, DB, search, LLM, clients | [docs/core.md](docs/core.md) |
| `api/` | HTTP REST API server (Hono) — mirrors IPC handlers | [docs/api.md](docs/api.md) |
| `electron-ui/` | Desktop + web dual-mode UI (Electron + React) | [docs/ui.md](docs/ui.md) |
| `cli/` | Command-line tools for setup, processing, querying | [docs/cli.md](docs/cli.md) |

Each directory also contains `llm-context.md` (file inventory) and optionally `llm-context-summary.md` (aggregated learnings) for LLM-assisted navigation. See [llm-context-summary.md](llm-context-summary.md) for the root-level index.

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
pnpm process          # one-off ingestion (auto-handled by webhook-watcher when PM2 is up)
pnpm ui:dev           # launch Electron desktop app
pnpm api:dev          # start HTTP API server (port 3000)
pnpm web:dev          # start web UI (port 5173, requires api:dev)
pnpm test             # run all tests (1248 tests, ~10s)
pnpm test:e2e         # run Playwright end-to-end tests
```

See [SETUP.md](SETUP.md) for first-time setup.
See [docs/](docs/README.md) for operational reference: API, CLI, core logic, UI, webhooks, database, env vars.

---

## Configuration

| Concern | Doc |
|---------|-----|
| Define your clients (teams, aliases, glossary, per-client LLM guidance) | [docs/clients.md](docs/clients.md) |
| Tune LLM prompts, chat templates, and search knobs | [docs/prompts.md](docs/prompts.md) |
| Environment variables and data directory layout | [docs/reference.md](docs/reference.md) |

---

## Webhook Ingestion

Krisp webhook events flow through Firebase Cloud Functions to Google Drive, sync locally via Google Drive for Desktop, and are picked up by a pm2-managed file watcher that runs them through the pipeline automatically.

Full details in [docs/webhook.md](docs/webhook.md).
