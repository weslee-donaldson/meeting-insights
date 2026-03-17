import { createStubAdapter } from "./llm-provider-stub.js";
import { createLocalAdapter } from "./llm-provider-local.js";
import { createAnthropicAdapter } from "./llm-provider-anthropic.js";
import { createOpenaiAdapter } from "./llm-provider-openai.js";
import { createClaudecliAdapter } from "./llm-provider-claudecli.js";
import { createClaudeapiAdapter } from "./llm-provider-claudeapi.js";

export type LlmCapability = "extract_artifact" | "cluster_tags" | "generate_task" | "synthesize_answer" | "deep_search_filter" | "evaluate_thread" | "generate_insight" | "dedup_intent";

export interface ImageAttachment {
  name: string;
  filePath: string;
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

interface OpenaiConfig {
  type: "openai";
  apiKey: string;
  model?: string;
}

interface ClaudecliConfig {
  type: "claudecli";
  bin?: string;
}

interface LocalClaudeapiConfig {
  type: "local-claudeapi";
  baseUrl: string;
}

export function createLlmAdapter(config: StubConfig | AnthropicConfig | LocalConfig | OpenaiConfig | ClaudecliConfig | LocalClaudeapiConfig): LlmAdapter {
  if (config.type === "stub") {
    return createStubAdapter();
  }

  if (config.type === "local") {
    return createLocalAdapter(config.baseUrl, config.model);
  }

  if (config.type === "openai") {
    return createOpenaiAdapter(config.apiKey, config.model);
  }

  if (config.type === "claudecli") {
    return createClaudecliAdapter(config.bin);
  }

  if (config.type === "local-claudeapi") {
    return createClaudeapiAdapter(config.baseUrl);
  }

  return createAnthropicAdapter(config.apiKey, config.model);
}
