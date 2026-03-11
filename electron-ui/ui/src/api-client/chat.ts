import type { ChatRequest, ConversationChatRequest, SearchRequest, DeepSearchRequest } from "../../../electron/channels.js";
import { API_BASE } from "./base.js";

export const chatMethods = {
  chat: (req: ChatRequest) =>
    fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  conversationChat: (req: ConversationChatRequest) =>
    fetch(`${API_BASE}/api/chat/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),

  search: (req: SearchRequest) => {
    const params = new URLSearchParams({ q: req.query });
    if (req.client) params.set("client", req.client);
    if (req.date_after) params.set("date_after", req.date_after);
    if (req.date_before) params.set("date_before", req.date_before);
    if (req.limit != null) params.set("limit", String(req.limit));
    return fetch(`${API_BASE}/api/search?${params}`).then((r) => r.ok ? r.json() : []);
  },

  deepSearch: (req: DeepSearchRequest) =>
    fetch(`${API_BASE}/api/deep-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }).then(async (r) => {
      if (!r.ok) {
        const body = await r.json() as { error: string };
        throw new Error(body.error);
      }
      return r.json();
    }),
};
