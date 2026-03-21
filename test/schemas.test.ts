import { describe, it, expect } from "vitest";
import { ArtifactSchema, DecisionSchema, ActionItemSchema, RiskItemSchema } from "../core/schemas.js";

describe("DecisionSchema", () => {
  it("parses object form", () => {
    const result = DecisionSchema.parse({ text: "Use Postgres", decided_by: "CTO" });
    expect(result).toEqual({ text: "Use Postgres", decided_by: "CTO" });
  });

  it("coerces string to object with empty decided_by", () => {
    const result = DecisionSchema.parse("Use Postgres");
    expect(result).toEqual({ text: "Use Postgres", decided_by: "" });
  });
});

describe("ActionItemSchema", () => {
  it("parses complete action item", () => {
    const result = ActionItemSchema.parse({
      description: "Fix bug",
      owner: "Alice",
      requester: "Bob",
      due_date: "2025-03-01",
      priority: "critical",
    });
    expect(result).toEqual({
      description: "Fix bug",
      owner: "Alice",
      requester: "Bob",
      due_date: "2025-03-01",
      priority: "critical",
    });
  });

  it("defaults requester to empty string and priority to normal", () => {
    const result = ActionItemSchema.parse({
      description: "Fix bug",
      owner: "Alice",
    });
    expect(result.requester).toBe("");
    expect(result.priority).toBe("normal");
    expect(result.due_date).toBe(null);
  });
});

describe("RiskItemSchema", () => {
  it("parses object form", () => {
    const result = RiskItemSchema.parse({ category: "engineering", description: "Tech debt" });
    expect(result).toEqual({ category: "engineering", description: "Tech debt" });
  });

  it("coerces string to engineering risk", () => {
    const result = RiskItemSchema.parse("Tech debt");
    expect(result).toEqual({ category: "engineering", description: "Tech debt" });
  });
});

describe("ArtifactSchema", () => {
  it("parses valid artifact with all required fields", () => {
    const result = ArtifactSchema.parse({
      summary: "Weekly sync",
      decisions: [{ text: "Use Postgres", decided_by: "CTO" }],
      proposed_features: ["Dashboard"],
      action_items: [{ description: "Fix bug", owner: "Alice" }],
      open_questions: ["When?"],
      risk_items: ["Tech debt"],
    });
    expect(result.summary).toBe("Weekly sync");
    expect(result.decisions).toEqual([{ text: "Use Postgres", decided_by: "CTO" }]);
    expect(result.action_items[0].requester).toBe("");
    expect(result.action_items[0].priority).toBe("normal");
    expect(result.risk_items[0]).toEqual({ category: "engineering", description: "Tech debt" });
    expect(result.additional_notes).toEqual([]);
    expect(result.milestones).toEqual([]);
  });

  it("rejects artifact missing summary", () => {
    const result = ArtifactSchema.safeParse({
      decisions: [],
      proposed_features: [],
      action_items: [],
      open_questions: [],
      risk_items: [],
    });
    expect(result.success).toBe(false);
  });
});
