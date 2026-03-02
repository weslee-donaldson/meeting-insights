import type { DatabaseSync as Database } from "node:sqlite";

export interface AssignResult {
  matched: number;
  client_name: string;
}

export function assignClient(db: Database, identifier: string, clientName: string): AssignResult {
  const clientRow = db.prepare("SELECT name FROM clients WHERE name = ?").get(clientName);
  if (!clientRow) throw new Error(`Client not found: ${clientName}`);

  const byId = db.prepare("SELECT id FROM meetings WHERE id = ?").get(identifier) as { id: string } | undefined;
  const meetingIds: string[] = byId
    ? [byId.id]
    : (db.prepare("SELECT id FROM meetings WHERE LOWER(title) LIKE LOWER(?)").all(`%${identifier}%`) as { id: string }[]).map(r => r.id);

  if (meetingIds.length === 0) throw new Error(`No meeting found for identifier: ${identifier}`);

  const del = db.prepare("DELETE FROM client_detections WHERE meeting_id = ?");
  const ins = db.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, ?, ?)");
  for (const id of meetingIds) {
    del.run(id);
    ins.run(id, clientName, 1.0, "manual");
  }

  return { matched: meetingIds.length, client_name: clientName };
}

const isMain = process.argv[1]?.endsWith("assign-client.ts") || process.argv[1]?.endsWith("assign-client.js");
if (isMain) {
  process.loadEnvFile?.(".env.local");
  const { createDb, migrate } = await import("../core/db.js");
  const DB_PATH = process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db";
  const [identifier, clientName] = process.argv.slice(2);
  if (!identifier || !clientName) {
    console.error("Usage: pnpm assign-client \"<meeting title or ID>\" \"<client name>\"");
    process.exit(1);
  }
  const db = createDb(DB_PATH);
  migrate(db);
  const result = assignClient(db, identifier, clientName);
  console.log(`Updated ${result.matched} meeting(s) → client: ${result.client_name}`);
}
