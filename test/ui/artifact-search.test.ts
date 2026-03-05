import { describe, it, expect } from "vitest";
import { computeArtifactMatches } from "../../electron-ui/ui/src/hooks/useArtifactSearch.js";
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

describe("computeArtifactMatches", () => {
  it("returns empty results when artifact is null", () => {
    expect(computeArtifactMatches(null, "test")).toEqual({
      matchesBySection: {},
      matchedTerms: [],
      totalMatches: 0,
    });
  });

  it("returns empty results when query is empty", () => {
    expect(computeArtifactMatches(makeArtifact({ summary: "Hello" }), "")).toEqual({
      matchesBySection: {},
      matchedTerms: [],
      totalMatches: 0,
    });
  });

  it("finds match in summary section", () => {
    const result = computeArtifactMatches(
      makeArtifact({ summary: "The team discussed the roadmap for Q2." }),
      "roadmap",
    );
    expect(result.matchesBySection).toEqual({ Summary: 1 });
    expect(result.matchedTerms).toEqual(["roadmap"]);
    expect(result.totalMatches).toBe(1);
  });

  it("finds matches across multiple sections", () => {
    const result = computeArtifactMatches(
      makeArtifact({
        summary: "Sprint planning session",
        action_items: [{ description: "Plan the sprint review", owner: "", requester: "", due_date: null, priority: "normal" }],
        open_questions: ["When is the next sprint?"],
      }),
      "sprint",
    );
    expect(result.matchesBySection).toEqual({
      Summary: 1,
      "Action Items": 1,
      "Open Questions": 1,
    });
    expect(result.totalMatches).toBe(3);
  });

  it("prefix matches tokens against text", () => {
    const result = computeArtifactMatches(
      makeArtifact({ summary: "The roadmap includes several milestones." }),
      "road",
    );
    expect(result.matchesBySection).toEqual({ Summary: 1 });
    expect(result.matchedTerms).toEqual(["road"]);
  });

  it("matches case-insensitively", () => {
    const result = computeArtifactMatches(
      makeArtifact({ decisions: [{ text: "Use TypeScript everywhere", decided_by: "Alice" }] }),
      "TYPESCRIPT",
    );
    expect(result.matchesBySection).toEqual({ Decisions: 1 });
    expect(result.matchedTerms).toEqual(["typescript"]);
  });

  it("ignores tokens shorter than 2 characters", () => {
    const result = computeArtifactMatches(
      makeArtifact({ summary: "A brief note on X and Y." }),
      "a x y",
    );
    expect(result).toEqual({
      matchesBySection: {},
      matchedTerms: [],
      totalMatches: 0,
    });
  });

  it("matches in risk_items descriptions", () => {
    const result = computeArtifactMatches(
      makeArtifact({ risk_items: [{ category: "engineering", description: "Database migration risk" }] }),
      "migration",
    );
    expect(result.matchesBySection).toEqual({ Risks: 1 });
    expect(result.matchedTerms).toEqual(["migration"]);
  });

  it("matches in proposed_features", () => {
    const result = computeArtifactMatches(
      makeArtifact({ proposed_features: ["Dark mode toggle", "Export to PDF"] }),
      "export",
    );
    expect(result.matchesBySection).toEqual({ "Proposed Features": 1 });
    expect(result.matchedTerms).toEqual(["export"]);
  });

  it("matches in additional_notes values", () => {
    const result = computeArtifactMatches(
      makeArtifact({ additional_notes: [{ category: "Context", notes: ["Authentication flow needs review"] }] }),
      "authentication",
    );
    expect(result.matchesBySection).toEqual({ "Additional Notes": 1 });
    expect(result.matchedTerms).toEqual(["authentication"]);
  });
});
