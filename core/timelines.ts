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
