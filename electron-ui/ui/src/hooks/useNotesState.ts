import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Note, ObjectType } from "../../../../core/notes.js";

export type NotesDialogMode = "list" | "compose" | "edit";

interface UseNotesStateParams {
  objectType: ObjectType;
  objectId: string | null;
  addToast: (message: string, type: "success" | "error") => void;
}

export function useNotesState({ objectType, objectId, addToast }: UseNotesStateParams) {
  const queryClient = useQueryClient();
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesDialogMode, setNotesDialogMode] = useState<NotesDialogMode>("list");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null);

  const notesQuery = useQuery<Note[]>({
    queryKey: ["notes", objectType, objectId],
    queryFn: () => window.api.notesList(objectType, objectId!),
    enabled: !!objectId && notesDialogOpen,
  });

  const noteCountQuery = useQuery<number>({
    queryKey: ["noteCount", objectType, objectId],
    queryFn: () => window.api.notesCount(objectType, objectId!),
    enabled: !!objectId,
  });

  const editingNote = notesQuery.data?.find((n) => n.id === editingNoteId) ?? null;

  const handleCreateNote = useCallback(async (title: string | null, body: string, noteType?: string) => {
    if (!objectId) return;
    try {
      await window.api.notesCreate(objectType, objectId, title, body, noteType);
      queryClient.invalidateQueries({ queryKey: ["notes", objectType, objectId] });
      queryClient.invalidateQueries({ queryKey: ["noteCount", objectType, objectId] });
      setNotesDialogMode("list");
      addToast("Note saved", "success");
    } catch (err) {
      addToast(`Save note failed: ${(err as Error).message}`, "error");
    }
  }, [objectType, objectId, queryClient, addToast]);

  const handleUpdateNote = useCallback(async (id: string, title: string | null, body: string) => {
    try {
      await window.api.notesUpdate(id, title, body);
      queryClient.invalidateQueries({ queryKey: ["notes", objectType, objectId] });
      setNotesDialogMode("list");
      setEditingNoteId(null);
      addToast("Note updated", "success");
    } catch (err) {
      addToast(`Update note failed: ${(err as Error).message}`, "error");
    }
  }, [objectType, objectId, queryClient, addToast]);

  const handleDeleteNote = useCallback((id: string) => {
    setPendingDeleteNoteId(id);
  }, []);

  const handleConfirmDeleteNote = useCallback(async () => {
    const id = pendingDeleteNoteId;
    setPendingDeleteNoteId(null);
    if (!id) return;
    try {
      await window.api.notesDelete(id);
      queryClient.invalidateQueries({ queryKey: ["notes", objectType, objectId] });
      queryClient.invalidateQueries({ queryKey: ["noteCount", objectType, objectId] });
      addToast("Note deleted", "success");
    } catch (err) {
      addToast(`Delete note failed: ${(err as Error).message}`, "error");
    }
  }, [pendingDeleteNoteId, objectType, objectId, queryClient, addToast]);

  const handleCancelDeleteNote = useCallback(() => {
    setPendingDeleteNoteId(null);
  }, []);

  const handleStartCompose = useCallback(() => {
    setNotesDialogMode("compose");
    setEditingNoteId(null);
  }, []);

  const handleStartEdit = useCallback((id: string) => {
    setEditingNoteId(id);
    setNotesDialogMode("edit");
  }, []);

  const handleBackToList = useCallback(() => {
    setNotesDialogMode("list");
    setEditingNoteId(null);
  }, []);

  return {
    notesDialogOpen,
    setNotesDialogOpen,
    notesDialogMode,
    setNotesDialogMode,
    editingNoteId,
    editingNote,
    pendingDeleteNoteId,
    notesQuery,
    noteCountQuery,
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
    handleConfirmDeleteNote,
    handleCancelDeleteNote,
    handleStartCompose,
    handleStartEdit,
    handleBackToList,
  };
}
