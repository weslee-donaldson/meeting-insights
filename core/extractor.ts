import type { DatabaseSync as Database } from "node:sqlite";
import { createHash } from "node:crypto";
import { createLogger } from "./logger.js";
import { chunkTranscript } from "./chunker.js";
import type { LlmAdapter } from "./llm-adapter.js";
import type { SpeakerTurn } from "./parser.js";
import { ArtifactSchema } from "./schemas.js";

const log = createLogger("extract");
const logValidate = createLogger("extract:validate");

export function generateShortId(meetingId: string, itemIndex: number): string {
  return createHash("sha256").update(`${meetingId}:${itemIndex}`).digest("hex").slice(0, 6);
}

const REQUIRED_KEYS = ["summary", "decisions", "proposed_features", "action_items", "open_questions", "risk_items", "additional_notes"] as const;

export interface Artifact {
  summary: string;
  decisions: Array<{ text: string; decided_by: string }>;
  proposed_features: string[];
  action_items: Array<{ description: string; owner: string; requester: string; due_date: string | null; priority: "critical" | "normal" | "low"; short_id?: string }>;
  open_questions: string[];
  risk_items: Array<{ category: "relationship" | "architecture" | "engineering"; description: string }>;
  additional_notes: Array<Record<string, unknown>>;
  milestones: Array<{ title: string; target_date: string | null; status_signal: string; excerpt: string }>;
}

export interface ArtifactRow {
  meeting_id: string;
  summary: string;
  decisions: string;
  proposed_features: string;
  action_items: string;
  open_questions: string;
  risk_items: string;
  additional_notes: string;
  milestones: string;
}

export function validateArtifact(raw: object): Artifact {
  const result = ArtifactSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    logValidate("validation failed: %s", issues);
    throw new Error(`Artifact validation failed: ${issues}`);
  }
  return result.data as unknown as Artifact;
}

function turnsToText(turns: SpeakerTurn[]): string {
  return turns.map((t) => `${t.speaker_name} | ${t.timestamp}\n${t.text}`).join("\n\n");
}

function normalizeString(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function dedupStrings(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((s) => {
    const key = normalizeString(s);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeArtifacts(artifacts: Artifact[]): Artifact {
  const seenDecisions = new Set<string>();
  const decisions: Artifact["decisions"] = [];
  for (const a of artifacts) {
    for (const d of a.decisions) {
      const key = normalizeString(d.text);
      if (!seenDecisions.has(key)) {
        seenDecisions.add(key);
        decisions.push(d);
      }
    }
  }

  const seenActions = new Set<string>();
  const action_items: Artifact["action_items"] = [];
  for (const a of artifacts) {
    for (const item of a.action_items) {
      const key = normalizeString(item.description);
      if (!seenActions.has(key)) {
        seenActions.add(key);
        action_items.push(item);
      }
    }
  }

  const seenRisks = new Set<string>();
  const risk_items: Artifact["risk_items"] = [];
  for (const a of artifacts) {
    for (const r of a.risk_items) {
      const key = normalizeString(r.description);
      if (!seenRisks.has(key)) {
        seenRisks.add(key);
        risk_items.push(r);
      }
    }
  }

  const seenMilestones = new Set<string>();
  const milestones: Artifact["milestones"] = [];
  for (const a of artifacts) {
    for (const m of a.milestones) {
      const key = normalizeString(m.title);
      if (!seenMilestones.has(key)) {
        seenMilestones.add(key);
        milestones.push(m);
      }
    }
  }

  return {
    summary: artifacts.map((a) => a.summary).filter(Boolean).join("\n\n"),
    decisions,
    proposed_features: dedupStrings(artifacts.flatMap((a) => a.proposed_features)),
    action_items,
    open_questions: dedupStrings(artifacts.flatMap((a) => a.open_questions)),
    risk_items,
    additional_notes: artifacts.flatMap((a) => a.additional_notes),
    milestones,
  };
}

export async function extractSummary(
  adapter: LlmAdapter,
  turns: SpeakerTurn[],
  tokenLimit: number,
  promptTemplate?: string,
  refinementPrompt?: string,
): Promise<Artifact> {
  const clientSection = refinementPrompt
    ? `## Client Context\n\n${refinementPrompt}\n\n`
    : "";
  const chunks = chunkTranscript(turns, tokenLimit);
  const start = Date.now();
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const transcript = turnsToText(chunk);
      const content = promptTemplate
        ? promptTemplate.replace("{{client_context}}", clientSection).replace("{{transcript}}", transcript)
        : transcript;
      const raw = await adapter.complete("extract_artifact", content);
      if (raw.__fallback) {
        logValidate("fallback artifact used raw_text=%s", String(raw.raw_text ?? "").slice(0, 100));
        return null;
      }
      return validateArtifact(raw);
    }),
  );
  log("extraction completed in %dms chunks=%d", Date.now() - start, chunks.length);
  const artifacts = results.filter((a): a is Artifact => a !== null);
  if (artifacts.length === 0) {
    throw new Error("Extraction failed: LLM returned unparseable responses for all chunks");
  }
  const merged = mergeArtifacts(artifacts);
  const notesCount = merged.additional_notes.length;
  const notesSize = JSON.stringify(merged.additional_notes).length;
  log("notes_count=%d notes_size=%d", notesCount, notesSize);
  return merged;
}

export function storeArtifact(db: Database, meetingId: string, artifact: Artifact): void {
  for (let i = 0; i < artifact.action_items.length; i++) {
    if (!artifact.action_items[i].short_id) {
      artifact.action_items[i].short_id = generateShortId(meetingId, i);
    }
  }
  db.prepare(`
    INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, open_questions, risk_items, additional_notes, milestones)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    meetingId,
    artifact.summary,
    JSON.stringify(artifact.decisions),
    JSON.stringify(artifact.proposed_features),
    JSON.stringify(artifact.action_items),
    JSON.stringify(artifact.open_questions),
    JSON.stringify(artifact.risk_items),
    JSON.stringify(artifact.additional_notes ?? []),
    JSON.stringify(artifact.milestones ?? []),
  );
}

export function getArtifact(db: Database, meetingId: string): ArtifactRow {
  return db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meetingId) as ArtifactRow;
}
