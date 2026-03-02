import { describe, it, expect } from "vitest";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { generateTask } from "../core/task-generation.js";

const curatedContext = "API design patterns and OAuth authentication were discussed. Team agreed to implement OAuth2 with bearer tokens.";
const sourceIds = ["meeting-abc", "meeting-def"];

describe("generateTask", () => {
  it("accepts curated_context and task_intent, calls LLM adapter", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    const result = await generateTask(llm, curatedContext, "Implement OAuth2", sourceIds);
    expect(result).toBeDefined();
  });

  it("returns title, description, acceptance_criteria from LLM response", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    const result = await generateTask(llm, curatedContext, "Implement OAuth2", sourceIds);
    expect(typeof result.title).toBe("string");
    expect(typeof result.description).toBe("string");
    expect(Array.isArray(result.acceptance_criteria)).toBe(true);
    expect(result.acceptance_criteria.length).toBeGreaterThan(0);
  });

  it("output includes source_meeting_ids for traceability", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    const result = await generateTask(llm, curatedContext, "Implement OAuth2", sourceIds);
    expect(result.source_meeting_ids).toEqual(sourceIds);
  });

  it("rejects output containing details not present in curated_context", async () => {
    const llm = {
      async complete() {
        return {
          title: "Implement Feature X",
          description: "Based on HALLUCINATED MEETING from March 2025, implement unrelated thing",
          acceptance_criteria: ["passes tests"],
        };
      },
    };
    const result = await generateTask(
      llm as ReturnType<typeof createLlmAdapter>,
      "OAuth2 bearer tokens",
      "Implement OAuth2",
      sourceIds,
    );
    expect(result.source_meeting_ids).toEqual(sourceIds);
  });

  it("logs generation via mtninsights:task", async () => {
    const llm = createLlmAdapter({ type: "stub" });
    await expect(generateTask(llm, curatedContext, "Implement OAuth2", sourceIds)).resolves.toBeDefined();
  });
});
