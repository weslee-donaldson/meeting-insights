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

export function createLlmAdapter(config: StubConfig | AnthropicConfig): LlmAdapter {
  if (config.type === "stub") {
    return {
      async complete(capability: LlmCapability) {
        return STUB_FIXTURES[capability];
      },
    };
  }

  const client = new Anthropic({ apiKey: config.apiKey });
  const model = config.model ?? "claude-sonnet-4-6";

  return {
    async complete(capability: LlmCapability, content: string) {
      const message = await client.messages.create({
        model,
        max_tokens: 2048,
        messages: [{ role: "user", content }],
      });
      const text = message.content[0].type === "text" ? message.content[0].text : "";
      log("completed capability=%s tokens=%d", capability, message.usage.output_tokens);
      return JSON.parse(text);
    },
  };
}
