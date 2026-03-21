import { useState, useCallback } from "react";

export function useMeetingSelection() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [checkedMeetingIds, setCheckedMeetingIds] = useState<Set<string>>(new Set());
  const [previewMeetingId, setPreviewMeetingId] = useState<string | null>(null);

  const handleCheck = useCallback((id: string) => {
    setCheckedMeetingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCheckGroup = useCallback((ids: string[]) => {
    setCheckedMeetingIds((prev) => {
      const allChecked = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allChecked) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const handleResetChecked = useCallback(() => {
    setCheckedMeetingIds(new Set());
  }, []);

  return {
    selectedMeetingId,
    setSelectedMeetingId,
    checkedMeetingIds,
    setCheckedMeetingIds,
    previewMeetingId,
    setPreviewMeetingId,
    handleCheck,
    handleCheckGroup,
    handleResetChecked,
  };
}
