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
  handleGetTemplates, handleCreateMeeting, handleDeepSearch,
  handleListThreads, handleCreateThread, handleUpdateThread, handleDeleteThread,
  handleGetThreadMeetings, handleGetThreadCandidates, handleEvaluateThreadCandidates,
  handleRemoveThreadMeeting, handleAddThreadMeeting, handleRegenerateThreadSummary, handleGetThreadMessages,
  handleThreadChat, handleClearThreadMessages, handleGetMeetingThreads,
  handleListInsights, handleCreateInsight, handleUpdateInsight, handleDeleteInsight,
  handleGetInsightMeetings, handleDiscoverInsightMeetings, handleGenerateInsight,
  handleGetInsightMessages, handleInsightChat, handleClearInsightMessages, handleRemoveInsightMeeting,
} from "../electron-ui/electron/ipc-handlers.js";
import { getMeeting } from "../core/ingest.js";
import type { LlmAdapter } from "../core/llm-adapter.js";
import type { CreateMeetingRequest, DeepSearchRequest, ThreadChatRequest, InsightChatRequest } from "../electron-ui/electron/channels.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

interface SearchDeps {
  vdb: VectorDb;
  session: InferenceSession & { _tokenizer: unknown };
}

export function createApp(db: Database, dbPath: string, llm?: LlmAdapter, searchDeps?: SearchDeps): Hono {
  const app = new Hono();
  app.use(cors());
  app.use(async (c, next) => {
    const start = Date.now();
    await next();
    const { logApiCall } = await import("../core/logger.js");
    logApiCall(c.req.method, c.req.path, c.res.status, Date.now() - start);
  });

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
    if (!llm) return c.json({ error: "LLM not available" }, 503);
    const req = await c.req.json() as { meetingIds: string[]; question: string };
    try {
      const result = await handleChat(db, llm, req);
      return c.json(result);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 502);
    }
  });

  app.post("/api/chat/conversation", async (c) => {
    if (!llm) return c.json({ error: "LLM not available" }, 503);
    const req = await c.req.json() as { meetingIds: string[]; messages: Array<{ role: "user" | "assistant"; content: string }>; attachments?: { name: string; base64: string; mimeType: string }[]; includeTranscripts?: boolean; template?: string };
    try {
      const result = await handleConversationChat(db, llm, req);
      return c.json(result);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 502);
    }
  });

  app.post("/api/meetings", async (c) => {
    if (!llm) return c.json({ error: "LLM not available" }, 503);
    const req = await c.req.json() as CreateMeetingRequest;
    try {
      const meetingId = await handleCreateMeeting(db, llm, req);
      return c.json({ meetingId }, 201);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 502);
    }
  });

  app.delete("/api/meetings", async (c) => {
    const { ids } = await c.req.json() as { ids: string[] };
    await handleDeleteMeetings(db, searchDeps?.vdb ?? null, ids);
    return c.body(null, 204);
  });

  app.post("/api/meetings/:id/re-extract", async (c) => {
    if (!llm) return c.json({ error: "LLM not available" }, 503);
    const id = c.req.param("id");
    try {
      await handleReExtract(db, llm, id);
      return c.json({});
    } catch (err) {
      return c.json({ error: (err as Error).message }, 502);
    }
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
    const after = c.req.query("after");
    const before = c.req.query("before");
    const filters = (after || before) ? { ...(after ? { after } : {}), ...(before ? { before } : {}) } : undefined;
    return c.json(handleGetClientActionItems(db, name, filters));
  });

  app.get("/api/templates", (c) => {
    return c.json(handleGetTemplates());
  });

  app.post("/api/re-embed", async (c) => {
    if (!searchDeps) return c.json({ error: "Search not available" }, 503);
    const { handleReEmbed } = await import("../electron-ui/electron/ipc-handlers.js");
    const result = await handleReEmbed(db, searchDeps.vdb, searchDeps.session);
    return c.json(result);
  });

  app.post("/api/meetings/:id/re-embed", async (c) => {
    if (!searchDeps) return c.json({ error: "Search not available" }, 503);
    const id = c.req.param("id");
    const { handleUpdateMeetingVector } = await import("../electron-ui/electron/ipc-handlers.js");
    try {
      await handleUpdateMeetingVector(db, searchDeps.vdb, searchDeps.session, id);
      return c.json({});
    } catch (err) {
      return c.json({ error: (err as Error).message }, 404);
    }
  });

  app.post("/api/deep-search", async (c) => {
    if (!llm) return c.json({ error: "LLM not available" }, 503);
    const req = await c.req.json() as DeepSearchRequest;
    try {
      const results = await handleDeepSearch(db, llm, req);
      return c.json(results);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 502);
    }
  });

  app.get("/api/search", async (c) => {
    if (!searchDeps) return c.json({ error: "Search not available" }, 503);
    const q = c.req.query("q") ?? "";
    if (q.length < 2) return c.json({ error: "Query too short" }, 400);
    const client = c.req.query("client");
    const limitParam = c.req.query("limit");
    const { handleSearchMeetings } = await import("../electron-ui/electron/ipc-handlers.js");
    const results = await handleSearchMeetings(db, searchDeps.vdb, searchDeps.session, {
      query: q,
      ...(client ? { client } : {}),
      ...(limitParam ? { limit: Number(limitParam) } : {}),
    });
    return c.json(results);
  });


  // Thread routes
  app.get('/api/threads', (c) => {
    const client = c.req.query('client') ?? '';
    return c.json(handleListThreads(db, client));
  });

  app.post('/api/threads', (c) => {
    const req = c.req.json();
    return req.then((body) => c.json(handleCreateThread(db, body as import('../electron-ui/electron/channels.js').CreateThreadRequest), 201));
  });

  app.put('/api/threads/:id', async (c) => {
    try {
      const body = await c.req.json() as import('../electron-ui/electron/channels.js').UpdateThreadRequest;
      return c.json(handleUpdateThread(db, c.req.param('id'), body));
    } catch (err) {
      console.error("Update thread failed:", err);
      return c.json({ error: (err as Error).message }, 500);
    }
  });

  app.delete('/api/threads/:id', (c) => {
    handleDeleteThread(db, c.req.param('id'));
    return c.json({ ok: true });
  });

  app.get('/api/threads/:id/meetings', (c) => {
    return c.json(handleGetThreadMeetings(db, c.req.param('id')));
  });

  app.get('/api/threads/:id/candidates', async (c) => {
    if (!searchDeps) return c.json({ error: 'Search not available' }, 503);
    const result = await handleGetThreadCandidates(db, searchDeps.vdb, searchDeps.session, c.req.param('id'));
    return c.json(result);
  });

  app.post('/api/threads/:id/evaluate', async (c) => {
    const body = await c.req.json() as { meetingIds: string[]; overrideExisting?: boolean };
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    const result = await handleEvaluateThreadCandidates(db, llm, c.req.param('id'), body.meetingIds, body.overrideExisting ?? false);
    return c.json(result);
  });

  app.delete('/api/threads/:threadId/meetings/:meetingId', (c) => {
    handleRemoveThreadMeeting(db, c.req.param('threadId'), c.req.param('meetingId'));
    return c.json({ ok: true });
  });

  app.post('/api/threads/:threadId/meetings', async (c) => {
    const body = await c.req.json() as { meetingId: string; summary: string; score: number };
    handleAddThreadMeeting(db, c.req.param('threadId'), body.meetingId, body.summary, body.score);
    return c.json({ ok: true });
  });

  app.post('/api/threads/:id/regenerate-summary', async (c) => {
    const body = await c.req.json() as { meetingIds?: string[] };
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    const result = await handleRegenerateThreadSummary(db, llm, c.req.param('id'), body.meetingIds);
    return c.json(result);
  });

  app.get('/api/threads/:id/messages', (c) => {
    return c.json(handleGetThreadMessages(db, c.req.param('id')));
  });

  app.post('/api/threads/:id/chat', async (c) => {
    const body = await c.req.json() as { message: string; includeTranscripts?: boolean };
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    if (!searchDeps) return c.json({ error: 'Search not available' }, 503);
    const req: ThreadChatRequest = { threadId: c.req.param('id'), message: body.message, includeTranscripts: body.includeTranscripts };
    const result = await handleThreadChat(db, llm, searchDeps.vdb, searchDeps.session, req);
    return c.json(result);
  });

  app.delete('/api/threads/:id/messages', (c) => {
    handleClearThreadMessages(db, c.req.param('id'));
    return c.json({ ok: true });
  });

  app.get('/api/meetings/:id/threads', (c) => {
    return c.json(handleGetMeetingThreads(db, c.req.param('id')));
  });

  // Insight routes
  app.get('/api/insights', (c) => {
    const client = c.req.query('client') ?? '';
    return c.json(handleListInsights(db, client));
  });

  app.post('/api/insights', async (c) => {
    const body = await c.req.json() as import('../electron-ui/electron/channels.js').CreateInsightRequest;
    return c.json(handleCreateInsight(db, body), 201);
  });

  app.put('/api/insights/:id', async (c) => {
    const body = await c.req.json() as import('../electron-ui/electron/channels.js').UpdateInsightRequest;
    return c.json(handleUpdateInsight(db, c.req.param('id'), body));
  });

  app.delete('/api/insights/:id', (c) => {
    handleDeleteInsight(db, c.req.param('id'));
    return c.json({ ok: true });
  });

  app.get('/api/insights/:id/meetings', (c) => {
    return c.json(handleGetInsightMeetings(db, c.req.param('id')));
  });

  app.post('/api/insights/:id/discover-meetings', (c) => {
    const meetingIds = handleDiscoverInsightMeetings(db, c.req.param('id'));
    return c.json({ meetingIds });
  });

  app.post('/api/insights/:id/generate', async (c) => {
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    try {
      const result = await handleGenerateInsight(db, llm, c.req.param('id'));
      return c.json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.json({ error: msg }, 500);
    }
  });

  app.get('/api/insights/:id/messages', (c) => {
    return c.json(handleGetInsightMessages(db, c.req.param('id')));
  });

  app.post('/api/insights/:id/chat', async (c) => {
    const body = await c.req.json() as { message: string; includeTranscripts?: boolean };
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    if (!searchDeps) return c.json({ error: 'Search not available' }, 503);
    const req: InsightChatRequest = { insightId: c.req.param('id'), message: body.message, includeTranscripts: body.includeTranscripts };
    const result = await handleInsightChat(db, llm, searchDeps.vdb, searchDeps.session, req);
    return c.json(result);
  });

  app.delete('/api/insights/:id/meetings/:meetingId', (c) => {
    handleRemoveInsightMeeting(db, c.req.param('id'), c.req.param('meetingId'));
    return c.json({ ok: true });
  });

  app.delete('/api/insights/:id/messages', (c) => {
    handleClearInsightMessages(db, c.req.param('id'));
    return c.json({ ok: true });
  });

  return app;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  process.loadEnvFile?.(".env.local");

  const { setLogLevel, setLogDir } = await import("../core/logger.js");
  const envLevel = process.env.MTNINSIGHTS_LOG_LEVEL as "error" | "warn" | "info" | "debug" | undefined;
  if (envLevel) setLogLevel(envLevel);
  setLogDir(resolve(process.env.MTNINSIGHTS_APP_ROOT ?? process.cwd(), "logs/api"));

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

  const { populateFts } = await import("../core/fts.js");
  const db = createDb(DB_PATH);
  migrate(db);
  const ftsCount = (db.prepare("SELECT COUNT(*) as n FROM artifact_fts").get() as { n: number }).n;
  if (ftsCount === 0) populateFts(db);
  const provider = (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as "anthropic" | "local" | "openai" | "stub";
  const llmConfig =
    provider === "local"
      ? { type: "local" as const, baseUrl: process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434", model: process.env.MTNINSIGHTS_LOCAL_MODEL ?? "llama3.1:8b" }
      : provider === "openai"
        ? { type: "openai" as const, apiKey: process.env.OPENAI_API_KEY ?? "", model: process.env.OPENAI_MODEL }
        : provider === "stub"
          ? { type: "stub" as const }
          : { type: "anthropic" as const, apiKey: process.env.ANTHROPIC_API_KEY ?? "", model: process.env.ANTHROPIC_MODEL };
  const llm = createLlmAdapter(llmConfig);

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
