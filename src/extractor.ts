import type { Database } from "better-sqlite3";
import { createLogger } from "./logger.js";
import { chunkTranscript } from "./chunker.js";
import type { LlmAdapter } from "./llm-adapter.js";
import type { SpeakerTurn } from "./parser.js";

const log = createLogger("extract");
const logValidate = createLogger("extract:validate");

const REQUIRED_KEYS = ["summary", "decisions", "proposed_features", "action_items", "technical_topics", "open_questions", "risk_items"] as const;

export interface Artifact {
  summary: string;
  decisions: string[];
  proposed_features: string[];
  action_items: Array<{ description: string; owner: string; due_date: string | null }>;
  technical_topics: string[];
  open_questions: string[];
  risk_items: string[];
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
  return raw as Artifact;
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
  };
}

export async function extractSummary(adapter: LlmAdapter, turns: SpeakerTurn[], tokenLimit: number): Promise<Artifact> {
  const chunks = chunkTranscript(turns, tokenLimit);
  const start = Date.now();
  const artifacts = await Promise.all(
    chunks.map(async (chunk) => {
      const raw = await adapter.complete("extraction", turnsToText(chunk));
      return validateArtifact(raw);
    }),
  );
  log("extraction completed in %dms chunks=%d", Date.now() - start, chunks.length);
  return mergeArtifacts(artifacts);
}

export function storeArtifact(db: Database, meetingId: string, artifact: Artifact): void {
  db.prepare(`
    INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, technical_topics, open_questions, risk_items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    meetingId,
    artifact.summary,
    JSON.stringify(artifact.decisions),
    JSON.stringify(artifact.proposed_features),
    JSON.stringify(artifact.action_items),
    JSON.stringify(artifact.technical_topics),
    JSON.stringify(artifact.open_questions),
    JSON.stringify(artifact.risk_items),
  );
}

export function getArtifact(db: Database, meetingId: string): ArtifactRow {
  return db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meetingId) as ArtifactRow;
}
