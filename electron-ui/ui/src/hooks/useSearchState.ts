import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { DISPLAY_LIMIT, CHAT_CONTEXT_LIMIT } from "../../../electron/handlers/config.js";
import { useSearch } from "./useSearch.js";
import { useDeepSearch } from "./useDeepSearch.js";
import { useArtifactBatch } from "./useArtifactBatch.js";

const ALL_FIELDS = new Set([
  "summary", "decisions", "action_items", "risk_items",
  "proposed_features", "open_questions", "milestones",
]);

export interface UseSearchStateProps {
  selectedClient: string | null;
}

export interface EnrichedResult {
  meetingId: string;
  displayScore: number;
  date: string;
  title: string;
  client: string;
  series: string;
  clusterTags: string[];
  artifact: Record<string, unknown> | null;
  matchedDecisions: string[];
  matchedActionItems: string[];
  matchedRisks: string[];
  totalDecisions: number;
  totalActionItems: number;
  totalRisks: number;
  deepSearchSummary: string | null;
}

function matchItems(items: string[], query: string): string[] {
  if (!query) return [];
  const lower = query.toLowerCase();
  return items.filter((item) => item.toLowerCase().includes(lower));
}

const FIELD_LABELS: Record<string, string> = {
  summary: "Summary",
  decisions: "Decisions",
  action_items: "Action Items",
  risk_items: "Risks",
  proposed_features: "Features",
  open_questions: "Questions",
  milestones: "Milestones",
};

function buildCollapsedSummary(query: string, fields: Set<string>): string {
  if (!query) return "Enter a search query";
  if (fields.size === 0) return "No fields selected";
  if (fields.size === ALL_FIELDS.size) return "All fields";
  const labels = [...ALL_FIELDS].filter((f) => fields.has(f)).map((f) => FIELD_LABELS[f]);
  if (labels.length <= 3) return labels.join(", ");
  return `${labels.slice(0, 3).join(", ")}, +${labels.length - 3} more`;
}

function minMaxNormalize(scores: number[]): Map<number, number> {
  const result = new Map<number, number>();
  if (scores.length === 0) return result;
  if (scores.length === 1) {
    result.set(0, 1);
    return result;
  }
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min;
  scores.forEach((s, i) => {
    result.set(i, range === 0 ? 1 : (s - min) / range);
  });
  return result;
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

  const { data: artifactBatchData } = useArtifactBatch(hybridMeetingIds);

  const deepSearchMap = useMemo(() => {
    if (!isDeepSearchActive || !deepSearchResults) return new Map<string, { summary: string; score: number }>();
    return new Map(deepSearchResults.map((r) => [r.meeting_id, { summary: r.relevanceSummary, score: r.relevanceScore }]));
  }, [isDeepSearchActive, deepSearchResults]);

  const enrichedResults = useMemo((): EnrichedResult[] => {
    if (!searchResults || searchResults.length === 0) return [];
    const scores = searchResults.map((r) => r.score);
    const normalizedScores = minMaxNormalize(scores);
    return searchResults.map((r, i) => {
      const artifact = artifactBatchData?.[r.meeting_id] ?? null;
      const deepInfo = deepSearchMap.get(r.meeting_id);
      const displayScore = isDeepSearchActive && deepInfo
        ? deepInfo.score / 100
        : normalizedScores.get(i) ?? 0;

      let decisions: string[] = [];
      let actionItems: string[] = [];
      let risks: string[] = [];
      let totalDecisions = 0;
      let totalActionItems = 0;
      let totalRisks = 0;

      if (artifact) {
        const a = artifact as Record<string, unknown>;
        const decArray = (a.decisions ?? []) as Array<{ text: string }>;
        totalDecisions = decArray.length;
        decisions = matchItems(decArray.map((d) => d.text), searchQuery);

        const actArray = (a.action_items ?? []) as Array<{ description: string }>;
        totalActionItems = actArray.length;
        actionItems = matchItems(actArray.map((item) => item.description), searchQuery);

        const riskArray = (a.risk_items ?? []) as Array<{ description: string }>;
        totalRisks = riskArray.length;
        risks = matchItems(riskArray.map((item) => item.description), searchQuery);
      }

      return {
        meetingId: r.meeting_id,
        displayScore,
        date: r.date,
        title: r.meeting_type,
        client: r.client,
        series: r.series,
        clusterTags: r.cluster_tags,
        artifact,
        matchedDecisions: decisions,
        matchedActionItems: actionItems,
        matchedRisks: risks,
        totalDecisions,
        totalActionItems,
        totalRisks,
        deepSearchSummary: deepInfo?.summary ?? null,
      };
    });
  }, [searchResults, artifactBatchData, deepSearchMap, isDeepSearchActive, searchQuery]);

  const collapsedSummary = useMemo(
    () => buildCollapsedSummary(searchQuery, searchFields),
    [searchQuery, searchFields],
  );

  const chatMeetingIds = useMemo((): string[] => {
    if (selectedResultId) return [selectedResultId];
    if (checkedResultIds.size > 0) return [...checkedResultIds];
    if (enrichedResults.length === 0) return [];
    const sorted = [...enrichedResults].sort((a, b) => b.displayScore - a.displayScore);
    return sorted.slice(0, CHAT_CONTEXT_LIMIT).map((r) => r.meetingId);
  }, [selectedResultId, checkedResultIds, enrichedResults]);

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
    enrichedResults,
    chatMeetingIds,
    collapsedSummary,
  };
}
