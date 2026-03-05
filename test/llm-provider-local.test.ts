import { describe, it, expect, vi, afterEach } from "vitest";
import { createLocalAdapter } from "../core/llm-provider-local.js";

afterEach(() => vi.restoreAllMocks());

function mockFetch(data: unknown, status = 200) {
  return vi.spyOn(global, "fetch").mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

describe("createLocalAdapter", () => {
  const adapter = createLocalAdapter("http://localhost:11434", "llama3");

  it("complete parses JSON response from Ollama", async () => {
    mockFetch({ message: { content: '{"tags":["a","b"]}' } });
    expect(await adapter.complete("cluster_tags", "input")).toEqual({ tags: ["a", "b"] });
  });

  it("complete returns { answer } wrapper for synthesize_answer", async () => {
    mockFetch({ message: { content: "The answer is 42." } });
    expect(await adapter.complete("synthesize_answer", "question")).toEqual({ answer: "The answer is 42." });
  });

  it("complete throws [rate_limit] on 429", async () => {
    mockFetch({}, 429);
    await expect(adapter.complete("cluster_tags", "input")).rejects.toThrow("[rate_limit] Ollama rate limit (429)");
  });

  it("complete throws [api_error] on 500", async () => {
    mockFetch({}, 500);
    await expect(adapter.complete("cluster_tags", "input")).rejects.toThrow("[api_error] Ollama server error (500)");
  });

  it("complete throws [api_error] when fetch rejects (unreachable)", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(adapter.complete("cluster_tags", "input")).rejects.toThrow("[api_error] Ollama unreachable");
  });

  it("converse sends system + messages and returns text", async () => {
    const spy = mockFetch({ message: { content: "hello back" } });
    const result = await adapter.converse("be helpful", [{ role: "user", content: "hi" }]);
    expect(result).toBe("hello back");
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string) as Record<string, unknown>;
    expect(body.messages).toEqual([
      { role: "system", content: "be helpful" },
      { role: "user", content: "hi" },
    ]);
  });

  it("converse throws [api_error] on 500", async () => {
    mockFetch({}, 500);
    await expect(adapter.converse("sys", [{ role: "user", content: "hi" }])).rejects.toThrow("[api_error] Ollama server error (500)");
  });
});
