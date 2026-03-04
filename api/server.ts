import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import type { DatabaseSync as Database } from "node:sqlite";
import {
  handleGetClients, handleGetMeetings, handleGetArtifact, handleChat, handleConversationChat,
  handleDeleteMeetings, handleReExtract, handleReassignClient,
  handleSetIgnored, handleCompleteActionItem, handleUncompleteActionItem, handleGetCompletions,
  handleGetItemHistory, handleGetMentionStats, handleGetDefaultClient, handleGetClientActionItems,
  handleGetTemplates,
} from "../electron-ui/electron/ipc-handlers.js";
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
  app.use(cors());

  app.get("/api/debug", (c) => {
    const clientCount = (db.prepare("SELECT COUNT(*) as n FROM clients").get() as { n: number }).n;
    const meetingCount = (db.prepare("SELECT COUNT(*) as n FROM meetings").get() as { n: number }).n;
    return c.json({ db_path: dbPath, client_count: clientCount, meeting_count: meetingCount });
  });

  app.get("/api/clients", (c) => {
    return c.json(handleGetClients(db));
  });

  app.get("/api/default-client", (c) => {
    return c.json(handleGetDefaultClient(db));
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

  app.post("/api/chat/conversation", async (c) => {
    const req = await c.req.json() as { meetingIds: string[]; messages: Array<{ role: "user" | "assistant"; content: string }>; attachments?: { name: string; base64: string; mimeType: string }[]; includeTranscripts?: boolean };
    const result = await handleConversationChat(db, llm!, req);
    return c.json(result);
  });

  app.delete("/api/meetings", async (c) => {
    const { ids } = await c.req.json() as { ids: string[] };
    handleDeleteMeetings(db, ids);
    return c.body(null, 204);
  });

  app.post("/api/meetings/:id/re-extract", async (c) => {
    const id = c.req.param("id");
    await handleReExtract(db, llm!, id);
    return c.json({});
  });

  app.post("/api/meetings/:id/client", async (c) => {
    const id = c.req.param("id");
    const { clientName } = await c.req.json() as { clientName: string };
    handleReassignClient(db, id, clientName);
    return c.body(null, 204);
  });

  app.post("/api/meetings/:id/ignored", async (c) => {
    const id = c.req.param("id");
    const { ignored } = await c.req.json() as { ignored: boolean };
    handleSetIgnored(db, id, ignored);
    return c.body(null, 204);
  });

  app.post("/api/meetings/:id/action-items/:index/complete", async (c) => {
    const id = c.req.param("id");
    const itemIndex = Number(c.req.param("index"));
    const { note } = await c.req.json() as { note: string };
    handleCompleteActionItem(db, id, itemIndex, note);
    return c.body(null, 204);
  });

  app.delete("/api/meetings/:id/action-items/:index/complete", (c) => {
    const id = c.req.param("id");
    const itemIndex = Number(c.req.param("index"));
    handleUncompleteActionItem(db, id, itemIndex);
    return c.body(null, 204);
  });

  app.get("/api/meetings/:id/completions", (c) => {
    const id = c.req.param("id");
    return c.json(handleGetCompletions(db, id));
  });

  app.get("/api/items/:canonicalId/history", (c) => {
    const canonicalId = c.req.param("canonicalId");
    return c.json(handleGetItemHistory(db, canonicalId));
  });

  app.get("/api/meetings/:id/mention-stats", (c) => {
    const id = c.req.param("id");
    return c.json(handleGetMentionStats(db, id));
  });

  app.get("/api/clients/:name/action-items", (c) => {
    const name = c.req.param("name");
    return c.json(handleGetClientActionItems(db, name));
  });

  app.get("/api/templates", (c) => {
    return c.json(handleGetTemplates());
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

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  process.loadEnvFile?.(".env.local");

  const { createDb, migrate } = await import("../core/db.js");
  const { createLlmAdapter } = await import("../core/llm-adapter.js");
  const { connectVectorDb } = await import("../core/vector-db.js");
  const { loadModel } = await import("../core/embedder.js");

  const APP_ROOT = resolve(process.env.MTNINSIGHTS_APP_ROOT ?? process.cwd());
  const DB_PATH = process.env.MTNINSIGHTS_DB_PATH
    ? resolve(process.env.MTNINSIGHTS_DB_PATH)
    : join(APP_ROOT, "db/mtninsights.db");
  const VECTOR_PATH = process.env.MTNINSIGHTS_VECTOR_PATH
    ? resolve(process.env.MTNINSIGHTS_VECTOR_PATH)
    : join(APP_ROOT, "db/lancedb");
  const PORT = Number(process.env.PORT ?? 3000);

  const db = createDb(DB_PATH);
  migrate(db);
  const llm = createLlmAdapter({ type: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  let searchDeps: SearchDeps | undefined;
  try {
    const vdb = await connectVectorDb(VECTOR_PATH);
    const session = await loadModel(
      join(APP_ROOT, "models/all-MiniLM-L6-v2.onnx"),
      join(APP_ROOT, "models/tokenizer.json"),
    );
    searchDeps = { vdb, session };
    console.log("[api] Search deps loaded");
  } catch (err) {
    console.warn("[api] Search unavailable:", (err as Error).message);
  }

  const app = createApp(db, DB_PATH, llm, searchDeps);
  serve({ fetch: app.fetch, port: PORT });
  console.log(`[api] Listening on http://localhost:${PORT}`);
}
