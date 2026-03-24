# Root Gather — Key Learnings from All Directories

Each directory has its own `scatter.md` (local file documentation) and optionally a `gather.md` (aggregated learnings from children). This file surfaces the critical patterns and gotchas from the entire codebase.

## From `core/`

The 46-file business logic layer is the dependency sink — it imports only from Node built-ins and npm packages. The pipeline orchestrator (`pipeline.ts`) drives the full batch flow: webhook JSON files first (when configured), then manifest/legacy transcripts. Webhook-ingested meeting IDs naturally deduplicate against the manifest. Per-meeting flow: parse → ingest → detect client → extract → reconcile milestones → FTS → deduplicate items → embed → evaluate threads. Clustering uses `table.query()` (full scan), not KNN search with zero vectors — KNN is unreliable for bulk retrieval of L2-normalized vectors. The LLM layer supports 6 providers (Anthropic, OpenAI, Ollama, Claude CLI, Claude API, stub) via a pluggable adapter pattern; `withRepair` retries once on JSON parse failure.

## From `api/`

All six route files share `registerXxxRoutes(app, db, llm?, searchDeps?)` — routes return `503` when optional deps are absent. Routes delegate immediately to the same handler functions used by Electron IPC, so HTTP and IPC have identical business logic with zero duplication.

## From `electron-ui/`

The Electron main process initialization is staged — DB and LLM are synchronous (window opens immediately), but vector search loads asynchronously in the background. Search IPC handlers register late, so early users see the UI before semantic search is ready. The React app uses a strict state hierarchy: `App.tsx` → four feature hooks → pages → components. Components never call `window.api`. The layout is responsive via `ResponsiveShell`: desktop uses `LinearShell` (three-zone), tablet uses split-pane, mobile uses single-stack with `BottomTabBar` and `BreadcrumbBar`. `useBreakpoint()` and `useMobileNav` drive viewport-adaptive behavior. `design-tokens.ts` holds per-breakpoint layout values. `bottom-sheet.tsx` and `responsive-dialog.tsx` provide viewport-adaptive modals. The web entry now includes PWA support. The search pipeline chains hybrid semantic search then LLM deep-search re-ranking. Adding a new `ElectronAPI` method requires changes in three files: `channels.ts`, `preload/index.ts`, and `api-client/index.ts`.

## From `cli/`

CLI tools import from `core/` directly — no IPC, no HTTP. They handle their own DB/vector initialization. All scripts read env vars from `.env.local`. The `query.ts` tool supports three modes: ask (LLM answer synthesis), search (ranked results), and list (structured dump).

## From `test/`

UI tests mock `window.api` — this is the key testing seam. Core tests use the stub LLM adapter for deterministic behavior without API keys. E2E tests (Playwright) hit the real HTTP stack and catch issues unit tests miss (CORS, serialization, real DOM). Responsive UI Phase 1 added 11 unit tests (responsive shell, bottom tab bar, breadcrumbs, bottom sheet, responsive dialog, breakpoint hook, mobile nav, and mobile component variants) plus an E2E spec for cross-viewport meetings view verification. Shared E2E helpers (`helpers.ts`) provide `selectClient` and `withViewport`. 100% branch coverage is enforced.

## From `local-service/`

A standalone background service managed by pm2 that watches `data/webhook-rawtranscripts/` for new Krisp webhook JSON files and auto-processes them through the full pipeline. Uses `fs.watch` with a 30s periodic scan fallback (macOS + Google Drive sync is unreliable). Debounces rapid file events to avoid processing partially-written files. Completely independent from the API server and web UI — runs as its own Node.js process via `ecosystem.config.cjs`.

## From `config/`

Prompt templates use `{{variable}}` placeholders and instruct strict JSON output. The extraction prompt uses a two-trigger action item model. These prompts are load-bearing — changing output format requires updating the corresponding parser in `core/`.

## Directory Index

| Directory | Scatter | Gather |
|-----------|---------|--------|
| `api/` | [scatter](api/scatter.md) | [gather](api/gather.md) |
| `api/routes/` | [scatter](api/routes/scatter.md) | — |
| `core/` | [scatter](core/scatter.md) | — |
| `cli/` | [scatter](cli/scatter.md) | — |
| `electron-ui/` | — | [gather](electron-ui/gather.md) |
| `electron-ui/electron/` | [scatter](electron-ui/electron/scatter.md) | [gather](electron-ui/electron/gather.md) |
| `electron-ui/electron/handlers/` | [scatter](electron-ui/electron/handlers/scatter.md) | — |
| `electron-ui/electron/main/` | [scatter](electron-ui/electron/main/scatter.md) | — |
| `electron-ui/electron/preload/` | [scatter](electron-ui/electron/preload/scatter.md) | — |
| `electron-ui/ui/` | — | [gather](electron-ui/ui/gather.md) |
| `electron-ui/ui/src/` | [scatter](electron-ui/ui/src/scatter.md) | [gather](electron-ui/ui/src/gather.md) |
| `electron-ui/ui/src/components/` | [scatter](electron-ui/ui/src/components/scatter.md) | [gather](electron-ui/ui/src/components/gather.md) |
| `electron-ui/ui/src/components/shared/` | [scatter](electron-ui/ui/src/components/shared/scatter.md) | — |
| `electron-ui/ui/src/components/ui/` | [scatter](electron-ui/ui/src/components/ui/scatter.md) | — |
| `electron-ui/ui/src/hooks/` | [scatter](electron-ui/ui/src/hooks/scatter.md) | — |
| `electron-ui/ui/src/pages/` | [scatter](electron-ui/ui/src/pages/scatter.md) | — |
| `electron-ui/ui/src/api-client/` | [scatter](electron-ui/ui/src/api-client/scatter.md) | — |
| `electron-ui/ui/src/lib/` | [scatter](electron-ui/ui/src/lib/scatter.md) | — |
| `test/` | [scatter](test/scatter.md) | [gather](test/gather.md) |
| `test/ui/` | [scatter](test/ui/scatter.md) | — |
| `test/e2e/` | [scatter](test/e2e/scatter.md) | — |
| `config/` | [scatter](config/scatter.md) | [gather](config/gather.md) |
| `config/prompts/` | [scatter](config/prompts/scatter.md) | — |
| `local-service/` | [scatter](local-service/scatter.md) | — |
| `scripts/` | [scatter](scripts/scatter.md) | — |
| `planning/` | [scatter](planning/scatter.md) | — |
| `google-krisp-webhook/` | [scatter](google-krisp-webhook/scatter.md) | — |
| `docs/` | [scatter](docs/scatter.md) | — |
