import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions.js";
import type { LlmAdapter, LlmCapability, ImageAttachment } from "./llm-adapter.js";
import { createLogger } from "./logger.js";
import { parseJsonOrThrow, withRepair } from "./llm-helpers.js";

const logLlm = createLogger("llm");

function buildImageParts(attachments: ImageAttachment[]): ChatCompletionContentPart[] {
  return attachments.map((a) => ({
    type: "image_url" as const,
    image_url: { url: `data:${a.mimeType};base64,${a.base64}` },
  }));
}

function handleOpenaiError(err: unknown): never {
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
      const completion = await client.chat.completions.create({
        model: resolvedModel,
        messages: [{ role: "user", content: userContent }],
      });
      text = completion.choices[0]?.message?.content ?? "";
      logLlm("provider=openai capability=%s model=%s latency_ms=%d tokens=%d", capability, resolvedModel, Date.now() - start, completion.usage?.completion_tokens ?? 0);
    } catch (err) {
      handleOpenaiError(err);
    }
    if (capability === "synthesize_answer") return { answer: text };
    return parseJsonOrThrow(text);
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
          messages: [
            { role: "system", content: system },
            ...apiMessages,
          ],
        });
        const text = completion.choices[0]?.message?.content ?? "";
        logLlm("provider=openai converse model=%s latency_ms=%d tokens=%d", resolvedModel, Date.now() - start, completion.usage?.completion_tokens ?? 0);
        return text;
      } catch (err) {
        handleOpenaiError(err);
      }
    },
  };
}
