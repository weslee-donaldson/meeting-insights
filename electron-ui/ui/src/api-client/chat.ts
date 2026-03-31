import type { ChatRequest, ConversationChatRequest, SearchRequest, DeepSearchRequest } from "../../../electron/channels.js";
import { API_BASE, fetchJsonOrNull, jsonPost } from "./base.js";

export const chatMethods = {
  chat: (req: ChatRequest) =>
    jsonPost(`${API_BASE}/api/chat`, req),

  conversationChat: (req: ConversationChatRequest) =>
    jsonPost(`${API_BASE}/api/chat/conversation`, req),

  search: (req: SearchRequest) => {
    const params = new URLSearchParams({ q: req.query });
    if (req.client) params.set("client", req.client);
    if (req.date_after) params.set("date_after", req.date_after);
    if (req.date_before) params.set("date_before", req.date_before);
    if (req.limit != null) params.set("limit", String(req.limit));
    if (req.searchFields && req.searchFields.length > 0) params.set("searchFields", req.searchFields.join(","));
    return fetchJsonOrNull(`${API_BASE}/api/search?${params}`).then((r) => r ?? []);
  },

  deepSearch: (req: DeepSearchRequest) =>
    jsonPost(`${API_BASE}/api/deep-search`, req),
};
