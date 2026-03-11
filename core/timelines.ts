import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { getArtifact } from "./extractor.js";
import { embed } from "./embedder.js";
import type { InferenceSession } from "onnxruntime-node";
import type { VectorDb } from "./vector-db.js";

interface MilestoneRow {
  id: string;
  client_name: string;
  title: string;
  description: string;
  target_date: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function createMilestone(
  db: DatabaseSync,
  input: { clientName: string; title: string; description?: string; targetDate?: string },
): MilestoneRow {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO milestones (id, client_name, title, description, target_date, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'identified', ?, ?)`,
  ).run(id, input.clientName, input.title, input.description ?? "", input.targetDate ?? null, now, now);

  return db.prepare("SELECT * FROM milestones WHERE id = ?").get(id) as MilestoneRow;
}

export function getMilestone(db: DatabaseSync, id: string): MilestoneRow | null {
  return (db.prepare("SELECT * FROM milestones WHERE id = ?").get(id) as MilestoneRow) ?? null;
}

export function updateMilestone(
  db: DatabaseSync,
  id: string,
  input: { title?: string; description?: string; targetDate?: string | null; status?: string },
): MilestoneRow | null {
  const existing = getMilestone(db, id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const title = input.title ?? existing.title;
  const description = input.description ?? existing.description;
  const targetDate = input.targetDate !== undefined ? input.targetDate : existing.target_date;
  const status = input.status ?? existing.status;
  const completedAt = status === "completed" ? (existing.completed_at ?? now) : null;

  db.prepare(
    `UPDATE milestones SET title = ?, description = ?, target_date = ?, status = ?, completed_at = ?, updated_at = ? WHERE id = ?`,
  ).run(title, description, targetDate, status, completedAt, now, id);

  return getMilestone(db, id);
}

export function deleteMilestone(db: DatabaseSync, id: string): void {
  db.prepare("DELETE FROM milestone_mentions WHERE milestone_id = ?").run(id);
  db.prepare("DELETE FROM milestone_action_items WHERE milestone_id = ?").run(id);
  db.prepare("DELETE FROM milestone_messages WHERE milestone_id = ?").run(id);
  db.prepare("DELETE FROM milestones WHERE id = ?").run(id);
}

interface MilestoneMentionRow {
  milestone_id: string;
  meeting_id: string;
  mention_type: string;
  excerpt: string;
  target_date_at_mention: string | null;
  mentioned_at: string;
  pending_review: number;
}

export function addMilestoneMention(
  db: DatabaseSync,
  input: {
    milestoneId: string;
    meetingId: string;
    mentionType: string;
    excerpt: string;
    targetDateAtMention: string | null;
    mentionedAt: string;
    pendingReview?: boolean;
  },
): MilestoneMentionRow {
  const pendingReview = input.pendingReview ? 1 : 0;
  db.prepare(
    `INSERT OR REPLACE INTO milestone_mentions (milestone_id, meeting_id, mention_type, excerpt, target_date_at_mention, mentioned_at, pending_review)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(input.milestoneId, input.meetingId, input.mentionType, input.excerpt, input.targetDateAtMention, input.mentionedAt, pendingReview);

  return db.prepare(
    "SELECT * FROM milestone_mentions WHERE milestone_id = ? AND meeting_id = ?",
  ).get(input.milestoneId, input.meetingId) as MilestoneMentionRow;
}

export function getMilestoneMentions(db: DatabaseSync, milestoneId: string) {
  return db.prepare(
    `SELECT mm.*, mtg.title AS meeting_title, mtg.date AS meeting_date
     FROM milestone_mentions mm
     JOIN meetings mtg ON mtg.id = mm.meeting_id
     WHERE mm.milestone_id = ?
     ORDER BY mm.mentioned_at ASC`,
  ).all(milestoneId) as (MilestoneMentionRow & { meeting_title: string; meeting_date: string })[];
}

export function getDateSlippage(db: DatabaseSync, milestoneId: string) {
  const mentions = db.prepare(
    `SELECT mm.mentioned_at, mm.target_date_at_mention, mtg.title AS meeting_title
     FROM milestone_mentions mm
     JOIN meetings mtg ON mtg.id = mm.meeting_id
     WHERE mm.milestone_id = ?
     ORDER BY mm.mentioned_at ASC`,
  ).all(milestoneId) as { mentioned_at: string; target_date_at_mention: string | null; meeting_title: string }[];

  const changes: { mentioned_at: string; target_date_at_mention: string | null; meeting_title: string }[] = [];
  for (let i = 0; i < mentions.length; i++) {
    if (i === 0 || mentions[i].target_date_at_mention !== mentions[i - 1].target_date_at_mention) {
      changes.push(mentions[i]);
    }
  }

  return changes.length <= 1 ? [] : changes;
}

interface MilestoneActionItemRow {
  milestone_id: string;
  meeting_id: string;
  item_index: number;
  linked_at: string;
}

export function linkActionItem(db: DatabaseSync, milestoneId: string, meetingId: string, itemIndex: number): MilestoneActionItemRow {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT OR REPLACE INTO milestone_action_items (milestone_id, meeting_id, item_index, linked_at) VALUES (?, ?, ?, ?)`,
  ).run(milestoneId, meetingId, itemIndex, now);

  return db.prepare(
    "SELECT * FROM milestone_action_items WHERE milestone_id = ? AND meeting_id = ? AND item_index = ?",
  ).get(milestoneId, meetingId, itemIndex) as MilestoneActionItemRow;
}

export function unlinkActionItem(db: DatabaseSync, milestoneId: string, meetingId: string, itemIndex: number): void {
  db.prepare(
    "DELETE FROM milestone_action_items WHERE milestone_id = ? AND meeting_id = ? AND item_index = ?",
  ).run(milestoneId, meetingId, itemIndex);
}

export function getMilestoneActionItems(db: DatabaseSync, milestoneId: string) {
  return db.prepare(
    `SELECT mai.*, mtg.title AS meeting_title, mtg.date AS meeting_date
     FROM milestone_action_items mai
     JOIN meetings mtg ON mtg.id = mai.meeting_id
     WHERE mai.milestone_id = ?
     ORDER BY mtg.date ASC, mai.item_index ASC`,
  ).all(milestoneId) as (MilestoneActionItemRow & { meeting_title: string; meeting_date: string })[];
}

export function getMeetingMilestones(db: DatabaseSync, meetingId: string) {
  return db.prepare(
    `SELECT m.id, m.title, m.target_date, m.status
     FROM milestone_mentions mm
     JOIN milestones m ON m.id = mm.milestone_id
     WHERE mm.meeting_id = ?
     ORDER BY m.target_date ASC NULLS LAST`,
  ).all(meetingId) as { id: string; title: string; target_date: string | null; status: string }[];
}

function normalizeTitle(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function bigrams(s: string): Set<string> {
  const set = new Set<string>();
  const lower = s.toLowerCase();
  for (let i = 0; i < lower.length - 1; i++) set.add(lower.slice(i, i + 2));
  return set;
}

export function diceSimilarity(a: string, b: string): number {
  const sa = bigrams(a);
  const sb = bigrams(b);
  if (sa.size === 0 && sb.size === 0) return 1;
  if (sa.size === 0 || sb.size === 0) return 0;
  let intersection = 0;
  for (const bg of sa) if (sb.has(bg)) intersection++;
  return (2 * intersection) / (sa.size + sb.size);
}

const FUZZY_THRESHOLD = 0.7;

interface ExtractedMilestone {
  title: string;
  target_date: string | null;
  status_signal: string;
  excerpt: string;
}

function applyStatusTransition(db: DatabaseSync, milestoneId: string, statusSignal: string): void {
  const milestone = getMilestone(db, milestoneId);
  if (!milestone) return;

  if (statusSignal === "completed" || statusSignal === "deferred") {
    updateMilestone(db, milestoneId, { status: statusSignal });
    return;
  }

  if (milestone.status === "identified") {
    const mentionCount = (db.prepare("SELECT COUNT(*) AS cnt FROM milestone_mentions WHERE milestone_id = ?").get(milestoneId) as { cnt: number }).cnt;
    if (mentionCount >= 2) {
      updateMilestone(db, milestoneId, { status: "tracked" });
    }
  }
}

export function reconcileMilestones(
  db: DatabaseSync,
  clientName: string,
  meetingId: string,
  meetingDate: string,
  extracted: ExtractedMilestone[],
): void {
  const existing = db.prepare("SELECT id, title FROM milestones WHERE client_name = ?").all(clientName) as { id: string; title: string }[];
  const titleMap = new Map(existing.map((m) => [normalizeTitle(m.title), m.id]));

  for (const em of extracted) {
    const normalized = normalizeTitle(em.title);
    const matchId = titleMap.get(normalized);

    if (matchId) {
      addMilestoneMention(db, {
        milestoneId: matchId,
        meetingId,
        mentionType: em.status_signal,
        excerpt: em.excerpt,
        targetDateAtMention: em.target_date,
        mentionedAt: meetingDate,
      });
      applyStatusTransition(db, matchId, em.status_signal);
    } else {
      let fuzzyMatchId: string | undefined;
      for (const [existingNorm, existingId] of titleMap) {
        if (diceSimilarity(normalized, existingNorm) >= FUZZY_THRESHOLD) {
          fuzzyMatchId = existingId;
          break;
        }
      }

      if (fuzzyMatchId) {
        addMilestoneMention(db, {
          milestoneId: fuzzyMatchId,
          meetingId,
          mentionType: em.status_signal,
          excerpt: em.excerpt,
          targetDateAtMention: em.target_date,
          mentionedAt: meetingDate,
          pendingReview: true,
        });
      } else {
        const created = createMilestone(db, {
          clientName,
          title: em.title,
          targetDate: em.target_date ?? undefined,
        });
        titleMap.set(normalized, created.id);
        addMilestoneMention(db, {
          milestoneId: created.id,
          meetingId,
          mentionType: em.status_signal,
          excerpt: em.excerpt,
          targetDateAtMention: em.target_date,
          mentionedAt: meetingDate,
        });
      }
    }
  }
}

export function confirmMilestoneMention(db: DatabaseSync, milestoneId: string, meetingId: string): void {
  db.prepare("UPDATE milestone_mentions SET pending_review = 0 WHERE milestone_id = ? AND meeting_id = ?").run(milestoneId, meetingId);
}

export function rejectMilestoneMention(db: DatabaseSync, milestoneId: string, meetingId: string, clientName: string): MilestoneRow {
  const mention = db.prepare("SELECT * FROM milestone_mentions WHERE milestone_id = ? AND meeting_id = ?").get(milestoneId, meetingId) as MilestoneMentionRow;
  db.prepare("DELETE FROM milestone_mentions WHERE milestone_id = ? AND meeting_id = ?").run(milestoneId, meetingId);

  const newMs = createMilestone(db, {
    clientName,
    title: mention.excerpt,
    targetDate: mention.target_date_at_mention ?? undefined,
  });

  addMilestoneMention(db, {
    milestoneId: newMs.id,
    meetingId: mention.meeting_id,
    mentionType: mention.mention_type,
    excerpt: mention.excerpt,
    targetDateAtMention: mention.target_date_at_mention,
    mentionedAt: mention.mentioned_at,
  });

  return newMs;
}

export function mergeMilestones(db: DatabaseSync, sourceId: string, targetId: string): void {
  db.prepare("UPDATE milestone_mentions SET milestone_id = ? WHERE milestone_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE milestone_action_items SET milestone_id = ? WHERE milestone_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE milestone_messages SET milestone_id = ? WHERE milestone_id = ?").run(targetId, sourceId);
  db.prepare("DELETE FROM milestones WHERE id = ?").run(sourceId);
}

export function listMilestonesByClient(db: DatabaseSync, clientName: string) {
  return db.prepare(
    `SELECT m.*,
       COUNT(mm.meeting_id) AS mention_count,
       MIN(mm.mentioned_at) AS first_mentioned_at,
       SUM(CASE WHEN mm.pending_review = 1 THEN 1 ELSE 0 END) AS pending_review_count
     FROM milestones m
     LEFT JOIN milestone_mentions mm ON mm.milestone_id = m.id
     WHERE m.client_name = ?
     GROUP BY m.id
     ORDER BY m.target_date ASC NULLS LAST`,
  ).all(clientName) as (MilestoneRow & { mention_count: number; first_mentioned_at: string | null; pending_review_count: number })[];
}

interface MilestoneMessageRow {
  id: string;
  milestone_id: string;
  role: string;
  content: string;
  sources: string | null;
  context_stale: number;
  stale_details: string | null;
  created_at: string;
}

interface MilestoneMessage {
  id: string;
  milestone_id: string;
  role: string;
  content: string;
  sources: string | null;
  context_stale: boolean;
  stale_details: string | null;
  created_at: string;
}

function rowToMilestoneMessage(row: MilestoneMessageRow): MilestoneMessage {
  return { ...row, context_stale: row.context_stale === 1 };
}

export function appendMilestoneMessage(
  db: DatabaseSync,
  input: { milestoneId: string; role: string; content: string; sources?: string },
): MilestoneMessage {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO milestone_messages (id, milestone_id, role, content, sources, context_stale, stale_details, created_at)
     VALUES (?, ?, ?, ?, ?, 0, NULL, ?)`,
  ).run(id, input.milestoneId, input.role, input.content, input.sources ?? null, now);
  return rowToMilestoneMessage(db.prepare("SELECT * FROM milestone_messages WHERE id = ?").get(id) as MilestoneMessageRow);
}

export function getMilestoneMessages(db: DatabaseSync, milestoneId: string): MilestoneMessage[] {
  const rows = db.prepare("SELECT * FROM milestone_messages WHERE milestone_id = ? ORDER BY created_at ASC").all(milestoneId) as MilestoneMessageRow[];
  return rows.map(rowToMilestoneMessage);
}

export function clearMilestoneMessages(db: DatabaseSync, milestoneId: string): void {
  db.prepare("DELETE FROM milestone_messages WHERE milestone_id = ?").run(milestoneId);
}

export async function getMilestoneChatContext(
  db: DatabaseSync,
  vdb: VectorDb,
  session: InferenceSession & { _tokenizer: unknown },
  milestoneId: string,
  userMessage: string,
  includeTranscripts: boolean,
  topK: number = 7,
): Promise<{ systemContext: string; meetingIds: string[] }> {
  const milestone = getMilestone(db, milestoneId);
  if (!milestone) return { systemContext: "", meetingIds: [] };

  const mentions = getMilestoneMentions(db, milestoneId);
  const parts: string[] = [`Milestone: ${milestone.title}`];
  if (milestone.description) parts.push(`Description: ${milestone.description}`);
  parts.push(`Target Date: ${milestone.target_date ?? "unscheduled"}`);
  parts.push(`Status: ${milestone.status}`);

  if (mentions.length === 0) {
    return { systemContext: parts.join("\n"), meetingIds: [] };
  }

  const vec = await embed(session as Parameters<typeof embed>[0], userMessage);
  const meetingIds = mentions.map((m) => m.meeting_id);
  const idList = meetingIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(",");
  const table = await vdb.openTable("meeting_vectors");
  const rows = await table
    .search(Array.from(vec))
    .limit(topK)
    .where(`meeting_id IN (${idList})`)
    .toArray() as Array<Record<string, unknown>>;
  const selectedIds = rows.map((r) => r.meeting_id as string);

  if (selectedIds.length > 0) {
    parts.push("\nRelevant Meetings:");
    for (const id of selectedIds) {
      const art = getArtifact(db, id);
      const mention = mentions.find((m) => m.meeting_id === id);
      if (art && mention) {
        const content = includeTranscripts ? `Summary: ${art.summary}\nAction Items: ${art.action_items}` : `Summary: ${art.summary}`;
        parts.push(`- ${mention.meeting_title} (${mention.meeting_date}):\n  ${content.replace(/\n/g, "\n  ")}`);
      }
    }
  }

  return { systemContext: parts.join("\n"), meetingIds: selectedIds };
}
