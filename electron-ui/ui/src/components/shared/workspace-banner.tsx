import React from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils.js";

interface WorkspaceBannerProps {
  clientName: string | null;
  clients: string[];
  onClientChange: (name: string | null) => void;
  stats?: { meetings: number; actionItems: number; threads: number };
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSubmitSearch: (query: string) => void;
  dateRange: { after: string; before: string };
  onDateChange: (field: "after" | "before", value: string) => void;
  deepSearchEnabled?: boolean;
  onDeepSearchToggle?: (enabled: boolean) => void;
  onReset: () => void;
  className?: string;
}

export function WorkspaceBanner({
  clientName,
  clients,
  onClientChange,
  stats,
  searchQuery,
  onSearchQueryChange,
  onSubmitSearch,
  dateRange,
  onDateChange,
  deepSearchEnabled,
  onDeepSearchToggle,
  onReset,
  className,
}: WorkspaceBannerProps) {
  if (!clientName) {
    return (
      <div className={cn("flex items-center gap-3 px-5 py-3 bg-[var(--color-bg-surface)] border-b border-[var(--color-line)]", className)}>
        <span className="text-[13px] text-[var(--color-text-secondary)]">Select a workspace</span>
        <select
          value=""
          onChange={(e) => onClientChange(e.target.value || null)}
          aria-label="Client"
          className="px-2 py-1 rounded-md bg-[var(--color-bg-input)] border border-[var(--color-line)] text-[13px] text-[var(--color-text-primary)]"
        >
          <option value="">Choose client…</option>
          {clients.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    );
  }

  const initial = clientName.charAt(0).toUpperCase();

  return (
    <div className={cn("flex flex-col border-b border-[var(--color-line)]", className)}>
      <div className="flex items-center gap-3 px-5 py-2.5 bg-[var(--color-tint)] border-b border-[var(--color-accent-muted)]">
        <div
          className="w-[28px] h-[28px] rounded-full bg-[var(--color-accent)] flex items-center justify-center shrink-0"
        >
          <span
            className="text-white text-[13px] font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {initial}
          </span>
        </div>
        <select
          value={clientName}
          onChange={(e) => onClientChange(e.target.value || null)}
          aria-label="Client"
          className="text-[14px] font-semibold bg-transparent border-0 text-[var(--color-text-primary)] cursor-pointer appearance-none pr-4"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0 center" }}
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex-1" />
        {stats && (
          <span className="text-[11px] text-[var(--color-text-secondary)] shrink-0">
            {stats.meetings} meetings · {stats.actionItems} action items · {stats.threads} threads
          </span>
        )}
        <button
          onClick={onReset}
          aria-label="Reset"
          className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] bg-transparent border-0 cursor-pointer shrink-0"
        >
          Reset
        </button>
      </div>

      <div className="flex items-center gap-3 px-5 py-2.5 bg-[var(--color-bg-surface)]">
        <div className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-input)]">
          <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" strokeWidth={1.75} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSubmitSearch(searchQuery); }}
            placeholder={`Search within ${clientName}…`}
            aria-label="Search meetings"
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          />
          {searchQuery && (
            <button
              onClick={() => { onSearchQueryChange(""); onSubmitSearch(""); }}
              aria-label="Clear search"
              className="text-[var(--color-text-muted)] bg-transparent border-0 cursor-pointer text-xs"
            >
              ×
            </button>
          )}
        </div>

        {onDeepSearchToggle && (
          <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={deepSearchEnabled ?? false}
              onChange={(e) => onDeepSearchToggle(e.target.checked)}
              aria-label="Deep Search"
              className="w-3.5 h-3.5"
              style={{ accentColor: "var(--color-accent)" }}
            />
            <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">Deep</span>
          </label>
        )}

        <span className="text-[11px] text-[var(--color-text-secondary)] shrink-0">From</span>
        <input
          type="date"
          value={dateRange.after}
          onChange={(e) => onDateChange("after", e.target.value)}
          aria-label="After date"
          className="px-2 py-1 rounded-md border border-[var(--color-line)] bg-[var(--color-bg-input)] text-[11px] text-[var(--color-text-primary)]"
        />
        <span className="text-[11px] text-[var(--color-text-secondary)] shrink-0">to</span>
        <input
          type="date"
          value={dateRange.before}
          onChange={(e) => onDateChange("before", e.target.value)}
          aria-label="Before date"
          className="px-2 py-1 rounded-md border border-[var(--color-line)] bg-[var(--color-bg-input)] text-[11px] text-[var(--color-text-primary)]"
        />
      </div>
    </div>
  );
}
