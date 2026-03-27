import React from "react";
import type { EnrichedResult } from "../hooks/useSearchState.js";

interface SearchResultCardProps {
  result: EnrichedResult;
  checked: boolean;
  onToggleChecked: (id: string) => void;
  onOpen: (id: string) => void;
  searchQuery: string;
}

export function SearchResultCard({ result, checked, onToggleChecked, onOpen, searchQuery }: SearchResultCardProps) {
  return (
    <div data-testid={`search-result-card-${result.meetingId}`} data-checked={checked}>
      <span>{result.title}</span>
    </div>
  );
}
