import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import {
  handleGetClients, handleGetMeetings, handleGetArtifact,
  handleDeleteMeetings, handleReExtract, handleReassignClient,
  handleSetIgnored, handleEditActionItem, handleCreateActionItem, handleCompleteActionItem, handleUncompleteActionItem, handleGetCompletions,
  handleGetItemHistory, handleGetMentionStats, handleGetDefaultClient, handleGetClientActionItems,
  handleGetTemplates, handleCreateMeeting,
  handleUploadAsset, handleGetMeetingAssets, handleDeleteAsset, handleGetAssetData,
  handleRenameMeeting,
  handleGetMeetingMessages, handleMeetingChat, handleClearMeetingMessages,
  handleGetTranscript,
} from "../../electron-ui/electron/ipc-handlers.js";
import { getMeeting } from "../../core/ingest.js";
import type { LlmAdapter } from "../../core/llm-adapter.js";
import type { CreateMeetingRequest, EditActionItemFields } from "../../electron-ui/electron/channels.js";
import type { SearchDeps } from "../server.js";

export function registerMeetingRoutes(app: Hono, db: Database, llm?: LlmAdapter, searchDeps?: SearchDeps, assetsDir?: string): void {
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

  app.put("/api/meetings/:id/action-items/:index", async (c) => {
    const id = c.req.param("id");
    const itemIndex = Number(c.req.param("index"));
    const fields = await c.req.json() as EditActionItemFields;
    try {
      handleEditActionItem(db, id, itemIndex, fields);
      return c.body(null, 204);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400);
    }
  });

  app.post("/api/meetings/:id/action-items", async (c) => {
    const id = c.req.param("id");
    const fields = await c.req.json() as EditActionItemFields;
    try {
      handleCreateActionItem(db, id, fields);
      return c.body(null, 204);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400);
    }
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

  app.patch("/api/meetings/:id/title", async (c) => {
    const id = c.req.param("id");
    const { title } = await c.req.json() as { title: string };
    handleRenameMeeting(db, id, title);
    return c.body(null, 204);
  });

  if (assetsDir) {
    app.get("/api/meetings/:id/assets", (c) => {
      const id = c.req.param("id");
      return c.json(handleGetMeetingAssets(db, id));
    });

    app.post("/api/meetings/:id/assets", async (c) => {
      const id = c.req.param("id");
      const { filename, mimeType, base64 } = await c.req.json() as { filename: string; mimeType: string; base64: string };
      const row = handleUploadAsset(db, id, filename, mimeType, base64, assetsDir!);
      return c.json(row, 201);
    });

    app.delete("/api/assets/:id", (c) => {
      const assetId = c.req.param("id");
      handleDeleteAsset(db, assetId, assetsDir!);
      return c.body(null, 204);
    });

    app.get("/api/assets/:id/data", (c) => {
      const assetId = c.req.param("id");
      const result = handleGetAssetData(db, assetId, assetsDir!);
      if (!result) return c.json({ error: "Not found" }, 404);
      return c.json(result);
    });
  }

  app.get("/api/meetings/:id/transcript", (c) => {
    const transcript = handleGetTranscript(db, c.req.param("id"));
    if (transcript === null) return c.json({ error: "Not found" }, 404);
    return c.json({ transcript });
  });

  app.get("/api/meetings/:id/messages", (c) => {
    return c.json(handleGetMeetingMessages(db, c.req.param("id")));
  });

  app.post("/api/meetings/:id/chat", async (c) => {
    if (!llm) return c.json({ error: "LLM not available" }, 503);
    const body = await c.req.json() as { message: string; includeTranscripts?: boolean; template?: string; includeAssets?: boolean; attachments?: { name: string; base64: string; mimeType: string }[]; noteIds?: string[] };
    const result = await handleMeetingChat(db, llm, c.req.param("id"), body.message, body.includeTranscripts ?? false, body.template, body.includeAssets, body.attachments, body.noteIds);
    return c.json(result);
  });

  app.delete("/api/meetings/:id/messages", (c) => {
    handleClearMeetingMessages(db, c.req.param("id"));
    return c.json({ ok: true });
  });
}
