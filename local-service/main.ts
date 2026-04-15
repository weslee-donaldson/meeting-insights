import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createDb, migrate } from "../core/db.js";
import { connectVectorDb } from "../core/search/vector-db.js";
import { loadModel } from "../core/pipeline/embedder.js";
import { createLlmAdapter } from "../core/llm/adapter.js";
import { seedClients } from "../core/clients/registry.js";
import { processNewMeetings, processWebhookMeetings, type PipelineEvent } from "../core/pipeline/pipeline.js";
import { createNotifierFromEnv } from "../core/notifier.js";
import { createWatcher, createFolderWatcher } from "./watcher.js";
import { createLogger, setLogDir } from "../core/logger.js";
import { loadCliConfig } from "../cli/admin-util/shared.js";
import { resolveDataPaths } from "../core/utils/paths.js";

const log = createLogger("service");

export interface ServiceConfig {
  dbPath: string;
  vectorPath: string;
  modelPath: string;
  tokenizerPath: string;
  llmConfig: Parameters<typeof createLlmAdapter>[0];
  clientsPath: string;
  webhookRawDir: string;
  webhookProcessedDir: string;
  webhookFailedDir: string;
  manualRawDir: string;
  manualProcessedDir: string;
  manualFailedDir: string;
  auditDir: string;
  manualQuietPeriodMs?: number;
}

export interface Service {
  stop: () => void;
}

export async function startService(config: ServiceConfig): Promise<Service> {
  mkdirSync("db", { recursive: true });
  setLogDir("logs/api");

  const db = createDb(config.dbPath);
  migrate(db);
  seedClients(db, config.clientsPath);

  const vdb = await connectVectorDb(config.vectorPath);

  log("loading embedding model...");
  const session = await loadModel(config.modelPath, config.tokenizerPath);
  log("model loaded");

  const llm = createLlmAdapter(config.llmConfig);
  const notifier = createNotifierFromEnv();

  const watcher = createWatcher({
    dir: config.webhookRawDir,
    onFile: async () => {
      await processWebhookMeetings({
        webhookRawDir: config.webhookRawDir,
        webhookProcessedDir: config.webhookProcessedDir,
        webhookFailedDir: config.webhookFailedDir,
        auditDir: config.auditDir,
        db,
        vdb,
        session,
        llm,
        extractionPromptPath: "config/prompts/extraction.md",
        provider: config.llmConfig.type,
        notifier,
        onProgress: (event: PipelineEvent) => {
          log("%s %s", event.type, event.name);
        },
      });
    },
  });

  log("webhook-watcher started, watching %s", config.webhookRawDir);

  let manualQueue: Promise<unknown> = Promise.resolve();
  const manualWatcher = createFolderWatcher({
    dir: config.manualRawDir,
    quietPeriodMs: config.manualQuietPeriodMs,
    onFolder: (folderName) => {
      manualQueue = manualQueue.then(() =>
        processNewMeetings({
          rawDir: config.manualRawDir,
          processedDir: config.manualProcessedDir,
          failedDir: config.manualFailedDir,
          auditDir: config.auditDir,
          db,
          vdb,
          session,
          llm,
          extractionPromptPath: "config/prompts/extraction.md",
          filterFolder: folderName,
          provider: config.llmConfig.type,
          notifier,
          onProgress: (event: PipelineEvent) => {
            log("manual %s %s", event.type, (event as { name?: string; title?: string }).name ?? (event as { name?: string; title?: string }).title ?? "");
          },
        }).catch((err) => {
          log("manual processing failed for %s: %s", folderName, (err as Error).message);
        }),
      );
    },
  });

  log("manual-watcher started, watching %s", config.manualRawDir);

  function stop(): void {
    watcher.stop();
    manualWatcher.stop();
    log("shutdown");
  }

  return { stop };
}

const isMainModule = resolve(process.argv[1] ?? "") === resolve(import.meta.dirname ?? "", "main.ts");

if (isMainModule) {
  const { dbPath, vectorPath, provider, apiKey, localBaseUrl, localModel, claudeApiUrl } = loadCliConfig();

  const llmConfig = provider === "local"
    ? { type: "local" as const, baseUrl: localBaseUrl, model: localModel }
    : provider === "claudecli"
      ? { type: "claudecli" as const }
      : provider === "local-claudeapi"
        ? { type: "local-claudeapi" as const, baseUrl: claudeApiUrl }
        : provider === "stub"
          ? { type: "stub" as const }
          : { type: "anthropic" as const, apiKey: apiKey! };

  const dataPaths = resolveDataPaths(process.env.MTNINSIGHTS_DATA_DIR);

  const service = await startService({
    dbPath,
    vectorPath,
    modelPath: "models/all-MiniLM-L6-v2.onnx",
    tokenizerPath: "models/tokenizer.json",
    llmConfig,
    clientsPath: process.env.MTNINSIGHTS_CLIENTS_PATH ?? "config/clients.json",
    webhookRawDir: dataPaths.webhook.rawTranscripts,
    webhookProcessedDir: dataPaths.webhook.processed,
    webhookFailedDir: dataPaths.webhook.failed,
    manualRawDir: dataPaths.manual.rawTranscripts,
    manualProcessedDir: dataPaths.manual.processed,
    manualFailedDir: dataPaths.manual.failed,
    auditDir: dataPaths.audit,
    manualQuietPeriodMs: process.env.MTNINSIGHTS_MANUAL_QUIET_MS
      ? parseInt(process.env.MTNINSIGHTS_MANUAL_QUIET_MS, 10)
      : undefined,
  });

  process.on("SIGINT", () => {
    service.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    service.stop();
    process.exit(0);
  });
}
