import type { DatabaseSync as Database } from "node:sqlite";
import { createLogger } from "./logger.js";
import { chunkTranscript } from "./chunker.js";
import type { LlmAdapter } from "./llm-adapter.js";
import type { SpeakerTurn } from "./parser.js";

const log = createLogger("extract");
const logValidate = createLogger("extract:validate");

const REQUIRED_KEYS = ["summary", "decisions", "proposed_features", "action_items", "technical_topics", "open_questions", "risk_items", "additional_notes"] as const;

export interface Artifact {
  summary: string;
  decisions: string[];
  proposed_features: string[];
  action_items: Array<{ description: string; owner: string; due_date: string | null }>;
  technical_topics: string[];
  open_questions: string[];
  risk_items: string[];
  additional_notes: Array<Record<string, unknown>>;
}

export interface ArtifactRow {
  meeting_id: string;
  summary: string;
  decisions: string;
  proposed_features: string;
  action_items: string;
  technical_topics: string;
  open_questions: string;
  risk_items: string;
  additional_notes: string;
}

export function validateArtifact(raw: object): Artifact {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    logValidate("validation failed: not an object");
    throw new Error("Artifact must be a plain object");
  }
  for (const key of REQUIRED_KEYS) {
    if (!(key in raw)) {
      logValidate("validation failed: missing key %s", key);
      throw new Error(`Artifact missing required key: ${key}`);
    }
  }
  const r = raw as Record<string, unknown>;
  const notes = r["additional_notes"];
  if (!Array.isArray(notes) || notes.some(item => typeof item !== "object" || item === null || Array.isArray(item))) {
    logValidate("additional_notes malformed — normalizing to []");
    r["additional_notes"] = [];
  }
  return r as unknown as Artifact;
}

function turnsToText(turns: SpeakerTurn[]): string {
  return turns.map((t) => `${t.speaker_name} | ${t.timestamp}\n${t.text}`).join("\n\n");
}

function mergeArtifacts(artifacts: Artifact[]): Artifact {
  return {
    summary: artifacts.map((a) => a.summary).join(" "),
    decisions: artifacts.flatMap((a) => a.decisions),
    proposed_features: artifacts.flatMap((a) => a.proposed_features),
    action_items: artifacts.flatMap((a) => a.action_items),
    technical_topics: artifacts.flatMap((a) => a.technical_topics),
    open_questions: artifacts.flatMap((a) => a.open_questions),
    risk_items: artifacts.flatMap((a) => a.risk_items),
    additional_notes: artifacts.flatMap((a) => a.additional_notes),
  };
}

export async function extractSummary(
  adapter: LlmAdapter,
  turns: SpeakerTurn[],
  tokenLimit: number,
  promptTemplate?: string,
): Promise<Artifact> {
  const chunks = chunkTranscript(turns, tokenLimit);
  const start = Date.now();
  const artifacts = await Promise.all(
    chunks.map(async (chunk) => {
      const transcript = turnsToText(chunk);
      const content = promptTemplate ? promptTemplate.replace("{{transcript}}", transcript) : transcript;
      const raw = await adapter.complete("extract_artifact", content);
      if (raw.__fallback) {
        logValidate("fallback artifact used raw_text=%s", String(raw.raw_text ?? "").slice(0, 100));
        return { summary: "", decisions: [], proposed_features: [], action_items: [], technical_topics: [], open_questions: [], risk_items: [], additional_notes: [] };
      }
      return validateArtifact(raw);
    }),
  );
  log("extraction completed in %dms chunks=%d", Date.now() - start, chunks.length);
  const merged = mergeArtifacts(artifacts);
  const notesCount = merged.additional_notes.length;
  const notesSize = JSON.stringify(merged.additional_notes).length;
  log("notes_count=%d notes_size=%d", notesCount, notesSize);
  return merged;
}

export function storeArtifact(db: Database, meetingId: string, artifact: Artifact): void {
  db.prepare(`
    INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, technical_topics, open_questions, risk_items, additional_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    meetingId,
    artifact.summary,
    JSON.stringify(artifact.decisions),
    JSON.stringify(artifact.proposed_features),
    JSON.stringify(artifact.action_items),
    JSON.stringify(artifact.technical_topics),
    JSON.stringify(artifact.open_questions),
    JSON.stringify(artifact.risk_items),
    JSON.stringify(artifact.additional_notes ?? []),
  );
}

export function getArtifact(db: Database, meetingId: string): ArtifactRow {
  return db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meetingId) as ArtifactRow;
}
