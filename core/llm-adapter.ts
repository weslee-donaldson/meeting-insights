import { createStubAdapter } from "./llm-provider-stub.js";
import { createLocalAdapter } from "./llm-provider-local.js";
import { createAnthropicAdapter } from "./llm-provider-anthropic.js";

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
    return createLocalAdapter(config.baseUrl, config.model);
  }

  return createAnthropicAdapter(config.apiKey, config.model);
}
