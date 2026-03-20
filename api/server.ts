import { Hono } from "hono";
import { cors } from "hono/cors";
import type { DatabaseSync as Database } from "node:sqlite";
import { registerDebugRoutes } from "./routes/debug.js";
import { registerMeetingRoutes } from "./routes/meetings.js";
import { registerSearchRoutes } from "./routes/search.js";
import { registerThreadRoutes } from "./routes/threads.js";
import { registerInsightRoutes } from "./routes/insights.js";
import { registerMilestoneRoutes } from "./routes/milestones.js";
import { registerNoteRoutes } from "./routes/notes.js";
import type { LlmAdapter } from "../core/llm-adapter.js";
import type { VectorDb } from "../core/vector-db.js";
import type { InferenceSession } from "onnxruntime-node";

export interface SearchDeps {
  vdb: VectorDb;
  session: InferenceSession & { _tokenizer: unknown };
}

export function createApp(db: Database, dbPath: string, llm?: LlmAdapter, searchDeps?: SearchDeps, assetsDir?: string): Hono {
  const app = new Hono();
  app.use(cors());
  app.use(async (c, next) => {
    const start = Date.now();
    await next();
    const { logApiCall } = await import("../core/logger.js");
    logApiCall(c.req.method, c.req.path, c.res.status, Date.now() - start);
  });

  registerDebugRoutes(app, db, dbPath, searchDeps);
  registerMeetingRoutes(app, db, llm, searchDeps, assetsDir);
  registerSearchRoutes(app, db, llm, searchDeps);
  registerThreadRoutes(app, db, llm, searchDeps);
  registerInsightRoutes(app, db, llm, searchDeps);
  registerMilestoneRoutes(app, db, llm, searchDeps);
  registerNoteRoutes(app, db);

  return app;
}
