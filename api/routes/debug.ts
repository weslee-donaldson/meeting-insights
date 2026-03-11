import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import type { SearchDeps } from "../server.js";

export function registerDebugRoutes(app: Hono, db: Database, dbPath: string, searchDeps?: SearchDeps): void {
  app.get("/api/debug", async (c) => {
    const clientCount = (db.prepare("SELECT COUNT(*) as n FROM clients").get() as { n: number }).n;
    const meetingCount = (db.prepare("SELECT COUNT(*) as n FROM meetings").get() as { n: number }).n;
    let vectorCount: number | null = null;
    if (searchDeps) {
      try {
        const table = await searchDeps.vdb.openTable("meeting_vectors");
        vectorCount = await table.countRows();
      } catch {
        vectorCount = 0;
      }
    }
    return c.json({ db_path: dbPath, client_count: clientCount, meeting_count: meetingCount, vector_count: vectorCount });
  });
}
