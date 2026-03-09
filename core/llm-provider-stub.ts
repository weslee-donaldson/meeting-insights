import type { LlmAdapter, LlmCapability, ImageAttachment } from "./llm-adapter.js";
import { createLogger, logLlmCall } from "./logger.js";

const logLlm = createLogger("llm");

export const STUB_FIXTURES: Record<LlmCapability, Record<string, unknown>> = {
  extract_artifact: {
    summary: "Stub summary of the meeting.",
    decisions: [{ text: "Decision A", decided_by: "Alice" }, { text: "Decision B", decided_by: "" }],
    proposed_features: ["Feature X", "Feature Y"],
    action_items: [{ description: "Follow up", owner: "Wesley", requester: "Stace", due_date: null, priority: "normal" }],
    open_questions: ["What is the timeline?"],
    risk_items: [{ category: "engineering", description: "Scope creep risk" }],
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
  deep_search_filter: {
    relevant: true,
    relevance_summary: "Stub relevance summary for deep search.",
    relevance_score: 85,
  },
  evaluate_thread: {
    related: true,
    relevance_summary: "Stub relevance.",
    relevance_score: 75,
  },
  generate_insight: {
    executive_summary: "Stub executive summary of the reporting period.",
    rag_status: "yellow",
    rag_rationale: "",
    topic_details: [
      { topic: "Feature Delivery", summary: "Feature X is on track.", status: "green" },
      { topic: "Open Issues", summary: "Two unresolved blockers.", status: "yellow" },
    ],
  },
};

export function createStubAdapter(): LlmAdapter {
  return {
    async complete(capability: LlmCapability, content: string, _attachments?: ImageAttachment[]) {
      const start = Date.now();
      const result = STUB_FIXTURES[capability];
      const latency = Date.now() - start;
      logLlm("provider=stub capability=%s model=stub latency_ms=%d tokens=0", capability, latency);
      logLlmCall({ capability, provider: "stub", model: "stub", latency_ms: latency, tokens: 0, prompt: content, parsed_result: result });
      return result;
    },
    async converse(_system: string, _messages: Array<{ role: "user" | "assistant"; content: string }>, _attachments?: ImageAttachment[]) {
      return STUB_FIXTURES.synthesize_answer.answer as string;
    },
  };
}
