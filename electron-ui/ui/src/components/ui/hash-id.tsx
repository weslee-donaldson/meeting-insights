import React from "react";
import { cn } from "../../lib/utils.js";

interface HashIdProps {
  hash: string;
  className?: string;
}

export function HashId({ hash, className }: HashIdProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
  };

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${hash}`}
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-mono",
        "text-[var(--color-line)] hover:text-[var(--color-text-secondary)]",
        "transition-colors",
        className,
      )}
    >
      <span>{hash}</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3 h-3"
      >
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    </button>
  );
}
