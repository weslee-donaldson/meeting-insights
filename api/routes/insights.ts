import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import {
  handleListInsights, handleCreateInsight, handleUpdateInsight, handleDeleteInsight,
  handleGetInsightMeetings, handleDiscoverInsightMeetings, handleGenerateInsight,
  handleGetInsightMessages, handleInsightChat, handleClearInsightMessages, handleRemoveInsightMeeting,
} from "../../electron-ui/electron/ipc-handlers.js";
import type { LlmAdapter } from "../../core/llm/adapter.js";
import type { CreateInsightRequest, UpdateInsightRequest, InsightChatRequest } from "../../electron-ui/electron/channels.js";
import type { SearchDeps } from "../server.js";
import { resolveClient } from "../../core/clients/resolve.js";

export function registerInsightRoutes(app: Hono, db: Database, llm?: LlmAdapter, searchDeps?: SearchDeps): void {
  app.get('/api/insights', (c) => {
    const clientParam = c.req.query('client') ?? '';
    if (!clientParam) return c.json([]);
    const resolved = resolveClient(db, clientParam);
    if (!resolved) return c.json([]);
    return c.json(handleListInsights(db, resolved.id));
  });

  app.post('/api/insights', async (c) => {
    const body = await c.req.json() as CreateInsightRequest;
    const resolved = body.client_name ? resolveClient(db, body.client_name) : null;
    const input = { ...body, client_id: resolved?.id ?? "" };
    return c.json(handleCreateInsight(db, input), 201);
  });

  app.put('/api/insights/:id', async (c) => {
    const body = await c.req.json() as UpdateInsightRequest;
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
      const body = await c.req.json().catch(() => ({})) as { meetingIds?: string[] };
      const result = await handleGenerateInsight(db, llm, c.req.param('id'), body.meetingIds);
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
    const body = await c.req.json() as { message: string; includeTranscripts?: boolean; attachments?: { name: string; base64: string; mimeType: string }[] };
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    if (!searchDeps) return c.json({ error: 'Search not available' }, 503);
    const req: InsightChatRequest = { insightId: c.req.param('id'), message: body.message, includeTranscripts: body.includeTranscripts, attachments: body.attachments };
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
}
