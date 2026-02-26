import Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "./logger.js";

const log = createLogger("extract");

export type PromptType = "extraction" | "tags" | "task";

export interface LlmAdapter {
  complete(promptType: PromptType, content: string): Promise<Record<string, unknown>>;
}

const STUB_FIXTURES: Record<PromptType, Record<string, unknown>> = {
  extraction: {
    summary: "Stub summary of the meeting.",
    decisions: ["Decision A", "Decision B"],
    proposed_features: ["Feature X", "Feature Y"],
    action_items: [{ description: "Follow up", owner: "Wesley", due_date: null }],
    technical_topics: ["API design", "database schema"],
    open_questions: ["What is the timeline?"],
    risk_items: ["Scope creep risk"],
  },
  tags: {
    tags: ["API integration", "client onboarding", "feature planning", "roadmap review"],
  },
  task: {
    title: "Implement Feature X",
    description: "Based on meeting discussion, implement Feature X with the agreed approach.",
    acceptance_criteria: ["Feature X passes all unit tests", "Feature X is documented"],
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
      async complete(promptType: PromptType) {
        return STUB_FIXTURES[promptType];
      },
    };
  }

  const client = new Anthropic({ apiKey: config.apiKey });
  const model = config.model ?? "claude-sonnet-4-6";

  return {
    async complete(promptType: PromptType, content: string) {
      const message = await client.messages.create({
        model,
        max_tokens: 2048,
        messages: [{ role: "user", content }],
      });
      const text = message.content[0].type === "text" ? message.content[0].text : "";
      log("completed promptType=%s tokens=%d", promptType, message.usage.output_tokens);
      return JSON.parse(text);
    },
  };
}
