import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "../../../..");
const CHAT_GUIDELINES_PATH = join(REPO_ROOT, "config/chat-guidelines.md");
export const chatGuidelines = existsSync(CHAT_GUIDELINES_PATH) ? readFileSync(CHAT_GUIDELINES_PATH, "utf8") : "";

const EXTRACTION_PROMPT_PATH = join(REPO_ROOT, "config/prompts/extraction.md");
export const extractionPrompt = existsSync(EXTRACTION_PROMPT_PATH) ? readFileSync(EXTRACTION_PROMPT_PATH, "utf8") : undefined;

const DEEP_SEARCH_PROMPT_PATH = join(REPO_ROOT, "config/prompts/deep-search.md");
export const deepSearchPrompt = existsSync(DEEP_SEARCH_PROMPT_PATH) ? readFileSync(DEEP_SEARCH_PROMPT_PATH, "utf8") : undefined;

const SYSTEM_CONFIG_PATH = join(REPO_ROOT, "config/system.json");
const systemConfig = existsSync(SYSTEM_CONFIG_PATH)
  ? JSON.parse(readFileSync(SYSTEM_CONFIG_PATH, "utf8")) as { search?: { maxDistance?: number; limit?: number; displayLimit?: number; chatContextLimit?: number } }
  : {};
export const SEARCH_MAX_DISTANCE = systemConfig.search?.maxDistance ?? 1.0;
export const SEARCH_LIMIT = systemConfig.search?.limit ?? 50;
export const DISPLAY_LIMIT = systemConfig.search?.displayLimit ?? 20;
export const CHAT_CONTEXT_LIMIT = systemConfig.search?.chatContextLimit ?? 10;

const CHAT_TEMPLATES_DIR = join(REPO_ROOT, "config/chat-templates");
export const chatTemplates = new Map<string, string>();
if (existsSync(CHAT_TEMPLATES_DIR)) {
  for (const file of readdirSync(CHAT_TEMPLATES_DIR).filter((f) => extname(f) === ".md")) {
    chatTemplates.set(basename(file, ".md"), readFileSync(join(CHAT_TEMPLATES_DIR, file), "utf8"));
  }
}
