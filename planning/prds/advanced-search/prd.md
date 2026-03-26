# PRD: Advanced Search Results

## Context

The current search bar in TopBar filters the meeting list in-place. As the system scales to hundreds of meetings across many clients, inline filtering isn't enough. Users need to:

1. **Triage search results** — see enough per result to decide if it's worth diving into
2. **Chat across results** — ask questions scoped to the result set, not just one meeting
3. **Apply advanced filters** — narrow by date range, field scope, enable LLM-powered deep search
4. **Discover patterns** — group results by semantic cluster to spot themes
5. **Bridge to tracking** — save a search as a Thread for ongoing monitoring

## Product Model

This is a **search results browser with scoped chat**. It is not a dashboard, not analytics, not a replacement for the meetings view. It's the answer to "what do I know about X?" with enough context to decide what to do next.

Two entry points, one destination:
- **Quick search** — TopBar enter → search view with query pre-filled, searches all fields
- **Advanced search** — NavRail search icon → search view with empty form, configure field scoping

The search view is a single view with two zones:
1. **Search form** (top, with Hide/Show toggle) — query input, "Search in" field toggles, date range, deep/cluster/sort options
2. **Results** (below) — result cards load below the form after searching

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout | Search form top + full-width result cards + chat panel (~40%) | Form always accessible, maximize scanning area |
| Card content | WHY + matched artifacts only, NO summary | Search matches specific items (decisions, actions, risks). Summary is a bulleted list that duplicates matched content. WHY from deep search is the primary context. |
| Card detail | Top-1 matched item per section + "+N more" expanders | Enough to triage without overwhelming |
| Chat scope | Top-N auto + checkbox override (N from config) | Balances token budget with user control; distilled context (no transcripts) |
| Deep search UX | Inline WHY (Option A style) — compact single-line label+text | Don't waste space; clear visual indicator of LLM involvement |
| Field scoping | "Search in" toggles: Summary, Decisions, Action Items, Risks, Features, Questions, Milestones | Power users narrow to specific artifact sections |
| Search form | Top of view with Hide/Show toggle | Single view, no page flipping. Hide to maximize result space, Show to tweak. |
| Client scope | Inherited from global client selector — no client filter on search | Search is already client-scoped |
| Meeting identity | Title + date combined (e.g., "Sprint Planning · Mar 12, 2026") | Most meetings are recurring; title alone is ambiguous |
| Participants | No generic participant list on cards. Owner/Reporter shown inline on action items where meaningful. | Bare names without roles aren't useful for triage |
| Open Meeting | CTA on header row. Opens MeetingDetail in center column (30/30/30 split). Chat context switches to single meeting. | Drill into detail without leaving search context |
| Pagination | "Showing N of M · Load more" | `displayLimit` from config controls page size |
| Config | `config/system.json` — `displayLimit`, `chatContextLimit` | Tweak without code changes |
| Search scope | Meetings only (v1) | Threads/insights searchable in future iteration |
| Cluster grouping | Optional toggle | Visual pattern discovery without forcing structure |
| Save as Thread | Button on results page | Natural bridge from "what do I know?" to "I need to track this" |

## Layout — Search Form Visible

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [L] LLSA ▾              95 meetings · 0 action items · 0 threads   Reset  [⚙]  │
├────┬──────────────────────────────────────────────────────┬──────────────────────┤
│    │  Search                                    [Hide ▲]  │                      │
│ Nav│  Query: [billing migration_________________________]  │  Assistant           │
│    │                                                      │  10 of 14 | 18K chars│
│ K  │  SEARCH IN                                           │                      │
│    │  [Sum ✓] [Dec ✓] [Act] [Risk] [Feat] [Qst] [Mile]   │  ┌────────────────┐  │
│    │                                                      │  │ User message   │  │
│ 🔍 │  From [mm/dd/yyyy] to [mm/dd/yyyy]                  │  └────────────────┘  │
│    │  [✓ Deep]  [Group clusters]  Sort: [Relevance ▾]    │                      │
│    │──────────────────────────────────────────────────────│  Assistant response  │
│    │  14 results in 0.3s         Select all | Save as Thrd│  with [M1][M3]       │
│    │  ┌────────────────────────────────────────────────┐  │  citations           │
│    │  │ Result card                                    │  │                      │
│    │  └────────────────────────────────────────────────┘  │                      │
│    │  ┌────────────────────────────────────────────────┐  │                      │
│    │  │ Result card                                    │  │  Ask about these...  │
│    │  └────────────────────────────────────────────────┘  │  [send]              │
│    │  Showing 2 of 14 · Load more                         │                      │
├────┴──────────────────────────────────────────────────────┴──────────────────────┤
```

## Layout — Detail Open (30/30/30 split)

When user clicks "Open" on a result card:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [L] LLSA ▾              95 meetings · 0 action items · 0 threads   Reset  [⚙]  │
├────┬────────────────┬─────────────────────────┬──────────────────────────────────┤
│    │ ← 14 results   │ Sprint Planning         │ Assistant      1 meeting         │
│ Nav│                 │ 2026-03-12  LLSA        │                                 │
│    │▶Sprint Planning│ onboarding billing migr │ Context: Sprint Planning (Mar 12)│
│    │  Mar 12  0.92  │                         │ [Back to search results]          │
│    │ Weekly Sync    │ SUMMARY                 │                                  │
│    │  Mar 5   0.87  │ Team reviewed the...    │ ┌──────────────────────────────┐ │
│    │ Billing Deep   │                         │ │ User message                 │ │
│    │  Feb 28  0.81  │ DECISIONS (2)           │ └──────────────────────────────┘ │
│    │ Enterprise...  │ • Phased rollout        │                                  │
│    │  Feb 20  0.74  │ • Delay billing v2      │ Assistant response               │
│    │                │                         │                                  │
│    │                │ ACTION ITEMS (3)        │                                  │
│    │                │ ☐ Draft migration plan  │                                  │
│    │                │   Owner: Sarah ...      │                                  │
├────┴────────────────┴─────────────────────────┴──────────────────────────────────┤
```

## Result Card Design

**Key principle: No summary block.** Search matches specific artifacts — a decision, an action item, a risk. The artifact summary is a bulleted list that would duplicate matched content. Instead, the card shows the WHY (explains relevance) and the matched artifacts (the evidence).

### Card — Default State

```
┌──────────────────────────────────────────────────────────────────┐
│ ☐  Sprint Planning · Mar 12, 2026                  0.92   Open  │
│    onboarding · billing · migration                              │
│                                                                  │
│    WHY  Discusses Q2 migration timeline and phased rollout       │
│         strategy that directly addresses billing concerns.       │
│                                                                  │
│       📌 Move to phased rollout approach           +1 more       │
│       ☐ Draft migration plan · Owner: Sarah · Reporter: Mike     │
│         · due Mar 20                               +2 more       │
│       ⚠ Legacy contract migration risk                          │
└──────────────────────────────────────────────────────────────────┘
```

### Card — Expanded State

```
┌──────────────────────────────────────────────────────────────────┐
│ ☑  Sprint Planning · Mar 12, 2026                  0.92   Open  │
│    onboarding · billing · migration                              │
│                                                                  │
│    WHY  Discusses Q2 migration timeline and phased rollout       │
│         strategy that directly addresses billing concerns.       │
│                                                                  │
│       DECISIONS (2)                                              │
│       📌 Move to phased rollout approach                         │
│       📌 Delay billing v2 to post-migration                      │
│                                                                  │
│       ACTION ITEMS (3)                            [collapse ▲]  │
│       ☐ Draft migration plan · Owner: Sarah · Reporter: Mike     │
│         · due Mar 20                                             │
│       ☐ Update API rate limits · Owner: Dev team · Reporter:     │
│         Sarah · due Mar 18                                       │
│       ☐ Schedule load test · Owner: QA · Reporter: Dev Lead      │
│         · due Mar 25                                             │
│                                                                  │
│       RISKS (1)                                                  │
│       ⚠ Legacy contract migration — custom billing rules may     │
│         break during transition                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Card anatomy:**
1. **Header**: Checkbox (chat scope) · Meeting title + date (identity) · Relevance score · "Open" CTA
2. **Tags**: Cluster tags as pills
3. **WHY** (deep search only): Inline LLM relevance explanation. Option A style — `WHY` label + italic text on amber background with left border. Deep search prompt can be tuned to pull out more detail.
4. **Matched artifacts** (indented): Top-1 decision, top-1 action item (with inline Owner/Reporter/due on same line), top-1 risk. Each with "+N more" expander.
5. **No summary block**: Summary is a bulleted list that duplicates matched artifacts. WHY provides the relevance context instead.
6. **No participant footer**: Owner/Reporter are shown on action items where meaningful. Generic participant names add no triage value.

### Field-scoped result priority

When "Search in" fields are selected, matched artifacts from those fields float to the top of the highlights. If you searched "Action Items" only, action items appear first. If you searched "Decisions", decisions float up.

### Cluster Grouping

When "Group by cluster" is toggled:

```
── onboarding · billing · migration (8 results) ─── Select all in group
  ┌─ Sprint Planning · Mar 12  ────── 0.92 ─┐
  └─────────────────────────────────────────┘
  ┌─ Weekly Sync · Mar 5  ────────── 0.87 ─┐
  └─────────────────────────────────────────┘

── billing · pricing · contracts (6 results) ─── Select all in group
  ┌─ Billing Deep Dive · Feb 28  ──── 0.81 ─┐
  └─────────────────────────────────────────┘
```

## User Flows

### Quick Search
1. User types query in TopBar search bar → presses Enter
2. App navigates to search view, query pre-filled in form, searches all fields
3. Hybrid search (vector + FTS) fires → results render as cards below form
4. Chat panel opens, auto-scoped to top-N results (N from config)
5. User scans cards, can tweak filters in the form

### Advanced Search
1. User clicks Search icon in NavRail → search view with empty form
2. Search is scoped to the globally selected client (inherited from TopBar)
3. User configures: query, "Search in" field toggles, date range, Deep Search, cluster grouping, sort
4. Pressing Enter fires search → results load below
5. Form stays visible — tweak and re-search. Or Hide to maximize result space.

### Chat with Results
1. Chat panel shows "N of M results" in header
2. Default: top-N by relevance included in chat context (N from `chatContextLimit` config)
3. User checks/unchecks result cards to override which meetings are in scope
4. Chat uses distilled context (artifacts only, no transcripts) to fit more meetings
5. Citations (`[M1]`, `[M2]`) reference specific result meetings

### Open Meeting Detail
1. User clicks "Open" on a result card header
2. Layout splits to 30/30/30: compact results sidebar + MeetingDetail + chat
3. Chat context switches from "N search results" to single meeting
4. Chat banner shows "Context: [meeting title] · Back to search results"
5. Click another result in sidebar to switch
6. Click "Back to full view" to close detail and return to full-width cards

### Save as Thread
1. User clicks "Save as Thread" button in results header
2. Creates a new Thread titled from the search query
3. All result meetings linked to the thread
4. Navigates to Threads view with the new thread selected

## Configuration

Extend `config/system.json`:

```json
{
  "search": {
    "maxDistance": 1.7,
    "limit": 50,
    "displayLimit": 20,
    "chatContextLimit": 10
  }
}
```

| Setting | Default | Purpose |
|---|---|---|
| `limit` | 50 | Max results from backend (existing) |
| `displayLimit` | 20 | Results shown before "Load more" |
| `chatContextLimit` | 10 | Default meetings in chat context |

## Architecture

### New View
- Add `"search"` to `View` union type in `App.tsx`, `NavRail.tsx`, `BottomTabBar.tsx`, `ResponsiveShell.tsx`, `BreadcrumbBar.tsx`
- `SearchPage()` returns `[<SearchResultsList />]` (single panel, full width)

### State: `useSearchState` hook
New hook at `electron-ui/ui/src/hooks/useSearchState.ts`:
- `searchQuery`, `typedSearchQuery` — query text
- `searchFields: Set<string>` — which artifact fields to search in, defaults to all
- `dateAfter`, `dateBefore` — date range filters (client inherited from global scope)
- `deepSearchEnabled` — toggle
- `formVisible` — Hide/Show toggle state
- `checkedResultIds: Set<string>` — chat scope overrides
- `groupByCluster: boolean` — cluster grouping toggle
- Wires existing `useSearch()` + `useDeepSearch()` hooks with `searchFields` param
- Computes `chatMeetingIds`: checked IDs if any, else top-N by score (N from config)
- Fetches artifacts for visible results via `useQueries` (or batch endpoint)
- Produces `enrichedResults[]` with matched artifacts, counts, tags

### Chat Context
- New `buildSearchContext(db, meetingIds, options?)` in `core/labeled-context.ts`
- Distilled format: artifacts only, no transcripts, no mention stats
- Token budget: `maxChars` scales per-meeting allocation inversely with count
- Optional `relevanceSummaries` map from deep search
- Exposed via `contextMode: "distilled"` on `ConversationChatRequest`

### API
- Fix: pass `date_after`/`date_before` through `GET /api/search` route
- New: `POST /api/artifacts/batch` for efficient multi-artifact fetch
- New: `searchFields` param on `GET /api/search` — field-scoped FTS matching
- New: field-tagged FTS index (split artifact content by field tags for scoped matching)

### Component Tree
```
SearchPage.tsx
  ├─ SearchForm.tsx (top, with Hide/Show toggle)
  │    ├─ QueryInput
  │    ├─ FieldToggles ("Search in" pills)
  │    ├─ DateRange (From/to pickers)
  │    └─ Options (Deep, Group clusters, Sort)
  └─ SearchResultsList.tsx (below form)
       ├─ ResultsHeader (count + Select all + Save as Thread)
       ├─ [ClusterGroupHeader] (optional)
       ├─ SearchResultCard.tsx (per result)
       │    ├─ Header (checkbox, title+date, score, Open CTA)
       │    ├─ ClusterTags (pills)
       │    ├─ WHY (deep only, inline Option A style)
       │    ├─ MatchedArtifacts (indented, top-1 per section + expanders)
       │    │    ├─ Decision (icon + text + "+N more")
       │    │    ├─ ActionItem (checkbox + text + Owner/Reporter/due inline + "+N more")
       │    │    └─ Risk (warning icon + text)
       │    └─ (no summary, no participants footer)
       └─ LoadMore ("Showing N of M · Load more")
```

## Ketchup Plan (46 bursts, 9 bottles)

### Bottle 1: Core Backend — Search Context (3 bursts)
- [ ] Burst 1: `buildSearchContext` — distilled format, meetingIds + maxChars + relevanceSummaries
- [ ] Burst 2: Per-meeting budget scaling (inverse of count)
- [ ] Burst 3: `contextMode` on `ConversationChatRequest` + handler wiring

### Bottle 2: API & Field-Scoped Search (4 bursts)
- [ ] Burst 4: `date_after`/`date_before` passthrough on `GET /api/search`
- [ ] Burst 5: Batch artifact endpoint `POST /api/artifacts/batch`
- [ ] Burst 6: Field-scoped FTS — tag artifact content by field in `artifact_fts`
- [ ] Burst 7: `searchFields` param on `GET /api/search` — filter FTS matches to specified fields

### Bottle 3: Config & View Wiring (7 bursts)
- [ ] Burst 8: Add `displayLimit` and `chatContextLimit` to `config/system.json` + `config.ts`
- [ ] Burst 9: Extend `View` type with `"search"` across all files
- [ ] Burst 10: NavRail search icon
- [ ] Burst 11: BottomTabBar + BreadcrumbBar entries
- [ ] Burst 12: TopBar submit → search view navigation (form pre-filled, all fields)
- [ ] Burst 13: Result Open → 30/30/30 detail layout with chat context switch
- [ ] Burst 14: "Back to full view" returns to full-width results, restores multi-result chat

### Bottle 4: Search State Hook (9 bursts)
- [ ] Burst 15: Hook skeleton — query, typed query, deep toggle
- [ ] Burst 16: Filter state — dateAfter, dateBefore (client from global scope)
- [ ] Burst 17: Field scope state — `searchFields: Set<string>`, toggleField(), defaults to all
- [ ] Burst 18: Form visibility — `formVisible: boolean`, toggle
- [ ] Burst 19: Wire `useSearch` with `searchFields` param
- [ ] Burst 20: Wire `useDeepSearch`
- [ ] Burst 21: Checked results — toggle, clear
- [ ] Burst 22: `chatMeetingIds` — top-N default (from config), checked override
- [ ] Burst 23: Enriched results with matched artifact data (no summary, just matched sections)

### Bottle 5: Search Form UI (4 bursts)
- [ ] Burst 24: `SearchForm` — query input, Hide/Show toggle
- [ ] Burst 25: Field toggle pills — clickable active/inactive states, "SEARCH IN" label
- [ ] Burst 26: Date range pickers + options row (Deep, Group clusters, Sort)
- [ ] Burst 27: Form submit — Enter key triggers search with current state

### Bottle 6: Result Card UI — Paper Design First (8 bursts)
- [ ] Burst 28: `SearchResultCard` header (checkbox, title+date, score, Open CTA)
- [ ] Burst 29: Cluster tag pills
- [ ] Burst 30: Inline WHY (Option A style — amber left border, WHY label + italic text)
- [ ] Burst 31: Matched artifacts — indented decision + action item (Owner/Reporter/due inline) + risk
- [ ] Burst 32: "+N more" expanders → full section lists on click
- [ ] Burst 33: Checkbox toggles chat scope
- [ ] Burst 34: `SearchResultsList` — results header + cards + empty/loading states + Load more
- [ ] Burst 35: Cluster grouping mode with section headers + "Select all in group"

### Bottle 7: Page Assembly & Chat Wiring (5 bursts)
- [ ] Burst 36: `SearchPage` returns form + results as single panel
- [ ] Burst 37: `App.tsx` renders SearchPage for search view
- [ ] Burst 38: Chat IDs from search state (multi-result or single-meeting based on detail open)
- [ ] Burst 39: `contextMode: "distilled"` for search chat
- [ ] Burst 40: Chat header shows result count + context switch banner when detail open

### Bottle 8: Save as Thread (3 bursts)
- [ ] Burst 41: "Save as Thread" button in results header
- [ ] Burst 42: Save handler — create thread from query + link result meetings
- [ ] Burst 43: Navigate to threads view after save

### Bottle 9: Polish (3 bursts)
- [ ] Burst 44: State persists across view switches
- [ ] Burst 45: Keyboard navigation (arrow keys + enter)
- [ ] Burst 46: Visual verification — Playwright vs Paper artboards

## Verification
1. **Unit tests**: All 46 bursts tested, 100% coverage
2. **Integration**: TopBar search → results → Open result → detail panel → back to results
3. **Chat context switch**: Open meeting → chat shows single meeting → Back to search results → chat shows multi-result
4. **Field scoping**: Select "Action Items" only → results prioritize action item matches
5. **Deep search**: Toggle → WHY appears on cards + included in chat context
6. **Cluster grouping**: Toggle → results cluster under tag headers
7. **Save as Thread**: Save → threads view → meetings linked
8. **Config**: Change `displayLimit` in system.json → page size changes without code
9. **Visual**: Playwright screenshots at 2560x1440 vs Paper artboards
