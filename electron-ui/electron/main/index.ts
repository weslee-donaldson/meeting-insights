import { createRequire } from "node:module";
import { join, resolve } from "path";
const { app, BrowserWindow, ipcMain } = createRequire(import.meta.url)("electron") as typeof import("electron");
import { createDb, migrate } from "../../../core/db.js";
import { resolveDataPaths } from "../../../core/paths.js";
import { CHANNELS } from "../channels.js";
import {
  handleGetClients,
  handleGetMeetings,
  handleGetArtifact,
  handleChat,
  handleConversationChat,
  handleSearchMeetings,
  handleDeleteMeetings,
  handleReExtract,
  handleReassignClient,
  handleSetIgnored,
  handleEditActionItem,
  handleCreateActionItem,
  handleCompleteActionItem,
  handleUncompleteActionItem,
  handleGetCompletions,
  handleGetItemHistory,
  handleGetMentionStats,
  handleGetDefaultClient,
  handleGetGlossary,
  handleGetClientActionItems,
  handleGetTemplates,
  handleUpdateMeetingVector,
  handleCreateMeeting,
  handleDeepSearch,
  handleListThreads,
  handleCreateThread,
  handleUpdateThread,
  handleDeleteThread,
  handleGetThreadMeetings,
  handleEvaluateThreadCandidates,
  handleRemoveThreadMeeting, handleAddThreadMeeting,
  handleRegenerateThreadSummary,
  handleGetThreadMessages,
  handleThreadChat,
  handleClearThreadMessages,
  handleGetMeetingThreads,
  handleUploadAsset,
  handleGetMeetingAssets,
  handleDeleteAsset,
  handleGetAssetData,
  handleRenameMeeting,
  handleSplitMeeting,
  handleGetMeetingLineage,
} from "../ipc-handlers.js";
import { createLlmAdapter } from "../../../core/llm/adapter.js";
import { ensureFtsCurrent } from "../../../core/fts.js";
import { connectVectorDb } from "../../../core/vector-db.js";
import { loadModel } from "../../../core/embedder.js";

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
const DATA_DIR       = process.env.MTNINSIGHTS_DATA_DIR
  ? resolve(process.env.MTNINSIGHTS_DATA_DIR)
  : join(APP_ROOT, "data");
const ASSETS_DIR     = resolveDataPaths(DATA_DIR).assets;

const PROVIDER = (process.env.MTNINSIGHTS_LLM_PROVIDER ?? "anthropic") as
  | "anthropic"
  | "local"
  | "openai"
  | "stub"
  | "claudecli"
  | "local-claudeapi";
const API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";
const LOCAL_BASE_URL =
  process.env.MTNINSIGHTS_LOCAL_BASE_URL ?? "http://localhost:11434";
const LOCAL_MODEL = process.env.MTNINSIGHTS_LOCAL_MODEL ?? "llama3.1:8b";
const CLAUDEAPI_URL = process.env.MTNINSIGHTS_CLAUDEAPI_URL ?? "http://localhost:8100";

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

  ensureFtsCurrent(db);

  const llmConfig =
    PROVIDER === "local"
      ? { type: "local" as const, baseUrl: LOCAL_BASE_URL, model: LOCAL_MODEL }
      : PROVIDER === "openai"
        ? { type: "openai" as const, apiKey: OPENAI_KEY, model: process.env.OPENAI_MODEL }
        : PROVIDER === "claudecli"
          ? { type: "claudecli" as const }
          : PROVIDER === "local-claudeapi"
          ? { type: "local-claudeapi" as const, baseUrl: CLAUDEAPI_URL }
          : PROVIDER === "stub"
          ? { type: "stub" as const }
          : { type: "anthropic" as const, apiKey: API_KEY, model: process.env.ANTHROPIC_MODEL };

  const llm = createLlmAdapter(llmConfig);

  ipcMain.handle(CHANNELS.GET_CLIENTS, () => handleGetClients(db));
  ipcMain.handle(CHANNELS.GET_MEETINGS, (_e, opts) => handleGetMeetings(db, opts));
  ipcMain.handle(CHANNELS.GET_ARTIFACT, (_e, meetingId: string) => handleGetArtifact(db, meetingId));
  ipcMain.handle(CHANNELS.CHAT, (_e, opts) => handleChat(db, llm, opts));
  ipcMain.handle(CHANNELS.CONVERSATION_CHAT, (_e, opts) => handleConversationChat(db, llm, opts));
  let vdbRef: import("../../../core/vector-db.js").VectorDb | null = null;
  ipcMain.handle(CHANNELS.DELETE_MEETINGS, (_e, ids: string[]) => handleDeleteMeetings(db, vdbRef, ids, ASSETS_DIR));
  ipcMain.handle(CHANNELS.RE_EXTRACT, (_e, meetingId: string) => handleReExtract(db, llm, meetingId));
  ipcMain.handle(CHANNELS.REASSIGN_CLIENT, (_e, meetingId: string, clientName: string) => handleReassignClient(db, meetingId, clientName));
  ipcMain.handle(CHANNELS.SET_IGNORED, (_e, meetingId: string, ignored: boolean) => handleSetIgnored(db, meetingId, ignored));
  ipcMain.handle(CHANNELS.EDIT_ACTION_ITEM, (_e, meetingId: string, itemIndex: number, fields) => handleEditActionItem(db, meetingId, itemIndex, fields));
  ipcMain.handle(CHANNELS.CREATE_ACTION_ITEM, (_e, meetingId: string, fields) => handleCreateActionItem(db, meetingId, fields));
  ipcMain.handle(CHANNELS.COMPLETE_ACTION_ITEM, (_e, meetingId: string, itemIndex: number, note: string) => handleCompleteActionItem(db, meetingId, itemIndex, note));
  ipcMain.handle(CHANNELS.GET_COMPLETIONS, (_e, meetingId: string) => handleGetCompletions(db, meetingId));
  ipcMain.handle(CHANNELS.GET_ITEM_HISTORY, (_e, canonicalId: string) => handleGetItemHistory(db, canonicalId));
  ipcMain.handle(CHANNELS.GET_MENTION_STATS, (_e, meetingId: string) => handleGetMentionStats(db, meetingId));
  ipcMain.handle(CHANNELS.GET_DEFAULT_CLIENT, () => handleGetDefaultClient(db));
  ipcMain.handle(CHANNELS.GLOSSARY, (_e, clientName: string) => handleGetGlossary(db, clientName));
  ipcMain.handle(CHANNELS.GET_CLIENT_ACTION_ITEMS, (_e, clientName: string, filters?: { after?: string; before?: string }) => handleGetClientActionItems(db, clientName, filters));
  ipcMain.handle(CHANNELS.GET_TEMPLATES, () => handleGetTemplates());
  ipcMain.handle(CHANNELS.CREATE_MEETING, (_e, req) => handleCreateMeeting(db, llm, req).then((meetingId) => ({ meetingId })));
  ipcMain.handle(CHANNELS.DEEP_SEARCH, (_e, req) => handleDeepSearch(db, llm, req));
  ipcMain.handle(CHANNELS.LIST_THREADS, (_e, clientName: string) => handleListThreads(db, clientName));
  ipcMain.handle(CHANNELS.CREATE_THREAD, (_e, req) => handleCreateThread(db, req));
  ipcMain.handle(CHANNELS.UPDATE_THREAD, (_e, threadId: string, req) => handleUpdateThread(db, threadId, req));
  ipcMain.handle(CHANNELS.DELETE_THREAD, (_e, threadId: string) => handleDeleteThread(db, threadId));
  ipcMain.handle(CHANNELS.GET_THREAD_MEETINGS, (_e, threadId: string) => handleGetThreadMeetings(db, threadId));
  ipcMain.handle(CHANNELS.EVALUATE_THREAD_CANDIDATES, (_e, threadId: string, meetingIds: string[], overrideExisting: boolean) => handleEvaluateThreadCandidates(db, llm, threadId, meetingIds, overrideExisting));
  ipcMain.handle(CHANNELS.REMOVE_THREAD_MEETING, (_e, threadId: string, meetingId: string) => handleRemoveThreadMeeting(db, threadId, meetingId));
  ipcMain.handle(CHANNELS.ADD_THREAD_MEETING, (_e, threadId: string, meetingId: string, summary: string, score: number) => handleAddThreadMeeting(db, threadId, meetingId, summary, score));
  ipcMain.handle(CHANNELS.REGENERATE_THREAD_SUMMARY, (_e, threadId: string, meetingIds?: string[]) => handleRegenerateThreadSummary(db, llm, threadId, meetingIds));
  ipcMain.handle(CHANNELS.GET_THREAD_MESSAGES, (_e, threadId: string) => handleGetThreadMessages(db, threadId));
  ipcMain.handle(CHANNELS.CLEAR_THREAD_MESSAGES, (_e, threadId: string) => handleClearThreadMessages(db, threadId));
  ipcMain.handle(CHANNELS.GET_MEETING_THREADS, (_e, meetingId: string) => handleGetMeetingThreads(db, meetingId));
  ipcMain.handle(CHANNELS.UPLOAD_ASSET, (_e, meetingId: string, filename: string, mimeType: string, base64: string) => handleUploadAsset(db, meetingId, filename, mimeType, base64, ASSETS_DIR));
  ipcMain.handle(CHANNELS.GET_MEETING_ASSETS, (_e, meetingId: string) => handleGetMeetingAssets(db, meetingId));
  ipcMain.handle(CHANNELS.DELETE_ASSET, (_e, assetId: string) => handleDeleteAsset(db, assetId, ASSETS_DIR));
  ipcMain.handle(CHANNELS.GET_ASSET_DATA, (_e, assetId: string) => handleGetAssetData(db, assetId, ASSETS_DIR));
  ipcMain.handle(CHANNELS.RENAME_MEETING, (_e, meetingId: string, newTitle: string) => handleRenameMeeting(db, meetingId, newTitle));
  ipcMain.handle(CHANNELS.SPLIT_MEETING, (_e, meetingId: string, durations: number[]) => handleSplitMeeting(db, meetingId, durations));
  ipcMain.handle(CHANNELS.GET_MEETING_LINEAGE, (_e, meetingId: string) => handleGetMeetingLineage(db, meetingId));

  createWindow();

  // Load vector search infrastructure in background — non-blocking
  connectVectorDb(VECTOR_PATH)
    .then((vdb) => loadModel(MODEL_PATH, TOKENIZER_PATH).then((session) => {
      vdbRef = vdb;
      ipcMain.handle(CHANNELS.SEARCH_MEETINGS, (_e, req) =>
        handleSearchMeetings(db, vdb, session, req),
      );
      ipcMain.handle(CHANNELS.RE_EMBED_MEETING, (_e, meetingId: string) =>
        handleUpdateMeetingVector(db, vdb, session, meetingId),
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
