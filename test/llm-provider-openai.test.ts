import { describe, it, expect, vi, afterEach } from "vitest";
import { createOpenaiAdapter } from "../core/llm-provider-openai.js";

const { mockCreate, APIError } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  class APIError extends Error {
    status: number;
    constructor(status: number, msg: string) {
      super(msg);
      this.status = status;
      this.name = "APIError";
    }
  }
  return { mockCreate, APIError };
});

vi.mock("openai", () => {
  const MockOpenAI = class {
    chat = { completions: { create: (...args: unknown[]) => mockCreate(...args) } };
  };
  (MockOpenAI as Record<string, unknown>).APIError = APIError;
  return { default: MockOpenAI };
});

afterEach(() => {
  mockCreate.mockReset();
  vi.restoreAllMocks();
});

function mockCompletion(text: string, tokens = 10) {
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content: text } }],
    usage: { completion_tokens: tokens },
  });
}

describe("createOpenaiAdapter", () => {
  it("returns an adapter with complete and converse methods", () => {
    const adapter = createOpenaiAdapter("test-key");
    expect(typeof adapter.complete).toBe("function");
    expect(typeof adapter.converse).toBe("function");
  });

  describe("complete", () => {
    it("parses JSON response for cluster_tags", async () => {
      mockCompletion('{"tags":["a","b"]}');
      const adapter = createOpenaiAdapter("test-key");
      expect(await adapter.complete("cluster_tags", "input")).toEqual({ tags: ["a", "b"] });
    });

    it("returns { answer } wrapper for synthesize_answer", async () => {
      mockCompletion("The answer is 42.");
      const adapter = createOpenaiAdapter("test-key");
      expect(await adapter.complete("synthesize_answer", "question")).toEqual({ answer: "The answer is 42." });
    });

    it("uses withRepair on json_parse failure", async () => {
      mockCreate
        .mockResolvedValueOnce({ choices: [{ message: { content: "not json" } }], usage: { completion_tokens: 5 } })
        .mockResolvedValueOnce({ choices: [{ message: { content: '{"repaired":true}' } }], usage: { completion_tokens: 5 } });
      const adapter = createOpenaiAdapter("test-key");
      expect(await adapter.complete("cluster_tags", "input")).toEqual({ repaired: true });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it("throws [rate_limit] on 429 APIError", async () => {
      mockCreate.mockRejectedValueOnce(new APIError(429, "rate limited"));
      const adapter = createOpenaiAdapter("test-key");
      await expect(adapter.complete("cluster_tags", "input")).rejects.toThrow("[rate_limit]");
    });

    it("throws [api_error] on 500 APIError", async () => {
      mockCreate.mockRejectedValueOnce(new APIError(500, "server error"));
      const adapter = createOpenaiAdapter("test-key");
      await expect(adapter.complete("cluster_tags", "input")).rejects.toThrow("[api_error]");
    });

    it("throws [api_error] for unknown errors", async () => {
      mockCreate.mockRejectedValueOnce(new TypeError("network failure"));
      const adapter = createOpenaiAdapter("test-key");
      await expect(adapter.complete("cluster_tags", "input")).rejects.toThrow("[api_error]");
    });

    it("sends image attachments as image_url content parts", async () => {
      mockCompletion('{"result":"ok"}');
      const adapter = createOpenaiAdapter("test-key");
      await adapter.complete("extract_artifact", "describe", [
        { name: "screenshot.png", base64: "abc123", mimeType: "image/png" },
      ]);
      const messages = mockCreate.mock.calls[0][0].messages;
      expect(messages[0].content).toEqual([
        { type: "image_url", image_url: { url: "data:image/png;base64,abc123" } },
        { type: "text", text: "describe" },
      ]);
    });
  });

  describe("converse", () => {
    it("sends system + messages and returns text", async () => {
      mockCompletion("hello back");
      const adapter = createOpenaiAdapter("test-key");
      const result = await adapter.converse("be helpful", [{ role: "user", content: "hi" }]);
      expect(result).toBe("hello back");
      expect(mockCreate.mock.calls[0][0].messages).toEqual([
        { role: "system", content: "be helpful" },
        { role: "user", content: "hi" },
      ]);
    });

    it("throws [rate_limit] on 429 APIError", async () => {
      mockCreate.mockRejectedValueOnce(new APIError(429, "rate limited"));
      const adapter = createOpenaiAdapter("test-key");
      await expect(adapter.converse("sys", [{ role: "user", content: "hi" }])).rejects.toThrow("[rate_limit]");
    });

    it("throws [api_error] on 500 APIError", async () => {
      mockCreate.mockRejectedValueOnce(new APIError(500, "server error"));
      const adapter = createOpenaiAdapter("test-key");
      await expect(adapter.converse("sys", [{ role: "user", content: "hi" }])).rejects.toThrow("[api_error]");
    });

    it("sends image attachments on last user message", async () => {
      mockCompletion("response with image context");
      const adapter = createOpenaiAdapter("test-key");
      await adapter.converse("sys", [
        { role: "user", content: "first" },
        { role: "assistant", content: "reply" },
        { role: "user", content: "with image" },
      ], [{ name: "img.jpg", base64: "xyz", mimeType: "image/jpeg" }]);
      const messages = mockCreate.mock.calls[0][0].messages;
      expect(messages[1]).toEqual({ role: "user", content: "first" });
      expect(messages[2]).toEqual({ role: "assistant", content: "reply" });
      expect(messages[3].content).toEqual([
        { type: "image_url", image_url: { url: "data:image/jpeg;base64,xyz" } },
        { type: "text", text: "with image" },
      ]);
    });
  });
});
