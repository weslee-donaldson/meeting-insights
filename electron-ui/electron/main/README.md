# main/ — Electron main process entry point

This directory contains the single entry file that bootstraps the Electron application: it initializes all infrastructure (SQLite, LLM adapter, FTS index), registers every IPC handler, creates the browser window, and then loads the vector search infrastructure asynchronously in the background.

## Files

| File | Purpose |
|------|---------|
| `index.ts` | Main process entry — database migration, IPC handler registration, window creation, background vector/model loading |

## Key Concepts

**Initialization sequence:**
1. Load `.env.local` (optional, relative to `app.getAppPath()`).
2. `createDb` + `migrate` — synchronous SQLite setup.
3. Populate FTS index if empty (first run).
4. Create the LLM adapter (provider selected from `MTNINSIGHTS_LLM_PROVIDER`: `anthropic`, `openai`, `local`, or `stub`).
5. Register all IPC handlers from `ipc-handlers.ts` except vector-dependent ones.
6. `createWindow()` — shows the UI immediately.
7. `connectVectorDb` + `loadModel` — runs asynchronously; registers `SEARCH_MEETINGS` and `RE_EMBED_MEETING` handlers only after both succeed. If this fails, search is silently unavailable.

**Dev vs. production window loading:** In dev mode (`NODE_ENV=development` or `ELECTRON_RENDERER_URL` set), the window loads the Vite dev server URL. In production it loads `../renderer/index.html` from the compiled output.

**Path configuration:** All paths (`DB_PATH`, `VECTOR_PATH`, `MODEL_PATH`) are resolved relative to `app.getAppPath()` and can be overridden with environment variables (`MTNINSIGHTS_DB_PATH`, `MTNINSIGHTS_VECTOR_PATH`).

**macOS window behavior:** `window-all-closed` only quits on non-macOS platforms; on macOS the app stays alive with no window (standard macOS convention).

## Related

- Parent: [../README.md](../README.md)
- IPC handlers: `../ipc-handlers.ts`
- Channel definitions: `../channels.ts`
