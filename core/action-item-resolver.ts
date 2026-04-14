import type { DatabaseSync as Database } from "node:sqlite";

export interface ResolvedItem {
  short_id: string;
  meeting_id: string;
  item_index: number;
}

export interface ResolveResult {
  resolved: ResolvedItem[];
  not_found: string[];
}

export function resolveShortIds(db: Database, shortIds: string[]): ResolveResult {
  const unique = [...new Set(shortIds)];
  if (unique.length === 0) return { resolved: [], not_found: [] };

  const wanted = new Set(unique);
  const resolved: ResolvedItem[] = [];

  const rows = db.prepare("SELECT meeting_id, action_items FROM artifacts").all() as { meeting_id: string; action_items: string }[];

  for (const row of rows) {
    let items: { short_id?: string }[];
    try {
      items = JSON.parse(row.action_items);
    } catch {
      continue;
    }

    for (let i = 0; i < items.length; i++) {
      const sid = items[i].short_id;
      if (sid && wanted.has(sid)) {
        resolved.push({ short_id: sid, meeting_id: row.meeting_id, item_index: i });
        wanted.delete(sid);
      }
    }
  }

  return {
    resolved,
    not_found: unique.filter((id) => !resolved.some((r) => r.short_id === id)),
  };
}
