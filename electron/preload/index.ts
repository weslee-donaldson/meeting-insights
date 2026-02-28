import { contextBridge, ipcRenderer } from "electron";
import { CHANNELS } from "../channels.js";
import type {
  MeetingFilters,
  ChatRequest,
  ElectronAPI,
} from "../channels.js";

const api: ElectronAPI = {
  getClients: () => ipcRenderer.invoke(CHANNELS.GET_CLIENTS),
  getMeetings: (filters: MeetingFilters) =>
    ipcRenderer.invoke(CHANNELS.GET_MEETINGS, filters),
  getArtifact: (meetingId: string) =>
    ipcRenderer.invoke(CHANNELS.GET_ARTIFACT, meetingId),
  chat: (req: ChatRequest) => ipcRenderer.invoke(CHANNELS.CHAT, req),
};

contextBridge.exposeInMainWorld("api", api);
