# Ketchup Plan: Advanced Search

## Context

The current search bar in TopBar filters the meeting list in-place via `useSearchScope`. Users need a dedicated search view with field scoping, richer result presentation, chat across results, and the ability to save searches as threads.

**Design artboards:** `Dev Comp: Search Results Components` (FINAL approved component designs), `Search Results — Option D: Form + Results (chat 40%)` (full-page reference)

**Key existing code:**
- `useSearchScope.ts` — composes `useSearch()` + `useDeepSearch()` for meetings view in-place filtering. Stays untouched. Search view uses its own independent `useSearchState` hook with distinct query key prefixes (`["searchView", ...]`) to avoid cache collisions.
- `useSearch.ts` / `useDeepSearch.ts` — existing hooks hardcode query keys (`["search", ...]`, `["deepSearch", ...]`). **Hook modification strategy:** add optional `keyPrefix?: string` param to both hooks. When provided, prefixes the query key (e.g. `["searchView-search", ...]`). Default remains unchanged so meetings view call sites (`useSearchScope`) are unaffected. `searchFields` added as optional param to `useSearch` only — meetings view passes nothing (omitted = search all fields).
- `buildDistilledContext()` in `labeled-context.ts` — already does artifact-only context without transcripts. Section #1 extends this, not duplicates it.
- `hybridSearch()` in `hybrid-search.ts` — currently accepts `{ limit, client?, maxDistance? }` but NOT date filters. Must be modified.
- `SearchResultRow` in `channels.ts` — currently `{ meeting_id, score, client, meeting_type, date }`. Must be extended with `cluster_tags: string[]` and `series: string` for card rendering and series grouping. These fields are populated by the handler via DB lookup (same pattern as `MeetingRow` thread_tags enrichment).
- `CreateThreadDialog` — currently creates thread only, does NOT auto-link meetings. Must accept optional `initialMeetingIds` prop and call `addThreadMeeting` for each after creation.
- Dual wiring pattern: every new endpoint/param needs types in `channels.ts`, IPC handler in `preload.ts`, AND HTTP client in `api-client.ts`.

## Dependency Graph & Parallelization

```
              #1 Context Backend ──────────────┐
              (Bursts 1-5)                     │
                                               ▼
              #2 Field-Scoped API ─────────► #8 Page Assembly & Chat
              (Bursts 6-13)                  (Bursts 46-53)
                    │                          ▲        ▲
                    │                          │        │
              #3 View Wiring ──────────────────┘        │
              (Bursts 14-17)                            │
                    │                                   │
                    ▼                                   │
              #4 Search State Hook ────────────────────►│
              (Bursts 18-25)                            │
                    │                                   │
           ┌────────┼────────┐                          │
           ▼        ▼        ▼                          │
     #5 Form UI  #6 Card UI  #7 Results List ──────────┘
     (26-31)     (32-38)     (39-45)

              #8 Page Assembly ─────────► #9 Detail Open
              (Bursts 46-53)              (Bursts 54-58)
                                               │
                                               ▼
                                          #10 Polish
                                          (Bursts 59-62)
                                               │
                                               ▼
                                          #11 Regression
                                          (Bursts 63-67)
                                               │
                                               ▼
                                          #12 Integration
                                          (Bursts 68-71)
```

**Parallel lanes:**

| Lane | Sections | Can run simultaneously |
|---|---|---|
| **Backend** | #1 (Context) + #2 (API, bursts 6-8 only) | Yes — no shared files. Both are `core/` and `api/` changes. Note: #2 bursts 9-10 (hook modifications) touch `hooks/useSearch.ts` and `hooks/useDeepSearch.ts` — these must complete before #4 starts. |
| **Shell** | #3 (View Wiring) | Depends on nothing. Can start immediately. |
| **State** | #4 (Hook) | Depends on #2 (needs batch endpoint + searchFields API + modified hooks) and #3 (needs View type). |
| **UI Components** | #5 (Form) + #6 (Card) + #7 (List, bursts 39-42) | All three can run in parallel after #4. No shared files between them. Note: #7 burst 43 (CreateThreadDialog) touches a shared component — run after #5/#6 complete to avoid conflicts. |
| **Assembly** | #8 (Page + Chat) | Depends on #1, #3, #4, #5, #6, #7 — all components + backend must exist. |
| **Detail** | #9 (Detail Open) | Depends on #8 (page must be assembled first). |
| **Polish** | #10, #11, #12 | Sequential after #9. |

**Subagent execution plan:**

Phase 1 (parallel — 3 agents):
- Agent A: Section #1 (Context Backend) — `core/labeled-context.ts`, `config/system.json`
- Agent B: Section #2 bursts 6-8 (API infra) — `core/fts.ts`, `core/hybrid-search.ts`, `api/routes/`, `channels.ts`
- Agent C: Section #3 (View Wiring) — `App.tsx`, `NavRail.tsx`, `BottomTabBar.tsx`, `ResponsiveShell.tsx`

Phase 1b (sequential, after Agent B):
- Section #2 bursts 9-13 (hook mods + FTS migration) — `hooks/useSearch.ts`, `hooks/useDeepSearch.ts`, `core/fts.ts`

Phase 2 (sequential):
- Section #4 (Search State Hook) — depends on #2 (batch endpoint + modified hooks) + #3 (View type)

Phase 3 (parallel — 3 agents):
- Agent D: Section #5 (Search Form UI)
- Agent E: Section #6 (Result Card UI)
- Agent F: Section #7 bursts 39-42 (Results List + Pagination)

Phase 3b (sequential, after Agent F):
- Section #7 bursts 43-45 (CreateThreadDialog mod + Save as Thread + E2E)

Phase 4 (sequential):
- Section #8 (Page Assembly + Chat) — wires everything together
- Section #9 (Detail Open State)

Phase 5 (sequential):
- Section #10 (Polish + Accessibility)
- Section #11 (Regression Guards)
- Section #12 (Integration Wiring + End-to-End)

**What doesn't change:**
- Meetings view in-place filtering via `useSearchScope` continues to work as-is
- Meetings/threads/insights/timelines views use `buildLabeledContext` with full context (not distilled)
- TopBar typing still filters meetings list in real-time in meetings view
- Existing chat behavior for all non-search views is preserved

---

### #1 — Search Context Backend (extend distilled context for multi-meeting chat)

> **Spec:**
> Extend existing `buildDistilledContext` with maxChars budgeting and relevance annotations. Wire `contextMode` through the full IPC + HTTP stack.
>
> - `buildDistilledContext()` already exists in `core/labeled-context.ts` (line ~110). It produces artifact-only context without transcripts. The delta:
>   - New optional `maxChars` param: when provided, allocates per-meeting budget = `maxChars / meetingIds.length`. Truncates each meeting's labeled block to fit.
>   - New optional `relevanceSummaries: Map<string, string>` param: when provided, prepends `Relevance: <summary>` line to each meeting's block
>   - Return shape unchanged: `{ contextText: string, charCount: number, meetings: string[] }`
> - New optional field `contextMode?: "full" | "distilled"` on `ConversationChatRequest`:
>   - Types: `electron-ui/electron/channels.ts` — add to `ConversationChatRequest` interface
>   - IPC handler: `electron-ui/electron/handlers/search.ts` `handleConversationChat` — when `contextMode === "distilled"`, call `buildDistilledContext` with maxChars + relevanceSummaries
>   - HTTP client: `electron-ui/ui/src/api-client.ts` — pass `contextMode` through to `POST /api/chat/conversation`
>   - API route: `api/routes/search.ts` — accept `contextMode` from request body, pass to handler
> - Add `displayLimit` (default 20) and `chatContextLimit` (default 10) to `config/system.json`, export from `electron-ui/electron/handlers/config.ts`
>
> **Existing behavior preserved:** All non-search views continue calling `buildLabeledContext` (full context with transcripts). `contextMode` defaults to `"full"` when omitted.
>
> **Error handling:** If `buildDistilledContext` fails for a meeting (missing artifact), skip that meeting and log warning. Never crash the chat request.
>
> **Files affected/created:** `core/labeled-context.ts`, `electron-ui/electron/channels.ts`, `electron-ui/electron/handlers/search.ts`, `electron-ui/ui/src/api-client.ts`, `api/routes/search.ts`, `config/system.json`, `electron-ui/electron/handlers/config.ts`, `test/labeled-context.test.ts`

- [x] Burst 1: Extend `buildDistilledContext` with `maxChars` budget — per-meeting allocation scales inversely with count, truncates blocks to fit
- [x] Burst 2: Extend `buildDistilledContext` with `relevanceSummaries` map — prepends relevance line per meeting when provided
- [x] Burst 3: `contextMode` on `ConversationChatRequest` — wire through channels.ts types + IPC handler + api-client.ts HTTP + API route
- [x] Burst 4: Add `displayLimit` (20) and `chatContextLimit` (10) to `config/system.json` + export from `config.ts`
- [x] Burst 5: Error handling — skip meetings with missing artifacts, log warning, test with mix of valid and stale meeting IDs

---

### #2 — Field-Scoped Search API (search within specific artifact sections)

> **Spec:**
> Extend search infrastructure so users can restrict which artifact fields are searched. Fix missing date filter passthrough (requires modifying `HybridSearchOptions`, not just the route). Extend `SearchResultRow` with metadata for cards.
>
> - **Date filter fix** — NOT a one-line fix:
>   - `hybrid-search.ts`: Add `date_after?: string` and `date_before?: string` to `HybridSearchOptions` interface
>   - `hybrid-search.ts`: Pass date filters through to `searchMeetingsByVector()` call (which already supports them via `SearchFilters`)
>   - `api/routes/search.ts`: Read `date_after`, `date_before` from query params and pass to `hybridSearch()`
>   - `electron-ui/ui/src/api-client.ts`: Pass date params in HTTP `GET /api/search` query string
> - **`SearchResultRow` enrichment:**
>   - Add `cluster_tags: string[]` and `series: string` to `SearchResultRow` in `channels.ts`
>   - In `handleSearchMeetings`: after hybrid search, enrich each result with cluster tags (from `meeting_clusters` + `clusters` tables) and series (from `meetings` table). Same DB-enrichment pattern used for `MeetingRow.thread_tags`.
> - **Batch artifact endpoint:**
>   - New `POST /api/artifacts/batch` in `api/routes/meetings.ts`: accepts `{ meetingIds: string[] }`, returns `Record<string, ArtifactRow | null>`
>   - Wire through: `channels.ts` type `artifactBatch`, IPC handler `handleArtifactBatch`, `api-client.ts` HTTP method `window.api.artifactBatch(ids)`
> - **Field-scoped FTS:**
>   - Modify `populateFts()` in `core/fts.ts`: tag content by field when building index: `[summary] text... [decisions] text... [action_items] text...`
>   - New `searchFields` param on `GET /api/search`: comma-separated field names. Post-filter FTS matches to only include results where match came from a tagged section.
>   - **Migration required:** changing FTS content format means all existing entries must be rebuilt. Add a `populateFts(db)` call in the migration step.
> - **`useSearch` hook modification:**
>   - Add optional `searchFields?: string[]` param and optional `keyPrefix?: string` param to `useSearch`
>   - When `searchFields` provided, append `&searchFields=summary,decisions,...` to API call
>   - When `keyPrefix` provided, use `[keyPrefix, query, ...]` instead of `["search", query, ...]`
>   - Existing call sites (e.g. `useSearchScope`) pass neither param — behavior unchanged
> - **`useDeepSearch` hook modification:**
>   - Add optional `keyPrefix?: string` param to `useDeepSearch`
>   - Existing call sites pass nothing — behavior unchanged
>
> **Error handling:** `POST /api/artifacts/batch` with stale/deleted meeting IDs returns `null` for those entries (not 404). Client handles gracefully.
>
> **Files affected/created:** `core/hybrid-search.ts`, `api/routes/search.ts`, `api/routes/meetings.ts`, `core/fts.ts`, `electron-ui/electron/channels.ts`, `electron-ui/electron/handlers/search.ts`, `electron-ui/ui/src/api-client.ts`, `electron-ui/ui/src/hooks/useSearch.ts`, `electron-ui/ui/src/hooks/useDeepSearch.ts`, `test/fts.test.ts`, `test/hybrid-search.test.ts`, `test/search-handler.test.ts`

- [x] Burst 6: `HybridSearchOptions` — add `date_after`/`date_before`, pass through to `searchMeetingsByVector`, wire route + api-client
- [x] Burst 7: `SearchResultRow` enrichment — add `cluster_tags` + `series` fields, populate in handler via DB lookup
- [x] Burst 8: `POST /api/artifacts/batch` — endpoint + IPC handler + channels.ts type + api-client.ts HTTP method
- [x] Burst 9: `useSearch` hook — add optional `keyPrefix` + `searchFields` params, backward-compatible (existing callers unaffected)
- [x] Burst 10: `useDeepSearch` hook — add optional `keyPrefix` param, backward-compatible
- [x] Burst 11: Field-tagged FTS — modify `populateFts()` to prefix content with `[field]` tags per section
- [x] Burst 12: FTS migration — rebuild all FTS entries with field tags, add migration version check
- [x] Burst 13: `searchFields` param on `GET /api/search` — post-filter FTS results to matched fields, wire through api-client

---

### #3 — View Type & Navigation Wiring (add "search" to the app shell)

> **Spec:**
> Register the search view in the app shell. Wire TopBar quick search to navigate. Define the dual behavior: typing filters in-place (meetings view), Enter navigates to search view.
>
> - Add `"search"` to the `View` union type in: `App.tsx`, `NavRail.tsx`, `BottomTabBar.tsx`, `ResponsiveShell.tsx`, `BreadcrumbBar.tsx`
> - NavRail: add `{ view: "search", label: "Search", Icon: Search }` to ITEMS array (lucide `Search` icon). Active state: orange icon + text.
> - BottomTabBar: add Search tab for mobile.
> - ResponsiveShell VIEW_LABELS: add `search: "Search"`.
> - **TopBar dual behavior (critical design decision):**
>   - **In meetings view:** Typing in TopBar search bar still filters meetings in-place via existing `useSearchScope`. No change.
>   - **Enter key:** Navigates to search view with query pre-filled in SearchForm. The TopBar search input clears (search lives in the SearchForm now).
>   - This is NOT hijacking Enter — the meetings view never used Enter for anything. Enter is a new action: "take this to full search."
> - Result "Open" click: calls `setCurrentView("meetings")` + `meeting.setSelectedMeetingId(id)`.
>
> **Existing behavior preserved:** Meetings view real-time filtering via typing in TopBar continues to work. No change to `useSearchScope` or `useMeetingState.searchQuery`.
>
> **User interactions:**
> - Click Search icon in NavRail → navigates to search view (empty form)
> - Type in TopBar (meetings view) → filters meeting list in-place (existing behavior)
> - Press Enter in TopBar → navigates to search view with query pre-filled
> - Click "Open" on result card → navigates to meetings view with that meeting selected
>
> **Design artboard:** `Search Results — Option D` (nav rail with Search icon active in orange)
> **Files affected/created:** `electron-ui/ui/src/App.tsx`, `electron-ui/ui/src/components/NavRail.tsx`, `electron-ui/ui/src/components/BottomTabBar.tsx`, `electron-ui/ui/src/components/ResponsiveShell.tsx`, `electron-ui/ui/src/components/BreadcrumbBar.tsx`, `test/ui/nav-rail.test.tsx`

- [x] Burst 14: Extend `View` type with `"search"` across all 5 files
- [x] Burst 15: NavRail search icon + BottomTabBar + BreadcrumbBar entries
- [x] Burst 16: TopBar Enter → search view navigation — sets SearchForm query, preserves meetings view typing behavior
- [x] Burst 17: Result "Open" → meetings view navigation

---

### #4 — Search State Hook (manages all search view state)

> **Spec:**
> New `useSearchState` hook for the search view. Independent from `useSearchScope` (meetings view). Uses distinct React Query key prefix `"searchView"` to avoid cache collisions.
>
> - New file `electron-ui/ui/src/hooks/useSearchState.ts`
> - **Boundary with existing code:** `useSearchScope` stays untouched for meetings view. `useSearchState` is search-view only. Query keys: `["searchView-search", query, ...]` and `["searchView-deep", ...]` instead of `["search", ...]`.
> - State:
>   - `searchQuery: string`, `typedSearchQuery: string` — query text
>   - `searchFields: Set<string>` — defaults to all 7. `toggleField(field)` adds/removes.
>   - `dateAfter: string`, `dateBefore: string` — date range. Synced from TopBar date filters when entering search view.
>   - `deepSearchEnabled: boolean`
>   - `formVisible: boolean` — Hide/Show toggle
>   - `groupBy: "none" | "cluster" | "date" | "series"`
>   - `sortBy: "relevance" | "date-newest" | "date-oldest"`
>   - `checkedResultIds: Set<string>` — separate from meetings view `checkedMeetingIds`
>   - `selectedResultId: string | null` — for detail open state
> - Data fetching (uses modified hooks from Section #2):
>   - `useSearch(searchQuery, selectedClient, dateAfter, dateBefore, { keyPrefix: "searchView-search", searchFields: [...searchFields] })` — uses modified hook with prefix + field params
>   - `useDeepSearch(hybridMeetingIds, searchQuery, deepSearchEnabled, { keyPrefix: "searchView-deep" })` — uses modified hook with prefix. **Deep toggle is live:** toggling on immediately starts deep search using current hybrid result IDs. No re-submit needed.
>   - New `useArtifactBatch(meetingIds)` — calls `POST /api/artifacts/batch`, returns `Record<string, ArtifactRow | null>`
> - Timing: `searchDurationMs` — set `Date.now()` on submit, compute delta when results arrive. Used by results header `"in {time}s"`.
> - Derived:
>   - `enrichedResults[]` — search results + artifact data. Each result includes `cluster_tags` and `series` from enriched `SearchResultRow` (Section #2). **Query-to-item matching:** for each artifact section, check which items contain query terms (case-insensitive substring match). Items that match float to top of their section. Non-matching items still available via "+N more" expand.
>   - `displayScore: number` — normalized to 0–1 for all cards. When deep search active: `relevanceScore / 100`. When hybrid only: min-max normalize RRF scores across current results to 0–1 range.
>   - `chatMeetingIds: string[]` — if `checkedResultIds.size > 0`, use checked; else top-N by score (N = `chatContextLimit` from config). If `selectedResultId` is set (detail open), returns `[selectedResultId]` instead.
>   - `collapsedSummary: string` — truncation rules: all fields → "All fields"; >3 → "Summary, Decisions, +5 more"; 0 fields → "No fields selected"; empty query → "Enter a search query"
> - Accepts `selectedClient` from App.tsx (synced from TopBar client selector). Client changes re-trigger search.
> - `displayedCount` state starts at `displayLimit`, resets to `displayLimit` when `searchQuery`, `groupBy`, or `sortBy` changes.
>
> - **`EnrichedResult` type** — defined and exported from `useSearchState.ts`:
>   ```
>   { meetingId, displayScore, date, title, client, series, clusterTags,
>     artifact, matchedDecisions, matchedActionItems, matchedRisks,
>     totalDecisions, totalActionItems, totalRisks, deepSearchSummary }
>   ```
>
> **Edge cases:**
> - No results yet (initial load) → `chatMeetingIds` returns empty array → chat shows "Search to start chatting"
> - Results but none checked → top-N by score
> - All fields toggled off → show validation message, prevent search
>
> **Files affected/created:** `electron-ui/ui/src/hooks/useSearchState.ts`, `electron-ui/ui/src/hooks/useArtifactBatch.ts`, `test/ui/use-search-state.test.tsx`

- [x] Burst 18: Hook skeleton — all state variables, setters, toggleField, selectedClient prop, `searchDurationMs` timer (set on submit, computed on results arrival)
- [ ] Burst 19: Wire `useSearch` with `keyPrefix: "searchView-search"` + pass `searchFields` — distinct from meetings view cache
- [ ] Burst 20: Wire `useDeepSearch` with `keyPrefix: "searchView-deep"` — deep toggle is live (toggling on immediately starts deep search on current hybrid results, no re-submit required)
- [ ] Burst 21: `useArtifactBatch` hook — calls batch endpoint, caches by meeting ID set
- [ ] Burst 22: `enrichedResults` derivation — query-to-item matching (substring match per artifact item), matched items float to top. `displayScore`: deep active → `relevanceScore / 100`; else min-max normalize RRF scores across results to 0–1 range
- [ ] Burst 23: `chatMeetingIds` — checked override, top-N default, single-meeting when detail open, empty when no results
- [ ] Burst 24: `collapsedSummary` — truncation rules for all-fields, >3 fields, 0 fields, empty query
- [ ] Burst 25: Client sync — `selectedClient` prop re-triggers search on change

---

### #5 — Search Form UI (query input, field toggles, filters)

> **Spec:**
> `SearchForm` component. Supports expanded and collapsed states. Responsive: stacks vertically on mobile, field pills wrap.
>
> - New file `electron-ui/ui/src/components/SearchForm.tsx`
> - **Expanded state:**
>   - "Search" title left, "Hide" button right (chevron-up, `f0eeeb` bg pill)
>   - Query input: white bg, `#e0ddd8` border, search icon left, 13px Inter 500. Submit on Enter.
>   - "SEARCH IN" label (10px uppercase muted `#8a8580` tracking 0.05em) + row of toggle pills:
>     - Active: `#e67e22` bg, white text Inter 11px 600
>     - Inactive: `#ffffff` bg, `#e0ddd8` border, `#5a5650` text Inter 11px 500
>     - 7 fields: Summary, Decisions, Action Items, Risks, Features, Questions, Milestones
>   - Bottom row: `From` + date picker + `to` + date picker + flex spacer + Deep green checkbox + `Group: None ▾` dropdown + `Sort: Relevance ▾` dropdown
>   - Group options: None, Cluster, Date, Series. Sort options: Relevance, Date (newest), Date (oldest)
> - **Collapsed state:**
>   - Single row: search icon + `"query"` Inter 12px 500 + `in Field1, Field2` 11px muted + `· Deep` 11px amber (if active) + spacer + "Show" pill (chevron-down)
> - **Responsive:** On mobile (<768px), field pills wrap to 2 rows, date pickers go full width, options row stacks.
> - **Props:** all state + setters from `useSearchState`, `onSubmit()` callback
>
> **User interactions:**
> - Type query → updates `typedSearchQuery`; press Enter → calls `onSubmit()` → sets `searchQuery`
> - Click SEARCH IN pill → `toggleField()`. All-off prevented (show toast "Select at least one field").
> - Click Hide/Show → toggles `formVisible`
> - Change date/Deep/Group/Sort → updates state, re-triggers search on next Enter
>
> **Design artboard:** `Dev Comp: Search Results Components`
> - Section 1 "Search Form — Expanded": query input, SEARCH IN orange pills (active) / outline pills (inactive), From/to date pickers, Deep green checkbox, `Group: None ▾` dropdown, `Sort: Relevance ▾` dropdown, Hide button top-right
> - Section 2 "Search Form — Collapsed": single row with search icon + `"billing migration"` bold + `in Summary, Decisions` muted + `· Deep` amber + Show button right
>
> **Files affected/created:** `electron-ui/ui/src/components/SearchForm.tsx`, `test/ui/search-form.test.tsx`

- [ ] Burst 26: `SearchForm` expanded — query input, Hide button, Enter submits
- [ ] Burst 27: SEARCH IN field toggles — 7 pills, click toggles, all-off prevention toast
- [ ] Burst 28: Date pickers + options row — From/to, Deep checkbox, Group dropdown, Sort dropdown
- [ ] Burst 29: Collapsed state — renders `collapsedSummary`, Show button
- [ ] Burst 30: Responsive — mobile stacking, pill wrapping, full-width date pickers
- [ ] Burst 31: **Playwright E2E — Search Form**: NavRail → search view, type query, toggle pills, verify expand/collapse, Enter submits

---

### #6 — Result Card UI (WHY + matched artifacts, no summary)

> **Spec:**
> `SearchResultCard` component. Shows WHY (deep search only) + matched artifact highlights. No summary block, no participant footer.
>
> - New file `electron-ui/ui/src/components/SearchResultCard.tsx`
> - **Props:** `result: EnrichedResult`, `checked: boolean`, `onToggleChecked: (id) => void`, `onOpen: (id) => void`, `deepSearchSummary?: string`
> - **Header row:**
>   - Checkbox: 16px. Checked = `#e67e22` bg + white check + 3px orange left border on card. Unchecked = `#c0bab3` border.
>   - Title+date: `"Sprint Planning · Mar 12, 2026"` Space Grotesk 13px 600
>   - Tags: cluster pills from `result.clusterTags` — `#f0eeeb` bg, 9px 500 `#6b6660`
>   - Score: `result.displayScore` (0–1, normalized in `useSearchState`) — JetBrains Mono 11px 600, green gradient: 0.9+ = `#2d8a4e`, 0.8+ = `#5a9a3e`, 0.7+ = `#7a9a3e`, <0.7 = `#9aaa3e`
>   - "Open": Inter 11px 500 `#e67e22`
> - **WHY block** (conditional — only when `deepSearchSummary` exists):
>   - `#fdf8f0` bg, 2px `#e6a54a` left border, rounded right corners
>   - "WHY": Inter 10px 700 `#c17a1a` tracking 0.03em
>   - Text: Inter 11px italic `#7a6e5f`
> - **Matched artifacts** (indented 24px):
>   - Decision: amber circle-check + text Inter 11px 500 + "+N more" `#b0aaa3`
>   - Action item: gray checkbox + description Inter 11px + `Owner: name  Reporter: name  due date` muted 10px ALL ON SAME LINE + "+N more"
>   - Risk: amber warning triangle + text Inter 11px `#9a5c1a`
>   - **Query matching:** items containing query terms render first in their section. Non-matching items hidden behind "+N more".
>   - "+N more" click → expands full list with DECISIONS / ACTION ITEMS / RISKS section headers
> - **Empty artifact handling:** If a meeting has no artifact (extraction failed), show card with title+date+score only, no artifact sections. Muted text: "Artifact not available".
>
> **User interactions:**
> - Click checkbox → `onToggleChecked(id)`, orange left border appears/disappears
> - Click "Open" → `onOpen(id)`
> - Click "+N more" → toggles expanded state
>
> **Design artboard:** `Dev Comp: Search Results Components` Section 3 "Results Listing":
> - **Card — Checked + WHY**: orange left border, filled checkbox, WHY block, indented artifacts
> - **Card — Unchecked + WHY**: no border, empty checkbox, WHY block, artifacts
> - **Card — No WHY**: no WHY block (non-deep), artifacts start after header
>
> **Files affected/created:** `electron-ui/ui/src/components/SearchResultCard.tsx`, `test/ui/search-result-card.test.tsx`

- [ ] Burst 32: Header — checkbox, title+date, tags (from `clusterTags`), `displayScore`, Open CTA
- [ ] Burst 33: WHY block — conditional, amber left border styling
- [ ] Burst 34: Matched artifacts — query-term matching, indented, Owner/Reporter/due inline
- [ ] Burst 35: "+N more" expand/collapse
- [ ] Burst 36: Checkbox toggle — orange left border on checked
- [ ] Burst 37: Empty artifact fallback — "Artifact not available" muted text
- [ ] Burst 38: **Playwright E2E — Result Cards**: search term, verify cards render, check a card, verify border, expand "+N more"

---

### #7 — Results List + Pagination (header, cards, load more, empty states)

> **Spec:**
> `SearchResultsList` component. Header bar, card list with pagination, grouping, empty/loading states.
>
> - New file `electron-ui/ui/src/components/SearchResultsList.tsx`
> - **Results header:**
>   - Left: `"{count} results"` Inter 12px 600 + `"in {time}s"` 11px muted (time from `searchDurationMs` in useSearchState, displayed as `(searchDurationMs / 1000).toFixed(1)`)
>   - Right: "Select all" outline button (border `#e0ddd8`, radius 4px, padding 2px 10px, Inter 11px 500) + "Save as Thread" text Inter 11px 500 muted
> - **Card list:** maps `enrichedResults` → `SearchResultCard`. Respects `displayLimit` from config. `displayedCount` state starts at `displayLimit`, "Load more" increments by `displayLimit`.
> - **Load more (3 states):**
>   - Partial: `"Showing {shown} of {total} · Load more"` (orange link)
>   - All loaded: `"Showing all {total} results"` (muted)
>   - Loading: `"Showing {shown} of {total} · Loading..."` (muted)
> - **Empty states (3 states):**
>   - Initial (no query): search icon `#c0bab3` + "Search across all meetings" Space Grotesk 14px 600 + helper Inter 12px muted
>   - No results: X-search icon + "No meetings match your search" + "Try broadening..." helper
>   - Loading: orange-top spinner + "Searching..." muted
> - **Search error state:** "Search failed. Try again." with retry link.
> - **Grouping:** Sort within group: by score descending. Group header: group label + count + "Select all in group" outline button (calls `selectAll(meetingIdsInThisGroup)`, NOT global selectAll).
>   - `groupBy === "cluster"`: groups under cluster tag headers (uses `clusterTags` from enriched SearchResultRow)
>   - `groupBy === "date"`: groups by month (`"March 2026"`, `"February 2026"`) — meetings span long periods, month is the right granularity
>   - `groupBy === "series"`: groups by meeting series name (uses `series` from enriched SearchResultRow)
>   - `groupBy === "none"`: flat list, no headers
> - **"Select all"** (global, in results header): `selectAll(allVisibleMeetingIds)` on search state — selects ALL visible results across all groups
> - **"Save as Thread":**
>   - Opens existing `CreateThreadDialog` pre-filled with: `title` = search query, `client_name` = selectedClient
>   - **Requires CreateThreadDialog modification:** new optional `initialMeetingIds?: string[]` prop. After successful `createThread`, the dialog calls `addThreadMeeting(threadId, meetingId, "", 0)` for each meeting ID. Shows progress if many meetings. Pre-selected meetings = checked results (or top `displayLimit` visible if none checked).
>   - On success: navigates to Threads view with new thread selected
> - **Responsive:** cards stack full-width on all breakpoints (already natural). Header wraps on mobile.
>
> **Design artboard:** `Dev Comp: Search Results Components`
> - Section 3 "Results Listing" header: `14 results in 0.3s` + outline "Select all" + text "Save as Thread"
> - Section 3 load more: `Showing 3 of 14 · Load more`
> - Section 4 "Pagination Controls": three states (partial, all loaded, loading)
> - Section 5 "Empty / No Results States": three states (initial, no results, loading)
>
> **Files affected/created:** `electron-ui/ui/src/components/SearchResultsList.tsx`, `electron-ui/ui/src/components/CreateThreadDialog.tsx`, `test/ui/search-results-list.test.tsx`, `test/ui/create-thread-dialog.test.tsx`

- [ ] Burst 39: Results header — count, `searchDurationMs` display, Select all (global) outline button, Save as Thread text link
- [ ] Burst 40: Card list + displayLimit pagination — Load more increments `displayedCount`, reset `displayedCount` when query/groupBy/sortBy changes
- [ ] Burst 41: Empty states — initial, no results, loading, error with retry
- [ ] Burst 42: Grouping — cluster/date(month)/series group headers, sort-within-group by score, "Select all in group" button (per-group, not global)
- [ ] Burst 43: Modify `CreateThreadDialog` — add optional `initialMeetingIds` prop, call `addThreadMeeting` for each after creation
- [ ] Burst 44: Save as Thread — opens CreateThreadDialog pre-filled with query + selectedClient + checked/visible meetings, navigates to threads on success
- [ ] Burst 45: **Playwright E2E — Results List**: search term, verify count, Load more, Select all, no-results with bad query, Save as Thread opens dialog

---

### #8 — Page Assembly & Chat Wiring (SearchPage + chat context)

> **Spec:**
> `SearchPage` assembles form + results. App.tsx wires it in. Chat receives `chatMeetingIds`. New `contextBanner` prop on ChatPanel for search context display.
>
> - New file `electron-ui/ui/src/pages/SearchPage.tsx`
>   - Returns `React.ReactNode[]` (follows existing page pattern)
>   - Panel 0: `<div>` containing `<SearchForm />` + `<SearchResultsList />`
>   - Panel 1 added when `selectedResultId` set (Section #9)
> - **App.tsx changes:**
>   - Instantiate `useSearchState(selectedClient)` — receives `selectedClient` from TopBar
>   - When `currentView === "search"`: render `SearchPage(searchState, ...handlers)`
>   - `computedActiveMeetingIds` logic:
>     - Search view, no detail open: `search.chatMeetingIds` (multi-result)
>     - Search view, detail open: `[search.selectedResultId]` (single meeting)
>     - Search view, no results yet: `[]` (empty — chat shows "Search to start chatting")
>     - Other views: existing logic unchanged
>   - Pass `contextMode: "distilled"` to chat handler when `currentView === "search"` AND no detail open
>   - Pass `contextMode: "full"` when detail is open (single meeting gets full context with transcript)
> - **ChatPanel.tsx changes:**
>   - New optional prop: `contextBanner?: { text: string; onAction?: () => void; actionLabel?: string }`
>   - When provided, renders a banner below the header: amber bg `#fef8f2`, info icon, text, optional action link
>   - Search view uses this for: "Chatting about {N} search results" or "Context: Sprint Planning (Mar 12) · Back to search results"
> - **TopBar changes when in search view:**
>   - New optional prop `hideDateFilters?: boolean` on TopBar — when true, hides date range pickers (SearchForm owns dates in search view)
>   - New optional prop `hideDeepToggle?: boolean` on TopBar — when true, hides Deep Search toggle (SearchForm owns Deep in search view)
>   - When entering search view, `dateAfter`/`dateBefore` from TopBar are copied into `useSearchState`. Subsequent date changes happen in SearchForm only.
> - **ChatPanel empty state for search view:**
>   - When `activeMeetingIds` is empty AND `currentView === "search"`, ChatPanel disables input and shows `contextBanner` with "Search to start chatting" text. Existing views unaffected (they always have at least one meeting before chat activates).
>
> **Edge cases:**
> - Switch from search view to meetings view and back → search state preserved (query, results, checked)
> - Change client in TopBar while in search view → re-triggers search with new client
> - Chat with 0 results → chat panel shows "Search to start chatting" empty state (not broken chat)
>
> **Existing behavior preserved:** Meetings/threads/insights/timelines chat continues using `buildLabeledContext` with full context. `computedActiveMeetingIds` for those views is unchanged.
>
> **Design artboard:** `Search Results — Option D: Form + Results (chat 40%)`
> - Full-page: nav rail (40px dark) + results panel (flex: 6) + chat panel (flex: 4)
> - Chat header: `"Assistant  10 of 14 results | 18,240 chars"`
>
> **Files affected/created:** `electron-ui/ui/src/pages/SearchPage.tsx`, `electron-ui/ui/src/App.tsx`, `electron-ui/ui/src/components/ChatPanel.tsx`, `test/ui/search-page.test.tsx`, `test/ui/chat-panel.test.tsx`

- [ ] Burst 46: `SearchPage` — returns panel array with SearchForm + SearchResultsList
- [ ] Burst 47: App.tsx — renders SearchPage, instantiates useSearchState with selectedClient
- [ ] Burst 48: `computedActiveMeetingIds` for search view — multi-result, single-result, empty states (test all 3)
- [ ] Burst 49: `contextMode` switching — distilled for multi-result, full for single detail
- [ ] Burst 50: `contextBanner` prop on ChatPanel — renders amber banner with text + optional action link. When `activeMeetingIds` empty + search view, disable input and show "Search to start chatting"
- [ ] Burst 51: TopBar `hideDateFilters` + `hideDeepToggle` props — hide when in search view. Copy dates into search state on view enter.
- [ ] Burst 52: State persistence — navigate away and back, query + results + checked preserved
- [ ] Burst 53: **Playwright E2E — Full Flow**: TopBar Enter → results load → check 2 cards → chat shows multi-result → Open card → chat switches to single meeting → Back → chat restores multi-result

---

### #9 — Detail Open State (30/30/30 split with data loading)

> **Spec:**
> When "Open" is clicked, layout splits 30/30/30. MeetingDetail requires extensive data — a new `useSelectedResultData` hook handles fetching. Detail is read-only in search context.
>
> - **`useSelectedResultData(meetingId)`** — new hook that fetches all data MeetingDetail needs:
>   - `useQuery(["artifact", id])` — artifact (may already be cached from batch)
>   - `useQuery(["completions", id])` — action item completions
>   - `useQuery(["assets", id])` — meeting assets
>   - `useQuery(["meeting-threads", id])` — thread tags
>   - `useQuery(["meeting-milestones", id])` — milestone tags
>   - `useQuery(["notes-count", "meeting", id])` — notes count
>   - Returns combined object matching MeetingDetail props shape
> - **MeetingDetail in search context — read-only subset:**
>   - Available: summary, decisions, action items (with completion), risks, open questions, notes, thread/milestone tags
>   - Hidden/disabled: Edit, Re-extract, Reassign, Delete buttons. These actions don't make sense in search context.
>   - New optional prop `onOpenInMeetings?: () => void` on MeetingDetail. When provided, renders "Open in Meetings →" link in detail header. When not provided (normal meetings view), nothing changes. Click calls `setCurrentView("meetings")` + `setSelectedMeetingId(id)`.
> - **SearchPage Panel 1:** when `selectedResultId` set, returns `<MeetingDetail />` as second panel
> - **CompactResultsSidebar:** results panel compresses to title+date+score rows. Selected = orange left border + warm bg `#fef8f2`. "← Back to full view" header.
> - **LinearShell considerations:** the existing resize behavior stores widths per `viewId`. The search-detail state gets its own width config. Panel 0 renders narrower (300px default when detail open vs full-width when closed). This is the same pattern as meetings view (sidebar narrows when detail opens).
> - **Chat context switch:**
>   - `computedActiveMeetingIds` returns `[selectedResultId]` (handled in Section #8 Burst 44)
>   - `contextMode` switches to `"full"` (handled in Section #8 Burst 45)
>   - Chat banner: "Context: {title} ({date}) · Back to search results" — click calls `setSelectedResultId(null)`
>
> **User interactions:**
> - Click "Open" on card → `setSelectedResultId(id)`, layout splits, data loads, chat switches
> - Click different row in sidebar → switches detail + chat
> - Click "← Back to full view" → `setSelectedResultId(null)`, restores full-width cards + multi-result chat
> - Click "Back to search results" in chat banner → same as above
> - Click "Open in Meetings" in detail header → `setCurrentView("meetings")` + `setSelectedMeetingId(id)`
>
> **Files affected/created:** `electron-ui/ui/src/hooks/useSelectedResultData.ts`, `electron-ui/ui/src/components/CompactResultsSidebar.tsx`, `electron-ui/ui/src/pages/SearchPage.tsx`, `test/ui/compact-results-sidebar.test.tsx`, `test/ui/use-selected-result-data.test.tsx`

- [ ] Burst 54: `useSelectedResultData` — fetches artifact, completions, assets, threads, milestones, notes for a meeting ID
- [ ] Burst 55: `CompactResultsSidebar` — title+date+score rows, selected highlight, "Back to full view" header
- [ ] Burst 56: SearchPage 2-panel mode — returns sidebar + MeetingDetail when selectedResultId set
- [ ] Burst 57: MeetingDetail — add `onOpenInMeetings` optional prop, hide Edit/Re-extract/Reassign/Delete when provided, render "Open in Meetings →" link
- [ ] Burst 58: **Playwright E2E — Detail Open**: search → Open → verify 3 columns → verify detail content → switch results → verify detail updates → Back → verify full-width restored

---

### #10 — Polish, Accessibility & Visual Verification

> **Spec:**
> Keyboard navigation, focus management, responsive verification, visual match to artboards.
>
> - **Keyboard navigation:**
>   - `focusedResultIndex` state in SearchResultsList
>   - Visual focus indicator: subtle `#e0ddd8` outline (distinct from checked orange border)
>   - Down arrow: focus next result. Up arrow: focus previous. Enter: open focused result. Space: toggle focused checkbox. Escape: return focus to search input.
>   - Tab: into results list. Shift+Tab: back to form.
>   - ARIA: `role="listbox"` on results container, `role="option"` on cards, `aria-selected` for checked, `aria-label` with meeting title + date + score
> - **Responsive:** SearchForm stacks on mobile. SearchResultsList full-width at all breakpoints. Chat panel hidden on mobile (sheet overlay, existing pattern). CompactResultsSidebar hidden on mobile (detail replaces results).
>
> **Files affected/created:** `electron-ui/ui/src/components/SearchResultsList.tsx`, `electron-ui/ui/src/components/SearchResultCard.tsx`, `test/e2e/search.spec.ts`

- [ ] Burst 59: Focus management — `focusedResultIndex`, visual indicator, Tab/Escape focus trapping
- [ ] Burst 60: Keyboard handlers — Up/Down/Enter/Space on results list with ARIA attributes
- [ ] Burst 61: Responsive — SearchForm mobile stacking, detail replaces results on mobile
- [ ] Burst 62: **Playwright E2E — Visual Verification**: screenshot search view at 1400x900 desktop, verify form + results + chat. Screenshot empty state. Screenshot detail-open state.

---

### #11 — Regression Guards

> **Spec:**
> Verify existing features still work after all search view changes. These are Playwright E2E tests that exercise pre-existing functionality.
>
> - Meetings view in-place search: type in TopBar → meeting list filters in real-time (useSearchScope unchanged)
> - Meetings view chat: select meeting → chat uses full context with transcripts (not distilled)
> - TopBar client filter: change client in TopBar → meetings/search/threads all update correctly
> - Deep search in meetings view: toggle Deep in meetings view → still functions (separate from search view Deep)
> - Thread creation from threads view: create thread → works as before (not broken by Save as Thread changes)
> - Insights generation: create + generate insight → still works (no side effects from search context changes)
>
> **Files affected/created:** `test/e2e/search-regression.spec.ts`

- [ ] Burst 63: Playwright — meetings view typing still filters in-place
- [ ] Burst 64: Playwright — meetings view chat uses full context (not distilled)
- [ ] Burst 65: Playwright — TopBar client filter works across all views including search
- [ ] Burst 66: Playwright — deep search toggle in meetings view still functions
- [ ] Burst 67: Playwright — thread creation from threads view unaffected

---

### #12 — Integration Wiring (connect sections end-to-end)

> **Spec:**
> Explicit integration bursts that wire sections together. These close the gaps between independently-built components.
>
> - SearchForm state → useSearch API params: `searchFields` from form flows through `useSearchState` → `useSearch` → `GET /api/search?searchFields=...` → FTS field filtering
> - SearchForm state → SearchResultCard rendering: `deepSearchEnabled` controls whether WHY blocks appear. `groupBy` controls card grouping. `sortBy` controls order.
> - SearchResultsList → ChatPanel: `checkedResultIds` + `chatMeetingIds` → `computedActiveMeetingIds` → ChatPanel `activeMeetingIds` prop
> - Full data flow smoke test: type query → form submits → API called with params → results render with correct cards → check cards → chat shows checked meetings → uncheck → chat reverts to top-N
>
> **Files affected/created:** (integration across existing files, no new files)

- [ ] Burst 68: Wire searchFields from SearchForm → useSearchState → useSearch → API param
- [ ] Burst 69: Wire enrichedResults through SearchResultsList → SearchResultCard (deep summaries, grouping, sorting)
- [ ] Burst 70: Wire checkedResultIds → chatMeetingIds → computedActiveMeetingIds → ChatPanel
- [ ] Burst 71: **Playwright E2E — End-to-End Smoke**: full flow from TopBar search to chat response with citations, verify every connection point
