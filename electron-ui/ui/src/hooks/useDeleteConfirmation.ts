import { useState, useCallback } from "react";

export function useDeleteConfirmation(onDelete: (id: string) => Promise<void>) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDelete = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setPendingDeleteId(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    if (!id) return;
    try {
      await onDelete(id);
    } catch {
      // Error handling is the caller's responsibility via onDelete
    }
  }, [pendingDeleteId, onDelete]);

  return { pendingDeleteId, requestDelete, cancelDelete, confirmDelete };
}
