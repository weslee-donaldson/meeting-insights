import OpenAI from "openai";
import type { LlmAdapter, LlmCapability, ImageAttachment } from "./llm-adapter.js";
import { createLogger } from "./logger.js";
import { parseJsonOrThrow, withRepair } from "./llm-helpers.js";

const logLlm = createLogger("llm");

export function createOpenaiAdapter(apiKey: string, model?: string): LlmAdapter {
  const client = new OpenAI({ apiKey });
  const resolvedModel = model ?? "gpt-4o";

  return {
    async complete(capability: LlmCapability, content: string, _attachments?: ImageAttachment[]) {
      const start = Date.now();
      const completion = await client.chat.completions.create({
        model: resolvedModel,
        messages: [{ role: "user", content }],
      });
      const text = completion.choices[0]?.message?.content ?? "";
      logLlm("provider=openai capability=%s model=%s latency_ms=%d tokens=%d", capability, resolvedModel, Date.now() - start, completion.usage?.completion_tokens ?? 0);
      if (capability === "synthesize_answer") return { answer: text };
      return parseJsonOrThrow(text);
    },
    async converse(system: string, messages: Array<{ role: "user" | "assistant"; content: string }>, _attachments?: ImageAttachment[]) {
      const start = Date.now();
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
    },
  };
}
