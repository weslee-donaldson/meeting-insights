import type { Artifact } from "../../../electron/channels.js";

function normalizeString(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function dedupStrings(arrs: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const arr of arrs) {
    for (const s of arr) {
      const key = normalizeString(s);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(s);
      }
    }
  }
  return result;
}

export function mergeArtifactsDeduped(artifacts: Artifact[]): Artifact {
  if (artifacts.length === 0) {
    return {
      summary: "",
      decisions: [],
      proposed_features: [],
      action_items: [],
      architecture: [],
      open_questions: [],
      risk_items: [],
      additional_notes: [],
    };
  }

  if (artifacts.length === 1) return artifacts[0];

  const seenDecisions = new Set<string>();
  const decisions: Artifact["decisions"] = [];
  for (const a of artifacts) {
    for (const d of a.decisions) {
      const key = normalizeString(d.text);
      if (!seenDecisions.has(key)) {
        seenDecisions.add(key);
        decisions.push(d);
      }
    }
  }

  const seenActions = new Set<string>();
  const action_items: Artifact["action_items"] = [];
  for (const a of artifacts) {
    for (const item of a.action_items) {
      const key = normalizeString(item.description);
      if (!seenActions.has(key)) {
        seenActions.add(key);
        action_items.push(item);
      }
    }
  }

  return {
    summary: artifacts.map((a) => a.summary).filter(Boolean).join(" "),
    decisions,
    proposed_features: dedupStrings(artifacts.map((a) => a.proposed_features)),
    action_items,
    architecture: dedupStrings(artifacts.map((a) => a.architecture)),
    open_questions: dedupStrings(artifacts.map((a) => a.open_questions)),
    risk_items: dedupStrings(artifacts.map((a) => a.risk_items)),
    additional_notes: artifacts.flatMap((a) => a.additional_notes),
  };
}
