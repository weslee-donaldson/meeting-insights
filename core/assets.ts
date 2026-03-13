import type { DatabaseSync as Database } from "node:sqlite";

export interface AssetRow {
  id: string;
  meeting_id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export function getAssets(db: Database, meetingId: string): AssetRow[] {
  return db.prepare("SELECT id, meeting_id, filename, mime_type, file_size, storage_path, created_at FROM assets WHERE meeting_id = ? ORDER BY created_at").all(meetingId) as AssetRow[];
}
