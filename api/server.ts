import { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import { handleGetClients, handleGetMeetings, handleGetArtifact, handleChat } from "../electron-ui/electron/ipc-handlers.js";
import { getMeeting } from "../core/ingest.js";
import type { LlmAdapter } from "../core/llm-adapter.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

interface SearchDeps {
  vdb: VectorDb;
  session: InferenceSession & { _tokenizer: unknown };
}

export function createApp(db: Database, dbPath: string, llm?: LlmAdapter, searchDeps?: SearchDeps): Hono {
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

  app.get("/api/meetings/:id/artifact", (c) => {
    const id = c.req.param("id");
    const artifact = handleGetArtifact(db, id);
    if (!artifact) return c.json({ error: "Not found" }, 404);
    return c.json(artifact);
  });

  app.post("/api/chat", async (c) => {
    const req = await c.req.json() as { meetingIds: string[]; question: string };
    const result = await handleChat(db, llm!, req);
    return c.json(result);
  });

  app.get("/api/search", async (c) => {
    if (!searchDeps) return c.json({ error: "Search not available" }, 503);
    const q = c.req.query("q") ?? "";
    if (q.length < 2) return c.json({ error: "Query too short" }, 400);
    const client = c.req.query("client");
    const limitParam = c.req.query("limit");
    const { handleSearchMeetings } = await import("../electron-ui/electron/ipc-handlers.js");
    const results = await handleSearchMeetings(searchDeps.vdb, searchDeps.session, {
      query: q,
      ...(client ? { client } : {}),
      ...(limitParam ? { limit: Number(limitParam) } : {}),
    });
    return c.json(results);
  });

  return app;
}
