import { createRequire } from "node:module";
import { join, resolve } from "path";
const { app, BrowserWindow, ipcMain } = createRequire(import.meta.url)("electron") as typeof import("electron");
import { createDb, migrate } from "../../core/db.js";
import { CHANNELS } from "../channels.js";
import {
  handleGetClients,
  handleGetMeetings,
  handleGetArtifact,
  handleChat,
  handleSearchMeetings,
} from "../ipc-handlers.js";
import { createLlmAdapter } from "../../core/llm-adapter.js";
import { connectVectorDb } from "../../core/vector-db.js";
import { loadModel } from "../../core/embedder.js";

// Resolve .env.local relative to app root before reading any env vars
const APP_ROOT = resolve(app.getAppPath());
try {
  process.loadEnvFile?.(join(APP_ROOT, ".env.local"));
} catch {
  // .env.local is optional
}

const DB_PATH = process.env.MTNINSIGHTS_DB_PATH
  ? resolve(process.env.MTNINSIGHTS_DB_PATH)
  : join(APP_ROOT, "db/mtninsights.db");

const VECTOR_PATH = process.env.MTNINSIGHTS_VECTOR_PATH
  ? resolve(process.env.MTNINSIGHTS_VECTOR_PATH)
  : join(APP_ROOT, "db/lancedb");

const MODEL_PATH     = join(APP_ROOT, "models/all-MiniLM-L6-v2.onnx");
const TOKENIZER_PATH = join(APP_ROOT, "models/tokenizer.json");

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

console.log("[main] APP_ROOT:", APP_ROOT);
console.log("[main] DB_PATH:", DB_PATH);
console.log("[main] VECTOR_PATH:", VECTOR_PATH);
console.log("[main] PROVIDER:", PROVIDER);

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0b1120",
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

app.whenReady().then(async () => {
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
  ipcMain.handle(CHANNELS.GET_MEETINGS, (_e, opts) => handleGetMeetings(db, opts));
  ipcMain.handle(CHANNELS.GET_ARTIFACT, (_e, meetingId: string) => handleGetArtifact(db, meetingId));
  ipcMain.handle(CHANNELS.CHAT, (_e, opts) => handleChat(db, llm, opts));

  createWindow();

  // Load vector search infrastructure in background — non-blocking
  connectVectorDb(VECTOR_PATH)
    .then((vdb) => loadModel(MODEL_PATH, TOKENIZER_PATH).then((session) => {
      ipcMain.handle(CHANNELS.SEARCH_MEETINGS, (_e, req) =>
        handleSearchMeetings(vdb, session, req),
      );
      console.log("[main] Vector search ready");
    }))
    .catch((err) => {
      console.error("[main] Vector search init failed:", err);
    });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
