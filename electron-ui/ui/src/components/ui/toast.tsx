import React, { useEffect, useState, useCallback } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export function ToastItem({ id, message, type, onDismiss }: Toast & { onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className={`px-4 py-2.5 rounded shadow-lg text-sm text-white ${type === "error" ? "bg-red-600" : "bg-green-700"}`}
    >
      {message}
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: Toast["type"]) => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  }, []);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return { toasts, addToast, removeToast };
}
