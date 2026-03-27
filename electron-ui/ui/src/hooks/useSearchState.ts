import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { DISPLAY_LIMIT } from "../../../electron/handlers/config.js";
import { useSearch } from "./useSearch.js";
import { useDeepSearch } from "./useDeepSearch.js";

const ALL_FIELDS = new Set([
  "summary", "decisions", "action_items", "risk_items",
  "proposed_features", "open_questions", "milestones",
]);

export interface UseSearchStateProps {
  selectedClient: string | null;
}

export function useSearchState({ selectedClient }: UseSearchStateProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typedSearchQuery, setTypedSearchQuery] = useState("");
  const [searchFields, setSearchFields] = useState<Set<string>>(() => new Set(ALL_FIELDS));
  const [dateAfter, setDateAfter] = useState("");
  const [dateBefore, setDateBefore] = useState("");
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const [groupBy, setGroupByRaw] = useState<"none" | "cluster" | "date" | "series">("none");
  const [sortBy, setSortByRaw] = useState<"relevance" | "date-newest" | "date-oldest">("relevance");
  const [checkedResultIds, setCheckedResultIds] = useState<Set<string>>(() => new Set());
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(DISPLAY_LIMIT);
  const [searchDurationMs, setSearchDurationMs] = useState<number | null>(null);
  const searchStartRef = useRef<number | null>(null);

  const toggleField = useCallback((field: string) => {
    setSearchFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }, []);

  const toggleCheckedResultId = useCallback((id: string) => {
    setCheckedResultIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const submitSearch = useCallback(() => {
    setSearchQuery(typedSearchQuery);
    setDisplayedCount(DISPLAY_LIMIT);
    searchStartRef.current = Date.now();
    setSearchDurationMs(null);
  }, [typedSearchQuery]);

  const setGroupBy = useCallback((value: "none" | "cluster" | "date" | "series") => {
    setGroupByRaw(value);
    setDisplayedCount(DISPLAY_LIMIT);
  }, []);

  const setSortBy = useCallback((value: "relevance" | "date-newest" | "date-oldest") => {
    setSortByRaw(value);
    setDisplayedCount(DISPLAY_LIMIT);
  }, []);

  const searchFieldsArray = useMemo(() => [...searchFields], [searchFields]);

  const {
    data: searchResults,
    isFetching: searchFetching,
  } = useSearch(
    searchQuery,
    selectedClient ?? undefined,
    dateAfter || undefined,
    dateBefore || undefined,
    { keyPrefix: "searchView-search", searchFields: searchFieldsArray },
  );

  const hybridMeetingIds = useMemo(
    () => (searchResults ?? []).map((r) => r.meeting_id),
    [searchResults],
  );

  const {
    data: deepSearchResults,
    isFetching: deepSearchFetching,
  } = useDeepSearch(
    hybridMeetingIds,
    searchQuery,
    deepSearchEnabled && searchQuery.trim().length >= 2 && !searchFetching,
    { keyPrefix: "searchView-deep" },
  );

  const isDeepSearchActive = deepSearchEnabled && !!deepSearchResults && deepSearchResults.length > 0;

  useEffect(() => {
    if (searchResults && searchStartRef.current !== null) {
      setSearchDurationMs(Date.now() - searchStartRef.current);
      searchStartRef.current = null;
    }
  }, [searchResults]);

  return {
    searchQuery,
    typedSearchQuery,
    setTypedSearchQuery,
    searchFields,
    toggleField,
    dateAfter,
    setDateAfter,
    dateBefore,
    setDateBefore,
    deepSearchEnabled,
    setDeepSearchEnabled,
    formVisible,
    setFormVisible,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    checkedResultIds,
    toggleCheckedResultId,
    selectedResultId,
    setSelectedResultId,
    displayedCount,
    setDisplayedCount,
    searchDurationMs,
    submitSearch,
    selectedClient,
    searchResults: searchResults ?? null,
    searchFetching,
    hybridMeetingIds,
    deepSearchResults: deepSearchResults ?? null,
    deepSearchFetching,
    isDeepSearchActive,
  };
}
