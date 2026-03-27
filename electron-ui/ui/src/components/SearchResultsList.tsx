import React from "react";
import type { EnrichedResult } from "../hooks/useSearchState.js";
import { SearchResultCard } from "./SearchResultCard.js";
import { typography, textTiers } from "../design-tokens.js";
import { DISPLAY_LIMIT } from "../../../electron/handlers/config.js";

interface SearchResultsListProps {
  enrichedResults: EnrichedResult[];
  searchDurationMs: number | null;
  displayedCount: number;
  setDisplayedCount: (n: number) => void;
  checkedResultIds: Set<string>;
  onToggleChecked: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onOpen: (id: string) => void;
  onSaveAsThread: () => void;
  groupBy: "none" | "cluster" | "date" | "series";
  sortBy: "relevance" | "date-newest" | "date-oldest";
  searchQuery: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function renderPaginationFooter(
  total: number,
  shown: number,
  loading: boolean,
  setDisplayedCount: (n: number) => void,
) {
  const allLoaded = shown >= total;
  const footerStyle = {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    lineHeight: typography.lineHeight.micro,
  };

  if (allLoaded) {
    return (
      <div className="flex items-center justify-center" style={{ padding: "12px 20px", gap: "6px" }}>
        <span style={{ ...footerStyle, color: textTiers.muted.cssVar }}>
          Showing all {total} results
        </span>
      </div>
    );
  }

  const displayedShown = Math.min(shown, total);

  return (
    <div className="flex items-center justify-center" style={{ padding: "12px 20px", gap: "6px" }}>
      <span style={{ ...footerStyle, color: textTiers.secondary.cssVar }}>
        Showing {displayedShown} of {total}
      </span>
      {loading ? (
        <span style={{ ...footerStyle, color: textTiers.muted.cssVar }}>Loading...</span>
      ) : (
        <button
          onClick={() => setDisplayedCount(shown + DISPLAY_LIMIT)}
          className="text-[var(--color-accent)]"
          style={{ ...footerStyle, fontWeight: typography.fontWeight.label, background: "none", border: "none", cursor: "pointer" }}
        >
          Load more
        </button>
      )}
    </div>
  );
}

export function SearchResultsList({
  enrichedResults,
  searchDurationMs,
  displayedCount,
  setDisplayedCount,
  checkedResultIds,
  onToggleChecked,
  onSelectAll,
  onOpen,
  onSaveAsThread,
  groupBy,
  sortBy,
  searchQuery,
  isLoading,
  isError,
  onRetry,
}: SearchResultsListProps) {
  const hasResults = enrichedResults.length > 0;
  const showHeader = hasResults;

  return (
    <div data-testid="search-results-list">
      {showHeader && (
        <div
          className="flex items-center gap-2 border-b border-[var(--color-line)]"
          style={{ padding: "8px 20px" }}
        >
          <span
            className="font-semibold"
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.caption,
              lineHeight: typography.lineHeight.label,
              color: textTiers.primary.cssVar,
            }}
          >
            {enrichedResults.length} results
          </span>
          {searchDurationMs !== null && (
            <span
              className="text-[var(--color-text-muted)]"
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: typography.fontSize.label,
                lineHeight: typography.lineHeight.micro,
              }}
            >
              in {(searchDurationMs / 1000).toFixed(1)}s
            </span>
          )}
          <div className="flex-1" />
          <button
            className="border border-[var(--color-line)] bg-[var(--color-bg-surface)]"
            style={{
              borderRadius: "4px",
              padding: "2px 10px",
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.label,
              fontWeight: typography.fontWeight.label,
              lineHeight: typography.lineHeight.micro,
              color: textTiers.secondary.cssVar,
            }}
            onClick={() => onSelectAll(enrichedResults.map((r) => r.meetingId))}
          >
            Select all
          </button>
          <button
            onClick={onSaveAsThread}
            style={{
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.label,
              fontWeight: typography.fontWeight.label,
              lineHeight: typography.lineHeight.micro,
              color: textTiers.muted.cssVar,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Save as Thread
          </button>
        </div>
      )}
      {hasResults &&
        enrichedResults.slice(0, displayedCount).map((r) => (
          <SearchResultCard
            key={r.meetingId}
            result={r}
            checked={checkedResultIds.has(r.meetingId)}
            onToggleChecked={onToggleChecked}
            onOpen={onOpen}
            searchQuery={searchQuery}
          />
        ))}
      {hasResults && renderPaginationFooter(enrichedResults.length, displayedCount, isLoading, setDisplayedCount)}
    </div>
  );
}
