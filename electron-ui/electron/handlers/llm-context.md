# handlers/ — Domain handler modules for IPC channels

Each file in this directory implements named handler functions for one domain area. The handlers are the actual business logic executed in response to IPC calls; they accept typed arguments (database, LLM adapter, vector DB, ONNX session) and return domain objects. All handlers are re-exported through the parent `ipc-handlers.ts` barrel so `main/index.ts` imports from a single location.

## Files

| File | Purpose |
|------|---------|
| `config.ts` | Loads 5 config files at startup: `chat-guidelines.md`, `extraction.md` prompt, `deep-search.md` prompt, `system.json` (search limits), and all `chat-templates/*.md` files into a Map |
| `meetings.ts` | Handles meeting CRUD, artifact retrieval/normalization, re-extraction, client reassignment, action item completion, action item editing, multi-meeting deletion (including LanceDB vector cleanup), chat (single-turn and conversation), `handleSplitMeeting(db, meetingId, durations)` (delegates to `splitMeeting` from core), and `handleGetMeetingLineage(db, meetingId)` (queries `meeting_lineage` for source, children, and segment_index). |
| `search.ts` | Handles hybrid semantic search, per-meeting vector re-embedding, bulk re-embed, and deep-search (LLM-scored relevance ranking) |
| `threads.ts` | Handles thread lifecycle (create, update, delete, resolve), meeting linking, candidate discovery and LLM evaluation, thread summary regeneration, and thread chat with persisted message history |
| `insights.ts` | Handles insight lifecycle, period-based meeting discovery, LLM insight generation, insight status/RAG updates, and insight chat |
| `milestones.ts` | Handles milestone lifecycle, mention confirmation/rejection, milestone merging, action item linking, date slippage queries, and milestone chat |
| `health.ts` | Registers IPC handlers for `GET_HEALTH` (calls `getHealthStatus(db)`) and `ACKNOWLEDGE_HEALTH_ERRORS` (calls `acknowledgeErrors` or `acknowledgeAllErrors` depending on whether error IDs are provided). |

## Key Concepts

**Dependency injection pattern:** Every handler takes `db`, `llm`, `vdb`, and/or `session` as explicit parameters — no module-level singletons. This makes handlers testable and lets `main/index.ts` control initialization order.

**Config loading at module load time:** `config.ts` reads all config files synchronously when the module is first imported. Missing files silently yield empty strings or `undefined`; handlers that receive `undefined` prompts fall back to built-in behavior.

**Cross-handler imports:** `search.ts` imports `handleGetArtifact` and `clientNameForMeeting` from `meetings.ts`. `threads.ts`, `insights.ts`, and `milestones.ts` import `resolveMeetingSources` from `meetings.ts` to resolve meeting IDs into labeled source references for chat responses.

## Related

- Parent: [../README.md](../README.md)
- Re-export barrel: `../ipc-handlers.ts`
- IPC channel definitions: `../channels.ts`
