import { createLogger } from "./logger.js";
import type { DatabaseSync as Database } from "node:sqlite";

const log = createLogger("fts");

interface ArtifactRow {
  meeting_id: string;
  summary: string;
  decisions: string;
  proposed_features: string;
  action_items: string;
  open_questions: string;
  risk_items: string;
  additional_notes: string;
}

function buildFtsContent(row: ArtifactRow): string {
  const parts: string[] = [];

  parts.push("[summary]", row.summary);

  const decisions = JSON.parse(row.decisions) as Array<{ text: string }>;
  parts.push("[decisions]", ...decisions.map((d) => d.text));

  const features = JSON.parse(row.proposed_features) as string[];
  parts.push("[proposed_features]", ...features);

  const actions = JSON.parse(row.action_items) as Array<{ description: string }>;
  parts.push("[action_items]", ...actions.map((a) => a.description));

  const questions = JSON.parse(row.open_questions) as string[];
  parts.push("[open_questions]", ...questions);

  const risks = JSON.parse(row.risk_items) as Array<{ description: string } | string>;
  parts.push("[risk_items]", ...risks.map((r) => typeof r === "string" ? r : r.description));

  const notes = JSON.parse(row.additional_notes ?? "[]") as Array<Record<string, unknown>>;
  if (notes.length > 0) {
    parts.push("[additional_notes]");
    for (const note of notes) {
      for (const val of Object.values(note)) {
        if (typeof val === "string") parts.push(val);
        if (Array.isArray(val)) parts.push(...val.filter((v): v is string => typeof v === "string"));
      }
    }
  }

  return parts.filter(Boolean).join(" ");
}

export function updateFts(db: Database, meetingId: string): void {
  const row = db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meetingId) as ArtifactRow | undefined;
  if (!row) return;

  db.prepare("DELETE FROM artifact_fts WHERE meeting_id = ?").run(meetingId);
  const content = buildFtsContent(row);
  db.prepare("INSERT INTO artifact_fts (meeting_id, content) VALUES (?, ?)").run(meetingId, content);
  log("updated fts for meeting=%s chars=%d", meetingId, content.length);
}

interface FtsResult {
  meeting_id: string;
  score: number;
}

export function sanitizeFtsQuery(raw: string): string {
  return raw.replace(/[*"'():^~{}<>?!@#$%&|\\[\]+,;=]/g, " ").replace(/\s+/g, " ").trim();
}

export function searchFts(db: Database, query: string, limit: number): FtsResult[] {
  const sanitized = sanitizeFtsQuery(query);
  if (!sanitized) return [];
  const rows = db.prepare(
    "SELECT meeting_id, bm25(artifact_fts) as score FROM artifact_fts WHERE artifact_fts MATCH ? ORDER BY bm25(artifact_fts) LIMIT ?",
  ).all(sanitized, limit) as { meeting_id: string; score: number }[];
  log("fts query=%s results=%d", sanitized, rows.length);
  return rows;
}

export function populateFts(db: Database): void {
  db.prepare("DELETE FROM artifact_fts").run();
  const rows = db.prepare("SELECT * FROM artifacts").all() as ArtifactRow[];
  for (const row of rows) {
    const content = buildFtsContent(row);
    db.prepare("INSERT INTO artifact_fts (meeting_id, content) VALUES (?, ?)").run(row.meeting_id, content);
  }
  log("populated fts for %d meetings", rows.length);
}

function extractFieldContent(content: string, fieldName: string): string {
  const tag = `[${fieldName}]`;
  const start = content.indexOf(tag);
  if (start === -1) return "";
  const afterTag = start + tag.length;
  const nextBracket = content.indexOf("[", afterTag);
  return nextBracket === -1 ? content.slice(afterTag) : content.slice(afterTag, nextBracket);
}

export function filterBySearchFields(
  db: Database,
  results: FtsResult[],
  query: string,
  searchFields: string[],
): FtsResult[] {
  if (searchFields.length === 0) return results;
  const sanitized = sanitizeFtsQuery(query);
  const queryTerms = sanitized.toLowerCase().split(/\s+/).filter(Boolean);
  return results.filter((r) => {
    const row = db.prepare("SELECT content FROM artifact_fts WHERE meeting_id = ?").get(r.meeting_id) as { content: string } | undefined;
    if (!row) return false;
    return searchFields.some((field) => {
      const section = extractFieldContent(row.content, field).toLowerCase();
      return queryTerms.some((term) => section.includes(term));
    });
  });
}

export function ensureFtsCurrent(db: Database): void {
  const count = (db.prepare("SELECT COUNT(*) as n FROM artifact_fts").get() as { n: number }).n;
  if (count === 0) {
    populateFts(db);
    return;
  }
  const sample = db.prepare("SELECT content FROM artifact_fts LIMIT 1").get() as { content: string } | undefined;
  if (sample && !sample.content.startsWith("[summary]")) {
    log("fts content outdated, rebuilding with field tags");
    populateFts(db);
  }
}
