# electron/ — Electron main process layer

This directory contains everything that runs in the Electron main process: the application entry point, the IPC translation layer, the typed channel contract, and the domain handler modules. The renderer process (React UI) never touches Node.js or SQLite directly — all data access flows through IPC channels defined here.

## Files

| File | Purpose |
|------|---------|
| `channels.ts` | Defines the `CHANNELS` constant (all ~60 IPC channel name strings), all request/response interfaces (`MeetingRow`, `ChatRequest`, `ElectronAPI`, etc.), and the `ElectronAPI` interface that both `preload/index.ts` and `ui/src/api-client/` implement |
| `ipc-handlers.ts` | Slim re-export barrel — aggregates and re-exports all handler functions from the five `handlers/*.ts` modules into one import surface for `main/index.ts` |

## Key Concepts

**Translation layer:** `ipc-handlers.ts` is the seam between IPC channels and `core/` functions. `main/index.ts` registers `ipcMain.handle(CHANNEL, handler)` for each channel; the handler is a thin lambda that unpacks IPC arguments and delegates to the appropriate named function from this barrel.

**Typed contract:** `channels.ts` is the single source of truth for the IPC contract. Both sides — the main process (via `ipc-handlers.ts`) and the renderer process (via `preload/index.ts` or `ui/src/api-client/`) — import types from here, ensuring that request and response shapes stay in sync without runtime overhead.

**Dual-mode compatibility:** The `ElectronAPI` interface defined in `channels.ts` is implemented twice: once in `preload/index.ts` using `ipcRenderer.invoke`, and once in `ui/src/api-client/index.ts` using `fetch`. The React UI only ever calls `window.api.*` and never knows which implementation is active.

## Related

- Parent: [../gather.md](../gather.md)
- Gathered view: [gather.md](gather.md)
- Core business logic: `../../core/`
- HTTP API (web mode): `../../api/`
