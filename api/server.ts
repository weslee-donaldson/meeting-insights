import { Hono } from "hono";
import { cors } from "hono/cors";
import type { DatabaseSync as Database } from "node:sqlite";
import { registerDebugRoutes } from "./routes/debug.js";
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
  handleListMilestones, handleCreateMilestone, handleUpdateMilestone, handleDeleteMilestone,
  handleGetMilestoneMentions, handleConfirmMilestoneMention, handleRejectMilestoneMention,
  handleMergeMilestones, handleLinkMilestoneActionItem, handleUnlinkMilestoneActionItem,
  handleGetMilestoneActionItems, handleGetMeetingMilestones, handleGetDateSlippage,
  handleGetMilestoneMessages, handleMilestoneChat, handleClearMilestoneMessages,
} from "../electron-ui/electron/ipc-handlers.js";
import { getMeeting } from "../core/ingest.js";
import type { LlmAdapter } from "../core/llm-adapter.js";
import type { CreateMeetingRequest, DeepSearchRequest, ThreadChatRequest, InsightChatRequest, CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest } from "../electron-ui/electron/channels.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

export interface SearchDeps {
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

  registerDebugRoutes(app, db, dbPath, searchDeps);

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

  // Milestone routes
  app.get('/api/milestones', (c) => {
    const client = c.req.query('client') ?? '';
    return c.json(handleListMilestones(db, client));
  });

  app.post('/api/milestones', async (c) => {
    const body = await c.req.json() as CreateMilestoneRequest;
    return c.json(handleCreateMilestone(db, body), 201);
  });

  app.post('/api/milestones/merge', async (c) => {
    const body = await c.req.json() as { sourceId: string; targetId: string };
    handleMergeMilestones(db, body.sourceId, body.targetId);
    return c.json({ ok: true });
  });

  app.put('/api/milestones/:id', async (c) => {
    const body = await c.req.json() as UpdateMilestoneRequest;
    return c.json(handleUpdateMilestone(db, c.req.param('id'), body));
  });

  app.delete('/api/milestones/:id', (c) => {
    handleDeleteMilestone(db, c.req.param('id'));
    return c.json({ ok: true });
  });

  app.get('/api/milestones/:id/mentions', (c) => {
    return c.json(handleGetMilestoneMentions(db, c.req.param('id')));
  });

  app.get('/api/milestones/:id/slippage', (c) => {
    return c.json(handleGetDateSlippage(db, c.req.param('id')));
  });

  app.get('/api/milestones/:id/messages', (c) => {
    return c.json(handleGetMilestoneMessages(db, c.req.param('id')));
  });

  app.post('/api/milestones/:id/chat', async (c) => {
    const body = await c.req.json() as { message: string; includeTranscripts?: boolean };
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    if (!searchDeps) return c.json({ error: 'Search not available' }, 503);
    const req: MilestoneChatRequest = { milestoneId: c.req.param('id'), message: body.message, includeTranscripts: body.includeTranscripts };
    const result = await handleMilestoneChat(db, llm, searchDeps.vdb, searchDeps.session, req);
    return c.json(result);
  });

  app.delete('/api/milestones/:id/messages', (c) => {
    handleClearMilestoneMessages(db, c.req.param('id'));
    return c.json({ ok: true });
  });

  app.post('/api/milestones/:id/confirm-mention', async (c) => {
    const body = await c.req.json() as { meetingId: string };
    handleConfirmMilestoneMention(db, c.req.param('id'), body.meetingId);
    return c.json({ ok: true });
  });

  app.post('/api/milestones/:id/reject-mention', async (c) => {
    const body = await c.req.json() as { meetingId: string };
    handleRejectMilestoneMention(db, c.req.param('id'), body.meetingId);
    return c.json({ ok: true });
  });

  app.post('/api/milestones/:id/link-action-item', async (c) => {
    const body = await c.req.json() as { meetingId: string; itemIndex: number };
    handleLinkMilestoneActionItem(db, c.req.param('id'), body.meetingId, body.itemIndex);
    return c.json({ ok: true });
  });

  app.delete('/api/milestones/:id/link-action-item', async (c) => {
    const body = await c.req.json() as { meetingId: string; itemIndex: number };
    handleUnlinkMilestoneActionItem(db, c.req.param('id'), body.meetingId, body.itemIndex);
    return c.json({ ok: true });
  });

  app.get('/api/milestones/:id/action-items', (c) => {
    return c.json(handleGetMilestoneActionItems(db, c.req.param('id')));
  });

  app.get('/api/meetings/:id/milestones', (c) => {
    return c.json(handleGetMeetingMilestones(db, c.req.param('id')));
  });

  return app;
}
