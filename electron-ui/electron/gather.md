# electron/ — Gathered subdirectory knowledge

Aggregated learnings from child directories within the Electron main process layer.

## Subdirectories

| Dir | Summary | Scatter |
|-----|---------|---------|
| `handlers/` | Domain handler modules (meetings, search, threads, insights, milestones, config) | [scatter.md](handlers/scatter.md) |
| `main/` | Electron main entry — window creation, IPC registration, app lifecycle | [scatter.md](main/scatter.md) |
| `preload/` | Context bridge script that exposes `window.api` to the renderer | [scatter.md](preload/scatter.md) |

## Key Learnings from Children

**From `handlers/`:** All handlers use dependency injection — `db`, `llm`, `vdb`, `session` are explicit parameters, no module-level singletons. This makes every handler independently testable. Cross-handler imports exist: `search.ts` imports from `meetings.ts`, and thread/insight/milestone handlers import `resolveMeetingSources` from `meetings.ts` for chat source resolution. Config files load synchronously at module import time; missing files silently yield empty strings.

**From `main/`:** Initialization is deliberately sequential. The window opens immediately after DB + LLM setup (steps 1-6), then vector search infrastructure loads asynchronously in the background. Search-dependent IPC handlers are registered only after the ONNX model and LanceDB connect — until then, search is silently unavailable. This means early users see the UI before semantic search is ready.

**From `preload/`:** `contextBridge.exposeInMainWorld` is the security boundary — the renderer cannot access Node.js or Electron APIs directly. Every `window.api` method is a thin `ipcRenderer.invoke` wrapper. Channel names come from the `CHANNELS` constant (not string literals), keeping main and preload in sync at compile time.

## Related

- Scatter view: [scatter.md](scatter.md)
- Parent: [../gather.md](../gather.md)
