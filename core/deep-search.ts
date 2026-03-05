import { getArtifact } from "./extractor.js";
import { createLogger } from "./logger.js";
import type { ArtifactRow } from "./extractor.js";
import type { LlmAdapter } from "./llm-adapter.js";
import type { DatabaseSync as Database } from "node:sqlite";

const log = createLogger("deep-search");

export interface DeepSearchResult {
  meeting_id: string;
  relevanceSummary: string;
  relevanceScore: number;
}

function buildMeetingContext(art: ArtifactRow): string {
  const parts: string[] = [];
  parts.push(`Summary: ${art.summary}`);
  const actions = JSON.parse(art.action_items ?? "[]") as Array<{ description: string; owner: string }>;
  if (actions.length > 0) {
    parts.push("Action Items:");
    for (const a of actions) {
      parts.push(`- ${a.description} (owner: ${a.owner})`);
    }
  }
  const decisions = JSON.parse(art.decisions ?? "[]") as Array<{ text: string }>;
  if (decisions.length > 0) {
    parts.push("Decisions:");
    for (const d of decisions) {
      parts.push(`- ${d.text}`);
    }
  }
  return parts.join("\n");
}

function buildPrompt(template: string, query: string, context: string): string {
  return template.replace("{{query}}", query).replace("{{meeting_context}}", context);
}

async function evaluateMeeting(
  llm: LlmAdapter,
  meetingId: string,
  art: ArtifactRow,
  query: string,
  promptTemplate: string,
): Promise<DeepSearchResult | null> {
  const context = buildMeetingContext(art);
  const prompt = buildPrompt(promptTemplate, query, context);
  const result = await llm.complete("deep_search_filter", prompt);
  const relevant = result.relevant === true;
  if (!relevant) return null;
  return {
    meeting_id: meetingId,
    relevanceSummary: typeof result.relevance_summary === "string" ? result.relevance_summary : "",
    relevanceScore: typeof result.relevance_score === "number" ? result.relevance_score : 0,
  };
}

const DEFAULT_PROMPT = "Evaluate meeting relevance.\n\nQuery: {{query}}\n\nContext: {{meeting_context}}\n\nReturn JSON with relevant, relevance_summary, relevance_score.";

export async function deepSearch(
  llm: LlmAdapter,
  db: Database,
  meetingIds: string[],
  query: string,
  promptTemplate?: string,
): Promise<DeepSearchResult[]> {
  const template = promptTemplate ?? DEFAULT_PROMPT;
  const promises = meetingIds.map(async (id) => {
    const art = getArtifact(db, id);
    if (!art) return null;
    try {
      return await evaluateMeeting(llm, id, art, query, template);
    } catch (err) {
      log("deep-search error meeting=%s err=%s", id, String(err));
      return null;
    }
  });
  const settled = await Promise.all(promises);
  const results = settled.filter((r): r is DeepSearchResult => r !== null);
  log("deep-search query=%s candidates=%d relevant=%d", query, meetingIds.length, results.length);
  return results;
}
