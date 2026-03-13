import type { DatabaseSync as Database } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

export interface AssetRow {
  id: string;
  meeting_id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export function storeAsset(db: Database, meetingId: string, filename: string, mimeType: string, data: Buffer, assetsDir: string): AssetRow {
  const id = randomUUID();
  const storagePath = `${meetingId}/${id}-${filename}`;
  const fullPath = join(assetsDir, storagePath);
  mkdirSync(join(assetsDir, meetingId), { recursive: true });
  writeFileSync(fullPath, data);
  const createdAt = new Date().toISOString();
  db.prepare("INSERT INTO assets (id, meeting_id, filename, mime_type, file_size, storage_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, meetingId, filename, mimeType, data.length, storagePath, createdAt);
  return { id, meeting_id: meetingId, filename, mime_type: mimeType, file_size: data.length, storage_path: storagePath, created_at: createdAt };
}

export function deleteAsset(db: Database, assetId: string, assetsDir: string): void {
  const row = db.prepare("SELECT storage_path FROM assets WHERE id = ?").get(assetId) as { storage_path: string } | undefined;
  if (!row) return;
  try { unlinkSync(join(assetsDir, row.storage_path)); } catch {}
  db.prepare("DELETE FROM assets WHERE id = ?").run(assetId);
}

export function getAssets(db: Database, meetingId: string): AssetRow[] {
  return db.prepare("SELECT id, meeting_id, filename, mime_type, file_size, storage_path, created_at FROM assets WHERE meeting_id = ? ORDER BY created_at").all(meetingId) as AssetRow[];
}
