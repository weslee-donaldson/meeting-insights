import { createRequire } from "node:module";
const { contextBridge, ipcRenderer } = createRequire(import.meta.url)("electron") as typeof import("electron");
import { CHANNELS } from "../channels.js";
import type {
  MeetingFilters,
  ChatRequest,
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
  search: (req: SearchRequest) => ipcRenderer.invoke(CHANNELS.SEARCH_MEETINGS, req),
  deleteMeetings: (ids: string[]) => ipcRenderer.invoke(CHANNELS.DELETE_MEETINGS, ids),
  reExtract: (meetingId: string) => ipcRenderer.invoke(CHANNELS.RE_EXTRACT, meetingId),
  reassignClient: (meetingId: string, clientName: string) => ipcRenderer.invoke(CHANNELS.REASSIGN_CLIENT, meetingId, clientName),
  setIgnored: (meetingId: string, ignored: boolean) => ipcRenderer.invoke(CHANNELS.SET_IGNORED, meetingId, ignored),
  completeActionItem: (meetingId: string, itemIndex: number, note: string) => ipcRenderer.invoke(CHANNELS.COMPLETE_ACTION_ITEM, meetingId, itemIndex, note),
  getCompletions: (meetingId: string) => ipcRenderer.invoke(CHANNELS.GET_COMPLETIONS, meetingId),
};

contextBridge.exposeInMainWorld("api", api);
