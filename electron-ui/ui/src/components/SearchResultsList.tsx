import React, { useState, useCallback, useRef } from "react";
import type { EnrichedResult } from "../hooks/useSearchState.js";
import { SearchResultCard } from "./SearchResultCard.js";
import { typography, textTiers } from "../design-tokens.js";
const DISPLAY_LIMIT = 20;

interface SearchResultsListProps {
  enrichedResults: EnrichedResult[];
  searchDurationMs: number | null;
  displayedCount: number;
  setDisplayedCount: (n: number) => void;
  checkedResultIds: Set<string>;
  onToggleChecked: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onOpen: (id: string) => void;
  onSaveAsThread: (meetingIds: string[]) => void;
  groupBy: "none" | "cluster" | "date" | "series";
  sortBy: "relevance" | "date-newest" | "date-oldest";
  searchQuery: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEscapeToSearch?: () => void;
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

interface ResultGroup {
  key: string;
  label: string;
  results: EnrichedResult[];
}

function groupByCluster(results: EnrichedResult[]): ResultGroup[] {
  const map = new Map<string, EnrichedResult[]>();
  for (const r of results) {
    const tag = r.clusterTags.length > 0 ? r.clusterTags[0] : "uncategorized";
    if (!map.has(tag)) map.set(tag, []);
    map.get(tag)!.push(r);
  }
  return [...map.entries()].map(([key, rs]) => ({
    key,
    label: key === "uncategorized" ? "Uncategorized" : key,
    results: rs,
  }));
}

function groupByMonth(results: EnrichedResult[]): ResultGroup[] {
  const map = new Map<string, EnrichedResult[]>();
  for (const r of results) {
    const d = new Date(r.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return [...map.entries()].map(([key, rs]) => {
    const [year, month] = key.split("-");
    const d = new Date(Date.UTC(Number(year), Number(month) - 1, 15));
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
    return { key, label, results: rs };
  });
}

function groupBySeries(results: EnrichedResult[]): ResultGroup[] {
  const map = new Map<string, EnrichedResult[]>();
  for (const r of results) {
    const key = r.series;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return [...map.entries()].map(([key, rs]) => ({
    key,
    label: key,
    results: rs,
  }));
}

function buildGroups(results: EnrichedResult[], groupBy: "none" | "cluster" | "date" | "series"): ResultGroup[] {
  if (groupBy === "cluster") return groupByCluster(results);
  if (groupBy === "date") return groupByMonth(results);
  if (groupBy === "series") return groupBySeries(results);
  return [{ key: "all", label: "", results }];
}

function sortWithinGroups(groups: ResultGroup[]): ResultGroup[] {
  return groups.map((g) => ({
    ...g,
    results: [...g.results].sort((a, b) => b.displayScore - a.displayScore),
  }));
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

function renderGroupedCards(
  results: EnrichedResult[],
  displayedCount: number,
  groupBy: "none" | "cluster" | "date" | "series",
  checkedResultIds: Set<string>,
  onToggleChecked: (id: string) => void,
  onSelectAll: (ids: string[]) => void,
  onOpen: (id: string) => void,
  searchQuery: string,
  focusedResultIndex: number,
) {
  const groups = sortWithinGroups(buildGroups(results, groupBy));
  const isGrouped = groupBy !== "none";

  const groupHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 20px",
    borderTop: "1px solid var(--color-line)",
    background: "var(--color-bg-elevated)",
  };

  const groupLabelStyle: React.CSSProperties = {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.heading,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.groupLabel,
    color: textTiers.primary.cssVar,
  };

  const selectGroupBtnStyle: React.CSSProperties = {
    borderRadius: "4px",
    padding: "2px 10px",
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.label,
    lineHeight: typography.lineHeight.micro,
    color: textTiers.secondary.cssVar,
    border: "1px solid var(--color-line)",
    background: "var(--color-bg-surface)",
    cursor: "pointer",
  };

  let rendered = 0;
  const elements: React.ReactNode[] = [];

  for (const group of groups) {
    if (rendered >= displayedCount) break;

    if (isGrouped) {
      elements.push(
        <div
          key={`header-${group.key}`}
          data-testid={`group-header-${group.key}`}
          style={groupHeaderStyle}
        >
          <span style={groupLabelStyle}>
            {group.label} ({group.results.length})
          </span>
          <div style={{ flex: 1 }} />
          <button
            aria-label={`Select all in group ${group.label}`}
            style={selectGroupBtnStyle}
            onClick={() => onSelectAll(group.results.map((r) => r.meetingId))}
          >
            Select all in group
          </button>
        </div>,
      );
    }

    for (const r of group.results) {
      if (rendered >= displayedCount) break;
      elements.push(
        <SearchResultCard
          key={r.meetingId}
          result={r}
          checked={checkedResultIds.has(r.meetingId)}
          focused={rendered === focusedResultIndex}
          onToggleChecked={onToggleChecked}
          onOpen={onOpen}
          searchQuery={searchQuery}
        />,
      );
      rendered++;
    }
  }

  return <>{elements}</>;
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
  onEscapeToSearch,
}: SearchResultsListProps) {
  const hasResults = enrichedResults.length > 0;
  const showHeader = hasResults;
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const handleListFocus = useCallback(() => {
    if (hasResults && focusedResultIndex < 0) {
      setFocusedResultIndex(0);
    }
  }, [hasResults, focusedResultIndex]);

  const maxIndex = Math.min(displayedCount, enrichedResults.length) - 1;

  const orderedIds = useCallback((): string[] => {
    const groups = sortWithinGroups(buildGroups(enrichedResults, groupBy));
    const ids: string[] = [];
    let count = 0;
    for (const group of groups) {
      for (const r of group.results) {
        if (count >= displayedCount) return ids;
        ids.push(r.meetingId);
        count++;
      }
    }
    return ids;
  }, [enrichedResults, groupBy, displayedCount]);

  const handleListKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setFocusedResultIndex(-1);
      onEscapeToSearch?.();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedResultIndex((prev) => Math.min(prev + 1, maxIndex));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedResultIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const ids = orderedIds();
      if (focusedResultIndex >= 0 && focusedResultIndex < ids.length) {
        onOpen(ids[focusedResultIndex]);
      }
      return;
    }
    if (e.key === " ") {
      e.preventDefault();
      const ids = orderedIds();
      if (focusedResultIndex >= 0 && focusedResultIndex < ids.length) {
        onToggleChecked(ids[focusedResultIndex]);
      }
    }
  }, [onEscapeToSearch, maxIndex, orderedIds, focusedResultIndex, onOpen, onToggleChecked]);

  function computeSaveAsThreadMeetingIds(): string[] {
    if (checkedResultIds.size > 0) {
      return enrichedResults
        .filter((r) => checkedResultIds.has(r.meetingId))
        .map((r) => r.meetingId);
    }
    return enrichedResults.slice(0, displayedCount).map((r) => r.meetingId);
  }

  return (
    <div
      data-testid="search-results-list"
      role={hasResults ? "listbox" : undefined}
      tabIndex={hasResults ? 0 : undefined}
      ref={listRef}
      onFocus={handleListFocus}
      onKeyDown={hasResults ? handleListKeyDown : undefined}
      onBlur={() => setFocusedResultIndex(-1)}
    >
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
            onClick={() => onSaveAsThread(computeSaveAsThreadMeetingIds())}
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
      {hasResults && renderGroupedCards(
        enrichedResults,
        displayedCount,
        groupBy,
        checkedResultIds,
        onToggleChecked,
        onSelectAll,
        onOpen,
        searchQuery,
        focusedResultIndex,
      )}
      {hasResults && renderPaginationFooter(enrichedResults.length, displayedCount, isLoading, setDisplayedCount)}
      {!hasResults && renderEmptyState(searchQuery, isLoading, isError, onRetry)}
    </div>
  );
}
