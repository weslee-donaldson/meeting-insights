# Notes Feature — Specification

## Context

Users need a way to attach free-form, rich-text notes to major objects in the system: **Meetings**, **Insights**, **Milestones**, and **Threads**. Notes capture context, follow-ups, corrections, and human observations that don't fit neatly into extracted artifacts or chat conversations.

**Key distinction**: Notes are user-authored annotations, not LLM-generated content. They persist alongside the object and are always editable. Unlike chat messages (ephemeral Q&A), notes are durable reference material the user wants to keep attached to an object.

**Action Items do not have their own notes.** When a user navigates from an Action Item into its parent Meeting Detail, the Meeting's notes are available there. This avoids note fragmentation — context about an action item belongs on the meeting where it was discussed.

**Scope**: Core CRUD + rich text (Lexical) + dialog UI + CommandBar/header integration across all 4 object types. No search indexing, no LLM integration, no cross-object note linking in this iteration.

## Design Reference

**Paper artboard**: "Notes Feature — Dialog Exploration" in `Meeting Insights.paper`

This artboard contains the complete visual specification across 6 sections:

1. **Command Integration by Area** — Shows Notes button placement in all 5 core areas (Meetings CommandBar, Action Items drill-through, Threads/Insights/Timelines header button rows)
2. **Notes Dialog — List State** — Dialog showing existing notes in reverse-chronological order with three-dot action menu per note
3. **Notes Dialog — Compose State** — Rich text editor with Lexical toolbar (Bold, Italic, Underline | Bullet List, Ordered List), optional title, Cancel/Save footer
4. **Cross-Object Variants** — Dialog adapting to Insight and Milestone contexts via header subtitle
5. **Empty State & Note Actions** — Empty state with CTA, three-dot menu showing Edit/Delete
6. **Implementation Notes** — Data model and architecture summary

**All visual decisions should be verified against this artboard.** Use Paper MCP `get_screenshot` on the artboard before implementing any UI component.

## Data Model

### New Table (in `core/db.ts` migrate())

```sql
notes (
  id          TEXT PRIMARY KEY,
  object_type TEXT NOT NULL,    -- 'meeting' | 'insight' | 'milestone' | 'thread'
  object_id   TEXT NOT NULL,
  title       TEXT,             -- nullable, optional
  body        TEXT NOT NULL,    -- HTML from Lexical RichTextEditor
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
)
```

**Polymorphic association** via `object_type` + `object_id`. Same pattern as `client_detections` which uses `meeting_id` + contextual lookups. No foreign key constraints on `object_id` since it references multiple tables.

**Index**: `CREATE INDEX idx_notes_object ON notes(object_type, object_id)` for efficient list queries.

**ID generation**: Use the existing `crypto.randomUUID()` pattern used throughout the project.

## Core Module: `core/notes.ts`

| Function | Signature | Purpose |
|----------|-----------|---------|
| `createNote` | `(db, { objectType, objectId, title?, body }) → Note` | Create note, set created_at/updated_at to now |
| `getNote` | `(db, id) → Note \| undefined` | Single note by ID |
| `listNotes` | `(db, objectType, objectId) → Note[]` | All notes for object, ordered by `created_at DESC` |
| `updateNote` | `(db, id, { title?, body? }) → Note` | Partial update, set updated_at to now |
| `deleteNote` | `(db, id) → void` | Delete single note |
| `countNotes` | `(db, objectType, objectId) → number` | Count for badge display |

**Type definitions** (inline, not in a separate types file per CLAUDE.md rules):

```typescript
interface Note {
  id: string;
  objectType: 'meeting' | 'insight' | 'milestone' | 'thread';
  objectId: string;
  title: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateNoteInput {
  objectType: Note['objectType'];
  objectId: string;
  title?: string;
  body: string;
}

interface UpdateNoteInput {
  title?: string | null;
  body?: string;
}
```

Follows the `meeting-messages.ts` pattern for structure and the `core/timelines.ts` pattern for CRUD operations.

## API Layer

### HTTP Endpoints (`api/routes/notes.ts`)

| Method | Path | Handler | Purpose |
|--------|------|---------|---------|
| `GET` | `/notes/:objectType/:objectId` | `listNotes` | List notes for object |
| `POST` | `/notes/:objectType/:objectId` | `createNote` | Create note on object |
| `GET` | `/notes/:id` | `getNote` | Get single note |
| `PATCH` | `/notes/:id` | `updateNote` | Update note title/body |
| `DELETE` | `/notes/:id` | `deleteNote` | Delete note |
| `GET` | `/notes/:objectType/:objectId/count` | `countNotes` | Badge count |

Register in `api/server.ts` following the existing route registration pattern.

### IPC Channels (`electron-ui/electron/channels.ts`)

| Channel | Payload | Response | Purpose |
|---------|---------|----------|---------|
| `notes:list` | `{ objectType, objectId }` | `Note[]` | List notes |
| `notes:create` | `{ objectType, objectId, title?, body }` | `Note` | Create |
| `notes:update` | `{ id, title?, body? }` | `Note` | Update |
| `notes:delete` | `{ id }` | `void` | Delete |
| `notes:count` | `{ objectType, objectId }` | `number` | Badge count |

Follows the `meetingChat` / `meetingMessages` IPC pattern in `channels.ts`.

## UI Architecture

### State Hook: `useNotesState.ts`

```
electron-ui/ui/src/hooks/useNotesState.ts
```

Manages all notes state for a given object. Consumed by any detail view that supports notes.

**State**:
- `notesDialogOpen: boolean` — controls dialog visibility
- `notesDialogMode: 'list' | 'compose' | 'edit'` — dialog internal state
- `editingNoteId: string | null` — which note is being edited (edit mode)
- `pendingDeleteNoteId: string | null` — two-phase delete confirmation

**Queries** (React Query):
- `notesQuery` — `useQuery(['notes', objectType, objectId])` → fetches `listNotes`
- `noteCountQuery` — `useQuery(['noteCount', objectType, objectId])` → fetches `countNotes` (for badge, fetched independently so badge updates without opening dialog)

**Mutations**:
- `handleCreateNote(title, body)` → POST → invalidate `notesQuery` + `noteCountQuery`
- `handleUpdateNote(id, title, body)` → PATCH → invalidate `notesQuery`
- `handleDeleteNote()` → DELETE on `pendingDeleteNoteId` → invalidate both queries → close confirmation → toast
- `handleConfirmDeleteNote()` — executes the pending delete

**Parameters**: `useNotesState({ objectType, objectId, addToast })`

**Returns**: All state, setters, query results, and handlers.

### Component: `NotesDialog.tsx`

```
electron-ui/ui/src/components/NotesDialog.tsx
```

A single dialog component that handles all three modes (list, compose, edit). Receives props from `useNotesState`.

**Props**:
```typescript
interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'list' | 'compose' | 'edit';
  onModeChange: (mode: 'list' | 'compose' | 'edit') => void;
  objectLabel: string;      // e.g. "Pre-Mortem for Commerce"
  objectTypeLabel: string;  // e.g. "Meeting"
  notes: Note[];
  editingNote: Note | null;
  onCreateNote: (title: string | null, body: string) => void;
  onUpdateNote: (id: string, title: string | null, body: string) => void;
  onDeleteNote: (id: string) => void;
  pendingDeleteNoteId: string | null;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}
```

## UI Interaction Specification

### Opening Notes

**Meetings (CommandBar)**:
1. User sees "Notes" button with amber tint + badge count in the CommandBar below the meeting title
2. Badge shows note count (e.g., "3"). If count is 0, no badge is shown — just the label "Notes"
3. Clicking "Notes" opens the NotesDialog in **list mode** scoped to `objectType: 'meeting'`, `objectId: selectedMeetingId`

**Threads / Insights / Timelines (Header button row)**:
1. User sees a "Notes" button with amber tint + badge count in the header button row alongside Edit, Delete, Resolve/Finalize, etc.
2. The Notes button is positioned **between the Edit button and the status-change button** (Resolve/Finalize/Reopen) in the button row. See artboard Section 1 for exact placement per area.
3. Clicking opens the NotesDialog in **list mode** scoped to the current object

**Action Items**:
1. No Notes button appears in the Action Items list view or on individual action item cards
2. When a user clicks into a meeting from an action item (opening the Meeting Detail panel), that panel's CommandBar includes the Notes button scoped to the meeting
3. Notes created here are meeting notes, not action item notes

### List Mode (Default)

**Layout** (see artboard Section 2):
- **Header**: "Notes" title + subtitle showing `{objectLabel} · {objectTypeLabel}` + "New Note" amber button + close (X) button
- **Body**: Reverse-chronological list of notes, each showing:
  - **Title** (bold, 13px/600) or first line of body if untitled
  - **Timestamp** (relative: "2h ago", "Mar 14") right-aligned
  - **Three-dot menu** (···) on hover/always visible, right of timestamp
  - **Body preview** (secondary text, 13px/400, 2-3 lines max, truncated)
- **Empty state** (see artboard Section 5): Centered document icon + "No notes yet" + "Add context, reminders, or follow-ups" + "Add First Note" amber button

**Interactions**:
- Click **note row** → switch to **edit mode** with that note loaded
- Click **"New Note"** or **"Add First Note"** → switch to **compose mode**
- Click **three-dot menu** → shows popover with "Edit" and "Delete"
  - "Edit" → switch to **edit mode**
  - "Delete" → set `pendingDeleteNoteId`, show inline confirmation dialog: "Delete this note? This cannot be undone." with Cancel/Delete buttons. Follows the existing two-phase delete pattern used across the app (see `pendingDeleteInsightId` pattern in `useInsightState.ts`)

### Compose Mode (New Note)

**Layout** (see artboard Section 3):
- **Header**: Back arrow (←) + "New Note" title + object label right-aligned + close (X) button
- **Title input**: Full-width text input with "Title (optional)" placeholder. Not a rich text field — plain text only.
- **Rich text editor**: The existing `RichTextEditor` component from `electron-ui/ui/src/components/ui/rich-text-editor.tsx` (Lexical-based). Provides:
  - **Toolbar**: Bold (B), Italic (I), Underline (U) | divider | Bullet List, Ordered List
  - **Content area**: Min-height 180px, 13px Inter, full rich text editing
  - **HTML output**: Body is stored as HTML via `$generateHtmlFromNodes`
- **Footer**: "Cancel" (outline button) + "Save Note" (amber filled button), right-aligned

**Interactions**:
- Click **back arrow (←)** → return to list mode (discard unsaved content, no confirmation needed for new notes)
- Click **Cancel** → return to list mode (same as back arrow)
- Click **Save Note** → calls `onCreateNote(title, body)` where `body` is the HTML from the Lexical editor. On success: return to list mode, new note appears at top of list
- **Save Note disabled** if body is empty (whitespace-only HTML like `<p><br></p>` counts as empty)

### Edit Mode

**Layout**: Same as compose mode but:
- Header shows "Edit Note" instead of "New Note"
- Title and body fields are pre-populated with existing note content
- Footer shows "Cancel" + "Save Changes" (amber)

**Interactions**:
- Click **back arrow (←)** → return to list mode (discard changes — note was not yet saved)
- Click **Cancel** → return to list mode
- Click **Save Changes** → calls `onUpdateNote(id, title, body)`. On success: return to list mode, note appears in its updated position (sorted by created_at, not updated_at)
- **Save Changes disabled** if body hasn't changed from original

### Badge Count Updates

- After any create/update/delete, `noteCountQuery` is invalidated
- Badge count on the CommandBar / header button updates reactively
- When count is 0, the badge number disappears but the Notes button remains visible
- The Notes button is always present regardless of count (unlike some badge patterns that hide at zero)

### Delete Confirmation

Follows the exact pattern from `useInsightState.ts` → `pendingDeleteInsightId`:

1. User clicks "Delete" in three-dot menu
2. `pendingDeleteNoteId` is set to the note's ID
3. Inline confirmation renders within the dialog (not a separate dialog): "Delete this note?" with Cancel/Delete buttons
4. **Cancel** → clears `pendingDeleteNoteId`
5. **Delete** → calls `handleConfirmDeleteNote()` → API delete → invalidate queries → toast "Note deleted" → return to list mode

### Dialog Sizing

- **Width**: 520px (matches existing dialog patterns — CreateInsightDialog is 440px, CreateThreadDialog is 800px, this sits in between)
- **Max-height**: 70vh with scrollable note list in list mode
- **Overlay**: black/60 following existing Radix Dialog overlay pattern in `components/ui/dialog.tsx`
- **Border-radius**: 12px
- **Shadow**: `0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)`

### Note Preview in List (Rich Text Rendering)

Notes in list mode show the body as a **plain-text preview** (HTML stripped, 2-3 lines max with text-overflow ellipsis). The full rich text is only rendered when viewing/editing a note. This keeps the list scannable.

For untitled notes: the first non-empty text content from the HTML body is used as the display title (bold, truncated to one line).

## Integration Points

### Per-View Wiring

Each detail view needs minimal changes to integrate notes:

**MeetingDetail.tsx**:
- Add `useNotesState({ objectType: 'meeting', objectId: meeting.id, addToast })`
- Add `{ label: 'Notes', icon: <FileText />, onClick: () => notes.setNotesDialogOpen(true), variant: 'default' }` to CommandBar actions array, with badge count from `notes.noteCountQuery.data`
- Render `<NotesDialog {...notes.dialogProps} objectLabel={meeting.title} objectTypeLabel="Meeting" />`

**ThreadDetailView.tsx**:
- Add `useNotesState({ objectType: 'thread', objectId: thread.id, addToast })`
- Add Notes button to the header button row between Edit and Resolve buttons
- Render `<NotesDialog />` at bottom of component

**InsightDetailView.tsx**:
- Add `useNotesState({ objectType: 'insight', objectId: insight.id, addToast })`
- Add Notes button to header button row between Edit and Finalize/Reopen buttons
- Render `<NotesDialog />`

**TimelineDetailView.tsx**:
- Add `useNotesState({ objectType: 'milestone', objectId: milestone.id, addToast })`
- Add Notes button to header button row between Edit and Delete buttons
- Render `<NotesDialog />`

### Cascade Deletion

When a parent object is deleted, its notes must be cleaned up:

| Parent deletion | Notes cleanup |
|-----------------|---------------|
| Meeting deleted | Delete all notes where `object_type = 'meeting' AND object_id = meetingId` |
| Insight deleted | Delete all notes where `object_type = 'insight' AND object_id = insightId` |
| Milestone deleted | Delete all notes where `object_type = 'milestone' AND object_id = milestoneId` |
| Thread deleted | Delete all notes where `object_type = 'thread' AND object_id = threadId` |

Add `deleteNotesByObject(db, objectType, objectId)` to `core/notes.ts`. Call from each object's existing delete handler.

## Design Tokens

The Notes button uses the following tokens (add to `design-tokens.ts` if not present):

```typescript
export const notesButton = {
  bg: 'rgba(201, 122, 46, 0.08)',
  text: '#C97A2E',           // var(--color-accent) or equivalent
  badgeBg: 'rgba(201, 122, 46, 0.12)',
  badgeText: '#C97A2E',
  badgeFontSize: '9px',
  badgePadding: '1px 4px',
  badgeRadius: '3px',
  iconSize: '13px',
  fontSize: '11px',
  fontWeight: 600,
  padding: '4px 10px',
  radius: '6px',
};
```

## Out of Scope (This Iteration)

- Full-text search indexing of note content
- LLM access to notes during chat/RAG context building
- Cross-object note references or linking
- Note tagging or categorization
- Collaborative notes (multi-user)
- Note pinning or starring
- Note export
- Markdown input (uses HTML via Lexical instead)
