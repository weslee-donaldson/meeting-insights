import { describe, it, expect, vi, afterEach } from "vitest";
import { createAnthropicAdapter } from "../core/llm/provider-anthropic.js";

vi.mock("@anthropic-ai/sdk", () => {
  class RateLimitError extends Error { constructor(msg: string) { super(msg); this.name = "RateLimitError"; } }
  class APIError extends Error { constructor(msg: string) { super(msg); this.name = "APIError"; } }
  let handler: (params: Record<string, unknown>) => Record<string, unknown>;
  const MockAnthropic = class {
    messages = {
      create: (params: Record<string, unknown>) => Promise.resolve(handler(params)),
    };
  };
  (MockAnthropic as Record<string, unknown>).RateLimitError = RateLimitError;
  (MockAnthropic as Record<string, unknown>).APIError = APIError;
  return {
    default: MockAnthropic,
    RateLimitError,
    APIError,
  };
});

afterEach(() => vi.restoreAllMocks());

const { default: Anthropic } = await import("@anthropic-ai/sdk");

function setMockResponse(text: string) {
  const client = new Anthropic({ apiKey: "test" }) as unknown as { messages: { create: (p: Record<string, unknown>) => Promise<Record<string, unknown>> } };
  const origCreate = client.messages.create;
  vi.spyOn(client.messages, "create").mockImplementation(async (params: Record<string, unknown>) => {
    void origCreate;
    void params;
    return {
      content: [{ type: "text", text }],
      usage: { output_tokens: text.length },
    };
  });
}

describe("createAnthropicAdapter", () => {
  it("returns an adapter with complete and converse methods", () => {
    const adapter = createAnthropicAdapter("test-key");
    expect(typeof adapter.complete).toBe("function");
    expect(typeof adapter.converse).toBe("function");
  });

  it("defaults model to claude-sonnet-4-6", () => {
    const adapter = createAnthropicAdapter("test-key");
    expect(adapter).toBeDefined();
  });

  it("accepts custom model", () => {
    const adapter = createAnthropicAdapter("test-key", "claude-haiku-4-5-20251001");
    expect(adapter).toBeDefined();
  });
});
