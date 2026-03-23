# preload/ — Electron context bridge script

The preload script runs in a special Node.js context that has access to both Electron APIs and the renderer's DOM, but with a security boundary enforced by `contextIsolation: true`. It uses `contextBridge.exposeInMainWorld` to attach a typed `window.api` object to the renderer — the only way the renderer can communicate with the main process.

## Files

| File | Purpose |
|------|---------|
| `index.ts` | Constructs an `ElectronAPI`-typed object where every method calls `ipcRenderer.invoke(CHANNEL, ...args)`, then exposes it as `window.api` via `contextBridge` |

## Key Concepts

**Why a context bridge exists:** With `contextIsolation: true` and `nodeIntegration: false`, renderer code cannot directly `require('electron')`. The preload script bridges this gap by exposing a controlled, typed surface — the renderer can only call the functions explicitly listed in the bridge, and those functions only forward typed calls to IPC channels.

**`window.api` contract:** The exposed object satisfies the `ElectronAPI` interface defined in `channels.ts`. Every method is a `Promise`-returning function that wraps an `ipcRenderer.invoke` call. The same `ElectronAPI` interface is implemented by `api-client/index.ts` in web mode, which means the React UI is entirely agnostic to whether it is running inside Electron or a browser.

**Channel naming:** All IPC channel strings are imported from `channels.ts` via the `CHANNELS` constant rather than inlined as strings, keeping the main and preload sides in sync.

## Related

- Parent: [../README.md](../README.md)
- Channel definitions and `ElectronAPI` type: `../channels.ts`
- Web-mode equivalent: `../../ui/src/api-client/` ([README](../../ui/src/api-client/README.md))
