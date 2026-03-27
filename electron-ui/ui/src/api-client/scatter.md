# api-client/ — HTTP fetch implementation of ElectronAPI

This directory provides the web-browser implementation of the `ElectronAPI` interface from `electron/channels.ts`. When the app runs in a browser (via `pnpm web:dev`) instead of inside Electron, `main-web.tsx` assigns this client to `window.api`, making the React UI entirely unaware of the transport difference.

## Files

| File | Purpose |
|------|---------|
| `base.ts` | Exports `API_BASE` — defaults to `http://localhost:3000`, overridable via `VITE_API_BASE` env var |
| `meetings.ts` | Fetch implementations for meeting queries, artifact retrieval, re-extraction, client reassignment, action item completion, action item editing, and meeting creation |
| `chat.ts` | Fetch implementations for single-turn chat, conversation chat, hybrid search, and deep search |
| `threads.ts` | Fetch implementations for thread CRUD, candidate discovery, evaluation, meeting linking, summary regeneration, and thread chat |
| `insights.ts` | Fetch implementations for insight CRUD, period-based meeting discovery, insight generation, and insight chat |
| `milestones.ts` | Fetch implementations for milestone CRUD, mention confirm/reject, milestone merging, action item linking, date slippage, and milestone chat |
| `notes.ts` | Fetch implementations for note CRUD: list notes by object, create, update (PATCH), delete, and count by object type/ID |
| `index.ts` | Assembles all domain method objects into a single `apiClient: ElectronAPI` export by spreading `meetingsMethods`, `chatMethods`, `threadsMethods`, `insightsMethods`, `milestonesMethods`, and `notesMethods` |

## Key Concepts

**Shared interface contract:** Both this module and `electron/preload/index.ts` satisfy the same `ElectronAPI` interface from `electron/channels.ts`. Adding a method to `ElectronAPI` requires implementing it in both places.

**`window.api` assignment:** `main-web.tsx` does `window.api = apiClient` before React renders. The rest of the UI only ever calls `window.api.*` — it does not import from this directory directly.

**Base URL:** The Hono HTTP server in `api/` must be running at `API_BASE` for calls to succeed. In development this is started separately from the Electron main process.

## Related

- Parent: [../README.md](../README.md)
- `ElectronAPI` interface: `../../../../electron/channels.ts`
- HTTP server routes: `../../../../api/`
- Electron IPC implementation: `../../../../electron/preload/index.ts` ([README](../../../../electron/preload/README.md))
