# api/ — Hono HTTP server exposing the full feature set over REST

## Subdirectories

| Dir | Summary | README |
|-----|---------|--------|
| `routes/` | Domain-scoped Hono route registration modules | [scatter](routes/scatter.md) |

## Key Learnings from Children

**From `routes/`:** All six route files share the same `registerXxxRoutes(app, db, llm?, searchDeps?)` signature — LLM and search deps are optional, and routes return `503` when they're absent. Routes are intentionally thin: they parse HTTP parameters and delegate immediately to the same handler functions used by Electron IPC. This means the HTTP API and Electron IPC have identical business logic with zero duplication. The `meetings.ts` route file is the largest (20+ endpoints covering CRUD, action items, completions, re-extraction, and client reassignment).

## Related

- Parent: [Root gather](../gather.md)
- Scatter view: [scatter.md](scatter.md)
- Core logic in `core/`
