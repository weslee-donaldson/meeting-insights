import { createRequire } from "node:module";
const { contextBridge, ipcRenderer } = createRequire(import.meta.url)("electron") as typeof import("electron");
import { CHANNELS } from "../channels.js";
import type {
  MeetingFilters,
  ChatRequest,
  ConversationChatRequest,
  SearchRequest,
  CreateMeetingRequest,
  DeepSearchRequest,
  EditActionItemFields,
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
  editActionItem: (meetingId: string, itemIndex: number, fields: EditActionItemFields) => ipcRenderer.invoke(CHANNELS.EDIT_ACTION_ITEM, meetingId, itemIndex, fields),
  createActionItem: (meetingId: string, fields: EditActionItemFields) => ipcRenderer.invoke(CHANNELS.CREATE_ACTION_ITEM, meetingId, fields),
  completeActionItem: (meetingId: string, itemIndex: number, note: string) => ipcRenderer.invoke(CHANNELS.COMPLETE_ACTION_ITEM, meetingId, itemIndex, note),
  getCompletions: (meetingId: string) => ipcRenderer.invoke(CHANNELS.GET_COMPLETIONS, meetingId),
  getItemHistory: (canonicalId: string) => ipcRenderer.invoke(CHANNELS.GET_ITEM_HISTORY, canonicalId),
  getMentionStats: (meetingId: string) => ipcRenderer.invoke(CHANNELS.GET_MENTION_STATS, meetingId),
  getDefaultClient: () => ipcRenderer.invoke(CHANNELS.GET_DEFAULT_CLIENT),
  getGlossary: (clientName: string) => ipcRenderer.invoke(CHANNELS.GLOSSARY, clientName),
  uncompleteActionItem: (_meetingId: string, _itemIndex: number) => Promise.resolve(),
  getClientActionItems: (clientName: string, filters?: { after?: string; before?: string }) => ipcRenderer.invoke(CHANNELS.GET_CLIENT_ACTION_ITEMS, clientName, filters),
  getTemplates: () => ipcRenderer.invoke(CHANNELS.GET_TEMPLATES),
  createMeeting: (req: CreateMeetingRequest) => ipcRenderer.invoke(CHANNELS.CREATE_MEETING, req),
  deepSearch: (req: DeepSearchRequest) => ipcRenderer.invoke(CHANNELS.DEEP_SEARCH, req),
  listThreads: (clientName: string) => ipcRenderer.invoke(CHANNELS.LIST_THREADS, clientName),
  createThread: (req: CreateThreadRequest) => ipcRenderer.invoke(CHANNELS.CREATE_THREAD, req),
  updateThread: (threadId: string, req: UpdateThreadRequest) => ipcRenderer.invoke(CHANNELS.UPDATE_THREAD, threadId, req),
  deleteThread: (threadId: string) => ipcRenderer.invoke(CHANNELS.DELETE_THREAD, threadId),
  getThreadMeetings: (threadId: string) => ipcRenderer.invoke(CHANNELS.GET_THREAD_MEETINGS, threadId),
  getThreadCandidates: (threadId: string) => ipcRenderer.invoke(CHANNELS.GET_THREAD_CANDIDATES, threadId),
  evaluateThreadCandidates: (threadId: string, meetingIds: string[], overrideExisting: boolean) => ipcRenderer.invoke(CHANNELS.EVALUATE_THREAD_CANDIDATES, threadId, meetingIds, overrideExisting),
  removeThreadMeeting: (threadId: string, meetingId: string) => ipcRenderer.invoke(CHANNELS.REMOVE_THREAD_MEETING, threadId, meetingId),
  addThreadMeeting: (threadId: string, meetingId: string, summary: string, score: number) => ipcRenderer.invoke(CHANNELS.ADD_THREAD_MEETING, threadId, meetingId, summary, score),
  regenerateThreadSummary: (threadId: string, meetingIds?: string[]) => ipcRenderer.invoke(CHANNELS.REGENERATE_THREAD_SUMMARY, threadId, meetingIds),
  getThreadMessages: (threadId: string) => ipcRenderer.invoke(CHANNELS.GET_THREAD_MESSAGES, threadId),
  threadChat: (req: ThreadChatRequest) => ipcRenderer.invoke(CHANNELS.THREAD_CHAT, req),
  clearThreadMessages: (threadId: string) => ipcRenderer.invoke(CHANNELS.CLEAR_THREAD_MESSAGES, threadId),
  getMeetingThreads: (meetingId: string) => ipcRenderer.invoke(CHANNELS.GET_MEETING_THREADS, meetingId),
};

contextBridge.exposeInMainWorld("api", api);
