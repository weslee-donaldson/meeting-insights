import Anthropic from "@anthropic-ai/sdk";
import type { LlmAdapter, LlmCapability, ImageAttachment } from "./adapter.js";
import { createLogger, logLlmCall } from "../logger.js";
import { parseJsonOrThrow, withRepair } from "./helpers.js";

const logLlm = createLogger("llm");

const MAX_TOKENS_EXTRACT = parseInt(process.env.MTNINSIGHTS_LLM_MAX_TOKENS_EXTRACT ?? "16384", 10);
const MAX_TOKENS_CONVERSE = parseInt(process.env.MTNINSIGHTS_LLM_MAX_TOKENS_CONVERSE ?? "10000", 10);
const MAX_TOKENS_DEFAULT = parseInt(process.env.MTNINSIGHTS_LLM_MAX_TOKENS_DEFAULT ?? "8000", 10);

export function createAnthropicAdapter(apiKey: string, model?: string): LlmAdapter {
  const client = new Anthropic({ apiKey });
  const resolvedModel = model ?? "claude-sonnet-4-6";

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
      const maxTokens = capability === "generate_insight" || capability === "extract_artifact" ? MAX_TOKENS_EXTRACT : MAX_TOKENS_DEFAULT;
      const message = await client.messages.create({
        model: resolvedModel,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: userContent }],
      });
      text = message.content[0].type === "text" ? message.content[0].text : "";
      const latency = Date.now() - start;
      logLlm("provider=anthropic capability=%s model=%s latency_ms=%d tokens=%d", capability, resolvedModel, latency, message.usage.output_tokens);
      logLlmCall({ capability, provider: "anthropic", model: resolvedModel, latency_ms: latency, tokens: message.usage.output_tokens, prompt: content, raw_response: text });
    } catch (err) {
      logLlmCall({ capability, provider: "anthropic", model: resolvedModel, latency_ms: Date.now() - start, prompt: content, error: String(err) }, "error");
      if (err instanceof Error && err.message.startsWith("[")) throw err;
      if (err instanceof Anthropic.RateLimitError) throw new Error(`[rate_limit] ${err.message}`);
      if (err instanceof Anthropic.APIError) throw new Error(`[api_error] ${err.message}`);
      throw new Error(`[api_error] ${String(err)}`);
    }
    if (capability === "synthesize_answer") return { answer: text };
    const parsed = parseJsonOrThrow(text);
    logLlmCall({ capability, provider: "anthropic", model: resolvedModel, parsed_result: parsed });
    return parsed;
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
        model: resolvedModel,
        max_tokens: MAX_TOKENS_CONVERSE,
        system,
        messages: apiMessages,
      });
      const text = message.content[0].type === "text" ? message.content[0].text : "";
      logLlm("provider=anthropic converse model=%s latency_ms=%d tokens=%d", resolvedModel, Date.now() - start, message.usage.output_tokens);
      return text;
    },
  };
}
