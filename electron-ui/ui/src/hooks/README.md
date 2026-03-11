# hooks/ — React data and feature hooks

Custom hooks that encapsulate data fetching and feature-level state. They fall into two categories: simple query hooks that are thin wrappers around `useQuery`, and stateful feature hooks that combine `useState`, `useQuery`, `useQueryClient`, and `useCallback` into a self-contained state machine consumed by a page component.

## Files

### Simple query hooks

| File | Purpose |
|------|---------|
| `useArtifact.ts` | Fetches a single meeting artifact by `meetingId`; disabled when `meetingId` is undefined |
| `useArtifactSearch.ts` | Pure client-side artifact search — tokenizes a query string and counts keyword matches per artifact section; also exports `computeArtifactMatches` for use outside React |
| `useClients.ts` | Fetches the list of all client names; no arguments |
| `useDeepSearch.ts` | Fetches LLM-scored deep search results for a list of meeting IDs and a query; enabled only when the hybrid search above it has returned results |
| `useMeetings.ts` | Fetches meetings with optional `MeetingFilters` (client, after, before) |
| `useSearch.ts` | Fetches hybrid (vector + FTS) search results for a query string; enabled when query length ≥ 2; 60-second stale time |

### Stateful feature hooks

| File | Purpose |
|------|---------|
| `useMeetingState.ts` | The largest hook — manages all meetings-view state: selection, multi-check, search/deep-search orchestration, artifact queries, completions, action item handlers, delete confirmation, re-extraction, client reassignment, new meeting creation, and cross-view navigation |
| `useThreadState.ts` | Manages thread list, selected thread, candidate discovery and evaluation, thread meeting management, thread summary regeneration, and thread chat message history |
| `useInsightState.ts` | Manages insight list, selected insight, insight generation, RAG/status updates, insight meeting management, and insight chat |
| `useMilestoneState.ts` | Manages milestone list, selected milestone, mention confirm/reject, milestone merging, action item linking, date slippage queries, and milestone chat |

## Key Concepts

**`useMeetingState` search pipeline:** The hook chains two queries — `useSearch` (hybrid semantic search returning meeting IDs) followed by `useDeepSearch` (LLM re-ranking of those IDs). When deep search returns results, the meeting list is filtered to that set. When deep search returns empty, the list shows nothing. When deep search errors, a toast is shown and the search gracefully degrades to hybrid results.

**Multi-select and artifact merging:** When ≥2 meetings are checked, `useMeetingState` issues parallel `useQueries` for all checked artifacts and passes them to `mergeArtifactsDeduped` and `computeActionItemOrigins`. Completion mutations then resolve the merged item index back to the correct origin meeting via `actionItemOrigins`.

**Stateful feature hooks are consumed by pages, not components.** `App.tsx` instantiates one of each and passes slices of the returned state down to page components as props.

## Related

- Parent: [../README.md](../README.md)
- Consumers: `../App.tsx`, `../pages/`
- `mergeArtifactsDeduped`: `../lib/merge-artifacts.ts`
