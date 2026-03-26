// @vitest-environment jsdom
import React from "react";
import { describe, afterEach, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotesState } from "../../electron-ui/ui/src/hooks/useNotesState.js";

afterEach(cleanup);

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const mockApi = {
  notesList: vi.fn().mockResolvedValue([]),
  notesCreate: vi.fn().mockResolvedValue({ id: "n1", objectType: "meeting", objectId: "m1", title: "Test", body: "<p>x</p>", createdAt: "2026-03-20", updatedAt: "2026-03-20" }),
  notesUpdate: vi.fn().mockResolvedValue({ id: "n1", objectType: "meeting", objectId: "m1", title: "Updated", body: "<p>y</p>", createdAt: "2026-03-20", updatedAt: "2026-03-20" }),
  notesDelete: vi.fn().mockResolvedValue(undefined),
  notesCount: vi.fn().mockResolvedValue(3),
};

beforeEach(() => {
  vi.clearAllMocks();
  (window as unknown as Record<string, unknown>).api = mockApi;
});

describe("useNotesState", () => {
  it("initializes with dialog closed and list mode", () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    expect(result.current.notesDialogOpen).toBe(false);
    expect(result.current.notesDialogMode).toBe("list");
    expect(result.current.editingNoteId).toBeNull();
    expect(result.current.pendingDeleteNoteId).toBeNull();
  });

  it("fetches note count when objectId is provided", async () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.noteCountQuery.isSuccess).toBe(true));
    expect(result.current.noteCountQuery.data).toBe(3);
  });

  it("handleStartCompose switches to compose mode", () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    act(() => result.current.handleStartCompose());

    expect(result.current.notesDialogMode).toBe("compose");
  });

  it("handleStartEdit switches to edit mode with note id", () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    act(() => result.current.handleStartEdit("n1"));

    expect(result.current.notesDialogMode).toBe("edit");
    expect(result.current.editingNoteId).toBe("n1");
  });

  it("handleBackToList returns to list mode and clears editing", () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    act(() => result.current.handleStartEdit("n1"));
    act(() => result.current.handleBackToList());

    expect(result.current.notesDialogMode).toBe("list");
    expect(result.current.editingNoteId).toBeNull();
  });

  it("handleDeleteNote sets pending delete id", () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    act(() => result.current.handleDeleteNote("n1"));

    expect(result.current.pendingDeleteNoteId).toBe("n1");
  });

  it("handleCancelDeleteNote clears pending delete id", () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    act(() => result.current.handleDeleteNote("n1"));
    act(() => result.current.handleCancelDeleteNote());

    expect(result.current.pendingDeleteNoteId).toBeNull();
  });

  it("handleCreateNote calls API and toasts success", async () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    act(() => result.current.handleStartCompose());
    await act(() => result.current.handleCreateNote("Title", "<p>body</p>"));

    expect(mockApi.notesCreate).toHaveBeenCalledWith("meeting", "m1", "Title", "<p>body</p>", undefined);
    expect(addToast).toHaveBeenCalledWith("Note saved", "success");
    expect(result.current.notesDialogMode).toBe("list");
  });

  it("handleConfirmDeleteNote calls API and toasts success", async () => {
    const addToast = vi.fn();
    const { result } = renderHook(
      () => useNotesState({ objectType: "meeting", objectId: "m1", addToast }),
      { wrapper: makeWrapper() },
    );

    act(() => result.current.handleDeleteNote("n1"));
    await act(() => result.current.handleConfirmDeleteNote());

    expect(mockApi.notesDelete).toHaveBeenCalledWith("n1");
    expect(addToast).toHaveBeenCalledWith("Note deleted", "success");
    expect(result.current.pendingDeleteNoteId).toBeNull();
  });
});
