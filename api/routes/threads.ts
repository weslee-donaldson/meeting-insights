import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import {
  handleListThreads, handleCreateThread, handleUpdateThread, handleDeleteThread,
  handleGetThreadMeetings, handleGetThreadCandidates, handleEvaluateThreadCandidates,
  handleRemoveThreadMeeting, handleAddThreadMeeting, handleRegenerateThreadSummary, handleGetThreadMessages,
  handleThreadChat, handleClearThreadMessages, handleGetMeetingThreads,
} from "../../electron-ui/electron/ipc-handlers.js";
import type { LlmAdapter } from "../../core/llm/adapter.js";
import type { CreateThreadRequest, UpdateThreadRequest, ThreadChatRequest } from "../../electron-ui/electron/channels.js";
import type { SearchDeps } from "../server.js";
import { resolveClient } from "../../core/resolve-client.js";

export function registerThreadRoutes(app: Hono, db: Database, llm?: LlmAdapter, searchDeps?: SearchDeps): void {
  app.get('/api/threads', (c) => {
    const clientParam = c.req.query('client') ?? '';
    if (!clientParam) return c.json([]);
    const resolved = resolveClient(db, clientParam);
    if (!resolved) return c.json([]);
    return c.json(handleListThreads(db, resolved.id));
  });

  app.post('/api/threads', async (c) => {
    const body = await c.req.json() as CreateThreadRequest;
    const resolved = body.client_name ? resolveClient(db, body.client_name) : null;
    const input = { ...body, client_id: resolved?.id ?? "" };
    return c.json(handleCreateThread(db, input), 201);
  });

  app.put('/api/threads/:id', async (c) => {
    try {
      const body = await c.req.json() as UpdateThreadRequest;
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
    const body = await c.req.json() as { message: string; includeTranscripts?: boolean; attachments?: { name: string; base64: string; mimeType: string }[] };
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    if (!searchDeps) return c.json({ error: 'Search not available' }, 503);
    const req: ThreadChatRequest = { threadId: c.req.param('id'), message: body.message, includeTranscripts: body.includeTranscripts, attachments: body.attachments };
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
}
