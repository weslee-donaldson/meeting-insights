import { describe, it, expect } from "vitest";
import { createStubAdapter, STUB_FIXTURES } from "../core/llm-provider-stub.js";
import type { LlmCapability } from "../core/llm-adapter.js";

describe("createStubAdapter", () => {
  const adapter = createStubAdapter();

  it("complete returns fixture for extract_artifact", async () => {
    expect(await adapter.complete("extract_artifact", "transcript")).toEqual(STUB_FIXTURES.extract_artifact);
  });

  it("complete returns fixture for cluster_tags", async () => {
    expect(await adapter.complete("cluster_tags", "summaries")).toEqual(STUB_FIXTURES.cluster_tags);
  });

  it("complete returns fixture for generate_task", async () => {
    expect(await adapter.complete("generate_task", "action item")).toEqual(STUB_FIXTURES.generate_task);
  });

  it("complete returns fixture for synthesize_answer", async () => {
    expect(await adapter.complete("synthesize_answer", "question")).toEqual(STUB_FIXTURES.synthesize_answer);
  });

  it("complete returns fixture for deep_search_filter", async () => {
    expect(await adapter.complete("deep_search_filter", "query")).toEqual(STUB_FIXTURES.deep_search_filter);
  });

  it("complete returns correct fixture for each capability", async () => {
    const capabilities: LlmCapability[] = ["extract_artifact", "cluster_tags", "generate_task", "synthesize_answer", "deep_search_filter"];
    for (const cap of capabilities) {
      expect(await adapter.complete(cap, "input")).toEqual(STUB_FIXTURES[cap]);
    }
  });

  it("converse returns stub answer string", async () => {
    expect(await adapter.converse("system prompt", [{ role: "user", content: "hello" }])).toBe("Stub answer based on meeting context.");
  });
});
