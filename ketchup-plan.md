# Notes Feature
## Ketchup Plan

---

# 0. SYSTEM GOAL

Add user-defined rich-text notes to Meetings, Insights, Milestones, and Threads. Notes are durable, user-authored annotations that persist alongside the object — unlike chat (ephemeral Q&A) or extracted artifacts (LLM-generated). The feature uses a dialog-based CRUD pattern triggered from the CommandBar (Meetings) or header button rows (Threads, Insights, Timelines). Action Items do not have their own notes — they inherit from their parent Meeting when drilling into Meeting Detail.

This plan follows **The Ketchup Technique**. Each Burst is atomic: one test, one behavior, one commit.

---

# DESIGN SOURCE OF TRUTH

**Paper MCP** is the visual source of truth. The Paper file `Meeting Insights.paper` contains the approved artboard.

### Artboard Reference

| Artboard Name | Contains | Used By Sections |
|---------------|----------|-----------------|
| Notes Feature — Dialog Exploration | All Notes UI: CommandBar integration per area, list dialog, compose dialog (Lexical RTE), cross-object variants, empty state, action menu, data model, architecture notes | 1, 2, 3, 4, 5, 6 |
| Concept A — Meeting Detail | Meeting Detail layout with CommandBar — reference for Notes button placement | 4 |
| Component Decomposition | CommandBar molecule specs | 4 |

### Mandatory Paper MCP Protocol

Before implementing any burst that touches UI:

1. `get_basic_info` → find artboard IDs
2. `get_screenshot` on the artboard referenced in the section's `Design reference` field
3. `get_computed_styles` on specific nodes if exact CSS values are needed
4. Implement the component to match the artboard
5. After implementation, verify with Playwright MCP (see Design Verification Gates below)

### PRD

Full specification: `planning/prds/notes.md`

---

# DESIGN DECISIONS

Decisions made from Paper explorations:

| Decision | Choice | Source |
|----------|--------|--------|
| Storage format | HTML (from Lexical RichTextEditor) | PRD — compose state uses existing Lexical component |
| Data model | Polymorphic `notes` table (`object_type` + `object_id`) | Artboard Section 6 — Implementation Notes |
| Object types | Meeting, Insight, Milestone, Thread (NOT Action Items) | Artboard Section 1 — Action Items inherits from Meeting |
| Dialog pattern | Single NotesDialog with list/compose/edit modes | Artboard Sections 2, 3 |
| Trigger pattern | CommandBar button (Meetings) / header button (Threads, Insights, Timelines) | Artboard Section 1 |
| Delete pattern | Two-phase confirmation (existing `pendingDelete` pattern) | Artboard Section 5 |
| Rich text editor | Existing Lexical `RichTextEditor` component (Bold, Italic, Underline, Bullet List, Ordered List) | Artboard Section 3 — Compose State |
| Badge count | Amber tint button with numeric badge, always visible (even at 0, badge hides but button stays) | Artboard Section 1 |

---

# EXISTING INFRASTRUCTURE

| Layer | Current State |
|-------|--------------|
| Rich text editor | `components/ui/rich-text-editor.tsx` — Lexical with toolbar, HTML I/O, fully tested |
| Dialog component | `components/ui/dialog.tsx` — Radix Dialog with overlay, title, close |
| CommandBar | `components/shared/command-bar.tsx` — pill toolbar with variant actions |
| State hooks | `useInsightState`, `useThreadState`, `useMilestoneState`, `useMeetingState` — React Query + useState pattern |
| Two-phase delete | `pendingDeleteInsightId` pattern in `useInsightState.ts` |
| Toast system | `useToast()` for success/error feedback |
| IPC/API patterns | `meeting-messages.ts` for IPC, `api/routes/meetings.ts` for HTTP |

### Files affected (notes feature scope)

```
core/
├── notes.ts                  # NEW — CRUD functions
├── db.ts                     # MODIFIED — add notes table migration

api/
├── routes/notes.ts           # NEW — HTTP endpoints

electron-ui/
├── electron/
│   └── channels.ts           # MODIFIED — add notes IPC channels
├── ui/src/
│   ├── hooks/
│   │   └── useNotesState.ts  # NEW — state hook
│   ├── components/
│   │   └── NotesDialog.tsx   # NEW — list/compose/edit dialog
│   │   └── MeetingDetail.tsx # MODIFIED — add Notes to CommandBar
│   │   └── ThreadDetailView.tsx    # MODIFIED — add Notes button
│   │   └── InsightDetailView.tsx   # MODIFIED — add Notes button
│   │   └── TimelineDetailView.tsx  # MODIFIED — add Notes button
│   └── design-tokens.ts     # MODIFIED — add notesButton tokens

test/
├── notes.test.ts             # NEW — core CRUD tests
├── notes-api.test.ts         # NEW — API route tests
├── ui/
│   └── notes-dialog.test.ts  # NEW — dialog component tests
```

---

# PLANNING RULES

1. Bursts are ordered. Each depends on the previous unless noted.
2. Each burst = one failing test → minimal code → TCR.
3. Plan updates go in the same commit as code.
4. Infrastructure commits (CSS, config, migrations) need no tests.
5. E2E exception: tightly-coupled UI bursts may combine 2 steps.
6. **Design verification gates are mandatory.** Each section ends with a verification burst that screenshots the running app via Playwright MCP and compares against the Paper artboard.

---

# DESIGN VERIFICATION GATES

Every section ends with a **design verification gate**.

### Gate Protocol

```
1. pnpm web:dev                           # Start dev server
2. Playwright MCP: browser_resize(2560, 1440)
3. Playwright MCP: browser_navigate("http://localhost:5188")
4. Playwright MCP: browser_take_screenshot  # Capture current state
5. Paper MCP: get_screenshot(artboardId)    # Capture design target
6. Compare: layout, spacing, colors, typography, component structure
7. If delta found → fix before proceeding to next section
8. If clean → document "VERIFIED" in the gate burst and commit
```

---

# BURSTS

## TODO

### SECTION 1: Data Layer — Schema & Core Module (~6 bursts)

> **Spec:**
> Polymorphic `notes` table and CRUD module following the `meeting-messages.ts` pattern.
>
> **Schema:** `notes(id TEXT PK, object_type TEXT, object_id TEXT, title TEXT nullable, body TEXT, created_at TEXT, updated_at TEXT)` with index on `(object_type, object_id)`.
> **CRUD:** `createNote`, `getNote`, `listNotes` (reverse-chrono), `updateNote` (partial), `deleteNote`, `countNotes`, `deleteNotesByObject` (cascade helper).
> **Types:** `Note`, `CreateNoteInput`, `UpdateNoteInput` defined inline in `core/notes.ts`.
>
> **Files affected:** `core/db.ts`, `core/notes.ts`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 6 (Implementation Notes → Data Model)

- [x] Burst 1: Add `notes` table to `core/db.ts` migrate() with index on (object_type, object_id) [infra]
- [ ] Burst 2: `createNote` — generates UUID, stores note with timestamps, returns full Note object
- [ ] Burst 3: `listNotes` — returns all notes for a given (objectType, objectId) ordered by created_at DESC
- [ ] Burst 4: `updateNote` — partial update of title and/or body, sets updated_at, returns updated Note
- [ ] Burst 5: `deleteNote` and `deleteNotesByObject` — single delete by ID + cascade delete by (objectType, objectId)
- [ ] Burst 6: `countNotes` — returns integer count for badge display

### SECTION 2: API & IPC Layer (~5 bursts)

> **Spec:**
> RESTful HTTP endpoints and Electron IPC channels for notes CRUD.
>
> **HTTP:** `GET/POST /notes/:objectType/:objectId`, `PATCH/DELETE /notes/:id`, `GET /notes/:objectType/:objectId/count`.
> **IPC:** `notes:list`, `notes:create`, `notes:update`, `notes:delete`, `notes:count`.
> Follows the `meeting-messages` IPC pattern and `api/routes/meetings.ts` HTTP pattern.
>
> **Files affected:** `api/routes/notes.ts`, `api/server.ts`, `electron-ui/electron/channels.ts`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 6 (Implementation Notes → Architecture)

- [ ] Burst 7: Notes HTTP routes — `GET /notes/:objectType/:objectId` returns list, `POST` creates note
- [ ] Burst 8: Notes HTTP routes — `PATCH /notes/:id` updates, `DELETE /notes/:id` deletes
- [ ] Burst 9: Notes HTTP route — `GET /notes/:objectType/:objectId/count` returns count
- [ ] Burst 10: Notes IPC channels — `notes:list`, `notes:create`, `notes:update`, `notes:delete`, `notes:count` registered in channels.ts
- [ ] Burst 11: API client methods — add `notes.list()`, `notes.create()`, `notes.update()`, `notes.delete()`, `notes.count()` to `api-client.ts` for web mode

### SECTION 3: UI Foundation — State Hook & Design Tokens (~5 bursts)

> **Spec:**
> `useNotesState` hook managing dialog state, React Query, and mutation handlers. Design tokens for the Notes button.
>
> **State:** `notesDialogOpen`, `notesDialogMode` (list/compose/edit), `editingNoteId`, `pendingDeleteNoteId`.
> **Queries:** `notesQuery` (list), `noteCountQuery` (badge count).
> **Mutations:** `handleCreateNote`, `handleUpdateNote`, `handleDeleteNote`, `handleConfirmDeleteNote` — all invalidate queries + toast.
> **Tokens:** `notesButton` in design-tokens.ts — amber tint bg, accent text, badge styling.
>
> **Files affected:** `electron-ui/ui/src/hooks/useNotesState.ts`, `electron-ui/ui/src/design-tokens.ts`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 1 (Command Integration — button styling) and Section 5 (Empty State — interaction flow)

- [ ] Burst 12: `useNotesState` hook — manages `notesDialogOpen`, `notesDialogMode`, `editingNoteId`, `pendingDeleteNoteId` state
- [ ] Burst 13: `useNotesState` React Query integration — `notesQuery` and `noteCountQuery` fetch from API
- [ ] Burst 14: `useNotesState` mutation handlers — `handleCreateNote` creates note, invalidates queries, switches to list mode, toasts success
- [ ] Burst 15: `useNotesState` delete flow — `handleDeleteNote` sets pending ID, `handleConfirmDeleteNote` deletes + invalidates + toasts + clears pending
- [ ] Burst 16: Add `notesButton` design tokens — amber tint bg `rgba(201,122,46,0.08)`, accent text `#C97A2E`, badge bg/text/size/padding/radius [infra]

### SECTION 4: Notes Dialog — List Mode (~6 bursts)

> **Spec:**
> `NotesDialog` component rendering the list of existing notes with header, note items, empty state, and three-dot action menu.
>
> **Dialog:** 520px wide, 12px radius, black/60 overlay. Header shows "Notes" title + object subtitle + "New Note" amber CTA + close button.
> **Note items:** Title (13px/600) or first-line preview, relative timestamp, body preview (2-3 lines, HTML stripped), three-dot menu with Edit/Delete.
> **Empty state:** Centered document icon + "No notes yet" + "Add context, reminders, or follow-ups" + "Add First Note" amber button.
> **Delete:** Two-phase inline confirmation within dialog.
>
> **Files affected:** `electron-ui/ui/src/components/NotesDialog.tsx`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 2 (List State) and Section 5 (Empty State & Note Actions)

- [ ] Burst 17: NotesDialog shell — Radix Dialog, 520px, header with "Notes" title + object subtitle + close button
- [ ] Burst 18: NotesDialog "New Note" button in header — amber bg, plus icon, "New Note" label
- [ ] Burst 19: NotesDialog note item row — title (bold) or first-line fallback, relative timestamp, body preview (HTML stripped, 2-3 lines truncated)
- [ ] Burst 20: NotesDialog three-dot menu — popover with Edit and Delete actions per note item
- [ ] Burst 21: NotesDialog empty state — centered document icon + "No notes yet" + subtitle + "Add First Note" amber CTA
- [ ] Burst 22: NotesDialog delete confirmation — inline two-phase: "Delete this note?" with Cancel/Delete buttons, wired to `pendingDeleteNoteId`

### SECTION 5: Notes Dialog — Compose & Edit Modes (~5 bursts, includes Design Gate)

> **Spec:**
> Compose mode for new notes and edit mode for existing notes, both using the Lexical `RichTextEditor`.
>
> **Header:** Back arrow (←) + "New Note" / "Edit Note" + object label right-aligned.
> **Title input:** Plain text, full-width, "Title (optional)" placeholder.
> **Body:** Existing `RichTextEditor` component (Bold, Italic, Underline | Bullet List, Ordered List). Min-height 180px. Outputs HTML.
> **Footer:** "Cancel" outline button + "Save Note" / "Save Changes" amber button. Save disabled if body is empty.
> **Edit mode:** Pre-populates title + body from existing note HTML.
>
> **Files affected:** `electron-ui/ui/src/components/NotesDialog.tsx`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 3 (Compose State — shows Lexical toolbar with B/I/U | List/OrderedList, rich text body with bold, bullets, cursor)

- [ ] Burst 23: Compose mode header — back arrow + "New Note" + object label, switches from list mode
- [ ] Burst 24: Compose mode title input + RichTextEditor body — optional title field, Lexical editor with min-height 180px
- [ ] Burst 25: Compose mode footer — Cancel returns to list, Save Note calls handleCreateNote with title + HTML body, disabled when body empty
- [ ] Burst 26: Edit mode — pre-populates title and body from existing note, header shows "Edit Note", footer shows "Save Changes"
- [ ] Burst 27: **DESIGN GATE — Dialog** — Playwright screenshot of NotesDialog in list mode (with notes), compose mode (with toolbar visible), and empty state. Paper MCP screenshot Sections 2, 3, 5 from "Notes Feature — Dialog Exploration". Compare dialog width, header layout, note item styling, toolbar icons, empty state CTA. VERIFIED.

### SECTION 6: View Integration — Meetings (~5 bursts)

> **Spec:**
> Wire Notes into Meeting Detail via CommandBar. Notes button with badge count opens the NotesDialog scoped to the selected meeting.
>
> **CommandBar placement:** Notes button sits between Reassign and the destructive divider (before Ignore). Uses amber tint bg + accent text + badge count.
> **Cascade:** When a meeting is deleted, its notes are cleaned up via `deleteNotesByObject`.
>
> **Files affected:** `electron-ui/ui/src/components/MeetingDetail.tsx`, meeting delete handler, `test/e2e/meeting-notes.spec.ts`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 1 (Meetings area — CommandBar with Re-extract, Copy, Reassign, **Notes 3**, | Ignore)

- [ ] Burst 28: Add Notes action to MeetingDetail CommandBar — amber tint button with FileText icon + "Notes" label + badge count from noteCountQuery
- [ ] Burst 29: Wire NotesDialog into MeetingDetail — opens on Notes click, scoped to `objectType: 'meeting'`, shows meeting title as object label
- [ ] Burst 30: Cascade delete — call `deleteNotesByObject(db, 'meeting', meetingId)` in meeting delete handler
- [ ] Burst 31: E2E — `test/e2e/meeting-notes.spec.ts`: select client, select meeting, Notes button visible in CommandBar with badge count; click Notes opens dialog with empty state; create note via dialog (type title + body with bold formatting), save, note appears in list; edit note via three-dot menu, change title, save, updated title visible; delete note via three-dot menu with confirmation, note removed from list, badge count updates to 0

### SECTION 7: View Integration — Threads (~4 bursts)

> **Spec:**
> Add Notes button to ThreadDetailView header button row. Uses `useNotesState` scoped to thread.
>
> **Button placement:** Notes button (amber tint + badge) inserted between Edit and Resolve in the header row.
> **Cascade:** Thread delete handler calls `deleteNotesByObject` for cleanup.
>
> **Files affected:** `ThreadDetailView.tsx`, thread delete handler, `test/e2e/thread-notes.spec.ts`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 1 (Threads area) and Section 4 (Cross-Object Variants — dialog subtitle "· Thread")

- [ ] Burst 32: ThreadDetailView — add Notes button to header row between Edit and Resolve, wire useNotesState + NotesDialog scoped to thread
- [ ] Burst 33: ThreadDetailView cascade — call `deleteNotesByObject(db, 'thread', threadId)` in thread delete handler
- [ ] Burst 34: E2E — `test/e2e/thread-notes.spec.ts`: select client, navigate to Threads, select thread, Notes button visible in header row; click Notes opens dialog with subtitle showing thread title + "· Thread"; create note, verify it appears in list; delete thread via API, verify notes are cascade-deleted via API count endpoint returning 0

### SECTION 8: View Integration — Insights (~4 bursts)

> **Spec:**
> Add Notes button to InsightDetailView header button row. Uses `useNotesState` scoped to insight.
>
> **Button placement:** Notes button (amber tint + badge) inserted between Edit and Finalize/Reopen in the header row.
> **Cascade:** Insight delete handler calls `deleteNotesByObject` for cleanup.
>
> **Files affected:** `InsightDetailView.tsx`, insight delete handler, `test/e2e/insight-notes.spec.ts`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 1 (Insights area) and Section 4 (Cross-Object Variants — dialog subtitle "· Insight")

- [ ] Burst 35: InsightDetailView — add Notes button to header row between Edit and Finalize/Reopen, wire useNotesState + NotesDialog scoped to insight
- [ ] Burst 36: InsightDetailView cascade — call `deleteNotesByObject(db, 'insight', insightId)` in insight delete handler
- [ ] Burst 37: E2E — `test/e2e/insight-notes.spec.ts`: select client, navigate to Insights, create insight via API, select it, Notes button visible; click Notes opens dialog with subtitle showing insight label + "· Insight"; create note with rich text (bold + bullet list), verify HTML persists on re-open; delete insight, verify cascade cleanup

### SECTION 9: View Integration — Timelines (~4 bursts)

> **Spec:**
> Add Notes button to TimelineDetailView header button row. Uses `useNotesState` scoped to milestone.
>
> **Button placement:** Notes button (amber tint + badge) inserted between Edit and Delete in the header row.
> **Cascade:** Milestone delete handler calls `deleteNotesByObject` for cleanup.
>
> **Files affected:** `TimelineDetailView.tsx`, milestone delete handler, `test/e2e/milestone-notes.spec.ts`
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 1 (Timelines area) and Section 4 (Cross-Object Variants — dialog subtitle "· Milestone")

- [ ] Burst 38: TimelineDetailView — add Notes button to header row between Edit and Delete, wire useNotesState + NotesDialog scoped to milestone
- [ ] Burst 39: TimelineDetailView cascade — call `deleteNotesByObject(db, 'milestone', milestoneId)` in milestone delete handler
- [ ] Burst 40: E2E — `test/e2e/milestone-notes.spec.ts`: select client, navigate to Timelines, create milestone via API, select it, Notes button visible; click Notes opens dialog with subtitle showing milestone title + "· Milestone"; create note, edit it, verify changes persist; delete milestone, verify cascade cleanup

### SECTION 10: Final Verification (~1 burst)

> **Spec:**
> Final design gate verifying Notes integration across all 4 detail views.
>
> **Files affected:** None (verification only)
> **Design reference:** Artboard "Notes Feature — Dialog Exploration" → Section 1 (all areas)

- [ ] Burst 41: **FINAL DESIGN GATE** — Playwright screenshots of all 4 detail views (Meeting, Thread, Insight, Milestone) showing Notes button with badge. Paper MCP screenshot Section 1 from "Notes Feature — Dialog Exploration". Compare button placement, badge styling, amber tint consistency. Open NotesDialog from each view — verify subtitle shows correct object type label. VERIFIED.

## DONE
