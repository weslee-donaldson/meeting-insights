import Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "./logger.js";

const logLlm = createLogger("llm");

export type LlmCapability = "extract_artifact" | "cluster_tags" | "generate_task" | "synthesize_answer" | "deep_search_filter";

export interface ImageAttachment {
  name: string;
  base64: string;
  mimeType: string;
}

export interface LlmAdapter {
  complete(capability: LlmCapability, content: string, attachments?: ImageAttachment[]): Promise<Record<string, unknown>>;
  converse(system: string, messages: Array<{ role: "user" | "assistant"; content: string }>, attachments?: ImageAttachment[]): Promise<string>;
}

const STUB_FIXTURES: Record<LlmCapability, Record<string, unknown>> = {
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

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n\s*```$/);
  return match ? match[1].trim() : trimmed;
}

function parseJsonOrThrow(text: string): Record<string, unknown> {
  try {
    return JSON.parse(stripCodeFences(text)) as Record<string, unknown>;
  } catch {
    throw new Error(`[json_parse] Response was not valid JSON: ${text.slice(0, 200)}`);
  }
}

const REPAIR_PREFIX = "The previous response was not valid JSON. Return only a valid JSON object with no prose.\n\nOriginal request:\n";

async function withRepair(
  call: (content: string) => Promise<Record<string, unknown>>,
  content: string,
): Promise<Record<string, unknown>> {
  try {
    return await call(content);
  } catch (err) {
    if (!(err instanceof Error) || !err.message.startsWith("[json_parse]")) throw err;
    const firstRaw = err.message.slice("[json_parse] Response was not valid JSON: ".length);
    try {
      return await call(REPAIR_PREFIX + content);
    } catch {
      return { __fallback: true, raw_text: firstRaw.slice(0, 500) };
    }
  }
}

export function createLlmAdapter(config: StubConfig | AnthropicConfig | LocalConfig): LlmAdapter {
  if (config.type === "stub") {
    return {
      async complete(capability: LlmCapability, _content: string, _attachments?: ImageAttachment[]) {
        const start = Date.now();
        const result = STUB_FIXTURES[capability];
        logLlm("provider=stub capability=%s model=stub latency_ms=%d tokens=0", capability, Date.now() - start);
        return result;
      },
      async converse(_system: string, _messages: Array<{ role: "user" | "assistant"; content: string }>, _attachments?: ImageAttachment[]) {
        return STUB_FIXTURES.synthesize_answer.answer as string;
      },
    };
  }

  if (config.type === "local") {
    const { baseUrl, model } = config;
    const localCall = async (capability: LlmCapability, content: string, _attachments?: ImageAttachment[]) => {
      const start = Date.now();
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
      logLlm("provider=local capability=%s model=%s latency_ms=%d tokens=%d", capability, model, Date.now() - start, text.length);
      if (capability === "synthesize_answer") return { answer: text };
      return parseJsonOrThrow(text);
    };
    return {
      async complete(capability: LlmCapability, content: string, attachments?: ImageAttachment[]) {
        return withRepair((c) => localCall(capability, c, attachments), content);
      },
      async converse(system: string, messages: Array<{ role: "user" | "assistant"; content: string }>, _attachments?: ImageAttachment[]) {
        const start = Date.now();
        const allMessages = [
          { role: "system" as const, content: system },
          ...messages,
        ];
        const res = await fetch(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages: allMessages, stream: false }),
        });
        if (res.status >= 500) throw new Error(`[api_error] Ollama server error (${res.status})`);
        const json = await res.json() as { message?: { content?: string } };
        const text = json.message?.content ?? "";
        logLlm("provider=local converse model=%s latency_ms=%d tokens=%d", model, Date.now() - start, text.length);
        return text;
      },
    };
  }

  const client = new Anthropic({ apiKey: config.apiKey });
  const model = config.model ?? "claude-sonnet-4-6";

  const anthropicCall = async (capability: LlmCapability, content: string, attachments?: ImageAttachment[]) => {
    const start = Date.now();
    let text: string;
    try {
      const userContent: Anthropic.MessageParam["content"] = attachments && attachments.length > 0
        ? [
            ...attachments.map((a) => ({
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: a.mimeType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
                data: a.base64,
              },
            })),
            { type: "text" as const, text: content },
          ]
        : content;
      const message = await client.messages.create({
        model,
        max_tokens: 2048,
        messages: [{ role: "user", content: userContent }],
      });
      text = message.content[0].type === "text" ? message.content[0].text : "";
      logLlm("provider=anthropic capability=%s model=%s latency_ms=%d tokens=%d", capability, model, Date.now() - start, message.usage.output_tokens);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("[")) throw err;
      if (err instanceof Anthropic.RateLimitError) throw new Error(`[rate_limit] ${err.message}`);
      if (err instanceof Anthropic.APIError) throw new Error(`[api_error] ${err.message}`);
      throw new Error(`[api_error] ${String(err)}`);
    }
    if (capability === "synthesize_answer") return { answer: text };
    return parseJsonOrThrow(text);
  };

  return {
    async complete(capability: LlmCapability, content: string, attachments?: ImageAttachment[]) {
      return withRepair((c) => anthropicCall(capability, c, attachments), content);
    },
    async converse(system: string, messages: Array<{ role: "user" | "assistant"; content: string }>, attachments?: ImageAttachment[]) {
      const start = Date.now();
      const apiMessages: Anthropic.MessageParam[] = messages.map((m, i) => {
        if (m.role === "user" && attachments && attachments.length > 0 && i === messages.length - 1) {
          return {
            role: "user" as const,
            content: [
              ...attachments.map((a) => ({
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: a.mimeType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
                  data: a.base64,
                },
              })),
              { type: "text" as const, text: m.content },
            ],
          };
        }
        return { role: m.role, content: m.content };
      });
      const message = await client.messages.create({
        model,
        max_tokens: 4096,
        system,
        messages: apiMessages,
      });
      const text = message.content[0].type === "text" ? message.content[0].text : "";
      logLlm("provider=anthropic converse model=%s latency_ms=%d tokens=%d", model, Date.now() - start, message.usage.output_tokens);
      return text;
    },
  };
}
