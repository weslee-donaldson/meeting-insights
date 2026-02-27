import { describe, it, expect } from "vitest";
import { createLlmAdapter } from "../src/llm-adapter.js";

describe("createLlmAdapter (stub)", () => {
  it("accepts stub config and returns adapter with complete method", () => {
    const adapter = createLlmAdapter({ type: "stub" });
    expect(typeof adapter.complete).toBe("function");
  });

  it("stub complete returns extract_artifact fixture", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.complete("extract_artifact", "some transcript");
    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("decisions");
    expect(result).toHaveProperty("proposed_features");
    expect(result).toHaveProperty("action_items");
    expect(result).toHaveProperty("technical_topics");
    expect(result).toHaveProperty("open_questions");
    expect(result).toHaveProperty("risk_items");
    expect(Array.isArray(result.additional_notes)).toBe(true);
    expect(typeof (result.additional_notes as unknown[])[0]).toBe("object");
  });

  it("stub complete returns cluster_tags fixture", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.complete("cluster_tags", "some summaries");
    expect(Array.isArray(result.tags)).toBe(true);
    expect(result.tags.length).toBeGreaterThanOrEqual(3);
    expect(result.tags.length).toBeLessThanOrEqual(7);
  });

  it("stub complete returns generate_task fixture", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.complete("generate_task", "some context");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("acceptance_criteria");
  });

  it("stub complete returns synthesize_answer fixture with answer string", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.complete("synthesize_answer", "some question context");
    expect(typeof result.answer).toBe("string");
    expect((result.answer as string).length).toBeGreaterThan(0);
  });
});
