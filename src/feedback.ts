import type { Database } from "better-sqlite3";

export function overrideClient(db: Database, meetingId: string, clientName: string): void {
  db.prepare("UPDATE client_detections SET client_name = ?, confidence = 1.0, method = 'override' WHERE meeting_id = ?").run(
    clientName,
    meetingId,
  );
}

export function overrideTag(db: Database, clusterId: string, tags: string[]): void {
  db.prepare("UPDATE clusters SET generated_tags = ? WHERE cluster_id = ?").run(JSON.stringify(tags), clusterId);
}

export function flagExtraction(db: Database, meetingId: string): void {
  db.prepare("UPDATE artifacts SET needs_reextraction = 1 WHERE meeting_id = ?").run(meetingId);
}
