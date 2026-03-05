import { describe, it, expect, vi, afterEach } from "vitest";
import { createLlmAdapter } from "../core/llm-adapter.js";

afterEach(() => vi.restoreAllMocks());

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

  it("stub complete returns deep_search_filter fixture with relevant, relevance_summary, relevance_score", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.complete("deep_search_filter", "some meeting context");
    expect(result).toEqual({
      relevant: true,
      relevance_summary: expect.any(String),
      relevance_score: expect.any(Number),
    });
    expect((result.relevance_summary as string).length).toBeGreaterThan(0);
    expect(result.relevance_score as number).toBeGreaterThanOrEqual(0);
    expect(result.relevance_score as number).toBeLessThanOrEqual(100);
  });

  it("stub converse returns fixture answer for conversation messages", async () => {
    const adapter = createLlmAdapter({ type: "stub" });
    const result = await adapter.converse("system prompt", [
      { role: "user", content: "hello" },
    ]);
    expect(result).toBe("Stub answer based on meeting context.");
  });
});

describe("createLlmAdapter (local)", () => {
  it("accepts local config and returns adapter with complete method", () => {
    const adapter = createLlmAdapter({ type: "local", baseUrl: "http://localhost:11434", model: "llama3.1:8b" });
    expect(typeof adapter.complete).toBe("function");
  });

  it("throws [rate_limit] error on 429 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 429, json: async () => ({}) }));
    const adapter = createLlmAdapter({ type: "local", baseUrl: "http://localhost:11434", model: "llama3.1:8b" });
    await expect(adapter.complete("extract_artifact", "test")).rejects.toThrow(/^\[rate_limit\]/);
  });

  it("returns __fallback sentinel after two non-JSON responses (repair loop)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ message: { content: "Here is a summary, not JSON at all!" } }),
    }));
    const adapter = createLlmAdapter({ type: "local", baseUrl: "http://localhost:11434", model: "llama3.1:8b" });
    const result = await adapter.complete("extract_artifact", "test");
    expect(result.__fallback).toBe(true);
    expect(typeof result.raw_text).toBe("string");
  });

  it("does NOT trigger repair loop for [rate_limit] errors — throws immediately", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 429, json: async () => ({}) }));
    const adapter = createLlmAdapter({ type: "local", baseUrl: "http://localhost:11434", model: "llama3.1:8b" });
    await expect(adapter.complete("extract_artifact", "test")).rejects.toThrow(/^\[rate_limit\]/);
  });

  it("local converse sends system as first message and conversation array to Ollama", async () => {
    const spy = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ message: { content: "response text" } }),
    });
    vi.stubGlobal("fetch", spy);
    const adapter = createLlmAdapter({ type: "local", baseUrl: "http://localhost:11434", model: "llama3.1:8b" });
    const result = await adapter.converse("system context", [
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "q2" },
    ]);
    expect(result).toBe("response text");
    const body = JSON.parse(spy.mock.calls[0][1].body);
    expect(body.messages).toEqual([
      { role: "system", content: "system context" },
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "q2" },
    ]);
    expect(body.model).toBe("llama3.1:8b");
  });
});
