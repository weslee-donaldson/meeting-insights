export interface BatchDedupItem {
  description: string;
  priority: "critical" | "normal" | "low";
  meetingTitle: string;
  date: string;
}

export interface IndexedBatchDedupItem extends BatchDedupItem {
  originalIndex: number;
}

export function filterAndCapItems(items: BatchDedupItem[], batchSize: number): IndexedBatchDedupItem[] {
  const indexed: IndexedBatchDedupItem[] = items.map((item, i) => ({ ...item, originalIndex: i }));
  const eligible = indexed.filter((item) => item.priority !== "low");
  const critical = eligible.filter((item) => item.priority === "critical");
  const normal = eligible.filter((item) => item.priority === "normal");
  critical.sort((a, b) => b.date.localeCompare(a.date));
  normal.sort((a, b) => b.date.localeCompare(a.date));
  return [...critical.slice(0, batchSize), ...normal.slice(0, batchSize)];
}

export function buildBatchDedupPrompt(template: string, items: BatchDedupItem[]): string {
  const lines = items.map(
    (item, i) => `${i}. [${item.priority}] [${item.meetingTitle}, ${item.date}] "${item.description}"`,
  );
  const itemsBlock = lines.length > 0 ? `Items:\n${lines.join("\n")}` : "Items:";
  return template.replace("{{items}}", itemsBlock);
}

export function parseBatchDedupResponse(response: Record<string, unknown>, itemCount: number): number[][] {
  const rawGroups = response.groups;
  if (!Array.isArray(rawGroups)) return [];
  const seen = new Set<number>();
  const groups: number[][] = [];
  for (const group of rawGroups) {
    if (!Array.isArray(group)) continue;
    const validIndices: number[] = [];
    for (const idx of group) {
      if (typeof idx !== "number" || idx < 0 || idx >= itemCount || !Number.isInteger(idx)) continue;
      if (seen.has(idx)) continue;
      seen.add(idx);
      validIndices.push(idx);
    }
    if (validIndices.length >= 2) groups.push(validIndices);
  }
  return groups;
}

import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";
import type { InferenceSession } from "onnxruntime-node";
import type { VectorTable } from "./vector-db.js";
import type { LlmAdapter } from "./llm/adapter.js";
import type { Artifact } from "./extractor.js";
import { getItemText, getMeetingTitle, DEDUP_FIELDS, embedItem, storeItemVector, recordMention } from "./item-dedup.js";
import { createLogger } from "./logger.js";

const log = createLogger("dedup:deep");

export interface CanonicalAssignment {
  canonicalId: string;
  firstMentionedAt: string;
}

export function assignCanonicalGroups(
  groups: number[][],
  items: BatchDedupItem[],
): Map<number, CanonicalAssignment> {
  const assignments = new Map<number, CanonicalAssignment>();
  const grouped = new Set<number>();
  for (const group of groups) {
    const canonicalId = randomUUID();
    const earliestDate = group.reduce((min, idx) => {
      const d = items[idx].date;
      return d < min ? d : min;
    }, items[group[0]].date);
    for (const idx of group) {
      grouped.add(idx);
      assignments.set(idx, { canonicalId, firstMentionedAt: earliestDate });
    }
  }
  for (let i = 0; i < items.length; i++) {
    if (!grouped.has(i)) {
      assignments.set(i, { canonicalId: randomUUID(), firstMentionedAt: items[i].date });
    }
  }
  return assignments;
}

interface DeepScanResult {
  mentionsCreated: number;
  duplicatesAutoCompleted: number;
}

interface ArtifactRow {
  summary: string;
  decisions: string;
  proposed_features: string;
  action_items: string;
  open_questions: string;
  risk_items: string;
  additional_notes: string;
  milestones: string;
}

function parseArtifact(row: ArtifactRow): Artifact {
  return {
    summary: row.summary ?? "",
    decisions: JSON.parse(row.decisions ?? "[]"),
    proposed_features: JSON.parse(row.proposed_features ?? "[]"),
    action_items: JSON.parse(row.action_items ?? "[]"),
    open_questions: JSON.parse(row.open_questions ?? "[]"),
    risk_items: JSON.parse(row.risk_items ?? "[]"),
    additional_notes: JSON.parse(row.additional_notes ?? "[]"),
    milestones: JSON.parse(row.milestones ?? "[]"),
  };
}

interface FlatActionItem extends BatchDedupItem {
  meetingId: string;
  itemIndex: number;
}

export async function deepScanClient(
  db: Database,
  itemTable: VectorTable,
  session: InferenceSession & { _tokenizer: unknown },
  llm: LlmAdapter,
  clientId: string,
  meetings: Array<{ id: string; date: string; title: string }>,
  promptTemplate: string,
): Promise<DeepScanResult> {
  let mentionsCreated = 0;
  let duplicatesAutoCompleted = 0;
  const batchSize = parseInt(process.env.MTNINSIGHTS_DEDUP_BATCH_SIZE ?? "50", 10);

  const allActionItems: FlatActionItem[] = [];
  const meetingArtifacts = new Map<string, Artifact>();

  for (const meeting of meetings) {
    const row = db.prepare("SELECT * FROM artifacts WHERE meeting_id = ?").get(meeting.id) as ArtifactRow | undefined;
    if (!row) continue;
    const artifact = parseArtifact(row);
    meetingArtifacts.set(meeting.id, artifact);

    for (let i = 0; i < artifact.action_items.length; i++) {
      const item = artifact.action_items[i];
      allActionItems.push({
        description: item.description,
        priority: item.priority ?? "normal",
        meetingTitle: meeting.title,
        date: meeting.date,
        meetingId: meeting.id,
        itemIndex: i,
      });
    }
  }

  const filtered = filterAndCapItems(allActionItems, batchSize);
  let groups: number[][] = [];

  if (filtered.length >= 2) {
    const prompt = buildBatchDedupPrompt(promptTemplate, filtered);
    const response = await llm.complete("dedup_intent", prompt);
    groups = parseBatchDedupResponse(response, filtered.length);
    log("client=%s items=%d groups=%d", clientId, filtered.length, groups.length);
  }

  const assignments = assignCanonicalGroups(groups, filtered);

  const groupedOriginals = new Map<number, { canonicalId: string; firstMentionedAt: string }>();
  for (const [filteredIdx, assignment] of assignments) {
    const item = filtered[filteredIdx];
    groupedOriginals.set(item.originalIndex, assignment);
  }

  for (let i = 0; i < allActionItems.length; i++) {
    const item = allActionItems[i];
    const assignment = groupedOriginals.get(i) ?? { canonicalId: randomUUID(), firstMentionedAt: item.date };
    const vec = await embedItem(session, item.description);
    await storeItemVector(itemTable, assignment.canonicalId, item.description, "action_items", item.meetingId, item.date, clientId, vec);
    recordMention(db, assignment.canonicalId, item.meetingId, "action_items", item.itemIndex, item.description, assignment.firstMentionedAt);
    mentionsCreated++;

    const isGrouped = groupedOriginals.has(i);
    if (isGrouped) {
      const group = groups.find((g) => {
        const origIndices = g.map((fi) => filtered[fi].originalIndex);
        return origIndices.includes(i);
      });
      if (group && group.length >= 2) {
        const earliestFilteredIdx = group.reduce((min, idx) => filtered[idx].date < filtered[min].date ? idx : min, group[0]);
        const earliestOriginal = filtered[earliestFilteredIdx].originalIndex;
        if (i !== earliestOriginal) {
          const earliestItem = allActionItems[earliestOriginal];
          const matchTitle = getMeetingTitle(db, earliestItem.meetingId);
          const note = `[auto-dedup-deep] First raised ${earliestItem.date} in '${matchTitle}'`;
          db.prepare(
            "INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET note = excluded.note, completed_at = excluded.completed_at",
          ).run(`${item.meetingId}:${item.itemIndex}`, item.meetingId, item.itemIndex, new Date().toISOString(), note);
          duplicatesAutoCompleted++;
        }
      }
    }
  }

  for (const meeting of meetings) {
    const artifact = meetingArtifacts.get(meeting.id);
    if (!artifact) continue;
    for (const field of DEDUP_FIELDS) {
      if (field === "action_items") continue;
      const items = artifact[field];
      if (!Array.isArray(items)) continue;
      for (let i = 0; i < items.length; i++) {
        const text = getItemText(items[i], field);
        if (!text) continue;
        const canonicalId = randomUUID();
        const vec = await embedItem(session, text);
        await storeItemVector(itemTable, canonicalId, text, field, meeting.id, meeting.date, clientId, vec);
        recordMention(db, canonicalId, meeting.id, field, i, text, meeting.date);
        mentionsCreated++;
      }
    }
  }

  log("client=%s mentions=%d dupes_completed=%d", clientId, mentionsCreated, duplicatesAutoCompleted);
  return { mentionsCreated, duplicatesAutoCompleted };
}
