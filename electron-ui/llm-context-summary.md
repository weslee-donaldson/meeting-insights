# electron-ui/ — Dual-mode Electron + web UI

The Meeting Intelligence Explorer front-end, implemented as a React application that runs in two modes: embedded inside an Electron desktop app (via IPC), or as a standalone web app in a browser (via HTTP API). The same React codebase runs in both modes with no code differences in the components, pages, or hooks.

## Dual-mode architecture

`window.api` is the single interface point between the React UI and the backend. It satisfies the `ElectronAPI` type defined in `electron/channels.ts`.

| Mode | How `window.api` is populated | Backend |
|------|-------------------------------|---------|
| Electron | `electron/preload/index.ts` via `contextBridge.exposeInMainWorld` | Electron main process (SQLite, LanceDB, ONNX in-process) |
| Web (`pnpm web:dev`) | `ui/src/main-web.tsx` assigns `window.api = apiClient` | Hono HTTP server in `api/` |

In Electron mode, every `window.api.*` call becomes an `ipcRenderer.invoke(CHANNEL, ...)` dispatched to the registered `ipcMain.handle` in `electron/main/index.ts`. In web mode, the same call becomes a `fetch()` to the HTTP API.

## Subdirectories

| Dir | Summary | Docs |
|-----|---------|------|
| `electron/` | Main process: IPC handlers, channel contract, app entry, preload bridge | [llm-context](electron/llm-context.md) · [llm-context-summary](electron/llm-context-summary.md) |
| `ui/` | React application: components, pages, hooks, API client | [llm-context-summary](ui/llm-context-summary.md) |

## Key Learnings from Children

**From `electron/`:** `channels.ts` is the single source of truth for the entire IPC contract (~60 channels). All handlers use dependency injection (db, llm, vdb, session as parameters) — no module-level singletons. The main process initialisation is deliberately staged: DB and LLM are synchronous (window opens immediately), but vector search infrastructure loads asynchronously in the background. Search IPC handlers register only after the ONNX model and LanceDB connect, so early users see the UI before semantic search is available. Config files load synchronously at module import time; missing files silently yield empty strings.

**From `ui/`:** The React app uses a strict state hierarchy: `App.tsx` → four feature hooks → pages → components. Components never call `window.api` directly. The layout is responsive via `ResponsiveShell`: desktop uses `LinearShell` (three-zone: nav rail, left panel, right panel), tablet uses split-pane, and mobile uses a single-stack with `BottomTabBar` and `BreadcrumbBar`. `useBreakpoint()` and `useMobileNav` drive viewport-adaptive behavior. `design-tokens.ts` contains per-breakpoint layout values. `bottom-sheet.tsx` and `responsive-dialog.tsx` provide viewport-adaptive modals. The web entry (`index-web.html`) now includes PWA support (manifest, icons). The search pipeline chains hybrid semantic search then LLM re-ranking. Multi-select (2+ checked meetings) triggers parallel artifact queries merged with deduplication. Adding a new `ElectronAPI` method requires changes in three places: `channels.ts`, `preload/index.ts`, and `api-client/index.ts`.

## Related

- Core business logic: `../core/`
- HTTP API server: `../api/`
- Channel/type contract: `electron/channels.ts`
