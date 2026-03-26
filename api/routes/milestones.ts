import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import {
  handleListMilestones, handleCreateMilestone, handleUpdateMilestone, handleDeleteMilestone,
  handleGetMilestoneMentions, handleConfirmMilestoneMention, handleRejectMilestoneMention,
  handleMergeMilestones, handleLinkMilestoneActionItem, handleUnlinkMilestoneActionItem,
  handleGetMilestoneActionItems, handleGetMeetingMilestones, handleGetDateSlippage,
  handleGetMilestoneMessages, handleMilestoneChat, handleClearMilestoneMessages,
} from "../../electron-ui/electron/ipc-handlers.js";
import type { LlmAdapter } from "../../core/llm-adapter.js";
import type { CreateMilestoneRequest, UpdateMilestoneRequest, MilestoneChatRequest } from "../../electron-ui/electron/channels.js";
import type { SearchDeps } from "../server.js";

export function registerMilestoneRoutes(app: Hono, db: Database, llm?: LlmAdapter, searchDeps?: SearchDeps): void {
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
    const body = await c.req.json() as { message: string; includeTranscripts?: boolean; attachments?: { name: string; base64: string; mimeType: string }[] };
    if (!llm) return c.json({ error: 'LLM not available' }, 503);
    if (!searchDeps) return c.json({ error: 'Search not available' }, 503);
    const req: MilestoneChatRequest = { milestoneId: c.req.param('id'), message: body.message, includeTranscripts: body.includeTranscripts, attachments: body.attachments };
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
}
