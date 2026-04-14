import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions.js";
import type { LlmAdapter, LlmCapability, ImageAttachment } from "./adapter.js";
import { createLogger, logLlmCall } from "../logger.js";
import { parseJsonOrThrow, withRepair } from "./helpers.js";

const logLlm = createLogger("llm");

const MAX_TOKENS_EXTRACT = parseInt(process.env.MTNINSIGHTS_LLM_MAX_TOKENS_EXTRACT ?? "16384", 10);
const MAX_TOKENS_CONVERSE = parseInt(process.env.MTNINSIGHTS_LLM_MAX_TOKENS_CONVERSE ?? "10000", 10);
const MAX_TOKENS_DEFAULT = parseInt(process.env.MTNINSIGHTS_LLM_MAX_TOKENS_DEFAULT ?? "8000", 10);

function buildImageParts(attachments: ImageAttachment[]): ChatCompletionContentPart[] {
  return attachments.map((a) => ({
    type: "image_url" as const,
    image_url: { url: `data:${a.mimeType};base64,${a.base64}` },
  }));
}

function handleOpenaiError(err: unknown, capability: string, model: string, start: number, prompt: string): never {
  logLlmCall({ capability, provider: "openai", model, latency_ms: Date.now() - start, prompt, error: String(err) }, "error");
  if (err instanceof Error && err.message.startsWith("[")) throw err;
  if (err instanceof OpenAI.APIError && err.status === 429) throw new Error(`[rate_limit] ${err.message}`);
  if (err instanceof OpenAI.APIError) throw new Error(`[api_error] ${err.message}`);
  throw new Error(`[api_error] ${String(err)}`);
}

export function createOpenaiAdapter(apiKey: string, model?: string): LlmAdapter {
  const client = new OpenAI({ apiKey });
  const resolvedModel = model ?? "gpt-4o";

  const openaiCall = async (capability: LlmCapability, content: string, attachments?: ImageAttachment[]) => {
    const start = Date.now();
    let text: string;
    try {
      const userContent: string | ChatCompletionContentPart[] = attachments && attachments.length > 0
        ? [...buildImageParts(attachments), { type: "text" as const, text: content }]
        : content;
      const maxTokens = capability === "generate_insight" || capability === "extract_artifact" ? MAX_TOKENS_EXTRACT : MAX_TOKENS_DEFAULT;
      const completion = await client.chat.completions.create({
        model: resolvedModel,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: userContent }],
      });
      text = completion.choices[0]?.message?.content ?? "";
      const latency = Date.now() - start;
      const tokens = completion.usage?.completion_tokens ?? 0;
      logLlm("provider=openai capability=%s model=%s latency_ms=%d tokens=%d", capability, resolvedModel, latency, tokens);
      logLlmCall({ capability, provider: "openai", model: resolvedModel, latency_ms: latency, tokens, prompt: content, raw_response: text });
    } catch (err) {
      handleOpenaiError(err, capability, resolvedModel, start, content);
    }
    if (capability === "synthesize_answer") return { answer: text };
    const parsed = parseJsonOrThrow(text);
    logLlmCall({ capability, provider: "openai", model: resolvedModel, parsed_result: parsed });
    return parsed;
  };

  return {
    async complete(capability: LlmCapability, content: string, attachments?: ImageAttachment[]) {
      return withRepair((c) => openaiCall(capability, c, attachments), content);
    },
    async converse(system: string, messages: Array<{ role: "user" | "assistant"; content: string }>, attachments?: ImageAttachment[]) {
      const start = Date.now();
      try {
        const apiMessages: OpenAI.ChatCompletionMessageParam[] = messages.map((m, i) => {
          if (m.role === "user" && attachments && attachments.length > 0 && i === messages.length - 1) {
            return {
              role: "user" as const,
              content: [...buildImageParts(attachments), { type: "text" as const, text: m.content }],
            };
          }
          return { role: m.role, content: m.content };
        });
        const completion = await client.chat.completions.create({
          model: resolvedModel,
          max_tokens: MAX_TOKENS_CONVERSE,
          messages: [
            { role: "system", content: system },
            ...apiMessages,
          ],
        });
        const text = completion.choices[0]?.message?.content ?? "";
        logLlm("provider=openai converse model=%s latency_ms=%d tokens=%d", resolvedModel, Date.now() - start, completion.usage?.completion_tokens ?? 0);
        return text;
      } catch (err) {
        handleOpenaiError(err, "converse", resolvedModel, start, messages[messages.length - 1]?.content ?? "");
      }
    },
  };
}
