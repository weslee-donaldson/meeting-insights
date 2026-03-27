import React from "react";
import { SearchForm } from "../components/SearchForm.js";
import { SearchResultsList } from "../components/SearchResultsList.js";
import { CompactResultsSidebar } from "../components/CompactResultsSidebar.js";
import { MeetingDetail } from "../components/MeetingDetail.js";
import { useSelectedResultData } from "../hooks/useSelectedResultData.js";
import type { EnrichedResult } from "../hooks/useSearchState.js";

interface SearchPageProps {
  typedSearchQuery: string;
  setTypedSearchQuery: (q: string) => void;
  searchFields: Set<string>;
  toggleField: (field: string) => void;
  dateAfter: string;
  setDateAfter: (v: string) => void;
  dateBefore: string;
  setDateBefore: (v: string) => void;
  deepSearchEnabled: boolean;
  setDeepSearchEnabled: (v: boolean) => void;
  formVisible: boolean;
  setFormVisible: (v: boolean) => void;
  groupBy: "none" | "cluster" | "date" | "series";
  setGroupBy: (v: "none" | "cluster" | "date" | "series") => void;
  sortBy: "relevance" | "date-newest" | "date-oldest";
  setSortBy: (v: "relevance" | "date-newest" | "date-oldest") => void;
  collapsedSummary: string;
  searchQuery: string;
  onSubmit: () => void;
  enrichedResults: EnrichedResult[];
  searchDurationMs: number | null;
  displayedCount: number;
  setDisplayedCount: (n: number) => void;
  checkedResultIds: Set<string>;
  onToggleChecked: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onOpen: (id: string) => void;
  onSaveAsThread: (meetingIds: string[]) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedResultId: string | null;
  onSelectResult: (id: string) => void;
  onBackToFullView: () => void;
  onOpenInMeetings: (id: string) => void;
}

function SearchDetailPanel({ selectedResultId, onOpenInMeetings }: { selectedResultId: string; onOpenInMeetings: (id: string) => void }) {
  const data = useSelectedResultData(selectedResultId);
  return (
    <MeetingDetail
      meeting={data.artifact ? { id: selectedResultId, title: "", date: "", client: "", series: "", thread_tags: data.threadTags, milestone_tags: data.milestoneTags, actionItemCount: 0 } : null}
      artifact={data.artifact}
      artifactLoading={data.artifactLoading}
      completions={data.completions}
      assets={data.assets}
      threadTags={data.threadTags}
      milestoneTags={data.milestoneTags}
      notesCount={data.notesCount}
      onOpenInMeetings={() => onOpenInMeetings(selectedResultId)}
    />
  );
}

export function SearchPage(props: SearchPageProps): React.ReactNode[] {
  if (props.selectedResultId) {
    return [
      <CompactResultsSidebar
        key="compact-sidebar"
        enrichedResults={props.enrichedResults}
        selectedResultId={props.selectedResultId}
        onSelect={props.onSelectResult}
        onBack={props.onBackToFullView}
      />,
      <SearchDetailPanel
        key="detail-panel"
        selectedResultId={props.selectedResultId}
        onOpenInMeetings={props.onOpenInMeetings}
      />,
    ];
  }

  return [
    <div key="search-panel" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
      <SearchForm
        typedSearchQuery={props.typedSearchQuery}
        setTypedSearchQuery={props.setTypedSearchQuery}
        searchFields={props.searchFields}
        toggleField={props.toggleField}
        dateAfter={props.dateAfter}
        setDateAfter={props.setDateAfter}
        dateBefore={props.dateBefore}
        setDateBefore={props.setDateBefore}
        deepSearchEnabled={props.deepSearchEnabled}
        setDeepSearchEnabled={props.setDeepSearchEnabled}
        formVisible={props.formVisible}
        setFormVisible={props.setFormVisible}
        groupBy={props.groupBy}
        setGroupBy={props.setGroupBy}
        sortBy={props.sortBy}
        setSortBy={props.setSortBy}
        collapsedSummary={props.collapsedSummary}
        searchQuery={props.searchQuery}
        onSubmit={props.onSubmit}
      />
      <SearchResultsList
        enrichedResults={props.enrichedResults}
        searchDurationMs={props.searchDurationMs}
        displayedCount={props.displayedCount}
        setDisplayedCount={props.setDisplayedCount}
        checkedResultIds={props.checkedResultIds}
        onToggleChecked={props.onToggleChecked}
        onSelectAll={props.onSelectAll}
        onOpen={props.onOpen}
        onSaveAsThread={props.onSaveAsThread}
        groupBy={props.groupBy}
        sortBy={props.sortBy}
        searchQuery={props.searchQuery}
        isLoading={props.isLoading}
        isError={props.isError}
        onRetry={props.onRetry}
      />
    </div>,
  ];
}
