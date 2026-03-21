import { useMemo, useEffect } from "react";
import { useSearch } from "./useSearch.js";
import { useDeepSearch } from "./useDeepSearch.js";
import type { MeetingRow } from "../../../electron/channels.js";

export function useSearchScope(
  allMeetings: MeetingRow[],
  searchQuery: string,
  deepSearchEnabled: boolean,
  addToast: (message: string, type: "success" | "error") => void,
) {
  const { data: searchResults, isFetching: searchFetching } = useSearch(searchQuery);

  const hybridMeetingIds = useMemo(
    () => (searchResults ?? []).map((r) => r.meeting_id),
    [searchResults],
  );

  const { data: deepSearchResults, isFetching: deepSearchFetching, isError: deepSearchError, error: deepSearchErrorObj } = useDeepSearch(
    hybridMeetingIds,
    searchQuery,
    deepSearchEnabled && searchQuery.trim().length >= 2 && !searchFetching,
  );

  useEffect(() => {
    if (deepSearchError && deepSearchErrorObj) {
      const msg = (deepSearchErrorObj as Error).message.replace(/^\[api_error\]\s*/, "").replace(/^\[rate_limit\]\s*/, "");
      addToast(`Deep search failed: ${msg}`, "error");
    }
  }, [deepSearchError, deepSearchErrorObj, addToast]);

  const isDeepSearchActive = deepSearchEnabled && !!deepSearchResults && deepSearchResults.length > 0;
  const deepSearchLoading = deepSearchEnabled && deepSearchFetching && searchQuery.trim().length >= 2;
  const deepSearchEmpty = deepSearchEnabled && !deepSearchError && !!deepSearchResults && deepSearchResults.length === 0 && searchQuery.trim().length >= 2 && !deepSearchFetching;

  const scopeMeetings = useMemo(() => {
    if (searchQuery.trim().length < 2 || !searchResults) return allMeetings;
    if (isDeepSearchActive) {
      const deepIds = new Set(deepSearchResults!.map((r) => r.meeting_id));
      return allMeetings.filter((m) => deepIds.has(m.id));
    }
    if (deepSearchEmpty) return [];
    const matchIds = new Set(searchResults.map((r) => r.meeting_id));
    return allMeetings.filter((m) => matchIds.has(m.id));
  }, [allMeetings, searchQuery, searchResults, isDeepSearchActive, deepSearchResults, deepSearchEmpty]);

  const searchScores = useMemo(() => {
    if (isDeepSearchActive) {
      return new Map(deepSearchResults!.map((r) => [r.meeting_id, r.relevanceScore]));
    }
    if (!searchResults || searchResults.length === 0) return undefined;
    return new Map(searchResults.map((r) => [r.meeting_id, r.score]));
  }, [searchResults, isDeepSearchActive, deepSearchResults]);

  const deepSearchSummaries = useMemo(() => {
    if (!isDeepSearchActive) return undefined;
    return new Map(deepSearchResults!.map((r) => [r.meeting_id, r.relevanceSummary]));
  }, [isDeepSearchActive, deepSearchResults]);

  return {
    searchResults,
    searchFetching,
    isDeepSearchActive,
    deepSearchLoading,
    deepSearchEmpty,
    scopeMeetings,
    searchScores,
    deepSearchSummaries,
  };
}
