import OpenAI from "openai";
import type { LlmAdapter, LlmCapability, ImageAttachment } from "./llm-adapter.js";
import { createLogger } from "./logger.js";
import { parseJsonOrThrow, withRepair } from "./llm-helpers.js";

const logLlm = createLogger("llm");

export function createOpenaiAdapter(apiKey: string, model?: string): LlmAdapter {
  const client = new OpenAI({ apiKey });
  const resolvedModel = model ?? "gpt-4o";

  const openaiCall = async (capability: LlmCapability, content: string, _attachments?: ImageAttachment[]) => {
    const start = Date.now();
    let text: string;
    try {
      const completion = await client.chat.completions.create({
        model: resolvedModel,
        messages: [{ role: "user", content }],
      });
      text = completion.choices[0]?.message?.content ?? "";
      logLlm("provider=openai capability=%s model=%s latency_ms=%d tokens=%d", capability, resolvedModel, Date.now() - start, completion.usage?.completion_tokens ?? 0);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("[")) throw err;
      if (err instanceof OpenAI.APIError && err.status === 429) throw new Error(`[rate_limit] ${err.message}`);
      if (err instanceof OpenAI.APIError) throw new Error(`[api_error] ${err.message}`);
      throw new Error(`[api_error] ${String(err)}`);
    }
    if (capability === "synthesize_answer") return { answer: text };
    return parseJsonOrThrow(text);
  };

  return {
    async complete(capability: LlmCapability, content: string, attachments?: ImageAttachment[]) {
      return withRepair((c) => openaiCall(capability, c, attachments), content);
    },
    async converse(system: string, messages: Array<{ role: "user" | "assistant"; content: string }>, _attachments?: ImageAttachment[]) {
      const start = Date.now();
      try {
        const completion = await client.chat.completions.create({
          model: resolvedModel,
          messages: [
            { role: "system", content: system },
            ...messages,
          ],
        });
        const text = completion.choices[0]?.message?.content ?? "";
        logLlm("provider=openai converse model=%s latency_ms=%d tokens=%d", resolvedModel, Date.now() - start, completion.usage?.completion_tokens ?? 0);
        return text;
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("[")) throw err;
        if (err instanceof OpenAI.APIError && err.status === 429) throw new Error(`[rate_limit] ${err.message}`);
        if (err instanceof OpenAI.APIError) throw new Error(`[api_error] ${err.message}`);
        throw new Error(`[api_error] ${String(err)}`);
      }
    },
  };
}
