import { createRequire } from "node:module";
const { contextBridge, ipcRenderer } = createRequire(import.meta.url)("electron") as typeof import("electron");
import { CHANNELS } from "../channels.js";
import type {
  MeetingFilters,
  ChatRequest,
  ConversationChatRequest,
  SearchRequest,
  ElectronAPI,
} from "../channels.js";

const api: ElectronAPI = {
  getClients: () => ipcRenderer.invoke(CHANNELS.GET_CLIENTS),
  getMeetings: (filters: MeetingFilters) =>
    ipcRenderer.invoke(CHANNELS.GET_MEETINGS, filters),
  getArtifact: (meetingId: string) =>
    ipcRenderer.invoke(CHANNELS.GET_ARTIFACT, meetingId),
  chat: (req: ChatRequest) => ipcRenderer.invoke(CHANNELS.CHAT, req),
  conversationChat: (req: ConversationChatRequest) => ipcRenderer.invoke(CHANNELS.CONVERSATION_CHAT, req),
  search: (req: SearchRequest) => ipcRenderer.invoke(CHANNELS.SEARCH_MEETINGS, req),
  deleteMeetings: (ids: string[]) => ipcRenderer.invoke(CHANNELS.DELETE_MEETINGS, ids),
  reExtract: (meetingId: string) => ipcRenderer.invoke(CHANNELS.RE_EXTRACT, meetingId),
  reEmbedMeeting: (meetingId: string) => ipcRenderer.invoke(CHANNELS.RE_EMBED_MEETING, meetingId),
  reassignClient: (meetingId: string, clientName: string) => ipcRenderer.invoke(CHANNELS.REASSIGN_CLIENT, meetingId, clientName),
  setIgnored: (meetingId: string, ignored: boolean) => ipcRenderer.invoke(CHANNELS.SET_IGNORED, meetingId, ignored),
  completeActionItem: (meetingId: string, itemIndex: number, note: string) => ipcRenderer.invoke(CHANNELS.COMPLETE_ACTION_ITEM, meetingId, itemIndex, note),
  getCompletions: (meetingId: string) => ipcRenderer.invoke(CHANNELS.GET_COMPLETIONS, meetingId),
  getItemHistory: (canonicalId: string) => ipcRenderer.invoke(CHANNELS.GET_ITEM_HISTORY, canonicalId),
  getMentionStats: (meetingId: string) => ipcRenderer.invoke(CHANNELS.GET_MENTION_STATS, meetingId),
  getDefaultClient: () => ipcRenderer.invoke(CHANNELS.GET_DEFAULT_CLIENT),
  uncompleteActionItem: (_meetingId: string, _itemIndex: number) => Promise.resolve(),
  getClientActionItems: (clientName: string) => ipcRenderer.invoke(CHANNELS.GET_CLIENT_ACTION_ITEMS, clientName),
  getTemplates: () => ipcRenderer.invoke(CHANNELS.GET_TEMPLATES),
};

contextBridge.exposeInMainWorld("api", api);
