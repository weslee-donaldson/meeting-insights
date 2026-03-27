import type { DatabaseSync as Database } from "node:sqlite";
import { getMeeting } from "./ingest.js";
import { getArtifact } from "./extractor.js";
import type { ArtifactRow, Artifact } from "./extractor.js";
import { getMentionStats } from "./item-dedup.js";
import { getMeetingMilestones } from "./timelines.js";
import { getNote } from "./notes.js";
import { createLogger } from "./logger.js";

const log = createLogger("labeled-context");

interface ContextMeeting {
  id: string;
  title: string;
  date: string;
}

export interface LabeledContextResult {
  contextText: string;
  charCount: number;
  meetings: ContextMeeting[];
}

function normalizeDecisions(raw: unknown[]): Artifact["decisions"] {
  return raw.map((d) => (typeof d === "string" ? { text: d, decided_by: "" } : d as Artifact["decisions"][number]));
}

function normalizeActionItems(raw: unknown[]): Artifact["action_items"] {
  return raw.map((item) => {
    const a = item as Record<string, unknown>;
    const withRequester = !("requester" in a) ? { ...a, requester: "" } : a;
    const p = (withRequester as Record<string, unknown>).priority;
    const priority = p === "critical" || p === "normal" ? p : "normal";
    return { ...withRequester, priority } as Artifact["action_items"][number];
  });
}

function normalizeRiskItems(raw: unknown[]): Artifact["risk_items"] {
  return raw.map((r) =>
    typeof r === "string" ? { category: "engineering" as const, description: r } : r as Artifact["risk_items"][number],
  );
}

function parseArtifactRow(row: ArtifactRow): Artifact {
  return {
    summary: row.summary,
    decisions: normalizeDecisions(JSON.parse(row.decisions ?? "[]")),
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items: normalizeActionItems(JSON.parse(row.action_items ?? "[]")),
    open_questions: JSON.parse(row.open_questions ?? "[]"),
    risk_items: normalizeRiskItems(JSON.parse(row.risk_items ?? "[]")),
    additional_notes: JSON.parse(row.additional_notes ?? "[]"),
  };
}

interface MentionAnnotation {
  mention_count: number;
  first_mentioned_at: string;
}

type AnnotationMap = Map<string, MentionAnnotation>;

function annotationSuffix(annotation: MentionAnnotation | undefined): string {
  if (!annotation || annotation.mention_count <= 1) return "";
  return ` [raised ${annotation.mention_count}x, first mentioned ${annotation.first_mentioned_at.slice(0, 10)}]`;
}

function annotationKey(itemType: string, index: number): string {
  return `${itemType}:${index}`;
}

function artifactBlock(artifact: Artifact, annotations: AnnotationMap): string {
  const lines: string[] = [];
  if (artifact.summary) lines.push(`Summary: ${artifact.summary}`);
  if (artifact.decisions.length > 0)
    lines.push(`Decisions:\n${artifact.decisions.map((d, i) => {
      const suffix = annotationSuffix(annotations.get(annotationKey("decisions", i)));
      return `- ${d.text}${d.decided_by ? ` (decided by ${d.decided_by})` : ""}${suffix}`;
    }).join("\n")}`);
  if (artifact.action_items.length > 0)
    lines.push(
      `Action Items:\n${artifact.action_items
        .map((a, i) => {
          const idTag = a.short_id ? `[${a.short_id}] ` : "";
          const prefix = `${idTag}${a.priority === "critical" ? "[CRITICAL] " : ""}`;
          const meta = [a.owner, a.requester ? `requested by ${a.requester}` : "", a.due_date ? `due ${a.due_date}` : ""].filter(Boolean).join(", ");
          const suffix = annotationSuffix(annotations.get(annotationKey("action_items", i)));
          return meta ? `- ${prefix}${a.description} (${meta})${suffix}` : `- ${prefix}${a.description}${suffix}`;
        })
        .join("\n")}`,
    );
  if (artifact.open_questions.length > 0)
    lines.push(
      `Open Questions:\n${artifact.open_questions.map((q, i) => {
        const suffix = annotationSuffix(annotations.get(annotationKey("open_questions", i)));
        return `- ${q}${suffix}`;
      }).join("\n")}`,
    );
  if (artifact.risk_items.length > 0)
    lines.push(`Risks:\n${artifact.risk_items.map((r, i) => {
      const suffix = annotationSuffix(annotations.get(annotationKey("risk_items", i)));
      return `- ${r.description}${suffix}`;
    }).join("\n")}`);
  if (artifact.proposed_features.length > 0)
    lines.push(
      `Proposed Features:\n${artifact.proposed_features.map((f, i) => {
        const suffix = annotationSuffix(annotations.get(annotationKey("proposed_features", i)));
        return `- ${f}${suffix}`;
      }).join("\n")}`,
    );
  return lines.join("\n");
}

export interface DistilledContextOptions {
  maxChars?: number;
  relevanceSummaries?: Map<string, string>;
}

export function buildDistilledContext(
  db: Database,
  meetingIds: string[],
  noteIds: string[] = [],
  options: DistilledContextOptions = {},
): string {
  const blocks: string[] = [];
  const perMeetingBudget = options.maxChars
    ? Math.floor(options.maxChars / Math.max(meetingIds.length, 1))
    : undefined;
  for (const id of meetingIds) {
    const mtg = getMeeting(db, id);
    const art = getArtifact(db, id);
    if (!mtg || !art) {
      log("skipping meeting %s: %s", id, !mtg ? "meeting not found" : "artifact missing");
      continue;
    }
    const artifact = parseArtifactRow(art);
    const lines: string[] = [];
    lines.push(`## ${mtg.title} (${mtg.date.slice(0, 10)})`);
    const relevance = options.relevanceSummaries?.get(id);
    if (relevance) lines.push(`Relevance: ${relevance}`);
    if (artifact.summary) lines.push(`Summary: ${artifact.summary}`);
    if (artifact.decisions.length > 0) {
      lines.push("Decisions:");
      for (const d of artifact.decisions) {
        lines.push(`- ${d.text}${d.decided_by ? ` (decided by ${d.decided_by})` : ""}`);
      }
    }
    if (artifact.action_items.length > 0) {
      lines.push("Action Items:");
      for (const a of artifact.action_items) {
        const idTag = a.short_id ? `[${a.short_id}] ` : "";
        const prefix = `${idTag}${a.priority === "critical" ? "[CRITICAL] " : ""}`;
        const meta = [a.owner ? `owner: ${a.owner}` : "", a.requester ? `requested by: ${a.requester}` : "", a.due_date ? `due: ${a.due_date}` : ""].filter(Boolean).join(", ");
        lines.push(meta ? `- ${prefix}${a.description} (${meta})` : `- ${prefix}${a.description}`);
      }
    }
    if (artifact.additional_notes.length > 0) {
      lines.push("Notes:");
      lines.push(JSON.stringify(artifact.additional_notes, null, 2));
    }
    const meetingNoteIds = noteIds.filter((nid) => {
      const n = getNote(db, nid);
      return n && n.objectId === id;
    });
    const noteBlock = notesSection(db, meetingNoteIds);
    if (noteBlock) lines.push(noteBlock.trim());
    let block = lines.join("\n");
    if (perMeetingBudget && block.length > perMeetingBudget) {
      block = block.slice(0, perMeetingBudget);
    }
    blocks.push(block);
  }
  const separator = "\n\n---\n\n";
  const joined = blocks.join(separator);
  if (options.maxChars && joined.length > options.maxChars) {
    return joined.slice(0, options.maxChars);
  }
  return joined;
}

function notesSection(db: Database, noteIds: string[]): string {
  if (noteIds.length === 0) return "";
  const bodies: string[] = [];
  for (const id of noteIds) {
    const note = getNote(db, id);
    if (note) bodies.push(`${note.title ?? note.noteType}:\n${note.body}`);
  }
  return bodies.length > 0 ? `\nNotes:\n${bodies.join("\n\n")}` : "";
}

export function buildLabeledContext(
  db: Database,
  meetingIds: string[],
  noteIds: string[] = [],
): LabeledContextResult {
  const rows = meetingIds
    .map((id) => {
      const mtg = getMeeting(db, id);
      const art = getArtifact(db, id);
      if (!mtg || !art) return null;
      return { mtg, art };
    })
    .filter((r): r is { mtg: ReturnType<typeof getMeeting>; art: ArtifactRow } => r !== null)
    .sort((a, b) => b.mtg.date.localeCompare(a.mtg.date));

  const meetings: ContextMeeting[] = [];
  const blocks: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const { mtg, art } = rows[i];
    const label = `[M${i + 1}]`;
    const artifact = parseArtifactRow(art);
    const stats = getMentionStats(db, mtg.id);
    const annotations: AnnotationMap = new Map();
    for (const stat of stats) {
      annotations.set(annotationKey(stat.item_type, stat.item_index), {
        mention_count: stat.mention_count,
        first_mentioned_at: stat.first_mentioned_at,
      });
    }
    const body = artifactBlock(artifact, annotations);
    const milestones = getMeetingMilestones(db, mtg.id);
    const milestoneSection = milestones.length > 0
      ? `\nMilestones:\n${milestones.map((m) => `- ${m.title} (target: ${m.target_date ?? "unscheduled"}, status: ${m.status})`).join("\n")}`
      : "";
    const transcript = mtg.raw_transcript ? `\nTranscript:\n${mtg.raw_transcript}` : "";
    const meetingNoteIds = noteIds.filter((nid) => {
      const n = getNote(db, nid);
      return n && n.objectId === mtg.id;
    });
    const notes = notesSection(db, meetingNoteIds);
    blocks.push(
      `${label} ${mtg.title} — ${mtg.date.slice(0, 10)}\n${body}${milestoneSection}${notes}${transcript}`,
    );
    meetings.push({ id: mtg.id, title: mtg.title, date: mtg.date });
  }

  const contextText = blocks.join("\n\n---\n\n");
  return { contextText, charCount: contextText.length, meetings };
}
