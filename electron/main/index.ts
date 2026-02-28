import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { createDb, migrate } from "../../src/db.js";
import { CHANNELS } from "../channels.js";
import {
  handleGetClients,
  handleGetMeetings,
  handleGetArtifact,
  handleChat,
} from "../ipc-handlers.js";
import { createLlmAdapter } from "../../src/llm-adapter.js";

process.loadEnvFile?.(".env.local");

const DB_PATH = process.env.MTNINSIGHTS_DB_PATH ?? "db/mtninsights.db";
const PROVIDER = (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as
  | "anthropic"
  | "local"
  | "stub";
const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const LOCAL_BASE_URL =
  process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
const LOCAL_MODEL = process.env.MTNINSIGHTS_LOCAL_MODEL ?? "llama3.1:8b";

const isDev =
  process.env.NODE_ENV === "development" || !!process.env["ELECTRON_RENDERER_URL"];

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0f0f0f",
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  const db = createDb(DB_PATH);
  migrate(db);

  const llmConfig =
    PROVIDER === "local"
      ? { type: "local" as const, baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL }
      : PROVIDER === "stub"
        ? { type: "stub" as const }
        : { type: "anthropic" as const, apiKey: API_KEY };

  const llm = createLlmAdapter(llmConfig);

  ipcMain.handle(CHANNELS.GET_CLIENTS, () => handleGetClients(db));
  ipcMain.handle(CHANNELS.GET_MEETINGS, (_e, opts) =>
    handleGetMeetings(db, opts),
  );
  ipcMain.handle(CHANNELS.GET_ARTIFACT, (_e, meetingId: string) =>
    handleGetArtifact(db, meetingId),
  );
  ipcMain.handle(CHANNELS.CHAT, (_e, opts) => handleChat(db, llm, opts));

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
