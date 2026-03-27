import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils.js";

const FIELD_ORDER = [
  "summary", "decisions", "action_items", "risk_items",
  "proposed_features", "open_questions", "milestones",
] as const;

const FIELD_LABELS: Record<string, string> = {
  summary: "Summary",
  decisions: "Decisions",
  action_items: "Action Items",
  risk_items: "Risks",
  proposed_features: "Features",
  open_questions: "Questions",
  milestones: "Milestones",
};

const GROUP_OPTIONS: { value: "none" | "cluster" | "date" | "series"; label: string }[] = [
  { value: "none", label: "None" },
  { value: "cluster", label: "Cluster" },
  { value: "date", label: "Date" },
  { value: "series", label: "Series" },
];

const SORT_OPTIONS: { value: "relevance" | "date-newest" | "date-oldest"; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "date-newest", label: "Date (newest)" },
  { value: "date-oldest", label: "Date (oldest)" },
];

function MiniDropdown<T extends string>({
  prefix,
  value,
  options,
  onChange,
}: {
  prefix: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={prefix}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1 cursor-pointer"
        style={{
          borderRadius: "4px",
          padding: "4px 12px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E0DDD8",
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          lineHeight: "14px",
          color: "var(--color-text-secondary)",
        }}
      >
        {prefix}: {currentLabel} <span>&#9662;</span>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 z-50 min-w-[160px] py-1 rounded-md shadow-md"
          style={{
            border: "1px solid var(--color-line)",
            backgroundColor: "var(--color-bg-surface)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-1.5 text-[11px]",
                opt.value === value
                  ? "text-[var(--color-accent)] font-semibold"
                  : "text-[var(--color-text-body)]",
                "hover:bg-[var(--color-bg-elevated)]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SearchFormProps {
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
  onValidationError?: (msg: string) => void;
}

export function SearchForm(props: SearchFormProps) {
  if (!props.formVisible) {
    return (
      <div
        className="flex items-center gap-2 rounded-md"
        style={{
          backgroundColor: "#FAF9F7",
          border: "1px solid var(--color-line)",
          padding: "10px 24px",
        }}
      >
        <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "16px",
            color: "var(--color-text-primary)",
          }}
        >
          {props.searchQuery ? `"${props.searchQuery}"` : ""}
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "14px",
            color: "var(--color-text-muted)",
          }}
        >
          {props.collapsedSummary ? `in ${props.collapsedSummary}` : ""}
        </span>
        {props.deepSearchEnabled && (
          <>
            <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>·</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                lineHeight: "14px",
                color: "#C17A1A",
              }}
            >
              Deep
            </span>
          </>
        )}
        <div className="flex-1" />
        <button
          onClick={() => props.setFormVisible(true)}
          aria-label="Show search form"
          className="flex items-center gap-1 cursor-pointer border-0"
          style={{
            borderRadius: "4px",
            padding: "3px 10px",
            backgroundColor: "#F0EEEB",
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            lineHeight: "12px",
            color: "var(--color-text-secondary)",
          }}
        >
          Show
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col rounded-md"
      style={{
        backgroundColor: "#FAF9F7",
        border: "1px solid var(--color-line)",
        padding: "16px 24px",
        gap: "12px",
      }}
    >
      <div className="flex items-center">
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: "16px",
            color: "var(--color-text-primary)",
          }}
        >
          Search
        </span>
        <div className="flex-1" />
        <button
          onClick={() => props.setFormVisible(false)}
          aria-label="Hide search form"
          className="flex items-center gap-1 cursor-pointer border-0"
          style={{
            borderRadius: "4px",
            padding: "3px 10px",
            backgroundColor: "#F0EEEB",
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: 500,
            lineHeight: "12px",
            color: "var(--color-text-secondary)",
          }}
        >
          Hide
          <ChevronUp className="w-2.5 h-2.5" />
        </button>
      </div>

      <div
        className="flex items-center rounded-md"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E0DDD8",
          padding: "8px 14px",
          gap: "8px",
        }}
      >
        <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-text-muted)" }} />
        <input
          type="text"
          value={props.typedSearchQuery}
          onChange={(e) => props.setTypedSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") props.onSubmit();
          }}
          aria-label="Search query"
          className="bg-transparent focus:outline-none w-full"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "20px",
            color: "var(--color-text-primary)",
          }}
          placeholder="Search meetings..."
        />
      </div>

      <div className="flex flex-col" style={{ gap: "6px" }}>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            lineHeight: "12px",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
          }}
        >
          SEARCH IN
        </span>
        <div className="flex flex-wrap" style={{ gap: "6px" }}>
          {FIELD_ORDER.map((field) => {
            const active = props.searchFields.has(field);
            return (
              <button
                key={field}
                aria-label={`Toggle ${FIELD_LABELS[field]}`}
                aria-pressed={active}
                onClick={() => {
                  if (active && props.searchFields.size === 1) {
                    props.onValidationError?.("Select at least one field");
                    return;
                  }
                  props.toggleField(field);
                }}
                className="cursor-pointer border-0"
                style={{
                  borderRadius: "4px",
                  padding: "4px 12px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  lineHeight: "14px",
                  ...(active
                    ? {
                        backgroundColor: "#E67E22",
                        color: "#FFFFFF",
                        fontWeight: 600,
                      }
                    : {
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E0DDD8",
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                      }),
                }}
              >
                {FIELD_LABELS[field]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center flex-wrap" style={{ gap: "10px" }}>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "14px",
            color: "var(--color-text-secondary)",
          }}
        >
          From
        </span>
        <input
          type="date"
          value={props.dateAfter}
          onChange={(e) => props.setDateAfter(e.target.value)}
          aria-label="From date"
          className="search-form-date-input"
          style={{
            width: "140px",
            borderRadius: "4px",
            padding: "5px 12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E0DDD8",
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "14px",
            color: "var(--color-text-secondary)",
          }}
        />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "14px",
            color: "var(--color-text-secondary)",
          }}
        >
          to
        </span>
        <input
          type="date"
          value={props.dateBefore}
          onChange={(e) => props.setDateBefore(e.target.value)}
          aria-label="To date"
          className="search-form-date-input"
          style={{
            width: "140px",
            borderRadius: "4px",
            padding: "5px 12px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E0DDD8",
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            lineHeight: "14px",
            color: "var(--color-text-secondary)",
          }}
        />
        <div className="flex-1" />
        <label className="flex items-center cursor-pointer select-none" style={{ gap: "5px" }}>
          <input
            type="checkbox"
            checked={props.deepSearchEnabled}
            onChange={(e) => props.setDeepSearchEnabled(e.target.checked)}
            aria-label="Deep search"
            style={{ accentColor: "#2D8A4E", width: "15px", height: "15px" }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              lineHeight: "14px",
              color: "var(--color-text-primary)",
            }}
          >
            Deep
          </span>
        </label>
        <MiniDropdown
          prefix="Group"
          value={props.groupBy}
          options={GROUP_OPTIONS}
          onChange={props.setGroupBy}
        />
        <MiniDropdown
          prefix="Sort"
          value={props.sortBy}
          options={SORT_OPTIONS}
          onChange={props.setSortBy}
        />
      </div>
    </div>
  );
}
