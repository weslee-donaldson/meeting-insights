// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NotesDialog } from "../../electron-ui/ui/src/components/NotesDialog.js";
import type { Note } from "../../core/notes.js";

afterEach(cleanup);

const sampleNotes: Note[] = [
  { id: "n1", objectType: "meeting", objectId: "m1", title: "Risk: timeline", body: "<p>Jennifer flagged the issue</p>", noteType: "user", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "n2", objectType: "meeting", objectId: "m1", title: null, body: "<p>Untitled note body content here</p>", noteType: "user", createdAt: "2026-03-14T10:00:00Z", updatedAt: "2026-03-14T10:00:00Z" },
];

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  mode: "list" as const,
  objectLabel: "Pre-Mortem for Commerce",
  objectTypeLabel: "Meeting",
  notes: sampleNotes,
  editingNote: null,
  pendingDeleteNoteId: null,
  onStartCompose: vi.fn(),
  onStartEdit: vi.fn(),
  onBackToList: vi.fn(),
  onCreateNote: vi.fn(),
  onUpdateNote: vi.fn(),
  onDeleteNote: vi.fn(),
  onConfirmDelete: vi.fn(),
  onCancelDelete: vi.fn(),
};

describe("NotesDialog — List Mode", () => {
  it("renders dialog header with title and object subtitle", () => {
    render(<NotesDialog {...defaultProps} />);

    expect(screen.getByText("Notes")).toBeDefined();
    expect(screen.getByText(/Pre-Mortem for Commerce/)).toBeDefined();
    expect(screen.getByText(/Meeting/)).toBeDefined();
  });

  it("renders New Note button in header", () => {
    render(<NotesDialog {...defaultProps} />);

    expect(screen.getByTestId("new-note-button")).toBeDefined();
    fireEvent.click(screen.getByTestId("new-note-button"));
    expect(defaultProps.onStartCompose).toHaveBeenCalled();
  });

  it("renders note items with titles", () => {
    render(<NotesDialog {...defaultProps} />);

    expect(screen.getByText("Risk: timeline")).toBeDefined();
  });

  it("renders first-line fallback for untitled notes", () => {
    render(<NotesDialog {...defaultProps} />);

    expect(screen.getByText("Untitled note body content here")).toBeDefined();
  });

  it("clicking a note item calls onStartEdit", () => {
    render(<NotesDialog {...defaultProps} />);

    fireEvent.click(screen.getByTestId("note-item-n1"));
    expect(defaultProps.onStartEdit).toHaveBeenCalledWith("n1");
  });
});

describe("NotesDialog — Empty State", () => {
  it("shows empty state when no notes exist", () => {
    render(<NotesDialog {...defaultProps} notes={[]} />);

    expect(screen.getByTestId("notes-empty-state")).toBeDefined();
    expect(screen.getByText("No notes yet")).toBeDefined();
    expect(screen.getByText("Add First Note")).toBeDefined();
  });

  it("Add First Note button calls onStartCompose", () => {
    render(<NotesDialog {...defaultProps} notes={[]} />);

    fireEvent.click(screen.getByText("Add First Note"));
    expect(defaultProps.onStartCompose).toHaveBeenCalled();
  });
});

describe("NotesDialog — Delete Confirmation", () => {
  it("shows delete confirmation when pendingDeleteNoteId is set", () => {
    render(<NotesDialog {...defaultProps} pendingDeleteNoteId="n1" />);

    expect(screen.getByTestId("delete-confirmation")).toBeDefined();
    expect(screen.getByText("Delete this note?")).toBeDefined();
  });

  it("Cancel clears pending delete", () => {
    render(<NotesDialog {...defaultProps} pendingDeleteNoteId="n1" />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onCancelDelete).toHaveBeenCalled();
  });

  it("Delete confirms deletion", () => {
    render(<NotesDialog {...defaultProps} pendingDeleteNoteId="n1" />);

    fireEvent.click(screen.getByText("Delete"));
    expect(defaultProps.onConfirmDelete).toHaveBeenCalled();
  });
});

describe("NotesDialog — Compose Mode", () => {
  it("renders compose form with back arrow and title", () => {
    render(<NotesDialog {...defaultProps} mode="compose" />);

    expect(screen.getByTestId("notes-compose-form")).toBeDefined();
    expect(screen.getByText("New Note")).toBeDefined();
    expect(screen.getByPlaceholderText("Title (optional)")).toBeDefined();
  });

  it("renders Save Note button", () => {
    render(<NotesDialog {...defaultProps} mode="compose" />);

    expect(screen.getByTestId("save-note-button")).toBeDefined();
    expect(screen.getByTestId("save-note-button").textContent).toContain("Save Note");
  });

  it("back button calls onBackToList", () => {
    render(<NotesDialog {...defaultProps} mode="compose" />);

    fireEvent.click(screen.getByLabelText("Back to notes list"));
    expect(defaultProps.onBackToList).toHaveBeenCalled();
  });
});

describe("NotesDialog — Edit Mode", () => {
  it("renders edit form with pre-populated title", () => {
    render(<NotesDialog {...defaultProps} mode="edit" editingNote={sampleNotes[0]} />);

    expect(screen.getByText("Edit Note")).toBeDefined();
    const input = screen.getByTestId("note-title-input") as HTMLInputElement;
    expect(input.value).toBe("Risk: timeline");
  });

  it("renders Save Changes button", () => {
    render(<NotesDialog {...defaultProps} mode="edit" editingNote={sampleNotes[0]} />);

    expect(screen.getByTestId("save-note-button").textContent).toContain("Save Changes");
  });
});

describe("NotesDialog — Note Type Display", () => {
  const keyPointsNote: Note = { id: "kp1", objectType: "meeting", objectId: "m1", title: "Krisp Key Points", body: "- Point 1", noteType: "key-points", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const actionItemsNote: Note = { id: "ai1", objectType: "meeting", objectId: "m1", title: "Krisp Action Items", body: "- [ ] Task 1", noteType: "action-items", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

  it("renders type badge for non-user notes", () => {
    render(<NotesDialog {...defaultProps} notes={[keyPointsNote, actionItemsNote]} />);
    expect(screen.getByText("Key Points")).toBeDefined();
    expect(screen.getByText("Action Items")).toBeDefined();
  });

  it("does not render type badge for user notes", () => {
    render(<NotesDialog {...defaultProps} notes={sampleNotes} />);
    expect(screen.queryByText("Key Points")).toBeNull();
    expect(screen.queryByText("Action Items")).toBeNull();
  });

  it("hides action menu for non-user notes", () => {
    render(<NotesDialog {...defaultProps} notes={[keyPointsNote]} />);
    expect(screen.queryByTestId("note-menu-kp1")).toBeNull();
  });

  it("shows action menu for user notes", () => {
    render(<NotesDialog {...defaultProps} notes={sampleNotes} />);
    expect(screen.getByTestId("note-menu-n1")).toBeDefined();
  });
});
