import React from "react";
import { cn } from "../../lib/utils.js";
import { FilterChip, ActiveFilterChip } from "./filter-chip.js";

interface FilterDef {
  key: string;
  label: string;
  options: string[];
}

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  groupBy?: { label: string; value: string; options: string[]; onChange: (v: string) => void };
  sortBy?: { label: string; value: string; options: string[]; onChange: (v: string) => void };
  filters?: Array<FilterDef & { value: string; onChange: (v: string) => void }>;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({
  groupBy,
  sortBy,
  filters,
  activeFilters,
  onRemoveFilter,
  onClearAll,
  className,
}: FilterBarProps) {
  const hasActiveFilters = activeFilters && activeFilters.length > 0;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2" role="toolbar" aria-label="Filters">
        {groupBy && (
          <FilterChip
            label={groupBy.label}
            value={groupBy.value}
            options={groupBy.options}
            onChange={groupBy.onChange}
          />
        )}
        {sortBy && (
          <FilterChip
            label={sortBy.label}
            value={sortBy.value}
            options={sortBy.options}
            onChange={sortBy.onChange}
          />
        )}
        {(groupBy || sortBy) && filters && filters.length > 0 && (
          <div className="w-px h-5 bg-[var(--color-line)] flex-shrink-0" />
        )}
        {filters?.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            value={f.value}
            options={f.options}
            onChange={f.onChange}
          />
        ))}
      </div>
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5">
          {activeFilters.map((af) => (
            <ActiveFilterChip
              key={af.key}
              label={`${af.label}: ${af.value}`}
              onRemove={() => onRemoveFilter?.(af.key)}
            />
          ))}
          <button
            onClick={onClearAll}
            className="text-[10px] font-medium text-[var(--color-accent)] underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
