import type { LlmAdapter, LlmCapability, ImageAttachment } from "./llm-adapter.js";
import { createLogger, logLlmCall } from "./logger.js";
import { parseJsonOrThrow, withRepair } from "./llm-helpers.js";

const logLlm = createLogger("llm");

export function createClaudeapiAdapter(baseUrl: string): LlmAdapter {
  const sessionCache = new Map<string, string>();

  function serializeAttachments(attachments?: ImageAttachment[]) {
    if (!attachments || attachments.length === 0) return undefined;
    return attachments.map((a) => ({ name: a.name, file_path: a.filePath, mime_type: a.mimeType }));
  }

  async function post(path: string, body: Record<string, unknown>): Promise<{ result: string; session_id: string }> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 429) throw new Error("[rate_limit] Claude API rate limit (429)");
    if (res.status >= 500) throw new Error(`[api_error] Claude API server error (${res.status})`);
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`[api_error] Claude API error (${res.status}): ${detail}`);
    }
    return (await res.json()) as { result: string; session_id: string };
  }

  const apiCall = async (capability: LlmCapability, content: string, attachments?: ImageAttachment[]) => {
    const start = Date.now();
    const body: Record<string, unknown> = { message: content };
    const serialized = serializeAttachments(attachments);
    if (serialized) body.attachments = serialized;
    const { result } = await post("/message", body);
    const latency = Date.now() - start;
    const tokens = Math.ceil(result.length / 4);
    logLlm("provider=claudeapi capability=%s latency_ms=%d tokens=%d", capability, latency, tokens);
    logLlmCall({ capability, provider: "claudeapi", model: "claude-cli", latency_ms: latency, tokens, prompt: content, raw_response: result });
    if (capability === "synthesize_answer") return { answer: result };
    const parsed = parseJsonOrThrow(result);
    logLlmCall({ capability, provider: "claudeapi", model: "claude-cli", parsed_result: parsed });
    return parsed;
  };

  return {
    async complete(capability, content, attachments?) {
      return withRepair((c) => apiCall(capability, c, attachments), content);
    },

    async converse(system, messages, attachments?) {
      const start = Date.now();
      const cacheKey = system + JSON.stringify(messages.slice(0, -1));
      const existingSessionId = messages.length > 1 ? sessionCache.get(cacheKey) : undefined;

      const body: Record<string, unknown> = {
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      };
      if (existingSessionId) body.session_id = existingSessionId;
      const serialized = serializeAttachments(attachments);
      if (serialized) body.attachments = serialized;

      const { result, session_id } = await post("/converse", body);
      const newKey = system + JSON.stringify(messages);
      sessionCache.set(newKey, session_id);
      logLlm("provider=claudeapi converse latency_ms=%d tokens=%d", Date.now() - start, Math.ceil(result.length / 4));
      return result;
    },
  };
}
