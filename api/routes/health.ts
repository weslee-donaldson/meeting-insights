import type { Hono } from "hono";
import type { DatabaseSync as Database } from "node:sqlite";
import { getHealthStatus, acknowledgeErrors, acknowledgeAllErrors } from "../../core/system-health.js";

export function registerHealthRoutes(app: Hono, db: Database): void {
  app.get("/api/health", (c) => {
    const status = getHealthStatus(db);
    return c.json(status);
  });

  app.post("/api/health/acknowledge", async (c) => {
    const body = await c.req.json().catch(() => ({})) as { errorIds?: string[] };
    const ids = body.errorIds;
    if (ids && ids.length > 0) {
      acknowledgeErrors(db, ids);
    } else {
      acknowledgeAllErrors(db);
    }
    return c.json({ ok: true });
  });
}
