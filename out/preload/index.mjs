import { contextBridge, ipcRenderer } from "electron";
const CHANNELS = {
  GET_CLIENTS: "get-clients",
  GET_MEETINGS: "get-meetings",
  GET_ARTIFACT: "get-artifact",
  CHAT: "chat"
};
const api = {
  getClients: () => ipcRenderer.invoke(CHANNELS.GET_CLIENTS),
  getMeetings: (filters) => ipcRenderer.invoke(CHANNELS.GET_MEETINGS, filters),
  getArtifact: (meetingId) => ipcRenderer.invoke(CHANNELS.GET_ARTIFACT, meetingId),
  chat: (req) => ipcRenderer.invoke(CHANNELS.CHAT, req)
};
contextBridge.exposeInMainWorld("api", api);
