# Root Gather — Key Learnings from All Directories

Each directory has its own `llm-context.md` (local file documentation) and optionally a `llm-context-summary.md` (aggregated learnings from children). This file surfaces the critical patterns and gotchas from the entire codebase.

## From `core/`

The business logic layer is the dependency sink -- it imports only from Node built-ins and npm packages. Organized into 11 subdirectories plus ~10 top-level files. The pipeline orchestrator (`pipeline/pipeline.ts`) drives the full batch flow: webhook JSON files first (when configured), then manifest/legacy transcripts. Webhook-ingested meeting IDs naturally deduplicate against the manifest. Per-meeting flow: parse -> ingest -> detect client -> extract -> reconcile milestones -> FTS -> deduplicate items -> embed -> evaluate threads. Clustering uses `table.query()` (full scan), not KNN search with zero vectors -- KNN is unreliable for bulk retrieval of L2-normalized vectors. The LLM layer (`llm/`) supports 6 providers (Anthropic, OpenAI, Ollama, Claude CLI, Claude API, stub) via a pluggable adapter pattern; `withRepair` retries once on JSON parse failure.

The tenant model adds `tenants`, `users`, and `tenant_memberships` tables to the schema. Clients now use UUID primary keys (migrated from name-based PKs via a clients -> clients_v2 rename); `client_id` columns on `threads`, `insights`, `milestones`, and `client_detections` are backfilled during migration. `clients/resolve.ts` provides `resolveClient(db, param, tenantId?)` which accepts either a client name or UUID, used by all API routes. `clients/registry.ts` seeds from `config/clients.json` at startup. `getClientById` retrieves by UUID; all query functions accept optional `tenantId` for tenant-scoped lookups. Each client carries a `glossary` (term/variants/description array) and optional `refinement_prompt` injected into the extraction prompt, making artifact extraction client-aware. Client detection (`clients/detection.ts`) auto-matches meetings via email domains, aliases, and meeting name tokens.

Meeting-attached resources live in `meetings/`: **messages** (per-meeting chat history), **split** (partition a recording into segments with lineage), **assets** (file attachments stored on disk), and **action-item-resolver** (map printable short IDs to `{ meetingId, itemIndex }`). Top-level domain features include **notes.ts** (universal annotations), **threads.ts** (topic threads with LLM evaluation), **insights.ts** (period-scoped executive summaries), and **timelines.ts** (milestone tracking with date-slippage history). **Dedup** (`dedup/`) has two modes: embedding-based cosine/Jaro-Winkler (`item-dedup.ts`) during ingestion, plus optional LLM intent clustering (`deep-dedup.ts`) for deeper matches across a client's full history.

Search (`search/`) operates in four modes: **vector** (KNN on 384-dim L2-normalized embeddings via `vector-db.ts`), **FTS** (SQLite FTS5 with BM25 via `fts.ts`), **hybrid** (Reciprocal Rank Fusion via `hybrid-search.ts`), and **deep** (LLM re-ranking of candidates via `deep-search.ts`). The search pipeline chains hybrid -> optional deep search, with `useSearchScope` in the UI orchestrating the cascade.

Artifact validation (`pipeline/schemas.ts`) uses Zod v4 schemas that handle both clean LLM output and legacy format coercions (string decisions -> object, missing requester defaults, string/array summary union). A typed error hierarchy (`errors.ts`) provides `AppError`, `ExtractionError`, `LlmError`, `ValidationError`, and `PipelineError` for machine-readable error codes. Pure utilities live in `utils/` (math, paths, format-owner, display/citation parsing).

The `core/auth/` directory implements a full OAuth 2.1 + API key authentication layer. Seven files cover: scope definitions and route-level enforcement (`scopes.ts`), RSA key management and JWT signing/verification (`jwt.ts`), API key CRUD with SHA-256 hashing (`api-keys.ts`), OAuth client registration and authentication (`oauth-clients.ts`), token issuance and single-use refresh rotation (`token-service.ts`), PKCE S256 challenge/verification (`pkce.ts`), and authorization code grant flow (`auth-codes.ts`). The auth layer is opt-in — enabled via `MTNINSIGHTS_AUTH_ENABLED=1` in the API server. A CLI tool (`cli/manage-auth.ts`) provides `create-client`, `create-api-key`, `list-clients`, `list-api-keys`, `revoke-client`, and `revoke-api-key` subcommands for key and client management.

## From `api/`

All route files share `registerXxxRoutes(app, db, llm?, searchDeps?)` — routes return `503` when optional deps are absent. Routes delegate immediately to the same handler functions used by Electron IPC, so HTTP and IPC have identical business logic with zero duplication. All route files that accept `?client=` query parameters resolve them via `resolveClient` from `core/clients/resolve.ts`, which accepts either a client name or UUID. The auth middleware (`middleware/auth.ts`) validates Bearer tokens (API keys for `mki_`-prefixed tokens, JWTs otherwise), enforces scope-based access control per route, and bypasses OAuth endpoints. OAuth routes (`routes/oauth.ts`) implement the full token endpoint (client_credentials, authorization_code, refresh_token grants), JWKS endpoint, dynamic client registration, authorization endpoint with PKCE, and token revocation per RFC 7009.

## From `electron-ui/`

The Electron main process initialization is staged — DB and LLM are synchronous (window opens immediately), but vector search loads asynchronously in the background. Search IPC handlers register late, so early users see the UI before semantic search is ready. The React app uses a strict state hierarchy: `App.tsx` → feature hooks → pages → components. Components never call `window.api`. The layout is responsive via `ResponsiveShell`: desktop uses `LinearShell` (three-zone), tablet uses split-pane, mobile uses single-stack with `BottomTabBar` and `BreadcrumbBar`. `useBreakpoint()` and `useMobileNav` drive viewport-adaptive behavior. `design-tokens.ts` holds per-breakpoint layout values. `bottom-sheet.tsx` and `responsive-dialog.tsx` provide viewport-adaptive modals. The web entry now includes PWA support. Adding a new `ElectronAPI` method requires changes in three files: `channels.ts`, `preload/index.ts`, and `api-client/index.ts`.

The UI has six page views: MeetingsPage, ActionItemsPage, ThreadsPage, InsightsPage, TimelinesPage, and **SearchPage**. SearchPage is the dedicated search view with its own state machine (`useSearchState`) that orchestrates query input, field filters, date range, hybrid search, optional LLM deep search re-ranking, result enrichment via artifact batch fetching, grouping (cluster/date/series), and sorting. A `CompactResultsSidebar` appears alongside `MeetingDetail` when a result is selected. The `NotesDialog` component provides a universal notes UI attachable to any domain object (meeting, insight, milestone, thread) via `useNotesState`. Density is a global UI preference (`useDensity`) that controls row height, icon size, and font size across all list views.

## From `cli/`

CLI tools import from `core/` directly — no IPC, no HTTP. They handle their own DB/vector initialization. All scripts read env vars from `.env.local`. The `query.ts` tool supports three modes: ask (LLM answer synthesis), search (ranked results), and list (structured dump).

## From `test/`

UI tests mock `window.api` — this is the key testing seam. Core tests use the stub LLM adapter for deterministic behavior without API keys. E2E tests (Playwright) hit the real HTTP stack and catch issues unit tests miss (CORS, serialization, real DOM). Responsive UI Phase 1 added 11 unit tests (responsive shell, bottom tab bar, breadcrumbs, bottom sheet, responsive dialog, breakpoint hook, mobile nav, and mobile component variants) plus an E2E spec for cross-viewport meetings view verification. Shared E2E helpers (`helpers.ts`) provide `selectClient` and `withViewport`. 100% branch coverage is enforced.

## From `local-service/`

A standalone background service managed by pm2 that watches `data/webhook-rawtranscripts/` for new Krisp webhook JSON files and auto-processes them through the full pipeline. Uses `fs.watch` with a 30s periodic scan fallback (macOS + Google Drive sync is unreliable). Debounces rapid file events to avoid processing partially-written files. Completely independent from the API server and web UI — runs as its own Node.js process via `ecosystem.config.cjs`.

## From `webhook-transcript-handler/`

Firebase Cloud Function (`firebase/`) that receives Krisp webhook POST requests and writes raw JSON payloads to Google Drive. Uses OAuth2 with a refresh token stored in Firebase Secret Manager to write to Drive via the v3 API. Auth token is validated from a query parameter or Authorization header. Files land in Drive and sync to `data/webhook-rawtranscripts/` via Google Drive Desktop, where `local-service/` picks them up.

## From `config/`

Prompt templates use `{{variable}}` placeholders and instruct strict JSON output. The extraction prompt uses a two-trigger action item model. These prompts are load-bearing — changing output format requires updating the corresponding parser in `core/`.

## Directory Index

| Directory | Scatter | Gather |
|-----------|---------|--------|
| `api/` | [llm-context](api/llm-context.md) | [llm-context-summary](api/llm-context-summary.md) |
| `api/routes/` | [llm-context](api/routes/llm-context.md) | — |
| `core/` | [llm-context](core/llm-context.md) | — |
| `core/auth/` | [llm-context](core/auth/llm-context.md) | — |
| `core/clients/` | [llm-context](core/clients/llm-context.md) | — |
| `core/clustering/` | [llm-context](core/clustering/llm-context.md) | — |
| `core/context/` | [llm-context](core/context/llm-context.md) | — |
| `core/dedup/` | [llm-context](core/dedup/llm-context.md) | — |
| `core/llm/` | [llm-context](core/llm/llm-context.md) | — |
| `core/meetings/` | [llm-context](core/meetings/llm-context.md) | — |
| `core/migrations/` | [llm-context](core/migrations/llm-context.md) | — |
| `core/pipeline/` | [llm-context](core/pipeline/llm-context.md) | — |
| `core/search/` | [llm-context](core/search/llm-context.md) | — |
| `core/utils/` | [llm-context](core/utils/llm-context.md) | — |
| `cli/` | [llm-context](cli/llm-context.md) | — |
| `cli/admin-util/` | [llm-context](cli/admin-util/llm-context.md) | — |
| `cli/mti/` | [llm-context](cli/mti/llm-context.md) | — |
| `electron-ui/` | — | [llm-context-summary](electron-ui/llm-context-summary.md) |
| `electron-ui/electron/` | [llm-context](electron-ui/electron/llm-context.md) | [llm-context-summary](electron-ui/electron/llm-context-summary.md) |
| `electron-ui/electron/handlers/` | [llm-context](electron-ui/electron/handlers/llm-context.md) | — |
| `electron-ui/electron/main/` | [llm-context](electron-ui/electron/main/llm-context.md) | — |
| `electron-ui/electron/preload/` | [llm-context](electron-ui/electron/preload/llm-context.md) | — |
| `electron-ui/ui/` | — | [llm-context-summary](electron-ui/ui/llm-context-summary.md) |
| `electron-ui/ui/src/` | [llm-context](electron-ui/ui/src/llm-context.md) | [llm-context-summary](electron-ui/ui/src/llm-context-summary.md) |
| `electron-ui/ui/src/components/` | [llm-context](electron-ui/ui/src/components/llm-context.md) | [llm-context-summary](electron-ui/ui/src/components/llm-context-summary.md) |
| `electron-ui/ui/src/components/shared/` | [llm-context](electron-ui/ui/src/components/shared/llm-context.md) | — |
| `electron-ui/ui/src/components/ui/` | [llm-context](electron-ui/ui/src/components/ui/llm-context.md) | — |
| `electron-ui/ui/src/hooks/` | [llm-context](electron-ui/ui/src/hooks/llm-context.md) | — |
| `electron-ui/ui/src/pages/` | [llm-context](electron-ui/ui/src/pages/llm-context.md) | — |
| `electron-ui/ui/src/api-client/` | [llm-context](electron-ui/ui/src/api-client/llm-context.md) | — |
| `electron-ui/ui/src/lib/` | [llm-context](electron-ui/ui/src/lib/llm-context.md) | — |
| `test/` | [llm-context](test/llm-context.md) | [llm-context-summary](test/llm-context-summary.md) |
| `test/ui/` | [llm-context](test/ui/llm-context.md) | — |
| `test/e2e/` | [llm-context](test/e2e/llm-context.md) | — |
| `config/` | [llm-context](config/llm-context.md) | [llm-context-summary](config/llm-context-summary.md) |
| `config/prompts/` | [llm-context](config/prompts/llm-context.md) | — |
| `local-service/` | [llm-context](local-service/llm-context.md) | — |
| `scripts/` | [llm-context](scripts/llm-context.md) | — |
| `planning/` | [llm-context](planning/llm-context.md) | — |
| `webhook-transcript-handler/` | [llm-context](webhook-transcript-handler/llm-context.md) | — |
| `docs/` | [llm-context](docs/llm-context.md) | — |
