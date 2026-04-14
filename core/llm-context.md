# core/ — Pure business logic

The entire domain model. No imports from `electron-ui/` or `api/`; both layers import from here. Everything is testable in isolation using the stub LLM adapter and an in-memory SQLite database.

**Design principle:** `core/` is the dependency sink. It imports from Node built-ins and npm packages only. Nothing in this directory knows about IPC channels, Hono, or React.

## Subdirectories

| Directory | Purpose | Index |
|-----------|---------|-------|
| `auth/` | OAuth 2.1, API keys, JWT signing, scopes, PKCE, authorization codes | [auth/llm-context.md](auth/llm-context.md) |
| `clients/` | Client registry, detection, and resolution | [clients/llm-context.md](clients/llm-context.md) |
| `dedup/` | Cross-meeting action item deduplication (semantic + string + optional LLM intent) | [dedup/llm-context.md](dedup/llm-context.md) |
| `llm/` | LLM adapter and six providers (Anthropic, OpenAI, Ollama, Claude CLI, Claude API, stub) | [llm/llm-context.md](llm/llm-context.md) |
| `migrations/` | Versioned schema migration runner and individual migrations | [migrations/llm-context.md](migrations/llm-context.md) |
| `pipeline/` | End-to-end ingestion: parse, chunk, ingest, extract, embed, lifecycle, schemas | [pipeline/llm-context.md](pipeline/llm-context.md) |
| `search/` | FTS5, vector, hybrid (RRF), deep LLM re-rank, feature embeddings | [search/llm-context.md](search/llm-context.md) |

## Top-level files

### Infrastructure

| File | Purpose |
|------|---------|
| `db.ts` | `createDb(path)` opens a SQLite connection via `node:sqlite`. `migrate(db)` is a thin wrapper over `runMigrations(db, allMigrations)` |
| `paths.ts` | `resolveDataPaths(dataDir)` returns typed paths for data subdirs. `ensureDataDirs(paths)` creates them |
| `logger.ts` | `createLogger(namespace)`. `logLlmCall` / `logApiCall` write JSONL. `setLogDir`, `setLogLevel` |
| `errors.ts` | Typed error hierarchy: `AppError`, `ExtractionError`, `LlmError`, `ValidationError`, `PipelineError` |
| `math.ts` | `cosineSimilarity`, `l2ToCosineSim`, `isSemanticDuplicate`, `jaroWinklerSimilarity`, `isStringDuplicate`, `normalizeItemText` |
| `notifier.ts` | Email alerts for pipeline failures. `createNotifierFromEnv()` reads SMTP config |
| `system-health.ts` | `recordSystemError`, `acknowledgeErrors`, `listSystemErrors` |

### Domain features

| File | Purpose |
|------|---------|
| `threads.ts` | Thread CRUD, candidate discovery, LLM evaluation, chat context, message history |
| `insights.ts` | Period-scoped executive summaries with RAG status. `generateInsight` builds artifact context and calls the LLM |
| `timelines.ts` | Milestone tracking: `reconcileMilestones` (exact + Dice coefficient fuzzy match), `getDateSlippage`, full CRUD |
| `notes.ts` | Universal annotations on meetings, insights, milestones, threads. `noteType` = user or auto |
| `assets.ts` | File attachments: `storeAsset`, `deleteAsset`, `getAssetData` |
| `meeting-messages.ts` | Per-meeting chat history |
| `meeting-split.ts` | Split a multi-meeting recording into separate meetings by duration. Preserves lineage in `meeting_lineage` |
| `action-item-resolver.ts` | `resolveShortIds(db, short_ids)` maps short IDs to `{ meetingId, itemIndex }` |
| `feedback.ts` | User feedback submission (thumbs up/down) |
| `task-generation.ts` | LLM-driven task generation from meeting context |
| `tag-drift.ts` | Detect semantic drift in recurring meetings |
| `cluster-topics.ts`, `clustering.ts` | Legacy topic clustering (kept for compatibility) |

### Context builders

| File | Purpose |
|------|---------|
| `context.ts` | Base context assembly primitives |
| `labeled-context.ts` | `buildLabeledContext` -- `[M1]`-labeled multi-meeting context. `buildDistilledContext` -- simpler variant |
| `display-helpers.ts` | `parseCitations`, `replaceCitations` -- transforms `[M1]` labels in LLM output |
| `format-owner.ts` | Normalizes owner/requester name formatting |

## Related

- Parent: [Root llm-context-summary](../llm-context-summary.md)
- Operational docs: [docs/core.md](../docs/core.md)
