import { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import { handleGetClients, handleGetMeetings } from "../electron-ui/electron/ipc-handlers.js";
import { getMeeting } from "../core/ingest.js";

export function createApp(db: Database, dbPath: string): Hono {
  const app = new Hono();

  app.get("/api/debug", (c) => {
    const clientCount = (db.prepare("SELECT COUNT(*) as n FROM clients").get() as { n: number }).n;
    const meetingCount = (db.prepare("SELECT COUNT(*) as n FROM meetings").get() as { n: number }).n;
    return c.json({ db_path: dbPath, client_count: clientCount, meeting_count: meetingCount });
  });

  app.get("/api/clients", (c) => {
    return c.json(handleGetClients(db));
  });

  app.get("/api/meetings", (c) => {
    const client = c.req.query("client");
    const after = c.req.query("after");
    const before = c.req.query("before");
    const filters = {
      ...(client ? { client } : {}),
      ...(after ? { after } : {}),
      ...(before ? { before } : {}),
    };
    return c.json(handleGetMeetings(db, filters));
  });

  app.get("/api/meetings/:id", (c) => {
    const id = c.req.param("id");
    const meeting = getMeeting(db, id);
    if (!meeting) return c.json({ error: "Not found" }, 404);
    return c.json(meeting);
  });

  return app;
}
