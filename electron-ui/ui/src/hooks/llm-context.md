# hooks/ — React data and feature hooks

Custom hooks that encapsulate data fetching and feature-level state. They fall into two categories: simple query hooks that are thin wrappers around `useQuery`, and stateful feature hooks that combine `useState`, `useQuery`, `useQueryClient`, and `useCallback` into a self-contained state machine consumed by a page component.

## Files

### Responsive hooks

| File | Purpose |
|------|---------|
| `useBreakpoint.ts` | Returns `"mobile"` / `"tablet"` / `"desktop"` based on `window.innerWidth` breakpoints; drives conditional rendering throughout the responsive layout |
| `useMobileNav.ts` | React context and provider for mobile navigation state — exposes `goToDetail`, `goToChat`, `goToList`, and an `isMobile` flag consumed by `ResponsiveShell` and child views |

### Simple query hooks

| File | Purpose |
|------|---------|
| `useArtifact.ts` | Fetches a single meeting artifact by `meetingId`; disabled when `meetingId` is undefined |
| `useArtifactSearch.ts` | Pure client-side artifact search — tokenizes a query string and counts keyword matches per artifact section; also exports `computeArtifactMatches` for use outside React |
| `useClients.ts` | Fetches the list of all client names; no arguments |
| `useDeepSearch.ts` | Fetches LLM-scored deep search results for a list of meeting IDs and a query; enabled only when the hybrid search above it has returned results |
| `useMeetings.ts` | Fetches meetings with optional `MeetingFilters` (client, after, before) |
| `useSearch.ts` | Fetches hybrid (vector + FTS) search results for a query string; enabled when query length ≥ 2; 60-second stale time |
| `useArtifactBatch.ts` | Fetches artifacts for multiple meeting IDs in a single batch call; keyed by sorted ID list; 120-second stale time; used by search results to enrich displayed data |
| `useSelectedResultData.ts` | Composite query hook that fetches artifact, completions, assets, thread tags, milestone tags, and notes count for a single selected meeting; used by SearchPage detail panel |

### Stateful feature hooks

| File | Purpose |
|------|---------|
| `useMeetingState.ts` | The largest hook — manages all meetings-view state: selection, multi-check, search/deep-search orchestration, artifact queries, completions, action item handlers, delete confirmation, re-extraction, client reassignment, action item editing, new meeting creation, and cross-view navigation |
| `useThreadState.ts` | Manages thread list, selected thread, candidate discovery and evaluation, thread meeting management, thread summary regeneration, and thread chat message history |
| `useInsightState.ts` | Manages insight list, selected insight, insight generation, RAG/status updates, insight meeting management, and insight chat |
| `useMilestoneState.ts` | Manages milestone list, selected milestone, mention confirm/reject, milestone merging, action item linking, date slippage queries, and milestone chat |
| `useNotesState.ts` | Manages notes dialog state (list/compose/edit modes), note CRUD via `window.api.notes*`, delete confirmation, and toast feedback; generic across meeting, insight, milestone, and thread object types |
| `useSearchState.ts` | Full search view state machine — manages query text, field filters, date range, deep search toggle, grouping, sorting, result enrichment (artifact batch + matched sections), display limit pagination, and chat context assembly |
| `useDensity.ts` | Reads/writes density preference (`comfortable`/`compact`/`dense`) to localStorage; returns `[mode, setMode]` tuple consumed by App.tsx and passed to all list views |
| `useSystemHealth.ts` | Polls `window.api.getHealth()` every 30 seconds (`refetchInterval: 30_000`, `staleTime: 15_000`, `refetchOnWindowFocus: true`). Returns `{ health, isLoading, isError, acknowledgeAll, acknowledgeErrors }`. `acknowledgeAll` calls `window.api.acknowledgeHealthErrors(undefined)` then invalidates the query; `acknowledgeErrors(ids)` calls with the given ID array. Both functions call the API synchronously (before any await) so test assertions work without async wrapping. |
| `useDeleteConfirmation.ts` | Generic two-step delete confirmation pattern — `requestDelete(id)` opens the dialog, `confirmDelete()` executes the callback, `cancelDelete()` dismisses; used by threads, insights, milestones |
| `useClearMessages.ts` | Generic two-step clear confirmation for chat message history — `requestClear()` opens dialog, `confirmClear()` executes the callback; used by thread, insight, milestone, and meeting chat panels |
| `useMeetingSelection.ts` | Manages meeting selection state — single-select (`selectedMeetingId`), multi-check (`checkedMeetingIds` Set), and preview meeting ID; extracted from `useMeetingState` for reuse across views |
| `useSearchScope.ts` | Chains `useSearch` (hybrid) and `useDeepSearch` (LLM re-ranking) into a single scope; applies deep search results to filter the visible meeting list; handles error fallback with toast |

## Key Concepts

**`useBreakpoint` is the responsive layout driver.** It determines the current viewport tier and is consumed by `ResponsiveShell`, `BottomTabBar`, `responsive-dialog`, and any component that adapts its rendering per viewport. `useMobileNav` provides imperative navigation within the mobile single-stack layout (list -> detail -> chat transitions).

**`useMeetingState` search pipeline:** The hook chains two queries — `useSearch` (hybrid semantic search returning meeting IDs) followed by `useDeepSearch` (LLM re-ranking of those IDs). When deep search returns results, the meeting list is filtered to that set. When deep search returns empty, the list shows nothing. When deep search errors, a toast is shown and the search gracefully degrades to hybrid results.

**Multi-select and artifact merging:** When ≥2 meetings are checked, `useMeetingState` issues parallel `useQueries` for all checked artifacts and passes them to `mergeArtifactsDeduped` and `computeActionItemOrigins`. Completion mutations then resolve the merged item index back to the correct origin meeting via `actionItemOrigins`.

**Stateful feature hooks are consumed by pages, not components.** `App.tsx` instantiates one of each and passes slices of the returned state down to page components as props.

## Related

- Parent: [../llm-context-summary.md](../llm-context-summary.md)
- Consumers: `../App.tsx`, `../pages/`
- `mergeArtifactsDeduped`: `../lib/merge-artifacts.ts`
