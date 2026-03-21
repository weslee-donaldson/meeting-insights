process.loadEnvFile?.(".env.local");

export type ProviderType = "anthropic" | "local" | "stub" | "claudecli" | "local-claudeapi";

export interface CliConfig {
  dbPath: string;
  vectorPath: string;
  provider: ProviderType;
  apiKey: string | undefined;
  localBaseUrl: string;
  localModel: string;
  claudeApiUrl: string;
}

export function loadCliConfig(): CliConfig {
  return {
    dbPath: process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db",
    vectorPath: process.env.MTNINSIGHTS_VECTOR_PATH ?? "db/lancedb",
    provider: (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as ProviderType,
    apiKey: process.env.ANTHROPIC_API_KEY,
    localBaseUrl: process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434",
    localModel: process.env.MTNINSIGHTS_LOCAL_MODEL ?? "llama3.1:8b",
    claudeApiUrl: process.env.MTNINSIGHTS_CLAUDEAPI_URL ?? "http://localhost:8100",
  };
}

export interface SearchResult {
  meeting_id: string;
  score: number;
  client: string;
  meeting_type: string;
  date: string;
}

export interface Decision {
  text: string;
  decided_by: string;
}

export function parseDecisions(json: string): Decision[] {
  const raw = JSON.parse(json) as unknown[];
  return raw.map((d) => (typeof d === "string" ? { text: d, decided_by: "" } : d as Decision));
}

export interface ActionItem {
  description: string;
  owner: string;
  requester: string;
  due_date: string | null;
}

export interface MeetingRow {
  id: string;
  title: string;
  date: string;
}

import type { DatabaseSync as Database } from "node:sqlite";
import { getMeeting } from "../core/ingest.js";
import { getArtifact } from "../core/extractor.js";
import { renderNotesGroups } from "../core/display-helpers.js";

export function buildSearchContext(db: Database, results: SearchResult[]): string {
  return results.map((r, i) => {
    const label = `[M${i + 1}]`;
    const mtg = getMeeting(db, r.meeting_id);
    const art = getArtifact(db, r.meeting_id);
    if (!art) return "";
    const decisions  = parseDecisions(art.decisions ?? "[]");
    const actions    = JSON.parse(art.action_items ?? "[]") as ActionItem[];
    const questions  = JSON.parse(art.open_questions ?? "[]") as string[];
    const risks      = JSON.parse(art.risk_items ?? "[]") as string[];
    const features   = JSON.parse(art.proposed_features ?? "[]") as string[];
    const notes = JSON.parse(art.additional_notes ?? "[]") as Array<Record<string, unknown>>;
    const notesText = renderNotesGroups(notes);
    const notesSection = notesText.length > 0
      ? `Notes:\n${notesText.length > 1000 ? notesText.slice(0, 1000) + "…" : notesText}`
      : "";
    return [
      `## ${label} ${mtg.title}  (${mtg.date.slice(0, 10)})`,
      `Summary: ${art.summary}`,
      decisions.length  ? `Decisions: ${decisions.map(d => d.text).join(" | ")}` : "",
      actions.length    ? `Action items: ${actions.map(a => `${a.owner}: ${a.description}`).join(" | ")}` : "",
      questions.length  ? `Open questions: ${questions.join(" | ")}` : "",
      risks.length      ? `Risks: ${risks.join(" | ")}` : "",
      features.length   ? `Proposed features: ${features.join(" | ")}` : "",
      notesSection,
    ].filter(Boolean).join("\n");
  }).filter(Boolean).join("\n\n---\n\n");
}
