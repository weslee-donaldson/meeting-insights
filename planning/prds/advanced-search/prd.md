# Ketchup Plan: Advanced Search

## Context

The current search bar in TopBar filters the meeting list in-place. Users need a dedicated search experience with field scoping, richer result presentation, chat across results, and the ability to save searches as threads.

**Design artboards:** `Dev Comp: Search Results Components` (component reference), `Search Results — Option D: Form + Results (chat 40%)` (full-page reference)

---

### #1 — Search Context Backend (distilled context for multi-meeting chat)

> **Spec:**
> New `buildSearchContext` function + `contextMode` wiring so chat can operate on many search results without blowing token budgets.
>
> - New function `buildSearchContext(db, meetingIds, options?)` in `core/labeled-context.ts`:
>   - Uses distilled format: artifacts only (summary, decisions, action_items, risks, features, questions), NO transcripts, NO mention stats
>   - Optional `maxChars` param: when provided, allocates per-meeting budget = `maxChars / meetingIds.length`. Truncates each meeting's block to fit.
>   - Optional `relevanceSummaries: Map<string, string>` param: when provided, prepends `Relevance: <summary>` line to each meeting's labeled block
>   - Returns `{ contextText: string, charCount: number, meetings: string[] }` — same shape as existing `buildLabeledContext`
> - New optional field `contextMode?: "full" | "distilled"` on `ConversationChatRequest` in `electron-ui/electron/channels.ts`
> - Update `handleConversationChat` in IPC handler: when `contextMode === "distilled"`, call `buildSearchContext` instead of `buildLabeledContext`
> - Add `displayLimit` and `chatContextLimit` to `config/system.json`, export from `electron-ui/electron/handlers/config.ts`
>
> **Files affected/created:** `core/labeled-context.ts`, `electron-ui/electron/channels.ts`, `electron-ui/electron/handlers/search.ts`, `config/system.json`, `electron-ui/electron/handlers/config.ts`, `test/labeled-context.test.ts`, `test/search-handler.test.ts`

- [x] Burst 1: Extend `buildDistilledContext` with `maxChars` budget — per-meeting allocation scales inversely with count
- [x] Burst 2: Extend `buildDistilledContext` with `relevanceSummaries` map — prepends relevance line per meeting when provided
- [x] Burst 3: `contextMode` on `ConversationChatRequest` — wire through channels.ts types + IPC handler + api-client.ts HTTP + API route
- [x] Burst 4: Add `displayLimit` (20) and `chatContextLimit` (10) to `config/system.json` + export from `config.ts`
- [ ] Burst 5: Error handling — skip meetings with missing artifacts, log warning, test with mix of valid and stale meeting IDs

---

### #2 — Field-Scoped Search API (search within specific artifact sections)

> **Spec:**
> Extend the search API so users can restrict which artifact fields are searched (e.g., only Decisions, only Action Items). Fix missing date filter passthrough.
>
> - Fix `GET /api/search` route in `api/routes/search.ts`: pass `date_after` and `date_before` query params through to `hybridSearch`. Currently ignored.
> - New `POST /api/artifacts/batch` endpoint in `api/routes/meetings.ts`: accepts `{ meetingIds: string[] }`, returns `Record<string, ArtifactRow>`. Used by UI to fetch artifacts for all visible search results in one call.
> - Modify FTS indexing in `core/fts.ts`: tag artifact content by field when building the `artifact_fts` index. Format: `[summary] text... [decisions] text... [action_items] text...` so FTS can match within specific sections.
> - New `searchFields` query param on `GET /api/search`: accepts comma-separated field names (e.g., `summary,decisions`). When provided, post-filter FTS matches to only include results where the match came from a tagged field section.
>
> **User interactions:** None directly — this is backend infrastructure consumed by the search form UI.
>
> **Files affected/created:** `api/routes/search.ts`, `api/routes/meetings.ts`, `core/fts.ts`, `core/hybrid-search.ts`, `test/fts.test.ts`, `test/search-handler.test.ts`, `test/api-meetings.test.ts`

- [ ] Burst 6: `date_after`/`date_before` passthrough on `GET /api/search`
- [ ] Burst 7: `POST /api/artifacts/batch` endpoint — accepts meetingIds array, returns artifact map
- [ ] Burst 8: Field-tagged FTS — rebuild `artifact_fts` content with `[field]` prefixes per section
- [ ] Burst 9: `searchFields` param on `GET /api/search` — filter FTS results to matched fields only

---

### #3 — View Type & Navigation Wiring (add "search" to the app shell)

> **Spec:**
> Register the search view in the app shell so NavRail, BottomTabBar, BreadcrumbBar, and ResponsiveShell all know about it. Wire TopBar quick search to navigate to the search view.
>
> - Add `"search"` to the `View` union type in: `App.tsx` (line ~44), `NavRail.tsx`, `BottomTabBar.tsx`, `ResponsiveShell.tsx`, `BreadcrumbBar.tsx`
> - NavRail: add `{ view: "search", label: "Search", Icon: Search }` to ITEMS array (lucide `Search` icon). Active state: orange icon + text (matches existing pattern).
> - BottomTabBar: add Search tab for mobile.
> - ResponsiveShell VIEW_LABELS: add `search: "Search"`.
> - BreadcrumbBar: add search label for mobile breadcrumbs.
> - TopBar search submit (`onSubmitSearch` in App.tsx): when user presses Enter in the TopBar search bar, call `search.setSearchQuery(query)` + `setCurrentView("search")`. This navigates to the search view with the query pre-filled.
> - Result "Open" click: call `setCurrentView("meetings")` + `meeting.setSelectedMeetingId(id)` — navigates to meetings view with that meeting selected.
>
> **User interactions:**
> - Click Search icon in NavRail → navigates to search view (empty form)
> - Press Enter in TopBar search bar → navigates to search view with query pre-filled
> - Click "Open" on a result card → navigates to meetings view with that meeting selected
>
> **Design artboard:** `Search Results — Option D` (nav rail with Search icon active)
> **Files affected/created:** `electron-ui/ui/src/App.tsx`, `electron-ui/ui/src/components/NavRail.tsx`, `electron-ui/ui/src/components/BottomTabBar.tsx`, `electron-ui/ui/src/components/ResponsiveShell.tsx`, `electron-ui/ui/src/components/BreadcrumbBar.tsx`, `test/ui/nav-rail.test.tsx`, `test/ui/app.test.tsx`

- [ ] Burst 10: Extend `View` type with `"search"` across all 5 files — TypeScript compiles
- [ ] Burst 11: NavRail search icon entry — renders, click calls onNavigate("search")
- [ ] Burst 12: BottomTabBar + BreadcrumbBar entries — mobile tab + breadcrumb label
- [ ] Burst 13: TopBar submit → search view navigation — sets query + switches view
- [ ] Burst 14: Result "Open" click → meetings view navigation — calls setCurrentView + setSelectedMeetingId

---

### #4 — Search State Hook (manages all search view state)

> **Spec:**
> New `useSearchState` hook that manages query, filters, field scoping, form visibility, checked results, and derived chat meeting IDs. Composes existing `useSearch` + `useDeepSearch` hooks.
>
> - New file `electron-ui/ui/src/hooks/useSearchState.ts`
> - State:
>   - `searchQuery: string`, `typedSearchQuery: string` — query text (typed = controlled input, searchQuery = submitted)
>   - `searchFields: Set<string>` — which artifact fields to search in. Defaults to all 7 fields. `toggleField(field)` adds/removes.
>   - `dateAfter: string`, `dateBefore: string` — date range filters
>   - `deepSearchEnabled: boolean` — toggle
>   - `formVisible: boolean` — Hide/Show toggle for search form
>   - `groupBy: string` — "none" | "cluster" | "date" | "series"
>   - `sortBy: string` — "relevance" | "date"
>   - `checkedResultIds: Set<string>` — for chat scope override. `toggleChecked(id)`, `clearChecked()`, `selectAll(ids)`
> - Data fetching:
>   - `useSearch(searchQuery, selectedClient, dateAfter, dateBefore)` — existing hook, returns hybrid results
>   - `useDeepSearch(hybridMeetingIds, searchQuery, deepSearchEnabled)` — existing hook, returns LLM-ranked results
>   - `useQueries` or new `useArtifactBatch(meetingIds)` — fetch artifacts for visible results (uses `POST /api/artifacts/batch`)
> - Derived:
>   - `enrichedResults[]` — merged search results + artifact data (matched decisions, actions, risks per meeting)
>   - `chatMeetingIds: string[]` — if `checkedResultIds.size > 0`, use checked; else top-N by score (N = `chatContextLimit` from config)
>   - `deepSearchSummaries: Map<string, string>` — relevance summaries from deep search
>   - `collapsedSummary: string` — e.g., `"billing migration" in Summary, Decisions · Deep`
>
> **User interactions:**
> - Type in query input → updates `typedSearchQuery`; press Enter → sets `searchQuery`, triggers search
> - Click SEARCH IN pill → `toggleField()` adds/removes field from set
> - Change date pickers → updates `dateAfter`/`dateBefore`
> - Toggle Deep checkbox → sets `deepSearchEnabled`
> - Click Hide/Show → toggles `formVisible`
> - Change Group/Sort dropdowns → updates `groupBy`/`sortBy`
> - Check/uncheck result card → `toggleChecked(id)`
>
> **Files affected/created:** `electron-ui/ui/src/hooks/useSearchState.ts`, `electron-ui/ui/src/hooks/useArtifactBatch.ts`, `test/ui/use-search-state.test.tsx`

- [ ] Burst 15: Hook skeleton — searchQuery, typedSearchQuery, deepSearchEnabled, formVisible, groupBy, sortBy
- [ ] Burst 16: Filter state — dateAfter, dateBefore, searchFields Set with toggleField
- [ ] Burst 17: Wire `useSearch` — query triggers API call, returns searchResults + searchFetching
- [ ] Burst 18: Wire `useDeepSearch` — deep enabled + hybrid IDs triggers deep search, returns summaries
- [ ] Burst 19: `useArtifactBatch` hook — fetches artifacts for visible meeting IDs via batch endpoint
- [ ] Burst 20: `enrichedResults` — merges search results + artifacts into card-ready data (matched items per section)
- [ ] Burst 21: Checked results — toggleChecked, clearChecked, selectAll
- [ ] Burst 22: `chatMeetingIds` computation — checked override or top-N from config
- [ ] Burst 23: `collapsedSummary` derived string for collapsed form state

---

### #5 — Search Form UI (query input, field toggles, filters)

> **Spec:**
> `SearchForm` component renders the search configuration panel at the top of the search view. Supports expanded and collapsed states.
>
> - New file `electron-ui/ui/src/components/SearchForm.tsx`
> - **Expanded state** (see artboard section 1):
>   - "Search" title left, "Hide" button right (chevron-up icon)
>   - Query input: white bg, border, search icon, 13px Inter. Submits on Enter.
>   - "SEARCH IN" label (10px, uppercase, muted) + row of toggle pills:
>     - Active: orange bg (#e67e22), white text, 600 weight — matches existing app toggle pill pattern
>     - Inactive: white bg, border, muted text — matches existing outline button pattern
>     - Fields: Summary, Decisions, Action Items, Risks, Features, Questions, Milestones
>   - Bottom row: "From" date picker + "to" date picker + spacer + Deep checkbox (green, matches existing) + `Group: None ▾` dropdown + `Sort: Relevance ▾` dropdown
>   - Group options: None, Cluster, Date, Series
>   - Sort options: Relevance, Date (newest), Date (oldest)
> - **Collapsed state** (see artboard section 2):
>   - Single row: search icon + `"query"` bold + `in Field1, Field2` muted + `· Deep` amber (if active) + spacer + "Show" button (chevron-down)
> - Props: all state + setters from `useSearchState`, `onSubmit()` callback
>
> **User interactions:**
> - Type query → controlled input updates `typedSearchQuery`
> - Press Enter in query input → calls `onSubmit()` which sets `searchQuery`
> - Click a SEARCH IN pill → toggles that field in `searchFields` Set. Orange = active, outline = inactive.
> - Click Hide → sets `formVisible: false`, form collapses to one-line summary
> - Click Show → sets `formVisible: true`, form expands
> - Change date picker → updates `dateAfter` / `dateBefore`
> - Toggle Deep checkbox → sets `deepSearchEnabled`
> - Change Group dropdown → sets `groupBy`
> - Change Sort dropdown → sets `sortBy`
>
> **Design artboard:** `Dev Comp: Search Results Components` sections 1-2
> **Files affected/created:** `electron-ui/ui/src/components/SearchForm.tsx`, `test/ui/search-form.test.tsx`

- [ ] Burst 24: `SearchForm` expanded — renders query input, Hide button, fires onSubmit on Enter
- [ ] Burst 25: SEARCH IN field toggles — renders 7 pills, click toggles active/inactive state via callback
- [ ] Burst 26: Date pickers + options row — From/to inputs, Deep checkbox, Group dropdown, Sort dropdown
- [ ] Burst 27: Collapsed state — renders one-line summary from `collapsedSummary`, Show button toggles back
- [ ] Burst 28: **Playwright E2E — Search Form**: navigate to search view via NavRail, type query, toggle SEARCH IN pills, verify expanded/collapsed states, confirm Enter submits search

---

### #6 — Result Card UI (WHY + matched artifacts, no summary)

> **Spec:**
> `SearchResultCard` component renders a single search result. Shows WHY (deep search only) + matched artifact highlights. No summary block, no participant footer.
>
> - New file `electron-ui/ui/src/components/SearchResultCard.tsx`
> - **Props:** `result: EnrichedResult`, `checked: boolean`, `onToggleChecked: (id) => void`, `onOpen: (id) => void`, `deepSearchSummary?: string`
> - **Header row** (see artboard section 3, card anatomy):
>   - Left: Checkbox (16px). Checked = orange bg + white check + orange left border on card. Unchecked = gray border.
>   - Meeting title + date as identity: `"Sprint Planning · Mar 12, 2026"` — Space Grotesk 13px 600
>   - Cluster tag pills: `f0eeeb` bg, 9px, `6b6660` text
>   - Right: Relevance score in JetBrains Mono 11px 600 (color: green gradient by value). "Open" in orange 11px 500.
> - **WHY block** (conditional — only when `deepSearchSummary` prop exists):
>   - `fdf8f0` bg, 2px amber left border, rounded right corners
>   - "WHY" label: 10px 700 amber `#c17a1a`, tracking 0.03em
>   - Summary text: 11px italic `#7a6e5f`
> - **Matched artifacts** (indented 24px left):
>   - Decision: amber circle-check icon + text 11px 500 + "+N more" muted
>   - Action item: gray checkbox icon + description 11px + `Owner: name` + `Reporter: name` + `due date` all muted 10px on same line + "+N more"
>   - Risk: amber warning triangle icon + text 11px `#9a5c1a`
>   - "+N more" click → expands to show full list with section headers (DECISIONS, ACTION ITEMS, RISKS)
> - **No summary block**: search matches specific artifacts, not general summaries
> - **No participant footer**: Owner/Reporter on action items is sufficient
>
> **User interactions:**
> - Click checkbox → calls `onToggleChecked(result.meetingId)`. Card gains orange left border when checked.
> - Click "Open" → calls `onOpen(result.meetingId)`
> - Click "+N more" → toggles expanded state showing full artifact lists
>
> **Design artboard:** `Dev Comp: Search Results Components` section 3 (three card variants: checked+WHY, unchecked+WHY, no WHY)
> **Files affected/created:** `electron-ui/ui/src/components/SearchResultCard.tsx`, `test/ui/search-result-card.test.tsx`

- [ ] Burst 29: `SearchResultCard` header — checkbox, title+date, tags, score, Open CTA
- [ ] Burst 30: WHY block — conditional render when `deepSearchSummary` present, amber left border style
- [ ] Burst 31: Matched artifacts — indented decision + action item (Owner/Reporter/due inline) + risk
- [ ] Burst 32: "+N more" expand/collapse — click reveals full section lists
- [ ] Burst 33: Checkbox toggles — checked state adds orange left border, fires callback
- [ ] Burst 34: **Playwright E2E — Result Cards**: search for a term, verify cards render with title+date, check a card, verify orange border appears, click "+N more" if present

---

### #7 — Results List + Pagination (header, cards, load more, empty states)

> **Spec:**
> `SearchResultsList` component renders the scrollable results area below the search form. Includes header bar, card list, load more, and empty/loading states.
>
> - New file `electron-ui/ui/src/components/SearchResultsList.tsx`
> - **Results header bar** (see artboard section 3 header):
>   - Left: `"{count} results"` 12px 600 + `"in {time}s"` 11px muted
>   - Right: "Select all" outline button (`border: 1px solid #e0ddd8, border-radius: 4px, padding: 2px 10px`) + "Save as Thread" text link 11px muted
> - **Card list**: maps `enrichedResults` → `SearchResultCard` components. Respects `displayLimit` from config — shows first N, "Load more" fetches next N.
> - **Load more bar** (see artboard section 4):
>   - Partial: `"Showing {shown} of {total} · Load more"` (Load more in orange)
>   - All loaded: `"Showing all {total} results"` (no button)
>   - Loading: `"Showing {shown} of {total} · Loading..."` (muted)
> - **Empty states** (see artboard section 5):
>   - Initial (no query): search icon + "Search across all meetings" + helper text
>   - No results: X-search icon + "No meetings match your search" + "Try broadening..." text
>   - Loading: spinner + "Searching..."
> - **Grouping**: when `groupBy === "cluster"`, groups results under cluster tag headers with "Select all in group" outline button
> - "Select all" click → `selectAll(visibleMeetingIds)` on search state
> - "Save as Thread" click → creates thread from query + links result meetings via existing API
>
> **User interactions:**
> - Click "Select all" → checks all visible results for chat scope
> - Click "Save as Thread" → creates thread, navigates to Threads view
> - Click "Load more" → shows next `displayLimit` batch of results
> - Scroll results list — standard scroll behavior
>
> **Design artboard:** `Dev Comp: Search Results Components` sections 3-5
> **Files affected/created:** `electron-ui/ui/src/components/SearchResultsList.tsx`, `test/ui/search-results-list.test.tsx`

- [ ] Burst 35: Results header — count, time, Select all outline button, Save as Thread text link
- [ ] Burst 36: Card list rendering — maps enrichedResults to SearchResultCard, respects displayLimit
- [ ] Burst 37: Load more — shows count, Load more button fetches next batch, all-loaded state
- [ ] Burst 38: Empty states — initial (no query), no results, loading spinner
- [ ] Burst 39: Cluster grouping — group results under cluster headers when `groupBy === "cluster"`
- [ ] Burst 40: Save as Thread — creates thread from query, links meetings, navigates to threads view
- [ ] Burst 41: **Playwright E2E — Results List**: search a term, verify result count, click Load more, verify more results appear, test Select all, test no-results state with garbage query

---

### #8 — Page Assembly & Chat Wiring (SearchPage + chat context switching)

> **Spec:**
> `SearchPage` function assembles the search view (form + results). App.tsx wires it into the view switch. Chat panel receives `chatMeetingIds` from search state, switches context when a meeting detail is opened.
>
> - New file `electron-ui/ui/src/pages/SearchPage.tsx`
>   - Returns `React.ReactNode[]` array (follows InsightsPage/ThreadsPage pattern)
>   - Panel 0: `<div>` containing `<SearchForm />` + `<SearchResultsList />`
>   - No Panel 1 by default (full-width results). Panel 1 added when detail opens (future burst).
> - `App.tsx` changes:
>   - Instantiate `useSearchState(selectedClient)` in App
>   - In panels switch: when `currentView === "search"`, call `SearchPage(searchState, ...handlers)`
>   - `computedActiveMeetingIds`: when `currentView === "search"`, use `search.chatMeetingIds`
>   - Pass `contextMode: "distilled"` to `handleChat` when in search view
>   - TopBar `onSubmitSearch`: set `search.setSearchQuery(query)` + `setCurrentView("search")`
> - Chat header: when search view active, show `"{N} of {M} results"` count + char count
> - Chat context switch (detail open — future section):
>   - When user clicks "Open" on a card, layout switches to 30/30/30 (compact sidebar + MeetingDetail + chat)
>   - Chat switches from multi-result to single meeting
>   - Banner in chat: "Context: {title} · Back to search results"
>
> **User interactions:**
> - Navigate to search view → form + empty state visible, chat panel shows "search results" scope
> - Search → results load, chat auto-scopes to top-N results
> - Check/uncheck cards → chat scope updates
> - Open a meeting → chat switches to single meeting context (detail open state)
>
> **Design artboard:** `Search Results — Option D: Form + Results (chat 40%)`
> **Files affected/created:** `electron-ui/ui/src/pages/SearchPage.tsx`, `electron-ui/ui/src/App.tsx`, `test/ui/search-page.test.tsx`

- [ ] Burst 42: `SearchPage` returns panel array with SearchForm + SearchResultsList
- [ ] Burst 43: App.tsx renders SearchPage for search view, instantiates useSearchState
- [ ] Burst 44: Chat IDs from search state — `computedActiveMeetingIds` uses `chatMeetingIds` in search view
- [ ] Burst 45: `contextMode: "distilled"` passed to chat handler when in search view
- [ ] Burst 46: Chat header shows result count context when in search view
- [ ] Burst 47: **Playwright E2E — Full Flow**: TopBar search → results page loads → check 2 results → open chat → verify chat references checked meetings → click Open on a result → verify navigation to meetings view

---

### #9 — Detail Open State (30/30/30 split with chat context switch)

> **Spec:**
> When user clicks "Open" on a search result, the layout splits into three columns: compact results sidebar (~30%), MeetingDetail center panel (~30%), chat panel (~30%). Chat context switches to the single opened meeting.
>
> - SearchPage Panel 1: when `selectedResultId` is set, return `<MeetingDetail />` as second panel
> - Results panel compresses to compact sidebar: shows title + date + score per row. Selected row highlighted with orange left border + warm bg.
> - "Back to full view" link in sidebar header → clears `selectedResultId`, restores full-width results, restores multi-result chat
> - Chat context switch:
>   - `computedActiveMeetingIds` switches from `chatMeetingIds` (multi) to `[selectedResultId]` (single)
>   - Chat banner: `"Context: Sprint Planning (Mar 12) · Back to search results"` — click "Back" restores multi-result scope
>   - `contextMode` switches from `"distilled"` to `"full"` for single meeting (include transcripts)
> - Click different row in sidebar → switches detail + chat to that meeting
>
> **User interactions:**
> - Click "Open" on card → layout splits, detail loads, chat switches to single meeting
> - Click different result in sidebar → switches to that meeting
> - Click "Back to full view" in sidebar → closes detail, restores full-width cards + multi-result chat
> - Click "Back to search results" in chat banner → same as above
>
> **Design artboard:** (to be created — `Dev Comp: Detail Open State`)
> **Files affected/created:** `electron-ui/ui/src/pages/SearchPage.tsx`, `electron-ui/ui/src/components/CompactResultsSidebar.tsx`, `electron-ui/ui/src/App.tsx`, `test/ui/compact-results-sidebar.test.tsx`

- [ ] Burst 48: `CompactResultsSidebar` — title+date+score rows, selected highlight, "Back to full view" header
- [ ] Burst 49: SearchPage returns 2 panels when `selectedResultId` set — sidebar + MeetingDetail
- [ ] Burst 50: Chat context switch — single meeting when detail open, multi-result when closed
- [ ] Burst 51: Chat banner — "Context: {title} · Back to search results" with click handler
- [ ] Burst 52: **Playwright E2E — Detail Open**: search → click Open → verify 3-column layout → verify chat shows single meeting context → click Back → verify full-width results restored

---

### #10 — Polish & Visual Verification

> **Spec:**
> Final polish: state persistence across view switches, keyboard navigation, visual verification against Paper artboards.
>
> - Search state persists when switching views: navigate away and back → query, results, checked state preserved
> - Keyboard navigation: Up/Down arrows move selection through results, Enter opens selected result
> - Visual verification: Playwright screenshots at 2560x1440 compared against Paper artboard `Dev Comp: Search Results Components`
>
> **Files affected/created:** `electron-ui/ui/src/hooks/useSearchState.ts`, `electron-ui/ui/src/components/SearchResultsList.tsx`, `test/e2e/search.spec.ts`

- [ ] Burst 53: State persists across view switches — navigate away and back, query preserved
- [ ] Burst 54: Keyboard navigation — arrow keys move selection, Enter opens
- [ ] Burst 55: **Playwright E2E — Visual Verification**: screenshot search view at 2560x1440, compare against artboard. Verify all states: form expanded, form collapsed, results with cards, empty state, no results state.
