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
  const parts: string[] = [row.summary];

  const decisions = JSON.parse(row.decisions) as Array<{ text: string }>;
  parts.push(...decisions.map((d) => d.text));

  const features = JSON.parse(row.proposed_features) as string[];
  parts.push(...features);

  const actions = JSON.parse(row.action_items) as Array<{ description: string }>;
  parts.push(...actions.map((a) => a.description));

  const questions = JSON.parse(row.open_questions) as string[];
  parts.push(...questions);

  const risks = JSON.parse(row.risk_items) as Array<{ description: string } | string>;
  parts.push(...risks.map((r) => typeof r === "string" ? r : r.description));

  const notes = JSON.parse(row.additional_notes ?? "[]") as Array<Record<string, unknown>>;
  for (const note of notes) {
    for (const val of Object.values(note)) {
      if (typeof val === "string") parts.push(val);
      if (Array.isArray(val)) parts.push(...val.filter((v): v is string => typeof v === "string"));
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

export function populateFts(db: Database): void {
  db.prepare("DELETE FROM artifact_fts").run();
  const rows = db.prepare("SELECT * FROM artifacts").all() as ArtifactRow[];
  for (const row of rows) {
    const content = buildFtsContent(row);
    db.prepare("INSERT INTO artifact_fts (meeting_id, content) VALUES (?, ?)").run(row.meeting_id, content);
  }
  log("populated fts for %d meetings", rows.length);
}
