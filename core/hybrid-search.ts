import { createLogger } from "./logger.js";

const log = createLogger("hybrid:search");

interface ScoredResult {
  meeting_id: string;
  score: number;
}

export function mergeSearchResults(
  resultArrays: ScoredResult[][],
): Map<string, number> {
  const merged = new Map<string, number>();
  for (const results of resultArrays) {
    for (const r of results) {
      const existing = merged.get(r.meeting_id);
      if (existing === undefined || r.score < existing) {
        merged.set(r.meeting_id, r.score);
      }
    }
  }
  log("merged %d arrays → %d unique meetings", resultArrays.length, merged.size);
  return merged;
}
