import { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";

export function createApp(db: Database, dbPath: string): Hono {
  const app = new Hono();

  app.get("/api/debug", (c) => {
    const clientCount = (db.prepare("SELECT COUNT(*) as n FROM clients").get() as { n: number }).n;
    const meetingCount = (db.prepare("SELECT COUNT(*) as n FROM meetings").get() as { n: number }).n;
    return c.json({ db_path: dbPath, client_count: clientCount, meeting_count: meetingCount });
  });

  return app;
}
