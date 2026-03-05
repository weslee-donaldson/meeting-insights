import Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "./logger.js";
import { parseJsonOrThrow, withRepair } from "./llm-helpers.js";
import { createStubAdapter } from "./llm-provider-stub.js";

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

export function createLlmAdapter(config: StubConfig | AnthropicConfig | LocalConfig): LlmAdapter {
  if (config.type === "stub") {
    return createStubAdapter();
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
