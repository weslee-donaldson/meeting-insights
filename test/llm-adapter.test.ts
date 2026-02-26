import { describe, it, expect } from "vitest";
import { createLlmAdapter } from "../src/llm-adapter.js";

describe("createLlmAdapter (stub)", () => {
  it("accepts stub config and returns adapter with complete method", () => {
    const adapter = createLlmAdapter({ type: "stub" });
    expect(typeof adapter.complete).toBe("function");
  });

  it("stub complete returns extraction fixture for extraction prompt type", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.complete("extraction", "some transcript");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("decisions");
    expect(result).toHaveProperty("proposed_features");
    expect(result).toHaveProperty("action_items");
    expect(result).toHaveProperty("technical_topics");
    expect(result).toHaveProperty("open_questions");
    expect(result).toHaveProperty("risk_items");
  });

  it("stub complete returns tags fixture for tags prompt type", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.complete("tags", "some summaries");
    expect(Array.isArray(result.tags)).toBe(true);
    expect(result.tags.length).toBeGreaterThanOrEqual(3);
    expect(result.tags.length).toBeLessThanOrEqual(7);
  });

  it("stub complete returns task fixture for task prompt type", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.complete("task", "some context");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("acceptance_criteria");
  });
});
