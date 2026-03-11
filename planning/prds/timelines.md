# Timelines Feature Plan

## Context

The system extracts action items, decisions, and risk items from meetings but lacks a way to track **milestones** — higher-level directional commitments like system launches, project phases, go-live dates, and migration completions. Milestones span multiple meetings, have target dates, and progress through a lifecycle. The "Timelines" view surfaces these milestones chronologically per client.

**Key distinction**: Milestones are NOT tied to action items. Action items are simple tasks; milestones are directional commitments like "launching the new commerce experience to 10% of users end of March." Users may optionally link action items to milestones manually from the UI, but there is no automatic linking.

**Scope**: Core + chat + search + date slippage. Client-scoped only (no cross-client view). No LLM narrative generation or LLM meeting evaluation in this iteration.

## Data Model

### New Tables (in `core/db.ts` migrate())

```sql
milestones (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date TEXT,                -- ISO date, nullable
  status TEXT DEFAULT 'identified', -- identified | tracked | completed | missed | deferred
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (client_name) REFERENCES clients(name)
)

milestone_mentions (
  milestone_id TEXT NOT NULL,
  meeting_id TEXT NOT NULL,
  mention_type TEXT NOT NULL,      -- introduced | updated | completed | deferred | referenced
  excerpt TEXT DEFAULT '',
  target_date_at_mention TEXT,     -- captures target date at time of this mention (for slippage detection)
  mentioned_at TEXT NOT NULL,      -- meeting date (denormalized)
  pending_review INTEGER DEFAULT 0,
  PRIMARY KEY (milestone_id, meeting_id),
  FOREIGN KEY (milestone_id) REFERENCES milestones(id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
)

milestone_action_items (
  milestone_id TEXT NOT NULL,
  meeting_id TEXT NOT NULL,
  item_index INTEGER NOT NULL,
  linked_at TEXT NOT NULL,
  PRIMARY KEY (milestone_id, meeting_id, item_index),
  FOREIGN KEY (milestone_id) REFERENCES milestones(id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
)

milestone_messages (
  id TEXT PRIMARY KEY,
  milestone_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sources TEXT,
  context_stale INTEGER DEFAULT 0,
  stale_details TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id)
)
```

### Artifact Extension

Add `milestones` TEXT column to artifacts table (ALTER TABLE migration, same pattern as `additional_notes`). Add to `Artifact` interface, `REQUIRED_KEYS`, `validateArtifact`, `mergeArtifacts`, `storeArtifact`, `ArtifactRow`.

## Extraction

Extend the existing extraction prompt (`config/prompts/extraction.md`) with a new `milestones` field:

```
- milestones (array of objects): Directional commitments from CLIENT TEAM members only (see Client Context above).
  These are significant project waypoints — system launches, project phases, go-live dates, migrations,
  contract renewals. NOT action items or tasks. Only extract when spoken by a client team member.
  If no client context is available, return an empty array.
  Each: { title, target_date (ISO|null), status_signal ("introduced"|"updated"|"completed"|"deferred"|"referenced"), excerpt }
```

**Speaker filtering**: The extraction prompt already receives `{{client_context}}` which lists client team members with names/roles via `buildClientContext()` in `core/client-registry.ts:92`. The prompt instructs the LLM to only extract milestones from client team speakers, filtering out noise from implementation team members discussing their own deadlines.

No new LLM capability needed — milestones are extracted inline with existing `extract_artifact`.

## Reconciliation (`core/timelines.ts`)

After extraction, `reconcileMilestones(db, clientName, meetingId, meetingDate, extractedMilestones)`:
1. For each extracted milestone, search existing milestones for same client by **normalized title (exact match first)**
2. **Exact match found**: create `milestone_mentions` row, update status/target_date if signal warrants
3. **No exact match → fuzzy match**: compare against all client milestones using string similarity (Levenshtein/Dice coefficient). If similarity > threshold (e.g., 0.7), flag as **pending confirmation** rather than auto-matching
4. **No match at all**: create new `milestones` row + first mention
5. Status transitions: `identified → tracked` on 2nd mention (auto); explicit `completed`/`deferred` from LLM signal; `missed` is manual only

**Fuzzy match confirmation flow**:
- `milestone_mentions` gets a `pending_review INTEGER DEFAULT 0` column
- When fuzzy match is found, create the mention with `pending_review = 1` and store the candidate milestone_id
- UI shows a "Review" badge on milestones with pending mentions
- User confirms (merge into existing) or rejects (keep as separate milestone)
- `confirmMilestoneMention(db, mentionId)` and `rejectMilestoneMention(db, mentionId)` functions

**Re-extraction integration**:
- `handleReExtract` in `ipc-handlers.ts` already deletes old artifact and re-extracts
- After `storeArtifact`, add: clean up old `milestone_mentions` for this meeting, then call `reconcileMilestones`
- This means re-extracting a meeting automatically re-evaluates its milestones

**Manual merge**:
- `mergeMilestones(db, sourceId, targetId)`: move all mentions + action item links from source to target, delete source
- Available in UI when user spots duplicates the fuzzy matching didn't catch

Called from `pipeline.ts` after `storeArtifact` and from `handleReExtract` after re-extraction.

## Core Module: `core/timelines.ts`

| Function | Purpose |
|----------|---------|
| `createMilestone(db, input)` | Manual creation |
| `getMilestone(db, id)` | Single milestone |
| `updateMilestone(db, id, input)` | Edit title/desc/date/status |
| `deleteMilestone(db, id)` | Cascade delete mentions + action item links + messages |
| `listMilestonesByClient(db, clientName)` | All milestones with mention_count + first_mentioned_at |
| `addMilestoneMention(db, input)` | Record meeting mention |
| `getMilestoneMentions(db, milestoneId)` | Chronological mentions with meeting context |
| `getDateSlippage(db, milestoneId)` | Returns array of {meeting_date, target_date_at_mention} showing date changes |
| `linkActionItem(db, milestoneId, meetingId, itemIndex)` | Manual association from UI |
| `unlinkActionItem(db, milestoneId, meetingId, itemIndex)` | Remove association |
| `getMilestoneActionItems(db, milestoneId)` | Linked items with meeting context |
| `reconcileMilestones(db, client, meetingId, date, extracted)` | Pipeline dedup/unify — exact match, fuzzy match (pending review), or create new |
| `confirmMilestoneMention(db, milestoneId, meetingId)` | Confirm fuzzy match (set pending_review = 0) |
| `rejectMilestoneMention(db, milestoneId, meetingId)` | Reject fuzzy match → create new milestone from the pending mention |
| `mergeMilestones(db, sourceId, targetId)` | Manual merge: move all mentions + links from source to target, delete source |
| `appendMilestoneMessage(db, input)` | Store chat message |
| `getMilestoneMessages(db, milestoneId)` | Fetch chat history |
| `clearMilestoneMessages(db, milestoneId)` | Delete chat history |
| `getMilestoneChatContext(db, vdb, session, milestoneId, userMsg, includeTranscripts, topK)` | Build RAG context from milestone's meetings |
| `getMeetingMilestones(db, meetingId)` | Get milestone tags for a meeting (for badges) |

## Search Integration

### FTS
- After `reconcileMilestones`, call `updateMilestoneFts(db, milestoneId)` to index milestone title + description in a new `milestone_fts` FTS5 table
- Alternatively, include milestone titles in `artifact_fts` content for meetings that mention milestones

### Meeting Context (`core/labeled-context.ts`)
- In `buildLabeledContext`, when a meeting has associated milestones (via `milestone_mentions`), include a "Milestones:" section listing milestone titles + target dates + status
- Reuse existing pattern: `getMeetingMilestones(db, meetingId)` returns `[{title, target_date, status}]`

### Meeting Cards
- Add `milestone_tags` to `MeetingRow` (same pattern as `thread_tags`)
- Query `milestone_mentions mm JOIN milestones m` in `handleGetMeetings`
- Display as clickable badges on meeting list items + MeetingDetail

## Chat (follows Thread/Insight chat pattern)

### Architecture
- `getMilestoneChatContext(db, vdb, session, milestoneId, userMsg, includeTranscripts, topK=7)`:
  1. Get all meeting IDs from `milestone_mentions` for this milestone
  2. Embed user message, search within those meetings (vector KNN)
  3. Build system context: milestone title, description, target_date, status, mention history
  4. Include top-K meeting artifacts
  5. Return `{systemContext, meetingIds}` for source attribution

### IPC
- `MILESTONE_CHAT` channel + `GET_MILESTONE_MESSAGES` + `CLEAR_MILESTONE_MESSAGES`
- Same request/response shape as `ThreadChatRequest`/`ThreadChatResponse`

## Date Slippage Detection

- `getDateSlippage(db, milestoneId)`: query `milestone_mentions` ordered by `mentioned_at`, return rows where `target_date_at_mention` differs from previous mention
- UI in TimelineDetailView: if slippage detected, show a "Date History" section:
  - Timeline of date changes: "Jan 15: target March 15 → Feb 8: target March 31 → Mar 1: target April 15"
  - Visual indicator (amber warning) when target has moved

## IPC/API Layer

**Channels** (`channels.ts`):
- CRUD: `LIST_MILESTONES`, `CREATE_MILESTONE`, `UPDATE_MILESTONE`, `DELETE_MILESTONE`
- Mentions: `GET_MILESTONE_MENTIONS`, `CONFIRM_MILESTONE_MENTION`, `REJECT_MILESTONE_MENTION`
- Merge: `MERGE_MILESTONES`
- Action items: `LINK_MILESTONE_ACTION_ITEM`, `UNLINK_MILESTONE_ACTION_ITEM`, `GET_MILESTONE_ACTION_ITEMS`
- Chat: `MILESTONE_CHAT`, `GET_MILESTONE_MESSAGES`, `CLEAR_MILESTONE_MESSAGES`
- Cross-ref: `GET_MEETING_MILESTONES`

**HTTP routes** (`api/server.ts`): Mirror IPC as REST endpoints under `/api/milestones`

**API client** (`api-client.ts`): Add corresponding methods

## UI

### Navigation
- Add `"timelines"` to `currentView` union + NavRail
- `selectedMilestoneId` state in App.tsx

### Two Visualization Modes (toggle in TimelinesView)

**Timeline View (Gantt-style, like Jira roadmap screenshot)**
- Left column: milestone title + status badge (identified/tracked/completed/missed/deferred)
- Right column: horizontal Gantt bars across month columns
- Bar spans from first mention date → `target_date`
- **Today marker**: blue vertical line at current date
- Bar colors by status: green=completed, blue=tracked, gray=identified, red=missed, amber=deferred
- Click a bar → selects milestone → opens detail panel
- Custom CSS grid implementation (no external Gantt library)
- Auto-scroll to center today marker on load

**Calendar View (month grid)**
- Standard month grid with milestone target dates placed on their date cells
- Status-colored dots/pills on dates where milestones land
- Navigate months with prev/next arrows
- Click a date pill → selects milestone → opens detail panel
- Milestones without target_date shown in an "Unscheduled" section below calendar

### Edit Functionality (modeled after Insights/Threads)

**Inline editing in TimelineDetailView** (follows InsightDetailView pattern):
- Edit mode toggle (Pencil → ArrowLeft back button)
- View mode: title, description, target date, status badge, date slippage, mentions timeline, linked action items
- Edit mode:
  - Title: text input
  - Description: textarea
  - Target date: native `<input type="date">`
  - Status: dropdown (identified/tracked/completed/missed/deferred)
  - Save/Cancel buttons

**CreateMilestoneDialog** (follows CreateThreadDialog pattern):
- Reused for both create and edit
- Fields: title, description, target_date (date input), client (pre-filled)

### Detail View Sections
1. **Header**: title, status badge, target date, edit/delete buttons
2. **Date Slippage** (conditional): amber warning with date change timeline when target has moved
3. **Mentions Timeline**: chronological list of meeting mentions with excerpt, mention_type badge, meeting link
4. **Linked Action Items**: manually linked items with meeting context, link/unlink controls
5. **Chat Panel**: milestone-scoped Q&A (same pattern as thread/insight chat)

### UX Patterns (matching Threads/Insights)
- **Toast notifications**: all CRUD actions, chat clear
- **Confirmation dialogs**: delete milestone (`pendingDeleteMilestoneId`), clear messages (`pendingClearMilestoneMessages`)
- **Empty states**: "No milestones", "No mentions yet", "No linked action items"
- **Milestone badges on meetings**: clickable badges on MeetingList + MeetingDetail (like thread_tags)

### Components
- `TimelinesView.tsx` — list panel with view mode toggle (timeline/calendar) + status filter
- `MilestoneGanttView.tsx` — Gantt chart: month columns, horizontal bars, today marker
- `MilestoneCalendarView.tsx` — month grid with milestone dots
- `TimelineDetailView.tsx` — detail panel: header, slippage, mentions, action items, edit mode
- `CreateMilestoneDialog.tsx` — create/edit form dialog

### App.tsx State
```
selectedMilestoneId, createMilestoneOpen, editMilestoneOpen,
pendingDeleteMilestoneId, pendingClearMilestoneMessages
```

### App.tsx Queries
```
milestonesQuery (client-scoped), milestoneMentionsQuery,
milestoneMessagesQuery, milestoneActionItemsQuery
```

## Ketchup Bursts

### Phase 1: Data Model + Core CRUD
- [x] Burst 1: Add 4 new tables (milestones, milestone_mentions, milestone_action_items, milestone_messages) + milestones column to artifacts in `migrate()`
- [x] Burst 2: `createMilestone` — insert + return
- [x] Burst 3: `getMilestone` — by id, returns null if missing
- [x] Burst 4: `updateMilestone` — partial update, returns updated
- [x] Burst 5: `deleteMilestone` — cascade delete mentions + action item links + messages
- [x] Burst 6: `listMilestonesByClient` — with mention_count + first_mentioned_at, ordered by target_date

### Phase 2: Mentions + Action Item Links
- [x] Burst 7: `addMilestoneMention` — UPSERT mention row
- [x] Burst 8: `getMilestoneMentions` — JOIN meeting title/date, chronological order
- [x] Burst 9: `getDateSlippage` — returns date changes across mentions
- [x] Burst 10: `linkActionItem` + `unlinkActionItem`
- [x] Burst 11: `getMilestoneActionItems` — linked items with meeting context
- [x] Burst 12: `getMeetingMilestones` — milestone tags for a meeting (for badges)

### Phase 3: Extraction Changes
- [x] Burst 13: Add `milestones` to Artifact interface, REQUIRED_KEYS, validateArtifact (backward-compat `[]`)
- [x] Burst 14: Add milestones to stub fixture + mergeArtifacts dedup
- [x] Burst 15: Update storeArtifact/getArtifact/ArtifactRow for milestones column
- [x] Burst 16: Update extraction prompt template

### Phase 4: Pipeline Reconciliation
- [x] Burst 17: `reconcileMilestones` — creates new milestone when no title match
- [x] Burst 18: `reconcileMilestones` — exact match by normalized title, creates mention
- [x] Burst 19: `reconcileMilestones` — fuzzy match (string similarity > 0.7), creates mention with pending_review=1
- [x] Burst 20: `reconcileMilestones` — status transition logic (identified→tracked on 2nd mention)
- [x] Burst 21: `confirmMilestoneMention` + `rejectMilestoneMention` — resolve pending fuzzy matches
- [x] Burst 22: `mergeMilestones` — move all mentions + links from source to target, delete source
- [x] Burst 23: Wire `reconcileMilestones` into pipeline.ts after storeArtifact
- [x] Burst 24: Wire `reconcileMilestones` into `handleReExtract` (clean old mentions, re-reconcile)

### Phase 5: Chat
- [x] Burst 25: `appendMilestoneMessage` + `getMilestoneMessages` + `clearMilestoneMessages`
- [x] Burst 26: `getMilestoneChatContext` — build RAG context from milestone's meetings (follows getThreadChatContext pattern)

### Phase 6: Search Integration
- [x] Burst 27: `getMeetingMilestones` integration into `handleGetMeetings` (milestone_tags on MeetingRow)
- [x] Burst 28: Add milestone context to `buildLabeledContext` when meeting has milestone mentions

### Phase 7: IPC + API
- [x] Burst 29: Add milestone channels + interfaces to channels.ts (including confirm/reject/merge)
- [x] Burst 30: IPC handlers for list/create/update/delete milestones
- [x] Burst 31: IPC handlers for mentions + action item linking + getMeetingMilestones + confirm/reject/merge
- [x] Burst 32: IPC handlers for chat (milestone_chat, get/clear messages)
- [x] Burst 33: HTTP routes in api/server.ts
- [x] Burst 34: API client methods in api-client.ts

### Phase 8: UI — Navigation + Detail
- [x] Burst 35: Add "timelines" to NavRail + currentView + selectedMilestoneId + state variables
- [x] Burst 36: TimelinesView — milestone list with status badges + view mode toggle (list/timeline/calendar)
- [x] Burst 37: TimelinesView — status filter dropdown + "Review" badge on milestones with pending fuzzy matches
- [x] Burst 38: TimelineDetailView — view mode: header with title/date/status badge + delete confirmation
- [ ] Burst 39: TimelineDetailView — date slippage section (amber warning + date change timeline)
- [x] Burst 40: TimelineDetailView — mentions timeline section (chronological with meeting links + pending review indicators)
- [x] Burst 41: TimelineDetailView — pending mention review UI (confirm/reject fuzzy matches)
- [x] Burst 42: TimelineDetailView — linked action items section
- [x] Burst 43: TimelineDetailView — edit mode toggle + inline editing (title, description, target_date, status)
- [x] Burst 44: TimelineDetailView — merge milestone action (select target milestone, confirm)
- [x] Burst 45: CreateMilestoneDialog — create/edit form (reused for both)
- [x] Burst 46: Wire TimelinesView + TimelineDetailView + chat panel into App.tsx
- [x] Burst 47: Milestone badges on MeetingList + MeetingDetail (clickable, navigate to timelines)
- [x] Burst 48: Update Re-Extract tooltip to mention milestone re-evaluation

### Phase 9: UI — Gantt Timeline View
- [x] Burst 49: MilestoneGanttView — month column headers + date grid layout (CSS grid)
- [x] Burst 50: MilestoneGanttView — horizontal bars (first_mention → target_date) with status colors
- [x] Burst 51: MilestoneGanttView — today marker (blue vertical line) + auto-scroll to today
- [x] Burst 52: MilestoneGanttView — click bar to select milestone + status badges in left column

### Phase 10: UI — Calendar View
- [x] Burst 53: MilestoneCalendarView — month grid with prev/next navigation
- [x] Burst 54: MilestoneCalendarView — milestone dots/pills on target date cells with status colors
- [x] Burst 55: MilestoneCalendarView — click pill to select milestone + unscheduled section

### Phase 11: Playwright E2E Tests (`test/e2e/milestones.spec.ts`)
Follows `test/e2e/insights.spec.ts` pattern: API helpers for setup/teardown, shared navigation utils.

**API Helpers:**
- `createMilestoneViaAPI(clientName, title, targetDate)` / `deleteMilestoneViaAPI(id)`
- `listMilestonesViaAPI(clientName)` / `cleanupAllTestMilestones(clientName)`
- `addMilestoneMentionViaAPI(milestoneId, meetingId, mentionType, excerpt)`

**Test Groups:**
- [x] Burst 56: Navigation + empty state — nav to Timelines via NavRail, "No milestones" empty state
- [x] Burst 57: Create milestone — dialog opens, form validation, create shows toast, milestone appears in list
- [x] Burst 58: Milestone detail — selecting milestone shows detail panel with header, status badge, target date
- [x] Burst 59: Edit milestone — edit mode toggle, change title/date/status, save shows toast, values updated
- [x] Burst 60: Delete with confirmation — delete opens dialog, cancel preserves, confirm removes + toast
- [x] Burst 61: Date slippage — create milestone with mentions at different target dates, verify slippage section visible
- [ ] Burst 62: Mentions timeline — milestone with multiple mentions shows chronological list with meeting links
- [ ] Burst 63: Chat panel — chat visible when milestone selected, send message, clear messages confirmation + toast
- [ ] Burst 64: Milestone badges on meetings — navigate to meetings view, verify milestone badges appear on meeting cards
- [ ] Burst 65: Gantt view — toggle to timeline view, verify bars render, today marker visible, click bar selects milestone
- [ ] Burst 66: Calendar view — toggle to calendar view, verify month grid, milestone pills on dates, click navigates
- [ ] Burst 67: State consistency — delete selected milestone clears detail, status change updates list badge
- [ ] Burst 68: Fuzzy match review — create two similar milestones, verify "Review" badge, confirm/reject flow

## Critical Files
- `core/db.ts` — schema migrations (lines 9-164, 166-211)
- `core/extractor.ts` — Artifact interface (line 12-20), validateArtifact (33-74), mergeArtifacts (95-141), storeArtifact (177-191)
- `core/timelines.ts` — NEW module (CRUD, mentions, slippage, chat context, reconciliation)
- `core/pipeline.ts` — add reconcileMilestones call after storeArtifact
- `core/labeled-context.ts` — add milestone context to meeting blocks
- `config/prompts/extraction.md` — add milestones field
- `core/llm-provider-stub.ts` — add milestones to extract_artifact fixture
- `electron-ui/electron/channels.ts` — new channels + interfaces
- `electron-ui/electron/ipc-handlers.ts` — new handlers (CRUD, chat, cross-ref) + extend `handleReExtract` (line 262) with milestone reconciliation
- `api/server.ts` — new routes under /api/milestones
- `electron-ui/ui/src/api-client.ts` — new methods
- `electron-ui/ui/src/App.tsx` — new view state, queries, handlers, chat wiring
- `electron-ui/ui/src/components/TimelinesView.tsx` — NEW (list + view mode toggle)
- `electron-ui/ui/src/components/MilestoneGanttView.tsx` — NEW (Gantt bars + month cols + today marker)
- `electron-ui/ui/src/components/MilestoneCalendarView.tsx` — NEW (month grid + milestone dots)
- `electron-ui/ui/src/components/TimelineDetailView.tsx` — NEW (detail + slippage + edit mode)
- `electron-ui/ui/src/components/CreateMilestoneDialog.tsx` — NEW (create/edit dialog)
- `electron-ui/ui/src/components/MeetingDetail.tsx` — add milestone badges (like thread_tags)
- `electron-ui/ui/src/components/MeetingList.tsx` — add milestone badges
- `test/e2e/milestones.spec.ts` — NEW (Playwright E2E tests)
- `test/ui/timelines-view.test.tsx` — NEW (Vitest component tests)
- `test/ui/timeline-detail-view.test.tsx` — NEW (Vitest component tests)
- `test/ui/create-milestone-dialog.test.tsx` — NEW (Vitest component tests)
- `test/timelines.test.ts` — NEW (core module unit tests)
- `playwright.config.ts` — existing, no changes needed (testDir: ./test/e2e)

## Reusable Patterns & Functions
- `buildClientContext()` in `core/client-registry.ts:92` — already injected into extraction prompt
- `normalizeString()` in `core/extractor.ts:81` — for milestone title dedup
- `getThreadChatContext()` in `core/threads.ts` — pattern for getMilestoneChatContext
- `thread_tags` query in `ipc-handlers.ts` handleGetMeetings — pattern for milestone_tags
- `buildLabeledContext()` in `core/labeled-context.ts` — extend with milestone section
- `CreateThreadDialog` pattern — reuse for CreateMilestoneDialog
- `InsightDetailView` edit toggle pattern — reuse for TimelineDetailView
- Toast + confirmation dialog patterns in App.tsx

## Verification
1. Run `pnpm test --run` — all existing + new tests pass
2. Process a meeting with milestone mentions → verify milestone created in DB
3. Process second meeting mentioning same milestone (exact title) → verify dedup (single milestone, 2 mentions)
4. Process meeting with similar but not identical milestone title → verify fuzzy match creates pending_review mention
5. Confirm/reject pending mention → verify merge or new milestone creation
6. Process meeting where target date changed → verify slippage detection shows date history
7. Re-extract a meeting → verify old milestone mentions cleaned up and re-reconciled
8. UI: navigate to Timelines view, verify list/detail/filtering work
9. UI: manually create milestone, edit status, link action items
10. UI: merge two milestones → verify all mentions consolidated
11. UI: open chat on a milestone, ask question, verify scoped to milestone's meetings
12. UI: verify milestone badges appear on meeting cards and detail view
13. UI: verify Re-Extract tooltip mentions milestone re-evaluation
14. UI: verify Gantt bars render with correct date spans and today marker
15. UI: verify calendar shows milestone pills on target dates
16. Run `pnpm playwright test` — all E2E tests pass (navigation, CRUD, detail, edit, delete, chat, Gantt, calendar, slippage, fuzzy review)
