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

function renderEmptyState(
  searchQuery: string,
  isLoading: boolean,
  isError: boolean,
  onRetry: () => void,
) {
  const centerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
    gap: "8px",
  };
  const headingStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.display,
    fontSize: "14px",
    fontWeight: typography.fontWeight.heading,
    color: textTiers.primary.cssVar,
  };
  const helperStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.caption,
    color: textTiers.muted.cssVar,
  };

  if (isError) {
    return (
      <div data-testid="empty-state-error" style={centerStyle}>
        <span style={headingStyle}>Search failed.</span>
        <button
          onClick={onRetry}
          style={{
            ...helperStyle,
            color: textTiers.muted.cssVar,
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Try again.
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div data-testid="empty-state-loading" style={centerStyle}>
        <div
          className="border-2 border-[var(--color-line)] rounded-full animate-spin"
          style={{
            width: "24px",
            height: "24px",
            borderTopColor: "var(--color-accent)",
          }}
        />
        <span style={helperStyle}>Searching...</span>
      </div>
    );
  }

  if (!searchQuery) {
    return (
      <div data-testid="empty-state-initial" style={centerStyle}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span style={headingStyle}>Search across all meetings</span>
        <span style={helperStyle}>Enter a query above to search decisions, action items, risks, and more.</span>
      </div>
    );
  }

  return (
    <div data-testid="empty-state-no-results" style={centerStyle}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="8" x2="14" y2="14" />
        <line x1="14" y1="8" x2="8" y2="14" />
      </svg>
      <span style={headingStyle}>No meetings match your search</span>
      <span style={helperStyle}>Try broadening your search, adjusting filters, or searching in more fields.</span>
    </div>
  );
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
      {!hasResults && renderEmptyState(searchQuery, isLoading, isError, onRetry)}
    </div>
  );
}
