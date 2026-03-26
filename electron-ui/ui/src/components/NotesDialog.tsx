import React, { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog.js";
import { Button } from "./ui/button.js";
import { RichTextEditor } from "./ui/rich-text-editor.js";
import { notesButton } from "../design-tokens.js";
import { FileText, Plus, X, ChevronLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Note } from "../../../../core/notes.js";
import type { NotesDialogMode } from "../hooks/useNotesState.js";

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: NotesDialogMode;
  objectLabel: string;
  objectTypeLabel: string;
  notes: Note[];
  editingNote: Note | null;
  pendingDeleteNoteId: string | null;
  onStartCompose: () => void;
  onStartEdit: (id: string) => void;
  onBackToList: () => void;
  onCreateNote: (title: string | null, body: string) => void;
  onUpdateNote: (id: string, title: string | null, body: string) => void;
  onDeleteNote: (id: string) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function isBodyEmpty(html: string): boolean {
  return stripHtml(html).length === 0;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NoteItemMenu({ noteId, onEdit, onDelete }: { noteId: string; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" data-testid={`note-menu-${noteId}`}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-0.5 rounded hover:bg-[var(--color-bg-elevated)]"
        aria-label="Note actions"
      >
        <MoreHorizontal size={14} className="text-[var(--color-text-muted)]" />
      </button>
      {open && (
        <div className="absolute right-0 top-6 z-10 w-[140px] bg-white rounded-lg shadow-lg border border-[var(--color-line)] py-1" data-testid="note-action-menu">
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(noteId); }}
          >
            <Pencil size={14} />
            Edit
          </button>
          <div className="h-px bg-[var(--color-line)] mx-1" />
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-[var(--color-danger)] hover:bg-[var(--color-bg-elevated)]"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(noteId); }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function NoteItem({ note, onEdit, onDelete }: { note: Note; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const displayTitle = note.title || stripHtml(note.body).slice(0, 60) || "Untitled";
  const bodyPreview = stripHtml(note.body).slice(0, 150);
  return (
    <div
      className="flex flex-col gap-2 px-5 py-6 border-b border-[#F0EEEA] cursor-pointer hover:bg-[var(--color-bg-elevated)]/50"
      onClick={() => onEdit(note.id)}
      data-testid={`note-item-${note.id}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate pr-2">{displayTitle}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-[var(--color-text-muted)]">{relativeTime(note.createdAt)}</span>
          <NoteItemMenu noteId={note.id} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      {bodyPreview && note.title && (
        <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-2">{bodyPreview}</p>
      )}
    </div>
  );
}

function EmptyState({ onCompose }: { onCompose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-10 gap-3" data-testid="notes-empty-state">
      <FileText size={32} className="text-[#D4D0CA]" strokeWidth={1.5} />
      <span className="text-[13px] font-medium text-[var(--color-text-muted)]">No notes yet</span>
      <span className="text-[12px] text-[#CCCCCC]">Add context, reminders, or follow-ups</span>
      <Button
        size="sm"
        className="mt-1 text-[12px] font-semibold text-white"
        style={{ background: notesButton.text }}
        onClick={onCompose}
      >
        <Plus size={13} className="mr-1" />
        Add First Note
      </Button>
    </div>
  );
}

function DeleteConfirmation({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-bg-elevated)] border-t border-[var(--color-line)]" data-testid="delete-confirmation">
      <span className="text-[13px] text-[var(--color-text-primary)]">Delete this note?</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button size="sm" variant="destructive" onClick={onConfirm}>Delete</Button>
      </div>
    </div>
  );
}

function ComposeEditForm({
  mode,
  objectLabel,
  initialTitle,
  initialBody,
  onBack,
  onSave,
}: {
  mode: "compose" | "edit";
  objectLabel: string;
  initialTitle: string;
  initialBody: string;
  onBack: () => void;
  onSave: (title: string | null, body: string) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const bodyEmpty = useMemo(() => isBodyEmpty(body), [body]);

  const handleSave = useCallback(() => {
    onSave(title.trim() || null, body);
  }, [title, body, onSave]);

  return (
    <div className="flex flex-col" data-testid="notes-compose-form">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 rounded hover:bg-[var(--color-bg-elevated)]" aria-label="Back to notes list">
            <ChevronLeft size={16} className="text-[var(--color-text-muted)]" />
          </button>
          <span className="text-[15px] font-semibold text-[var(--color-text-primary)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {mode === "compose" ? "New Note" : "Edit Note"}
          </span>
        </div>
        <span className="text-[12px] text-[var(--color-text-muted)]">{objectLabel}</span>
      </div>
      <div className="px-5 py-3 border-b border-[#F0EEEA]">
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-[14px] font-medium text-[var(--color-text-primary)] bg-transparent outline-none placeholder:text-[#CCCCCC]"
          data-testid="note-title-input"
        />
      </div>
      <div className="px-5 py-4 min-h-[180px]" data-testid="note-body-editor">
        <RichTextEditor initialHtml={initialBody} onChange={setBody} />
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-line)]">
        <Button size="sm" variant="outline" onClick={onBack}>Cancel</Button>
        <Button
          size="sm"
          className="text-[12px] font-semibold text-white"
          style={{ background: notesButton.text }}
          disabled={bodyEmpty}
          onClick={handleSave}
          data-testid="save-note-button"
        >
          {mode === "compose" ? "Save Note" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export function NotesDialog({
  open,
  onOpenChange,
  mode,
  objectLabel,
  objectTypeLabel,
  notes,
  editingNote,
  pendingDeleteNoteId,
  onStartCompose,
  onStartEdit,
  onBackToList,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onConfirmDelete,
  onCancelDelete,
}: NotesDialogProps) {
  const handleClose = useCallback(() => {
    onOpenChange(false);
    onBackToList();
  }, [onOpenChange, onBackToList]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="w-[720px] min-h-[70vh] p-0 gap-0 overflow-hidden flex flex-col" data-testid="notes-dialog">
        {mode === "list" && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
              <div className="flex flex-col gap-0.5">
                <DialogTitle className="text-[15px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Notes</DialogTitle>
                <span className="text-[12px] text-[var(--color-text-muted)]">{objectLabel}  ·  {objectTypeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="text-[12px] font-semibold text-white"
                  style={{ background: notesButton.text }}
                  onClick={onStartCompose}
                  data-testid="new-note-button"
                >
                  <Plus size={13} className="mr-1" />
                  New Note
                </Button>
                <button onClick={handleClose} className="p-1 rounded hover:bg-[var(--color-bg-elevated)]" aria-label="Close">
                  <X size={16} className="text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notes.length === 0 ? (
                <EmptyState onCompose={onStartCompose} />
              ) : (
                notes.map((note) => (
                  <NoteItem key={note.id} note={note} onEdit={onStartEdit} onDelete={onDeleteNote} />
                ))
              )}
            </div>
            {pendingDeleteNoteId && (
              <DeleteConfirmation onConfirm={onConfirmDelete} onCancel={onCancelDelete} />
            )}
          </>
        )}
        {(mode === "compose" || mode === "edit") && (
          <ComposeEditForm
            mode={mode}
            objectLabel={objectLabel}
            initialTitle={editingNote?.title ?? ""}
            initialBody={editingNote?.body ?? ""}
            onBack={onBackToList}
            onSave={mode === "compose"
              ? onCreateNote
              : (title, body) => editingNote && onUpdateNote(editingNote.id, title, body)
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
