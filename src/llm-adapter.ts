import Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "./logger.js";

const log = createLogger("extract");

export type LlmCapability = "extract_artifact" | "cluster_tags" | "generate_task" | "synthesize_answer";

export interface LlmAdapter {
  complete(capability: LlmCapability, content: string): Promise<Record<string, unknown>>;
}

const STUB_FIXTURES: Record<LlmCapability, Record<string, unknown>> = {
  extract_artifact: {
    summary: "Stub summary of the meeting.",
    decisions: ["Decision A", "Decision B"],
    proposed_features: ["Feature X", "Feature Y"],
    action_items: [{ description: "Follow up", owner: "Wesley", due_date: null }],
    technical_topics: ["API design", "database schema"],
    open_questions: ["What is the timeline?"],
    risk_items: ["Scope creep risk"],
    additional_notes: [{ category: "Context", notes: ["Stub note about constraints and tradeoffs."] }],
  },
  cluster_tags: {
    tags: ["API integration", "client onboarding", "feature planning", "roadmap review"],
  },
  generate_task: {
    title: "Implement Feature X",
    description: "Based on meeting discussion, implement Feature X with the agreed approach.",
    acceptance_criteria: ["Feature X passes all unit tests", "Feature X is documented"],
  },
  synthesize_answer: {
    answer: "Stub answer based on meeting context.",
  },
};

interface StubConfig {
  type: "stub";
}

interface AnthropicConfig {
  type: "anthropic";
  apiKey: string;
  model?: string;
}

interface LocalConfig {
  type: "local";
  baseUrl: string;
  model: string;
}

function parseJsonOrThrow(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`[json_parse] Response was not valid JSON: ${text.slice(0, 200)}`);
  }
}

export function createLlmAdapter(config: StubConfig | AnthropicConfig | LocalConfig): LlmAdapter {
  if (config.type === "stub") {
    return {
      async complete(capability: LlmCapability) {
        return STUB_FIXTURES[capability];
      },
    };
  }

  if (config.type === "local") {
    const { baseUrl, model } = config;
    return {
      async complete(capability: LlmCapability, content: string) {
        let res: Response;
        try {
          res = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, messages: [{ role: "user", content }], stream: false }),
          });
        } catch (err) {
          throw new Error(`[api_error] Ollama unreachable: ${String(err)}`);
        }
        if (res.status === 429) throw new Error(`[rate_limit] Ollama rate limit (429)`);
        if (res.status >= 500) throw new Error(`[api_error] Ollama server error (${res.status})`);
        const json = await res.json() as { message?: { content?: string } };
        const text = json.message?.content ?? "";
        if (capability === "synthesize_answer") return { answer: text };
        return parseJsonOrThrow(text);
      },
    };
  }

  const client = new Anthropic({ apiKey: config.apiKey });
  const model = config.model ?? "claude-sonnet-4-6";

  return {
    async complete(capability: LlmCapability, content: string) {
      let text: string;
      try {
        const message = await client.messages.create({
          model,
          max_tokens: 2048,
          messages: [{ role: "user", content }],
        });
        text = message.content[0].type === "text" ? message.content[0].text : "";
        log("completed capability=%s tokens=%d", capability, message.usage.output_tokens);
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("[")) throw err;
        if (err instanceof Anthropic.RateLimitError) throw new Error(`[rate_limit] ${err.message}`);
        if (err instanceof Anthropic.APIError) throw new Error(`[api_error] ${err.message}`);
        throw new Error(`[api_error] ${String(err)}`);
      }
      if (capability === "synthesize_answer") return { answer: text };
      return parseJsonOrThrow(text);
    },
  };
}
