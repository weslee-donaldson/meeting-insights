import React from "react";
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
    </div>
  );
}
