import type { DatabaseSync as Database } from "node:sqlite";
import { getMeeting } from "./ingest.js";
import { getArtifact } from "./extractor.js";
import type { ArtifactRow, Artifact } from "./extractor.js";
import { getMentionStats } from "./item-dedup.js";

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
    if (!("requester" in a)) return { ...a, requester: "" } as Artifact["action_items"][number];
    return a as Artifact["action_items"][number];
  });
}

function parseArtifactRow(row: ArtifactRow): Artifact {
  return {
    summary: row.summary,
    decisions: normalizeDecisions(JSON.parse(row.decisions ?? "[]")),
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items: normalizeActionItems(JSON.parse(row.action_items ?? "[]")),
    architecture: JSON.parse(row.architecture ?? "[]"),
    open_questions: JSON.parse(row.open_questions ?? "[]"),
    risk_items: JSON.parse(row.risk_items ?? "[]"),
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
          const meta = [a.owner, a.requester ? `requested by ${a.requester}` : "", a.due_date ? `due ${a.due_date}` : ""].filter(Boolean).join(", ");
          const suffix = annotationSuffix(annotations.get(annotationKey("action_items", i)));
          return meta ? `- ${a.description} (${meta})${suffix}` : `- ${a.description}${suffix}`;
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
      return `- ${r}${suffix}`;
    }).join("\n")}`);
  if (artifact.proposed_features.length > 0)
    lines.push(
      `Proposed Features:\n${artifact.proposed_features.map((f, i) => {
        const suffix = annotationSuffix(annotations.get(annotationKey("proposed_features", i)));
        return `- ${f}${suffix}`;
      }).join("\n")}`,
    );
  if (artifact.architecture.length > 0)
    lines.push(
      `Architecture:\n${artifact.architecture.map((t, i) => {
        const suffix = annotationSuffix(annotations.get(annotationKey("architecture", i)));
        return `- ${t}${suffix}`;
      }).join("\n")}`,
    );
  return lines.join("\n");
}

export function buildLabeledContext(
  db: Database,
  meetingIds: string[],
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
    blocks.push(
      `${label} ${mtg.title} — ${mtg.date.slice(0, 10)}\n${body}`,
    );
    meetings.push({ id: mtg.id, title: mtg.title, date: mtg.date });
  }

  const contextText = blocks.join("\n\n---\n\n");
  return { contextText, charCount: contextText.length, meetings };
}
