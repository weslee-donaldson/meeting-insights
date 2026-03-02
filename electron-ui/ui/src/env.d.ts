import type { ElectronAPI } from "../../electron/channels.js";

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
