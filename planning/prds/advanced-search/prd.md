# PRD: Advanced Search Results

## Context

The current search bar in TopBar filters the meeting list in-place. As the system scales to hundreds of meetings across many clients, inline filtering isn't enough. Users need to:

1. **Triage search results** — see enough per result to decide if it's worth diving into
2. **Chat across results** — ask questions scoped to the result set, not just one meeting
3. **Apply advanced filters** — narrow by client, date range, enable LLM-powered deep search
4. **Discover patterns** — group results by semantic cluster to spot themes
5. **Bridge to tracking** — save a search as a Thread for ongoing monitoring

## Product Model

This is a **search results browser with scoped chat**. It is not a dashboard, not analytics, not a replacement for the meetings view. It's the answer to "what do I know about X?" with enough context to decide what to do next.

Two entry points, one destination:
- **Quick search** — TopBar enter → results page (no filters, just query)
- **Advanced search** — NavRail search icon → results page (filters visible)

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout | Full-width result cards + chat panel | Maximize scanning area; cards are rich enough without a preview panel |
| Card detail | Hybrid: summary + top-1 each section, expand for rest | Enough to triage without overwhelming; "+N more" for deep dives |
| Chat scope | Top-10 auto + checkbox override | Balances token budget with user control; distilled context (no transcripts) |
| Deep search UX | Relevance summary inline, only when Deep toggled on | Don't waste space when not needed; clear visual indicator of LLM involvement |
| Search scope | Meetings only (v1) | Threads/insights searchable in future iteration |
| Cluster grouping | Optional toggle | Visual pattern discovery without forcing structure |
| Save as Thread | Button on results page | Natural bridge from "what do I know?" to "I need to track this" |

## Layout

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  TopBar  [ Search meetings...________________________________ ]   [Deep ◻]  [⚙] │
├────┬──────────────────────────────────────────────────────┬──────────────────────┤
│    │                                                      │                      │
│ Nav│  SEARCH RESULTS  (14 results · 0.3s)                 │  Chat (10 of 14)     │
│    │                                                      │                      │
│ R  │  Filters: [Client ▾]  [After ___]  [Before ___]     │  Chatting with 10    │
│ A  │           [Relevance ▾]  [☑ Deep]  [Group clusters]  │  search results      │
│ I  │                                                      │                      │
│ L  │  ┌────────────────────────────────────────────────┐  │  ┌────────────────┐  │
│    │  │ Result card (see wireframe below)               │  │  │ User message   │  │
│ 🔍 │  └────────────────────────────────────────────────┘  │  └────────────────┘  │
│    │  ┌────────────────────────────────────────────────┐  │                      │
│    │  │ Result card                                    │  │  Assistant response  │
│    │  └────────────────────────────────────────────────┘  │  with [M1][M3][M7]   │
│    │  ┌────────────────────────────────────────────────┐  │  citations           │
│    │  │ Result card                                    │  │                      │
│    │  └────────────────────────────────────────────────┘  │                      │
│    │                                                      │                      │
│    │  [Save as Thread]                                    │                      │
├────┴──────────────────────────────────────────────────────┴──────────────────────┤
```

## Result Card — Default State

Each card shows enough to answer: "Is this relevant to what I'm looking for?" and "What happened in this meeting?"

```
┌──────────────────────────────────────────────────────────────────┐
│ ☐  Sprint Planning — Acme Corp                  0.92   Mar 12   │
│    onboarding · billing · migration                              │
│                                                                  │
│ [Deep only: "Discusses Q2 migration timeline and phased          │
│  rollout strategy matching your billing query."]                 │
│                                                                  │
│ Team reviewed the migration timeline for the Q2 launch.          │
│ Agreed on a phased rollout with 3 stages: staging validation,    │
│ 10% canary, full deployment. Billing v2 deferred post-migration. │
│                                                                  │
│ 📌 Move to phased rollout approach              +1 more decision │
│ ☐ Draft migration plan · @Sarah · due Mar 20      +2 more items │
│ ⚠ Legacy contract migration risk                                │
│                                                                  │
│ 👥 Sarah, Mike, Dev Team Lead                    [Open Meeting →]│
└──────────────────────────────────────────────────────────────────┘
```

**Card anatomy:**
1. **Header**: Checkbox (chat scope) · Meeting title · Client badge · Relevance score · Date
2. **Tags**: Cluster tags as pills (e.g., `onboarding · billing · migration`)
3. **Relevance summary** (deep search only): LLM-written explanation of WHY this matched the query. Italic, distinct styling. Only appears when Deep Search toggle is on.
4. **Summary**: Full artifact summary — the "what was discussed" overview
5. **Top-1 highlights**: One decision, one action item (with owner + due date), one risk — the most important signals for triage
6. **"+N more" expanders**: Reveal full lists of decisions, action items, risks when clicked
7. **Footer**: Participant names · "Open Meeting" navigation button

## Result Card — Expanded State

```
┌──────────────────────────────────────────────────────────────────┐
│ ☑  Sprint Planning — Acme Corp                  0.92   Mar 12   │
│    onboarding · billing · migration                              │
│                                                                  │
│ Team reviewed the migration timeline for the Q2 launch.          │
│ Agreed on a phased rollout with 3 stages: staging validation,    │
│ 10% canary, full deployment. Billing v2 deferred post-migration. │
│                                                                  │
│ DECISIONS (2)                                                    │
│ 📌 Move to phased rollout approach                               │
│ 📌 Delay billing v2 to post-migration                            │
│                                                                  │
│ ACTION ITEMS (3)                                                 │
│ ☐ Draft migration plan · @Sarah · due Mar 20                    │
│ ☐ Update API rate limits · @Dev team · due Mar 18               │
│ ☐ Schedule load test · @QA · due Mar 25                         │
│                                                                  │
│ RISKS (1)                                        [collapse ▲]   │
│ ⚠ Legacy contract migration — some contracts have custom         │
│   billing rules that may break during migration                  │
│                                                                  │
│ 👥 Sarah, Mike, Dev Team Lead                    [Open Meeting →]│
└──────────────────────────────────────────────────────────────────┘
```

## Result Card — With Cluster Grouping

When "Group by cluster" is toggled on, results are grouped under semantic cluster headers:

```
── onboarding · migration (5 results) ─────────────────────────
  ┌─ Sprint Planning — Acme Corp ... ┐
  └──────────────────────────────────┘
  ┌─ Migration Review — Acme Corp ...┐
  └──────────────────────────────────┘

── billing · pricing (3 results) ──────────────────────────────
  ┌─ Billing Deep Dive — Acme Corp...┐
  └──────────────────────────────────┘
```

## User Flows

### Quick Search
1. User types query in TopBar search bar → presses Enter
2. App navigates to search view, query pre-filled
3. Hybrid search (vector + FTS) fires → results render as cards
4. Chat panel opens, auto-scoped to top-10 results
5. User scans cards, clicks "Open Meeting" to dive into any result

### Advanced Search
1. User clicks Search icon in NavRail (or arrives via quick search)
2. Filter bar visible: client dropdown, date range pickers, Deep Search toggle, cluster grouping toggle
3. Changing any filter re-fires search
4. Deep Search toggle: when on, LLM re-ranks results and adds relevance summaries to cards

### Chat with Results
1. Chat panel shows "Chatting with N of M results"
2. Default: top-10 by relevance included in chat context
3. User checks/unchecks result cards to override which meetings are in scope
4. Chat uses distilled context (summaries + artifacts, no transcripts) to fit more meetings
5. Citations (`[M1]`, `[M2]`) reference specific result meetings

### Save as Thread
1. User clicks "Save as Thread" button below results
2. Creates a new Thread titled from the search query
3. All result meetings linked to the thread
4. Navigates to Threads view with the new thread selected

## Architecture

### New View
- Add `"search"` to `View` union type in `App.tsx`, `NavRail.tsx`, `BottomTabBar.tsx`, `ResponsiveShell.tsx`, `BreadcrumbBar.tsx`
- `SearchPage()` returns `[<SearchResultsList />]` (single panel, full width)

### State: `useSearchState` hook
New hook at `electron-ui/ui/src/hooks/useSearchState.ts`:
- `searchQuery`, `typedSearchQuery` — query text
- `clientFilter`, `dateAfter`, `dateBefore` — advanced filters
- `deepSearchEnabled` — toggle
- `checkedResultIds: Set<string>` — chat scope overrides
- `groupByCluster: boolean` — cluster grouping toggle
- Wires existing `useSearch()` + `useDeepSearch()` hooks
- Computes `chatMeetingIds`: checked IDs if any, else top-10 by score
- Fetches artifacts for visible results via `useQueries` (or new batch endpoint)
- Produces `enrichedResults[]` with summary, top items, counts, tags

### Chat Context
- New `buildSearchContext(db, meetingIds, options?)` in `core/labeled-context.ts`
- Distilled format: summaries + artifacts, no transcripts
- Token budget: `maxChars` scales per-meeting allocation inversely with result count
- Optional `relevanceSummaries` map from deep search
- Exposed via `contextMode: "distilled"` on `ConversationChatRequest`

### API
- Fix: pass `date_after`/`date_before` through `GET /api/search` route
- New: `POST /api/artifacts/batch` for efficient multi-artifact fetch

### Component Tree
```
SearchPage.tsx
  └─ SearchResultsList.tsx
       ├─ FilterBar (client, dates, deep, group-by, sort, count)
       ├─ [ClusterGroupHeader] (optional)
       ├─ SearchResultCard.tsx (per result)
       │    ├─ Checkbox + Header (title, client, score, date)
       │    ├─ ClusterTags (pills)
       │    ├─ RelevanceSummary (deep only)
       │    ├─ Summary
       │    ├─ TopHighlights (top-1 decision, action, risk + expanders)
       │    └─ Footer (participants + Open button)
       └─ SaveAsThreadButton
```

## Ketchup Plan (38 bursts, 8 bottles)

### Bottle 1: Core Backend — Search Context (3 bursts)
- [ ] Burst 1: `buildSearchContext` — distilled format, meetingIds + maxChars + relevanceSummaries
- [ ] Burst 2: Per-meeting budget scaling (inverse of count)
- [ ] Burst 3: `contextMode` on `ConversationChatRequest` + handler wiring

### Bottle 2: API Fixes (2 bursts)
- [ ] Burst 4: `date_after`/`date_before` passthrough on `GET /api/search`
- [ ] Burst 5: Batch artifact endpoint `POST /api/artifacts/batch`

### Bottle 3: View Type & Navigation (5 bursts)
- [ ] Burst 6: Extend `View` type with `"search"` across all files
- [ ] Burst 7: NavRail search icon
- [ ] Burst 8: BottomTabBar + BreadcrumbBar entries
- [ ] Burst 9: TopBar submit → search view navigation
- [ ] Burst 10: Result click → meetings view navigation

### Bottle 4: Search State Hook (7 bursts)
- [ ] Burst 11: Hook skeleton — query, typed query, deep toggle
- [ ] Burst 12: Filter state — client, dateAfter, dateBefore
- [ ] Burst 13: Wire `useSearch`
- [ ] Burst 14: Wire `useDeepSearch`
- [ ] Burst 15: Checked results — toggle, clear
- [ ] Burst 16: `chatMeetingIds` — top-10 default, checked override
- [ ] Burst 17: Enriched results with artifact data

### Bottle 5: UI Components — Paper Design First (10 bursts)
- [ ] Burst 18: `SearchResultCard` header (checkbox, title, client, score, date)
- [ ] Burst 19: Cluster tag pills
- [ ] Burst 20: Deep search relevance summary (conditional)
- [ ] Burst 21: Full summary text
- [ ] Burst 22: Top-1 highlights (decision, action, risk) + "+N more"
- [ ] Burst 23: Expand/collapse for full lists
- [ ] Burst 24: Participants + "Open Meeting" button
- [ ] Burst 25: Checkbox toggles chat scope
- [ ] Burst 26: `SearchResultsList` — filter bar + cards + empty/loading states
- [ ] Burst 27: Cluster grouping mode with section headers

### Bottle 6: Page Assembly & Chat Wiring (5 bursts)
- [ ] Burst 28: `SearchPage` returns single panel
- [ ] Burst 29: `App.tsx` renders SearchPage for search view
- [ ] Burst 30: Chat IDs from search state
- [ ] Burst 31: `contextMode: "distilled"` for search chat
- [ ] Burst 32: Chat header shows result count

### Bottle 7: Save as Thread (3 bursts)
- [ ] Burst 33: "Save as Thread" button
- [ ] Burst 34: Save handler — create thread + link meetings
- [ ] Burst 35: Navigate to threads view after save

### Bottle 8: Polish (3 bursts)
- [ ] Burst 36: State persists across view switches
- [ ] Burst 37: Keyboard navigation (arrow keys + enter)
- [ ] Burst 38: Visual verification — Playwright vs Paper artboards

## Verification
1. **Unit tests**: All 38 bursts tested, 100% coverage
2. **Integration**: TopBar search → results → click result → meeting detail → back
3. **Chat**: Check 3 results → chat → verify `[M1][M2][M3]` citations match
4. **Deep search**: Toggle → relevance summaries on cards + in chat context
5. **Cluster grouping**: Toggle → results cluster under tag headers
6. **Save as Thread**: Save → threads view → meetings linked
7. **Visual**: Playwright screenshots at 2560x1440 vs Paper artboards
