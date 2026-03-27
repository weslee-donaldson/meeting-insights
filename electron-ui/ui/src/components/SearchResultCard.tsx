import React from "react";
import type { EnrichedResult } from "../hooks/useSearchState.js";
import { searchResultCard, typography } from "../design-tokens.js";

interface SearchResultCardProps {
  result: EnrichedResult;
  checked: boolean;
  onToggleChecked: (id: string) => void;
  onOpen: (id: string) => void;
  searchQuery: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface ActionItemRecord {
  description: string;
  owner?: string;
  reporter?: string;
  due_date?: string;
}

function findActionItemMeta(
  artifact: Record<string, unknown> | null,
  description: string,
): ActionItemRecord | undefined {
  if (!artifact) return undefined;
  const items = (artifact.action_items ?? []) as ActionItemRecord[];
  return items.find((item) => item.description === description);
}

function hasAnyMatches(result: EnrichedResult): boolean {
  return (
    result.matchedDecisions.length > 0 ||
    result.matchedActionItems.length > 0 ||
    result.matchedRisks.length > 0
  );
}

function scoreColor(score: number): string {
  if (score >= 0.9) return searchResultCard.scoreColors.high;
  if (score >= 0.8) return searchResultCard.scoreColors.medHigh;
  if (score >= 0.7) return searchResultCard.scoreColors.med;
  return searchResultCard.scoreColors.low;
}

export function SearchResultCard({
  result,
  checked,
  onToggleChecked,
  onOpen,
  searchQuery,
}: SearchResultCardProps) {
  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    padding: "10px 16px",
    borderLeft: checked ? searchResultCard.checkedBorderLeft : "3px solid transparent",
    borderBottom: "1px solid var(--color-line)",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const checkboxStyle: React.CSSProperties = {
    width: searchResultCard.checkboxSize,
    height: searchResultCard.checkboxSize,
    borderRadius: searchResultCard.checkboxRadius,
    border: checked ? "none" : `1.5px solid ${searchResultCard.checkboxUncheckedBorder}`,
    backgroundColor: checked ? searchResultCard.checkedAccent : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: searchResultCard.titleFont,
    fontSize: searchResultCard.titleSize,
    fontWeight: searchResultCard.titleWeight,
    color: "var(--color-text-primary)",
    lineHeight: typography.lineHeight.body,
  };

  return (
    <div
      data-testid={`search-result-card-${result.meetingId}`}
      data-checked={checked}
      style={cardStyle}
    >
      <div style={headerStyle}>
        <div
          data-testid="result-checkbox"
          data-checked={String(checked)}
          style={checkboxStyle}
          onClick={() => onToggleChecked(result.meetingId)}
        >
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <span style={titleStyle}>
          {result.title} &middot; {formatDate(result.date)}
        </span>

        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          {result.clusterTags.map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: searchResultCard.tagBg,
                color: searchResultCard.tagColor,
                fontSize: searchResultCard.tagFontSize,
                fontWeight: searchResultCard.tagFontWeight,
                borderRadius: searchResultCard.tagRadius,
                padding: searchResultCard.tagPadding,
                lineHeight: typography.lineHeight.micro,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <span
          data-testid="result-score"
          style={{
            fontFamily: searchResultCard.scoreFont,
            fontSize: searchResultCard.scoreSize,
            fontWeight: searchResultCard.scoreWeight,
            color: scoreColor(result.displayScore),
            flexShrink: 0,
          }}
        >
          {result.displayScore.toFixed(2)}
        </span>

        <span
          style={{
            fontFamily: searchResultCard.openCtaFont,
            fontSize: searchResultCard.openCtaSize,
            fontWeight: searchResultCard.openCtaWeight,
            color: searchResultCard.openCtaColor,
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => onOpen(result.meetingId)}
        >
          Open
        </span>
      </div>

      {hasAnyMatches(result) && (
        <div
          data-testid="artifact-matches"
          style={{ paddingLeft: searchResultCard.artifactIndent, marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}
        >
          {result.matchedDecisions.length > 0 && (
            <div data-testid="matched-decisions">
              {result.matchedDecisions.map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="6" cy="6" r="5" stroke={searchResultCard.decisionIconColor} strokeWidth="1.5" />
                    <path d="M3.5 6L5 7.5L8.5 4" stroke={searchResultCard.decisionIconColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: searchResultCard.artifactItemFont, fontSize: searchResultCard.artifactItemSize, fontWeight: searchResultCard.artifactItemWeight, color: "var(--color-text-body)", lineHeight: typography.lineHeight.label }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {result.matchedActionItems.length > 0 && (
            <div data-testid="matched-action-items">
              {result.matchedActionItems.map((desc, i) => {
                const meta = findActionItemMeta(result.artifact, desc);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                      <rect x="1.5" y="1.5" width="9" height="9" rx="2" stroke="var(--color-text-muted)" strokeWidth="1.2" />
                    </svg>
                    <span style={{ fontFamily: searchResultCard.artifactItemFont, fontSize: searchResultCard.artifactItemSize, color: "var(--color-text-body)", lineHeight: typography.lineHeight.label }}>
                      {desc}
                    </span>
                    {meta && (meta.owner || meta.reporter || meta.due_date) && (
                      <span style={{ fontFamily: searchResultCard.artifactItemFont, fontSize: searchResultCard.artifactMetaSize, color: searchResultCard.artifactMetaColor, lineHeight: typography.lineHeight.micro, whiteSpace: "nowrap" }}>
                        {meta.owner && `Owner: ${meta.owner}`}
                        {meta.owner && (meta.reporter || meta.due_date) && "  "}
                        {meta.reporter && `Reporter: ${meta.reporter}`}
                        {meta.reporter && meta.due_date && "  "}
                        {meta.due_date && meta.due_date}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {result.matchedRisks.length > 0 && (
            <div data-testid="matched-risks">
              {result.matchedRisks.map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M6 1L11 10H1L6 1Z" stroke={searchResultCard.riskTextColor} strokeWidth="1.2" strokeLinejoin="round" />
                    <line x1="6" y1="5" x2="6" y2="7" stroke={searchResultCard.riskTextColor} strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="6" cy="8.5" r="0.5" fill={searchResultCard.riskTextColor} />
                  </svg>
                  <span style={{ fontFamily: searchResultCard.artifactItemFont, fontSize: searchResultCard.artifactItemSize, color: searchResultCard.riskTextColor, lineHeight: typography.lineHeight.label }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {result.deepSearchSummary && (
        <div
          data-testid="why-block"
          style={{
            backgroundColor: searchResultCard.whyBg,
            borderLeft: searchResultCard.whyBorderLeft,
            borderRadius: "0 4px 4px 0",
            padding: "6px 10px",
            marginTop: "6px",
            marginLeft: "24px",
          }}
        >
          <span
            style={{
              fontFamily: searchResultCard.whyLabelFont,
              fontSize: searchResultCard.whyLabelSize,
              fontWeight: searchResultCard.whyLabelWeight,
              color: searchResultCard.whyLabelColor,
              letterSpacing: searchResultCard.whyLabelTracking,
              display: "block",
              marginBottom: "2px",
            }}
          >
            WHY
          </span>
          <span
            style={{
              fontFamily: searchResultCard.whyTextFont,
              fontSize: searchResultCard.whyTextSize,
              color: searchResultCard.whyTextColor,
              fontStyle: "italic",
              lineHeight: typography.lineHeight.label,
            }}
          >
            {result.deepSearchSummary}
          </span>
        </div>
      )}
    </div>
  );
}
