import { describe, it, expect } from "vitest";
import { mergeArtifactsDeduped } from "../../electron-ui/ui/src/lib/merge-artifacts.js";
import type { Artifact } from "../../electron-ui/electron/channels.js";

function makeArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    summary: "",
    decisions: [],
    proposed_features: [],
    action_items: [],
    open_questions: [],
    risk_items: [],
    additional_notes: [],
    ...overrides,
  };
}

describe("mergeArtifactsDeduped", () => {
  it("returns empty artifact when given empty array", () => {
    expect(mergeArtifactsDeduped([])).toEqual(makeArtifact());
  });

  it("returns same artifact when given single artifact", () => {
    const single = makeArtifact({ summary: "Hello.", decisions: [{ text: "Ship it", decided_by: "Alice" }] });
    expect(mergeArtifactsDeduped([single])).toBe(single);
  });

  it("joins non-empty summaries with newline separator", () => {
    const result = mergeArtifactsDeduped([
      makeArtifact({ summary: "Alpha summary." }),
      makeArtifact({ summary: "" }),
      makeArtifact({ summary: "Beta summary." }),
    ]);
    expect(result.summary).toBe("Alpha summary.\nBeta summary.");
  });

  it("deduplicates string fields preserving first occurrence case", () => {
    const result = mergeArtifactsDeduped([
      makeArtifact({ proposed_features: ["Dark Mode"] }),
      makeArtifact({ proposed_features: ["dark mode", "Light Mode"] }),
    ]);
    expect(result.proposed_features).toEqual(["Dark Mode", "Light Mode"]);
  });

  it("deduplicates decisions by text preserving first decided_by", () => {
    const result = mergeArtifactsDeduped([
      makeArtifact({ decisions: [{ text: "Use TypeScript", decided_by: "Alice" }] }),
      makeArtifact({ decisions: [{ text: "use typescript", decided_by: "Bob" }] }),
    ]);
    expect(result.decisions).toEqual([{ text: "Use TypeScript", decided_by: "Alice" }]);
  });

  it("deduplicates action items by description preserving first owner", () => {
    const result = mergeArtifactsDeduped([
      makeArtifact({ action_items: [{ description: "Write tests", owner: "Alice", requester: "", due_date: null }] }),
      makeArtifact({ action_items: [{ description: "write tests", owner: "Bob", requester: "Carol", due_date: "2026-03-01" }] }),
    ]);
    expect(result.action_items).toEqual([{ description: "Write tests", owner: "Alice", requester: "", due_date: null }]);
  });

  it("normalizes whitespace for dedup comparison", () => {
    const result = mergeArtifactsDeduped([
      makeArtifact({ open_questions: ["What  is   the  plan?"] }),
      makeArtifact({ open_questions: ["What is the plan?"] }),
    ]);
    expect(result.open_questions).toEqual(["What  is   the  plan?"]);
  });

  it("flatMaps additional_notes without dedup", () => {
    const result = mergeArtifactsDeduped([
      makeArtifact({ additional_notes: [{ category: "a", note: "x" }] }),
      makeArtifact({ additional_notes: [{ category: "a", note: "x" }] }),
    ]);
    expect(result.additional_notes).toEqual([{ category: "a", note: "x" }, { category: "a", note: "x" }]);
  });

  it("deduplicates across all string array fields independently", () => {
    const result = mergeArtifactsDeduped([
      makeArtifact({ open_questions: ["When to launch?"], risk_items: ["Timeline slip"] }),
      makeArtifact({ open_questions: ["when to launch?", "Budget?"], risk_items: ["timeline slip", "Staffing"] }),
    ]);
    expect(result.open_questions).toEqual(["When to launch?", "Budget?"]);
    expect(result.risk_items).toEqual(["Timeline slip", "Staffing"]);
  });

  it("merges non-overlapping action items from multiple artifacts", () => {
    const result = mergeArtifactsDeduped([
      makeArtifact({ action_items: [
        { description: "Write tests", owner: "Alice", requester: "", due_date: null },
        { description: "Review PR", owner: "Alice", requester: "", due_date: null },
      ] }),
      makeArtifact({ action_items: [
        { description: "Deploy staging", owner: "Bob", requester: "", due_date: "2026-03-05" },
      ] }),
    ]);
    expect(result.action_items).toEqual([
      { description: "Write tests", owner: "Alice", requester: "", due_date: null },
      { description: "Review PR", owner: "Alice", requester: "", due_date: null },
      { description: "Deploy staging", owner: "Bob", requester: "", due_date: "2026-03-05" },
    ]);
  });
});
