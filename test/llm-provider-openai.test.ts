import { describe, it, expect, vi, afterEach } from "vitest";
import { createOpenaiAdapter } from "../core/llm-provider-openai.js";

vi.mock("openai", () => {
  const MockOpenAI = class {
    chat = {
      completions: {
        create: vi.fn(),
      },
    };
  };
  return { default: MockOpenAI };
});

afterEach(() => vi.restoreAllMocks());

describe("createOpenaiAdapter", () => {
  it("returns an adapter with complete and converse methods", () => {
    const adapter = createOpenaiAdapter("test-key");
    expect(typeof adapter.complete).toBe("function");
    expect(typeof adapter.converse).toBe("function");
  });
});
