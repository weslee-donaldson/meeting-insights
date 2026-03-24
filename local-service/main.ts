import { mkdirSync } from "node:fs";
import { createDb, migrate } from "../core/db.js";
import { connectVectorDb } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { seedClients } from "../core/client-registry.js";
import { processWebhookMeetings, type PipelineEvent } from "../core/pipeline.js";
import { createWatcher, type Watcher } from "./watcher.js";
import { createLogger } from "../core/logger.js";

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
  auditDir: string;
}

export interface Service {
  stop: () => void;
}

export async function startService(config: ServiceConfig): Promise<Service> {
  mkdirSync("db", { recursive: true });

  const db = createDb(config.dbPath);
  migrate(db);
  seedClients(db, config.clientsPath);

  const vdb = await connectVectorDb(config.vectorPath);

  log("loading embedding model...");
  const session = await loadModel(config.modelPath, config.tokenizerPath);
  log("model loaded");

  const llm = createLlmAdapter(config.llmConfig);

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
        onProgress: (event: PipelineEvent) => {
          log("%s %s", event.type, event.name);
        },
      });
    },
  });

  log("webhook-watcher started, watching %s", config.webhookRawDir);

  function stop(): void {
    watcher.stop();
    log("shutdown");
  }

  return { stop };
}
