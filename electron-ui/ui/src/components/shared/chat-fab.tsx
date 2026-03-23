import React from "react";
import { MessageCircle } from "lucide-react";

interface ChatFabProps {
  onClick: () => void;
}

export function ChatFab({ onClick }: ChatFabProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Open chat"
      data-testid="chat-fab"
      className="fixed bottom-[72px] right-4 w-12 h-12 rounded-full bg-[var(--color-accent)] text-white shadow-lg flex items-center justify-center z-40 border-0 cursor-pointer"
    >
      <MessageCircle className="w-5 h-5" strokeWidth={2} />
    </button>
  );
}
