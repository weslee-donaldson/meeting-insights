import React from "react";
import { ArrowLeft } from "lucide-react";
import type { EnrichedResult } from "../hooks/useSearchState.js";
import { typography } from "../design-tokens.js";

interface CompactResultsSidebarProps {
  enrichedResults: EnrichedResult[];
  selectedResultId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
}

function scoreColor(score: number): string {
  if (score >= 0.9) return "#2d8a4e";
  if (score >= 0.8) return "#5a9a3e";
  if (score >= 0.7) return "#7a9a3e";
  return "#9aaa3e";
}

export function CompactResultsSidebar({ enrichedResults, selectedResultId, onSelect, onBack }: CompactResultsSidebarProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "10px 12px",
          border: "none",
          borderBottom: "1px solid var(--color-line)",
          background: "transparent",
          cursor: "pointer",
          fontFamily: typography.fontFamily.body,
          fontSize: typography.fontSize.caption,
          fontWeight: typography.fontWeight.bodyMedium,
          color: "var(--color-accent)",
        }}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} />
        Back to full view
      </button>
      <div role="listbox" style={{ flex: 1, overflowY: "auto" }}>
        {enrichedResults.map((result) => {
          const isSelected = result.meetingId === selectedResultId;
          return (
            <div
              key={result.meetingId}
              role="option"
              aria-selected={isSelected}
              data-selected={String(isSelected)}
              onClick={() => onSelect(result.meetingId)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                borderLeft: isSelected ? "3px solid var(--color-accent)" : "3px solid transparent",
                background: isSelected ? "#fef8f2" : "transparent",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: typography.fontFamily.display,
                    fontSize: typography.fontSize.body,
                    fontWeight: typography.fontWeight.heading,
                    color: "var(--color-text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {result.title}
                </div>
                <div
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: typography.fontSize.label,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {result.date.slice(0, 10)}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: typography.fontSize.label,
                  fontWeight: typography.fontWeight.heading,
                  color: scoreColor(result.displayScore),
                  flexShrink: 0,
                }}
              >
                {Math.round(result.displayScore * 100)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
