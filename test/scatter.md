# test/ — All test files for the project

Unit and integration tests covering API endpoints, core business logic, LLM adapters, IPC handlers, threads, insights, and supporting utilities. All tests use Vitest. 100% branch coverage is enforced (per CLAUDE.md); no coverage exclusions except barrel `index.ts` re-exports and `*.test.ts` files themselves.

The stub LLM adapter (`llm-provider-stub.ts`) provides deterministic fixtures keyed by `PromptType`, enabling LLM-dependent tests to run without API keys or network access.

## Test Files

### API Endpoint Tests

Tests for the Hono HTTP server routes in `api/`.

| File | Purpose |
|------|---------|
| `api-artifact-chat.test.ts` | `/api/artifacts/:id/chat` streaming chat endpoint |
| `api-debug.test.ts` | `/api/debug` diagnostic endpoint |
| `api-deep-search.test.ts` | `/api/deep-search` LLM-scored semantic search endpoint |
| `api-insights.test.ts` | `/api/insights` CRUD and generation endpoints |
| `api-llm-errors.test.ts` | LLM error propagation through API routes |
| `api-meetings.test.ts` | `/api/meetings` list and detail endpoints |
| `api-milestones.test.ts` | `/api/milestones` CRUD endpoints |
| `api-search.test.ts` | `/api/search` semantic and hybrid search endpoints |

### Core Module Tests

Tests for business logic in `core/`.

| File | Purpose |
|------|---------|
| `chunker.test.ts` | Transcript chunking into token-bounded segments |
| `clustering.test.ts` | k-means++ clustering and `recluster` |
| `context.test.ts` | Context building utilities |
| `db.test.ts` | SQLite schema migrations and CRUD operations |
| `embedder.test.ts` | ONNX embedding model load, inference, and L2 normalization |
| `extractor.test.ts` | LLM artifact extraction, validation, and storage |
| `feature-embedding.test.ts` | Feature-level vector embedding and storage |
| `feedback.test.ts` | `overrideClient`, `overrideTag`, `flagExtraction` |
| `fts.test.ts` | SQLite full-text search |
| `hybrid-search.test.ts` | Combined FTS + vector search with score fusion |
| `ingest.test.ts` | Meeting ingestion and deduplication |
| `item-dedup.test.ts` | Artifact item deduplication logic |
| `labeled-context.test.ts` | `buildLabeledContext`: semantic search, dedup, token budget, `[M1]` labels |
| `lifecycle.test.ts` | `moveToProcessed`, `moveToFailed`, `processDirectory` |
| `math.test.ts` | Vector math utilities (cosine similarity, k-means math) |
| `meeting-pipeline.test.ts` | End-to-end embedding pipeline for a single meeting |
| `parser.test.ts` | Krisp transcript file parsing (filename, sections, attendance, body) |
| `tag-drift.test.ts` | Cosine similarity-based tag drift detection |
| `task-generation.test.ts` | LLM-driven task generation from meeting context |
| `vector-db.test.ts` | LanceDB table creation and vector operations |
| `vector-search.test.ts` | Semantic KNN search with metadata filters |

### LLM Tests

| File | Purpose |
|------|---------|
| `llm-adapter.test.ts` | `createLlmAdapter` factory and adapter interface |
| `llm-helpers.test.ts` | Prompt rendering and response parsing helpers |
| `llm-provider-anthropic.test.ts` | Anthropic Claude provider implementation |
| `llm-provider-local.test.ts` | Local Ollama-compatible provider |
| `llm-provider-openai.test.ts` | OpenAI provider implementation |
| `llm-provider-stub.test.ts` | Stub provider deterministic fixture behavior |
| `logger.test.ts` | `createLogger` namespace and debug output |

### IPC Handler Tests

Tests for Electron IPC handlers in `electron-ui/electron/`.

| File | Purpose |
|------|---------|
| `ipc-handlers.test.ts` | Meeting list, detail, search, and artifact IPC channels |
| `ipc-insight-handlers.test.ts` | Insight-specific IPC channels (CRUD, generate, finalize) |
| `re-embed-handler.test.ts` | Re-embedding IPC handler |
| `search-handler.test.ts` | Search IPC handler with semantic and hybrid modes |
| `channels.test.ts` | IPC channel registry and type definitions |

### Thread Tests

| File | Purpose |
|------|---------|
| `thread-candidates.test.ts` | Thread candidate discovery from meetings |
| `thread-chat-context.test.ts` | Chat context assembly for thread conversations |
| `thread-evaluate-confirmed.test.ts` | Confirmed thread evaluation flow |
| `thread-evaluation.test.ts` | LLM-based thread-to-meeting relevance evaluation |
| `thread-meetings.test.ts` | Thread-to-meeting association queries |
| `thread-messages.test.ts` | Thread chat message storage and retrieval |
| `thread-regenerate-summary.test.ts` | Thread summary regeneration |
| `threads-crud.test.ts` | Thread create, read, update, delete |
| `threads-update-delete.test.ts` | Thread update and delete edge cases |
| `threads.test.ts` | Thread list and filtering |

### Insight Tests

| File | Purpose |
|------|---------|
| `insight-chat-context.test.ts` | Chat context assembly for insight conversations |
| `insight-generation.test.ts` | LLM-driven insight report generation |
| `insight-html.test.ts` | HTML rendering of insight executive summaries |
| `insight-meetings.test.ts` | Insight-to-meeting discovery and association |
| `insight-messages.test.ts` | Insight chat message storage and retrieval |
| `insights-crud.test.ts` | Insight create, read, update, delete |
| `insights.test.ts` | Insight list and filtering |

### Other Tests

| File | Purpose |
|------|---------|
| `assign-client.test.ts` | Client assignment to meetings |
| `chat-sources.test.ts` | Citation source parsing and deduplication in chat |
| `client-detection.test.ts` | Speaker-based client detection |
| `client-registry.test.ts` | Client seed data, lookup by name and alias |
| `cluster-topics.test.ts` | Cluster tag aggregation and LLM extraction |
| `deep-search.test.ts` | Deep search orchestration (semantic + LLM scoring) |
| `milestone-chat-context.test.ts` | Chat context assembly for milestone conversations |
| `parse-keywords.test.ts` | Keyword extraction for FTS query construction |
| `pipeline.test.ts` | End-to-end batch pipeline (`processNewMeetings`) |
| `query.test.ts` | Search query parsing and normalization |
| `timelines.test.ts` | Milestone timelines, mentions, and slippage detection |

### Responsive UI Tests

Tests for the responsive layout system (Phase 1). Located in `ui/` and `e2e/`.

| File | Purpose |
|------|---------|
| `ui/responsive-shell.test.tsx` | `ResponsiveShell` layout delegation per viewport |
| `ui/bottom-tab-bar.test.tsx` | `BottomTabBar` navigation items and callbacks |
| `ui/breadcrumb-bar.test.tsx` | `BreadcrumbBar` rendering and navigation |
| `ui/bottom-sheet.test.tsx` | `BottomSheet` slide-up and Dialog fallback |
| `ui/responsive-dialog.test.tsx` | Viewport-adaptive dialog rendering |
| `ui/use-breakpoint.test.tsx` | Breakpoint hook tier detection |
| `ui/mobile-nav.test.tsx` | Mobile navigation context and transitions |
| `ui/workspace-banner-mobile.test.tsx` | Compact mobile banner mode |
| `ui/list-item-row-mobile.test.tsx` | Touch target and MeetingAvatar |
| `ui/mobile-detail-components.test.tsx` | show-more and chat-fab components |
| `e2e/responsive-meetings.spec.ts` | Cross-viewport meetings view E2E |

## Related

- Parent: [Root gather](../gather.md)
- [gather.md](gather.md)
