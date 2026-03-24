import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../core/db.js", () => ({
  createDb: vi.fn(() => ({ prepare: vi.fn(() => ({ all: vi.fn(() => []), run: vi.fn() })) })),
  migrate: vi.fn(),
}));

vi.mock("../core/vector-db.js", () => ({
  connectVectorDb: vi.fn(async () => ({})),
}));

vi.mock("../core/embedder.js", () => ({
  loadModel: vi.fn(async () => ({ _tokenizer: {} })),
}));

vi.mock("../core/llm-adapter.js", () => ({
  createLlmAdapter: vi.fn(() => ({})),
}));

vi.mock("../core/client-registry.js", () => ({
  seedClients: vi.fn(),
}));

vi.mock("../core/pipeline.js", () => ({
  processWebhookMeetings: vi.fn(async () => ({ total: 0, succeeded: 0, failed: 0, skipped: 0 })),
}));

vi.mock("../local-service/watcher.js", () => ({
  createWatcher: vi.fn(() => ({ stop: vi.fn() })),
}));

import { createDb, migrate } from "../core/db.js";
import { connectVectorDb } from "../core/vector-db.js";
import { loadModel } from "../core/embedder.js";
import { createLlmAdapter } from "../core/llm-adapter.js";
import { seedClients } from "../core/client-registry.js";
import { processWebhookMeetings } from "../core/pipeline.js";
import { createWatcher } from "../local-service/watcher.js";
import { startService } from "../local-service/main.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("startService", () => {
  it("initializes core dependencies using shared config pattern", async () => {
    const service = await startService({
      dbPath: ":memory:",
      vectorPath: "/tmp/test-vdb",
      modelPath: "models/test.onnx",
      tokenizerPath: "models/tokenizer.json",
      llmConfig: { type: "stub" as const },
      clientsPath: "config/clients.json",
      webhookRawDir: "data/webhook-rawtranscripts",
      webhookProcessedDir: "data/webhook-processed",
      webhookFailedDir: "data/webhook-failed",
      auditDir: "data/audit",
    });

    expect(createDb).toHaveBeenCalledWith(":memory:");
    expect(migrate).toHaveBeenCalled();
    expect(seedClients).toHaveBeenCalled();
    expect(connectVectorDb).toHaveBeenCalledWith("/tmp/test-vdb");
    expect(loadModel).toHaveBeenCalledWith("models/test.onnx", "models/tokenizer.json");
    expect(createLlmAdapter).toHaveBeenCalledWith({ type: "stub" });
    expect(createWatcher).toHaveBeenCalled();

    service.stop();
  });

  it("processes detected webhook file through full pipeline", async () => {
    let capturedOnFile: ((filename: string) => void | Promise<void>) | undefined;
    vi.mocked(createWatcher).mockImplementation((opts) => {
      capturedOnFile = opts.onFile;
      return { stop: vi.fn() };
    });

    const service = await startService({
      dbPath: ":memory:",
      vectorPath: "/tmp/test-vdb",
      modelPath: "models/test.onnx",
      tokenizerPath: "models/tokenizer.json",
      llmConfig: { type: "stub" as const },
      clientsPath: "config/clients.json",
      webhookRawDir: "data/webhook-rawtranscripts",
      webhookProcessedDir: "data/webhook-processed",
      webhookFailedDir: "data/webhook-failed",
      auditDir: "data/audit",
    });

    expect(capturedOnFile).toBeDefined();
    await capturedOnFile!("new-meeting.json");

    expect(processWebhookMeetings).toHaveBeenCalledWith(
      expect.objectContaining({
        webhookRawDir: "data/webhook-rawtranscripts",
        webhookProcessedDir: "data/webhook-processed",
        webhookFailedDir: "data/webhook-failed",
        auditDir: "data/audit",
      }),
    );

    service.stop();
  });

  it("stop() calls watcher.stop() for graceful shutdown", async () => {
    const mockStop = vi.fn();
    vi.mocked(createWatcher).mockImplementation(() => ({
      stop: mockStop,
    }));

    const service = await startService({
      dbPath: ":memory:",
      vectorPath: "/tmp/test-vdb",
      modelPath: "models/test.onnx",
      tokenizerPath: "models/tokenizer.json",
      llmConfig: { type: "stub" as const },
      clientsPath: "config/clients.json",
      webhookRawDir: "data/webhook-rawtranscripts",
      webhookProcessedDir: "data/webhook-processed",
      webhookFailedDir: "data/webhook-failed",
      auditDir: "data/audit",
    });

    expect(mockStop).not.toHaveBeenCalled();
    service.stop();
    expect(mockStop).toHaveBeenCalledOnce();
  });
});
