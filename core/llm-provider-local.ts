import type { LlmAdapter, LlmCapability, ImageAttachment } from "./llm-adapter.js";
import { createLogger, logLlmCall } from "./logger.js";
import { parseJsonOrThrow, withRepair } from "./llm-helpers.js";

const logLlm = createLogger("llm");

export function createLocalAdapter(baseUrl: string, model: string): LlmAdapter {
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
      logLlmCall({ capability, provider: "local", model, latency_ms: Date.now() - start, prompt: content, error: String(err) }, "error");
      throw new Error(`[api_error] Ollama unreachable: ${String(err)}`);
    }
    if (res.status === 429) {
      logLlmCall({ capability, provider: "local", model, latency_ms: Date.now() - start, prompt: content, error: "rate_limit (429)" }, "error");
      throw new Error(`[rate_limit] Ollama rate limit (429)`);
    }
    if (res.status >= 500) {
      logLlmCall({ capability, provider: "local", model, latency_ms: Date.now() - start, prompt: content, error: `server error (${res.status})` }, "error");
      throw new Error(`[api_error] Ollama server error (${res.status})`);
    }
    const json = await res.json() as { message?: { content?: string } };
    const text = json.message?.content ?? "";
    const latency = Date.now() - start;
    logLlm("provider=local capability=%s model=%s latency_ms=%d tokens=%d", capability, model, latency, text.length);
    logLlmCall({ capability, provider: "local", model, latency_ms: latency, tokens: text.length, prompt: content, raw_response: text });
    if (capability === "synthesize_answer") return { answer: text };
    const parsed = parseJsonOrThrow(text);
    logLlmCall({ capability, provider: "local", model, parsed_result: parsed });
    return parsed;
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
