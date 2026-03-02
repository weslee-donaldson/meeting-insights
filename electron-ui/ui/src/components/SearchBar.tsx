import React, { useState } from "react";
import { Search } from "lucide-react";
import { useSearch } from "../hooks/useSearch.js";
import type { SearchResultRow } from "../../../electron/channels.js";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  client?: string;
  onSelectResults: (results: SearchResultRow[]) => void;
}

export function SearchBar({ query, onQueryChange, client, onSelectResults }: Props) {
  const [open, setOpen] = useState(false);
  const { data: results, isError } = useSearch(query, client);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-2 py-1 rounded"
        style={{ background: "var(--color-bg-input)", border: "1px solid var(--color-border)" }}
      >
        <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
        <input
          type="text"
          placeholder="Search meetings…"
          value={query}
          onChange={(e) => { onQueryChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="bg-transparent focus:outline-none text-sm w-44"
          style={{ color: "var(--color-text-primary)" }}
          aria-label="Search meetings"
        />
      </div>
      {isError && (
        <span
          className="absolute top-full mt-1 left-0 text-xs px-2 py-0.5 rounded"
          style={{ background: "var(--color-bg-elevated)", color: "var(--color-danger)", border: "1px solid var(--color-border)" }}
        >
          Search unavailable
        </span>
      )}
      {!isError && open && results && results.length > 0 && (
        <ul
          className="absolute top-full mt-1 left-0 z-50 w-80 rounded shadow-xl overflow-hidden"
          style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
          role="listbox"
        >
          {results.map((r) => (
            <li
              key={r.meeting_id}
              role="option"
              aria-selected={false}
              className="px-3 py-2 cursor-pointer"
              style={{ borderBottom: "1px solid var(--color-border)" }}
              onMouseDown={() => {
                onSelectResults([r]);
                onQueryChange("");
                setOpen(false);
              }}
            >
              <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {r.meeting_type}
              </div>
              <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {r.client} · {r.date.slice(0, 10)} · {r.score.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
