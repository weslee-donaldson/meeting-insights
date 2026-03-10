import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

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
