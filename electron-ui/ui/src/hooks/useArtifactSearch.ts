import { useMemo } from "react";
import type { Artifact } from "../../../electron/channels.js";

interface ArtifactMatchResult {
  matchesBySection: Record<string, number>;
  matchedTerms: string[];
  totalMatches: number;
}

const SECTION_TEXT_EXTRACTORS: Array<{ name: string; extract: (a: Artifact) => string[] }> = [
  { name: "Summary", extract: (a) => a.summary ? [a.summary] : [] },
  { name: "Decisions", extract: (a) => a.decisions.map((d) => d.text) },
  { name: "Action Items", extract: (a) => a.action_items.map((ai) => ai.description) },
  { name: "Open Questions", extract: (a) => a.open_questions },
  { name: "Risks", extract: (a) => a.risk_items.map((r) => r.description) },
  { name: "Proposed Features", extract: (a) => a.proposed_features },
  { name: "Additional Notes", extract: (a) => a.additional_notes.map((n) => stringifyNote(n)) },
];

function stringifyNote(note: Record<string, unknown>): string {
  return Object.values(note)
    .map((v) => (Array.isArray(v) ? v.map(String).join(" ") : String(v)))
    .join(" ");
}

export function computeArtifactMatches(artifact: Artifact | null, query: string): ArtifactMatchResult {
  const empty: ArtifactMatchResult = { matchesBySection: {}, matchedTerms: [], totalMatches: 0 };
  if (!artifact || !query.trim()) return empty;

  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) return empty;

  const matchesBySection: Record<string, number> = {};
  const matchedTokens = new Set<string>();
  let totalMatches = 0;

  for (const { name, extract } of SECTION_TEXT_EXTRACTORS) {
    const texts = extract(artifact);
    const joined = texts.join(" ").toLowerCase();
    if (!joined) continue;

    let sectionCount = 0;
    for (const token of tokens) {
      if (joined.includes(token)) {
        sectionCount++;
        matchedTokens.add(token);
      }
    }
    if (sectionCount > 0) {
      matchesBySection[name] = sectionCount;
      totalMatches += sectionCount;
    }
  }

  return { matchesBySection, matchedTerms: [...matchedTokens], totalMatches };
}

export function useArtifactSearch(artifact: Artifact | null, searchQuery: string): ArtifactMatchResult {
  return useMemo(() => computeArtifactMatches(artifact, searchQuery), [artifact, searchQuery]);
}
