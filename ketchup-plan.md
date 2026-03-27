# Ketchup Plan: Meeting Notes — Types, Webhook Import, and Chat Integration

## Context

The notes system (`core/notes.ts`) currently stores plain notes with no type classification. Three changes are needed:

1. **Note type classification** — Add a `note_type` column to distinguish note sources. Users can manually create "In-Meeting" notes. Webhook events create "Key Points" and "Action Items" notes automatically.
2. **Webhook import** — Krisp fires `key_points_generated` and `action_items_generated` events (manually triggered by user in Krisp). These should be parsed and stored as typed notes attached to the matching meeting.
3. **Chat integration** — A "Notes" multi-select dropdown in ChatPanel lets users pick which notes to include as LLM context.

## Real Webhook Payloads

Both event types share the same envelope. Both reference the same meeting (`data.meeting.id`).

**`key_points_generated`** — `data/webhook-rawtranscripts/krisp-2026-03-26T14-14-21-533Z.json`
- `data.content[]`: `{ id, description }` — array of key point items
- `data.raw_content`: pre-formatted bullet string (`"- point 1\n- point 2\n..."`)

**`action_items_generated`** — `data/webhook-rawtranscripts/krisp-2026-03-26T14-14-15-119Z.json`
- `data.content[]`: `{ id, title, assignee, due_date, completed, priority }` — structured action items
- `data.raw_content`: pre-formatted checklist string (`"- [ ] task 1\n- [ ] task 2\n..."`)

Both have `data.raw_meeting` (one-line meeting summary) and `data.raw_content` (formatted body). **Use `raw_content` as the note body** — it's human-readable and doesn't require reformatting.

## Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Note types | `user` (default), `in-meeting`, `key-points`, `action-items` | User creates `in-meeting` manually; webhook creates the other two |
| Schema | `note_type TEXT DEFAULT 'user'` column on `notes` table | Reuses existing CRUD; ALTER TABLE migration follows db.ts pattern |
| Webhook parser | Single `parseWebhookNote` function handles both event types | Identical envelope; just map event name → note_type |
| Note body | Use `data.raw_content` string directly | Pre-formatted, human-readable, avoids re-serializing structured content |
| Note title | Event label: "Krisp Key Points" / "Krisp Action Items" | Clear provenance |
| Pipeline handler | `handleWebhookNote` in pipeline.ts, before `isKnownNonTranscriptEvent` | Follows `handleRecordingReady` pattern |
| Immutability | Webhook-sourced notes are read-only (403 on PATCH/DELETE) | They're Krisp artifacts |
| Idempotency | Skip if note with same `note_type` already exists for meeting | Prevents duplicates on reprocessing |
| Chat UI | "Notes" label with multi-select dropdown listing all notes for the meeting | User picks which notes to include; each note identified by type + title |
| Context builder | Selected note bodies appended to meeting context block | Added to both `buildLabeledContext` and `buildDistilledContext` |

## Critical Files

| File | Changes |
|------|---------|
| `core/db.ts` | ALTER TABLE migration for `note_type` column |
| `core/notes.ts` | `noteType` field on interfaces, `getInMeetingNotes()` → `getNotesByType()` |
| `core/parser.ts` | `parseWebhookNote()` function, `ParsedWebhookNote` type |
| `core/pipeline.ts` | `handleWebhookNote()`, wire into `processWebhookMeetings` |
| `core/labeled-context.ts` | Accept note IDs param, append selected notes to context |
| `electron-ui/electron/channels.ts` | `noteIds` on `ConversationChatRequest` |
| `electron-ui/electron/handlers/meetings.ts` | Pass `noteIds` through chat handler chain |
| `api/routes/notes.ts` | 403 guard on PATCH/DELETE for non-user notes |
| `api/routes/meetings.ts` | Pass `noteIds` from chat request body |
| `electron-ui/ui/src/components/NotesDialog.tsx` | Type badge, read-only for webhook notes, type selector on create |
| `electron-ui/ui/src/components/ChatPanel.tsx` | "Notes" multi-select dropdown |
| `electron-ui/ui/src/api-client/meetings.ts` | Pass `noteIds` in chat API call |

## Existing Functions to Reuse

- `createNote(db, input)` in `core/notes.ts` — extend `CreateNoteInput` with optional `noteType`
- `listNotes(db, objectType, objectId)` in `core/notes.ts` — already returns all notes for a meeting
- `handleRecordingReady(db, json)` in `core/pipeline.ts:27-40` — pattern for `handleWebhookNote`
- `isKnownNonTranscriptEvent(json)` in `core/pipeline.ts:42-49` — intercept before this catch-all
- `buildLabeledContext(db, meetingIds)` in `core/labeled-context.ts:147-190` — extend to accept note IDs
- `buildDistilledContext(db, meetingIds)` in `core/labeled-context.ts:110-145` — same extension
- `embedFeature`/`storeFeatureVector` in `core/feature-embedding.ts` — embed note body for search

---

## Ketchup Plan

### SECTION 1: Schema & Note Type (~3 bursts)

> Files: `core/db.ts`, `core/notes.ts`, `test/notes.test.ts`

- [x] Burst 1: Migration adds `note_type TEXT DEFAULT 'user'` to notes table (8926b25)
- [x] Burst 2: `Note`/`NoteRow`/`CreateNoteInput` include `noteType`; `createNote` stores it; `rowToNote` maps it (6c33f4a)
- [x] Burst 3: `getNotesByMeeting(db, meetingId)` returns all notes for a meeting regardless of type (973f261)

### SECTION 2: Webhook Parsing (~3 bursts)

> Files: `core/parser.ts`, `test/parser.test.ts`

- [x] Burst 4-6 (E2E): `parseWebhookNote` — null for non-note events, extracts key-points and action-items from raw_content, null for malformed (e8751aa)

### SECTION 3: Pipeline Integration (~4 bursts)

> Files: `core/pipeline.ts`, `test/pipeline.test.ts`

- [x] Burst 7-10 (E2E): `handleWebhookNote` — returns false for non-notes, creates typed note, idempotent, wired into pipeline (cbb394a)

### SECTION 4: Embedding (~2 bursts)

> Files: `core/pipeline.ts`, `core/feature-embedding.ts`, `test/pipeline.test.ts`

- [ ] Burst 11: `handleWebhookNote` embeds note body via `embedFeature`/`storeFeatureVector` when session/vdb provided
- [ ] Burst 12: `processWebhookMeetings` passes feature table + session to `handleWebhookNote`

### SECTION 5: Chat Context (~3 bursts)

> Files: `core/labeled-context.ts`, `core/notes.ts`, `electron-ui/electron/channels.ts`, `electron-ui/electron/handlers/meetings.ts`

- [x] Burst 13-14 (E2E): both context builders accept noteIds, append matched note bodies to meeting blocks (49b8c05)
- [x] Burst 15: `noteIds` on ConversationChatRequest, handleConversationChat + handleMeetingChat pass through (c4f3497)

### SECTION 6: API Layer (~3 bursts)

> Files: `api/routes/notes.ts`, `api/routes/meetings.ts`, `electron-ui/ui/src/api-client/meetings.ts`

- [x] Burst 16-18 (E2E): Notes API 403 guard, chat API passes noteIds, api-client adds noteIds param (0c27630)

### SECTION 7: UI — NotesDialog (~4 bursts)

> Files: `NotesDialog.tsx`, `useNotesState.ts`, `test/ui/notes-dialog.test.tsx`

- [x] Burst 19-20 (E2E): NoteItem renders type badge and hides action menu for non-user notes (0912d9a)
- [ ] Burst 21: Clicking non-user note opens read-only view
- [x] Burst 22: Create note form includes type selector dropdown (user, in-meeting) (6433e28)

### SECTION 8: UI — Chat Notes Selector (~3 bursts)

> Files: `ChatPanel.tsx`, `useMeetingState.ts`, `test/ui/chat-panel.test.tsx`

- [x] Burst 23-24 (E2E): ChatPanel Notes multi-select dropdown, noteIds passed through onChat/onSendMessage (9637ca4)
- [x] Burst 25: useMeetingState fetches notes list, exposes availableNotes, wired to ChatPanel via App.tsx (6b35882)

### SECTION 9: E2E (~1 burst)

- [ ] Burst 26: Pipeline processes both webhook files → notes created, embedded, selectable in chat context

### SECTION 10: Advanced Search — View Type & Navigation Wiring (~4 bursts)

> Files: `App.tsx`, `NavRail.tsx`, `BottomTabBar.tsx`, `ResponsiveShell.tsx`, `BreadcrumbBar.tsx`, `TopBar.tsx`, `test/ui/nav-rail.test.tsx`

- [x] Burst 14: Extend `View` type with `"search"` across all 5 files (214bc79)
- [x] Burst 15: NavRail search icon + BottomTabBar + BreadcrumbBar entries (b6834a7)
- [x] Burst 16: TopBar Enter → search view navigation — sets SearchForm query, preserves meetings view typing behavior
- [ ] Burst 17: Result "Open" → meetings view navigation

## Total: ~30 bursts

## Verification

1. `pnpm test --run` — all tests pass
2. Run `pnpm process` with the two sample files in `data/webhook-rawtranscripts/` → verify:
   - Meeting "Mandalore, AWS Alert Planning" has two notes attached (key-points + action-items)
   - Notes visible in NotesDialog with badges, read-only
   - Notes appear in ChatPanel multi-select dropdown
   - Selecting notes and chatting includes their content in LLM context
3. Manually create an "In-Meeting" note via NotesDialog → verify type badge shows
4. Reprocess same webhook files → no duplicate notes
