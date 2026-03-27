import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import {
  handleChat, handleConversationChat, handleDeepSearch,
} from "../../electron-ui/electron/ipc-handlers.js";
import type { LlmAdapter } from "../../core/llm-adapter.js";
import type { DeepSearchRequest } from "../../electron-ui/electron/channels.js";
import type { SearchDeps } from "../server.js";

export function registerSearchRoutes(app: Hono, db: Database, llm?: LlmAdapter, searchDeps?: SearchDeps): void {
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
    console.log("[api] POST /api/chat/conversation hit, llm=%s", llm ? "present" : "MISSING");
    if (!llm) return c.json({ error: "LLM not available" }, 503);
    const req = await c.req.json() as { meetingIds: string[]; messages: Array<{ role: "user" | "assistant"; content: string }>; attachments?: { name: string; base64: string; mimeType: string }[]; includeTranscripts?: boolean; template?: string; contextMode?: "full" | "distilled" };
    try {
      console.log("[api] calling handleConversationChat meetingIds=%d messages=%d", req.meetingIds.length, req.messages.length);
      const result = await handleConversationChat(db, llm, req);
      console.log("[api] handleConversationChat returned ok");
      return c.json(result);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 502);
    }
  });

  app.post("/api/re-embed", async (c) => {
    if (!searchDeps) return c.json({ error: "Search not available" }, 503);
    const { handleReEmbed } = await import("../../electron-ui/electron/ipc-handlers.js");
    const result = await handleReEmbed(db, searchDeps.vdb, searchDeps.session);
    return c.json(result);
  });

  app.post("/api/meetings/:id/re-embed", async (c) => {
    if (!searchDeps) return c.json({ error: "Search not available" }, 503);
    const id = c.req.param("id");
    const { handleUpdateMeetingVector } = await import("../../electron-ui/electron/ipc-handlers.js");
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
    const dateAfter = c.req.query("date_after");
    const dateBefore = c.req.query("date_before");
    const searchFieldsParam = c.req.query("searchFields");
    const searchFields = searchFieldsParam ? searchFieldsParam.split(",") : undefined;
    const { handleSearchMeetings } = await import("../../electron-ui/electron/ipc-handlers.js");
    const results = await handleSearchMeetings(db, searchDeps.vdb, searchDeps.session, {
      query: q,
      ...(client ? { client } : {}),
      ...(limitParam ? { limit: Number(limitParam) } : {}),
      ...(dateAfter ? { date_after: dateAfter } : {}),
      ...(dateBefore ? { date_before: dateBefore } : {}),
      ...(searchFields ? { searchFields } : {}),
    });
    return c.json(results);
  });
}
