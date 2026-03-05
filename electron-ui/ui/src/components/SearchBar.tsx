import React from "react";
import { Search, X } from "lucide-react";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: (q: string) => void;
  deepSearchEnabled?: boolean;
  onDeepSearchToggle?: (enabled: boolean) => void;
}

export function SearchBar({ query, onQueryChange, onSubmit, deepSearchEnabled, onDeepSearchToggle }: Props) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1 rounded"
      style={{ background: "var(--color-bg-input)", border: "1px solid var(--color-border)" }}
    >
      <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
      <input
        type="text"
        placeholder="Search meetings…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(query.trim());
        }}
        className="bg-transparent focus:outline-none text-sm w-66"
        style={{ color: "var(--color-text-primary)" }}
        aria-label="Search meetings"
      />
      {query && (
        <button
          onClick={() => { onQueryChange(""); onSubmit(""); }}
          aria-label="Clear search"
          className="shrink-0 cursor-pointer bg-transparent border-0 p-0"
          style={{ color: "var(--color-text-muted)" }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {onDeepSearchToggle && (
        <label className="flex items-center gap-1 shrink-0 cursor-pointer select-none" style={{ color: "var(--color-text-muted)" }}>
          <input
            type="checkbox"
            checked={deepSearchEnabled ?? false}
            onChange={(e) => onDeepSearchToggle(e.target.checked)}
            className="accent-current"
            aria-label="Deep Search"
          />
          <span className="text-xs whitespace-nowrap">Deep</span>
        </label>
      )}
    </div>
  );
}
