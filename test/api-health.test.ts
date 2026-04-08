import { describe, it, expect, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { createApp } from "../api/server.js";
import type { HealthStatus } from "../core/system-health.js";

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  const db = createDb(":memory:");
  migrate(db);
  app = createApp(db, ":memory:");
});

describe("GET /api/health", () => {
  it("returns healthy status with empty DB", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json() as HealthStatus;
    expect(body).toEqual({
      status: "healthy",
      error_groups: [],
      meetings_without_artifact: 0,
      last_error_at: null,
    });
  });

  it("returns critical status when api_error exists", async () => {
    const db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, provider) VALUES ('e1', 'api_error', 'critical', '[api_error] 402', 'openai')").run();
    const critApp = createApp(db, ":memory:");

    const res = await critApp.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json() as HealthStatus;
    expect(body.status).toBe("critical");
    expect(body.error_groups).toHaveLength(1);
    expect(body.error_groups[0]).toMatchObject({
      error_type: "api_error",
      severity: "critical",
      count: 1,
      latest_message: "[api_error] 402",
      provider: "openai",
      resolution_hint: "Check your LLM provider account billing and API key validity",
    });
  });
});

describe("POST /api/health/acknowledge", () => {
  it("acknowledges specific errors by IDs", async () => {
    const db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e1', 'api_error', 'critical', 'err')").run();
    const ackApp = createApp(db, ":memory:");

    const res = await ackApp.request("/api/health/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errorIds: ["e1"] }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body).toEqual({ ok: true });

    const healthRes = await ackApp.request("/api/health");
    const healthBody = await healthRes.json() as HealthStatus;
    expect(healthBody.status).toBe("healthy");
  });

  it("acknowledges all errors when errorIds omitted", async () => {
    const db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e1', 'api_error', 'critical', 'err1')").run();
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e2', 'api_error', 'critical', 'err2')").run();
    const ackApp = createApp(db, ":memory:");

    const res = await ackApp.request("/api/health/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);

    const healthRes = await ackApp.request("/api/health");
    const healthBody = await healthRes.json() as HealthStatus;
    expect(healthBody.status).toBe("healthy");
  });

  it("acknowledges all errors when errorIds is empty array", async () => {
    const db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e1', 'api_error', 'critical', 'err1')").run();
    const ackApp = createApp(db, ":memory:");

    const res = await ackApp.request("/api/health/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errorIds: [] }),
    });
    expect(res.status).toBe(200);

    const healthRes = await ackApp.request("/api/health");
    const healthBody = await healthRes.json() as HealthStatus;
    expect(healthBody.status).toBe("healthy");
  });
});
