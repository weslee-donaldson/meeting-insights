import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

export function createMilestone(
  db: DatabaseSync,
  input: { clientName: string; title: string; description?: string; targetDate?: string },
) {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO milestones (id, client_name, title, description, target_date, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'identified', ?, ?)`,
  ).run(id, input.clientName, input.title, input.description ?? "", input.targetDate ?? null, now, now);

  return db.prepare("SELECT * FROM milestones WHERE id = ?").get(id) as {
    id: string;
    client_name: string;
    title: string;
    description: string;
    target_date: string | null;
    status: string;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
}
