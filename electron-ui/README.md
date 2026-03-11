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

| Dir | Summary | README |
|-----|---------|--------|
| `electron/` | Main process: IPC handlers, channel contract, app entry, preload bridge | [README](electron/README.md) |
| `ui/` | React application: components, pages, hooks, API client | [README](ui/README.md) |

## Related

- Core business logic: `../core/`
- HTTP API server: `../api/`
- Channel/type contract: `electron/channels.ts`
