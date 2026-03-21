# Architecture Refactoring
## Ketchup Plan

---

# 0. SYSTEM GOAL

Eliminate code duplication, improve SOLID compliance, and increase extensibility across the codebase. Driven by a comprehensive code review that identified DRY violations in React hooks (4x delete/clear patterns), CLI tools (duplicated utilities), and core modules (vector search filters). Also addresses SRP violations in `useMeetingState` (690 lines) and `pipeline.ts` (14 imports, 76-line orchestrator), plus type safety gaps (missing Zod validation, `tsconfig.json` excluding `api/` and `cli/`).

This plan follows **The Ketchup Technique**. Each Burst is atomic: one test, one behavior, one commit.

---

# CODE REVIEW REFERENCE

Full review: `.claude/plans/crystalline-finding-platypus.md`

### Key Findings Addressed

| Finding | Severity | Section |
|---------|----------|---------|
| React hook duplication (delete, clear, invalidation) | HIGH | 1 |
| CLI tool duplication (buildLabeledContext, config) | HIGH | 2 |
| `tsconfig.json` excludes `api/`, `cli/` | HIGH | 3 |
| Vector search filter duplication (4 modules) | MEDIUM | 4 |
| `useMeetingState` SRP violation (690 lines) | MEDIUM | 5 |
| `pipeline.ts:processEntry()` SRP violation | MEDIUM | 6 |
| No Zod validation (extractor, API) | MEDIUM | 7 |
| No typed error hierarchy | MEDIUM | 8 |
| API client error normalization | MEDIUM | 9 |
| Row-to-object converter duplication | LOW | 10 |

### Findings Deferred (long-term, lower ROI)

| Finding | Reason |
|---------|--------|
| View registry pattern | Major refactor, current approach works for 5 views |
| Migration file pattern | `migrate()` is stable, low churn |
| Clustering strategy interface | Only one algorithm in use |
| Pipeline step registry | Depends on pipeline decomposition (Section 6) |
| LLM adapter registry pattern | Current factory works for 6 providers |

---

# PLANNING RULES

1. Bursts are ordered within sections. Sections are independent unless noted.
2. Each burst = one failing test -> minimal code -> TCR.
3. Plan updates go in the same commit as code.
4. Infrastructure commits (config, tsconfig) need no tests.
5. **Refactoring bursts must not change behavior.** All existing tests must continue passing after each burst.
6. **Backward compatibility within burst:** Callers updated in same burst as extraction. No dangling imports.

---

# BURSTS

## TODO

### SECTION 1: Extract Shared React Hooks (~8 bursts)

> **Spec:**
> Extract duplicated patterns from `useMeetingState`, `useThreadState`, `useInsightState`, and `useMilestoneState` into reusable hooks.
>
> **Patterns to extract:**
> - `useDeleteConfirmation(onDelete, entityName)` — manages `pendingDeleteId`, confirmation dialog state, async delete + invalidation + toast
> - `useClearMessages(onClear)` — manages clear confirmation + async clear + invalidation + toast
> - `useQueryInvalidation(queryClient, selectedClient)` — helper for scoped invalidation
>
> **Files affected:** `electron-ui/ui/src/hooks/useDeleteConfirmation.ts` (NEW), `electron-ui/ui/src/hooks/useClearMessages.ts` (NEW), `electron-ui/ui/src/hooks/useMeetingState.ts`, `electron-ui/ui/src/hooks/useThreadState.ts`, `electron-ui/ui/src/hooks/useInsightState.ts`, `electron-ui/ui/src/hooks/useMilestoneState.ts`
>
> **Constraint:** All existing tests must pass after each burst without modification (proves behavior preservation).

- [x] Burst 1: Create `useDeleteConfirmation` hook (8a28ce8)
- [x] Burst 2: Wire `useDeleteConfirmation` into `useInsightState` (211f613)
- [x] Burst 3: Wire `useDeleteConfirmation` into `useThreadState` (e413633)
- [x] Burst 4: Wire `useDeleteConfirmation` into `useMilestoneState` (6db3e84)
- [x] Burst 5: SKIPPED — useMeetingState uses bulk delete (string[]) with optimistic query updates, not a fit for single-ID hook
- [x] Burst 6: Create `useClearMessages` hook (120afad)
- [x] Burst 7: Wire `useClearMessages` into all 4 state hooks (37f7ac3)
- [x] Burst 8: SKIPPED — no dead code remaining after clean substitutions

### SECTION 2: Extract CLI Shared Utilities (~5 bursts)

> **Spec:**
> Eliminate duplication across `cli/query.ts`, `cli/eval.ts`, and other CLI tools by extracting shared config and utilities.
>
> **Duplicated code:**
> - `buildLabeledContext()` in both `query.ts` and `eval.ts` — already exists in `core/labeled-context.ts`
> - `parseDecisions()` duplicated in both files
> - `MeetingRow`, `ActionItem` types defined locally in both files
> - `DB_PATH`, `VECTOR_PATH`, `PROVIDER` constants repeated in every CLI tool
>
> **Files affected:** `cli/shared.ts` (NEW), `cli/query.ts`, `cli/eval.ts`, `cli/run.ts`, `cli/setup.ts`, `cli/assign-client.ts`, `cli/all-items-dedupe.ts`

- [x] Burst 9: Create `cli/shared.ts` with loadCliConfig(), types, parseDecisions() (40a726d)
- [x] Burst 10: Replace local config constants in all 7 CLI tools (5605f8b)
- [x] Burst 11-13: Deduplicate types, parseDecisions, buildSearchContext from query.ts and eval.ts (07a6698)

### SECTION 3: Fix TypeScript Build Config (~1 burst)

> **Spec:**
> Add `api/` and `cli/` to `tsconfig.json` include so type errors are caught at build time, not runtime.
>
> **Files affected:** `tsconfig.json`

- [x] Burst 14: Add api/**/* and cli/**/* to tsconfig.json include, fix stale architecture refs (591b7ce)

### SECTION 4: Centralize Vector Search (~4 bursts)

> **Spec:**
> Extract duplicated vector search filter-building logic from 4 modules into a shared helper in `vector-db.ts`.
>
> **Duplicated in:** `vector-search.ts:32-41`, `feature-embedding.ts:54-55`, `item-dedup.ts:64-65`, `context.ts:43-44`
>
> **Files affected:** `core/vector-db.ts`, `core/vector-search.ts`, `core/feature-embedding.ts`, `core/item-dedup.ts`, `core/context.ts`

- [x] Burst 15: Add searchWithFilters() to core/vector-db.ts (97399f5)
- [x] Burst 16-18: Replace filter logic in vector-search.ts, item-dedup.ts, context.ts (ebc38f8). feature-embedding.ts skipped (no filters to extract).

### SECTION 5: Split `useMeetingState` (~6 bursts)

> **Spec:**
> Decompose the 690-line `useMeetingState` hook into focused sub-hooks following SRP.
>
> **Target decomposition:**
> - `useMeetingSelection` — selectedMeetingId, previewMeetingId, checkedMeetingIds state
> - `useMeetingQueries` — all React Query hooks (artifact, completions, history, search)
> - `useMeetingMutations` — all API call handlers (create, delete, reassign, ignore, extract, etc.)
> - `useSearchScope` — hybrid search + deep search logic
> - `useMeetingState` becomes a thin composer that calls the 4 sub-hooks and returns the combined interface
>
> **Files affected:** `electron-ui/ui/src/hooks/useMeetingSelection.ts` (NEW), `electron-ui/ui/src/hooks/useMeetingQueries.ts` (NEW), `electron-ui/ui/src/hooks/useMeetingMutations.ts` (NEW), `electron-ui/ui/src/hooks/useSearchScope.ts` (NEW), `electron-ui/ui/src/hooks/useMeetingState.ts`
>
> **Constraint:** `useMeetingState` return type must remain identical. Zero changes to callers.

- [ ] Burst 19: Extract `useMeetingSelection` — manages selectedMeetingId, previewMeetingId, checkedMeetingIds, setters, bulk check/uncheck
- [ ] Burst 20: Extract `useSearchScope` — manages searchQuery, searchScores, deepSearchResults, hybrid search trigger, deep search trigger
- [ ] Burst 21: Extract `useMeetingQueries` — all React Query useQuery calls (artifact, completions, history, meetings list)
- [ ] Burst 22: Extract `useMeetingMutations` — all handler functions (create, delete, reassign, ignore, extract, complete, etc.)
- [ ] Burst 23: Rewrite `useMeetingState` as thin composer — calls 4 sub-hooks + `useDeleteConfirmation` + `useClearMessages`, returns same interface
- [ ] Burst 24: Delete dead code from `useMeetingState` — verify no inline logic remains, all tests pass unchanged

### SECTION 6: Decompose `pipeline.ts:processEntry()` (~5 bursts)

> **Spec:**
> Break the 76-line `processEntry()` into focused step functions. Each step receives its dependencies as parameters (DIP).
>
> **Target decomposition:**
> - `parseAndIngest(db, filePath)` — parse transcript, ingest meeting, return meetingId
> - `detectAndExtract(db, llm, meetingId)` — client detection + artifact extraction with refinement
> - `embedAndIndex(db, vectorDb, embedder, meetingId)` — embed meeting + build FTS index
> - `threadAndDedup(db, vectorDb, llm, meetingId)` — thread assignment + milestone reconciliation + item dedup
> - `processEntry()` becomes a thin orchestrator calling the 4 steps in sequence
>
> **Files affected:** `core/pipeline.ts`
>
> **Constraint:** All pipeline tests must pass unchanged. Event emission behavior preserved.

- [ ] Burst 25: Extract `parseAndIngest()` step function — accepts db + filePath, returns meetingId + parsed data
- [ ] Burst 26: Extract `detectAndExtract()` step function — accepts db + llm + meetingId, handles client detection + extraction
- [ ] Burst 27: Extract `embedAndIndex()` step function — accepts db + vectorDb + embedder + meetingId, handles embedding + FTS
- [ ] Burst 28: Extract `threadAndDedup()` step function — accepts db + vectorDb + llm + meetingId, handles threading + dedup
- [ ] Burst 29: Rewrite `processEntry()` as thin orchestrator — calls 4 steps in sequence, emits same events, all pipeline tests pass

### SECTION 7: Add Zod Validation (~5 bursts)

> **Spec:**
> Replace manual JSON validation in `extractor.ts` and add request validation to API routes using Zod schemas.
>
> **Files affected:** `core/extractor.ts`, `api/routes/meetings.ts`, `api/routes/threads.ts`, `api/routes/notes.ts`, `api/routes/insights.ts`, `api/routes/milestones.ts`
>
> **Note:** Zod must be added as a dependency.

- [ ] Burst 30: Add `zod` dependency — `pnpm add zod` [infra]
- [ ] Burst 31: Create `core/schemas.ts` — Zod schemas for `Artifact`, `ActionItem`, `Decision`, `Question`, `Risk` replacing manual validation in `extractor.ts`
- [ ] Burst 32: Replace `validateArtifact()` in `extractor.ts` with Zod `.safeParse()` — verify all extractor tests pass unchanged
- [ ] Burst 33: Add request schemas to API routes — `CreateMeetingSchema`, `EditActionItemSchema`, `CreateThreadSchema`, etc.
- [ ] Burst 34: Wire request validation into API route handlers — parse with `.safeParse()`, return 400 on failure with structured error

### SECTION 8: Typed Error Hierarchy (~3 bursts)

> **Spec:**
> Create a typed error hierarchy to replace plain `Error` throws with codes and context.
>
> **Files affected:** `core/errors.ts` (NEW), `core/extractor.ts`, `core/llm-adapter.ts`, `core/pipeline.ts`

- [ ] Burst 35: Create `core/errors.ts` — `AppError` base class with `code` and `context` fields, plus subclasses: `ExtractionError`, `LlmError`, `ValidationError`, `PipelineError`
- [ ] Burst 36: Replace `throw new Error(...)` in `extractor.ts` and `llm-adapter.ts` with typed errors — verify all tests pass (update error message assertions if needed)
- [ ] Burst 37: Replace `throw new Error(...)` in `pipeline.ts` with typed errors — verify all pipeline tests pass

### SECTION 9: Standardize API Client Error Handling (~3 bursts)

> **Spec:**
> Create a `fetchJson()` wrapper for API client to normalize error handling across all endpoints. Add AbortController support.
>
> **Files affected:** `electron-ui/ui/src/api-client/base.ts` (NEW or modified), all `api-client/*.ts` files

- [ ] Burst 38: Create `fetchJson()` utility in `api-client/base.ts` — wraps fetch with error normalization, returns typed JSON, accepts AbortSignal
- [ ] Burst 39: Replace raw `fetch()` calls in all `api-client/` modules with `fetchJson()` — verify all UI tests pass unchanged
- [ ] Burst 40: Add AbortController to chat/streaming endpoints — cancel pending requests on component unmount

### SECTION 10: Row-to-Object Converter Cleanup (~2 bursts)

> **Spec:**
> Replace duplicated `rowToThread()`, `rowToInsight()` patterns with validated converters using Zod schemas from Section 7.
>
> **Files affected:** `core/threads.ts`, `core/insights.ts`, `core/timelines.ts`
>
> **Depends on:** Section 7 (Zod schemas)

- [ ] Burst 41: Create Zod schemas for `Thread`, `Insight`, `Milestone` row types in `core/schemas.ts` — validate status enums at parse time
- [ ] Burst 42: Replace `rowToThread()`, `rowToInsight()`, `rowToMilestone()` with Zod-validated converters — unsafe `as` casts eliminated

## DONE
