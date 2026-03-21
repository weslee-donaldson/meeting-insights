import { useState, useCallback } from "react";

export function useClearMessages(onClear: () => Promise<void>) {
  const [pendingClear, setPendingClear] = useState(false);

  const requestClear = useCallback(() => {
    setPendingClear(true);
  }, []);

  const cancelClear = useCallback(() => {
    setPendingClear(false);
  }, []);

  const confirmClear = useCallback(async () => {
    setPendingClear(false);
    try {
      await onClear();
    } catch {
      // Error handling is the caller's responsibility via onClear
    }
  }, [onClear]);

  return { pendingClear, requestClear, cancelClear, confirmClear };
}
