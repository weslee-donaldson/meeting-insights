import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { recordSystemError, getHealthStatus } from "../core/system-health.js";

let db: Database;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
});

describe("recordSystemError", () => {
  it("inserts api_error with severity critical", () => {
    const result = recordSystemError(db, { error_type: "api_error", message: "[api_error] 402" });
    expect(result).toMatchObject({
      error_type: "api_error",
      severity: "critical",
      message: "[api_error] 402",
      meeting_filename: null,
      provider: null,
      acknowledged: false,
    });
    expect(typeof result?.id).toBe("string");
  });

  it("inserts rate_limit with severity warning", () => {
    const result = recordSystemError(db, { error_type: "rate_limit", message: "[rate_limit] 429" });
    expect(result?.severity).toBe("warning");
  });

  it("inserts json_parse with severity warning", () => {
    const result = recordSystemError(db, { error_type: "json_parse", message: "[json_parse] bad" });
    expect(result?.severity).toBe("warning");
  });

  it("inserts unknown with severity warning", () => {
    const result = recordSystemError(db, { error_type: "unknown", message: "parse failed" });
    expect(result?.severity).toBe("warning");
  });

  it("stores meeting_filename as null when undefined", () => {
    const result = recordSystemError(db, { error_type: "api_error", message: "err" });
    expect(result?.meeting_filename).toBeNull();
  });

  it("stores provider as null when undefined", () => {
    const result = recordSystemError(db, { error_type: "api_error", message: "err" });
    expect(result?.provider).toBeNull();
  });

  it("stores both optional fields when provided", () => {
    const result = recordSystemError(db, {
      error_type: "api_error",
      message: "[api_error] 402",
      meeting_filename: "2026-04-01_standup.json",
      provider: "openai",
    });
    expect(result).toMatchObject({
      error_type: "api_error",
      severity: "critical",
      message: "[api_error] 402",
      meeting_filename: "2026-04-01_standup.json",
      provider: "openai",
      acknowledged: false,
    });
  });

  it("returns object with all SystemError fields", () => {
    const result = recordSystemError(db, { error_type: "api_error", message: "err" });
    expect(result).toMatchObject({
      id: expect.any(String),
      error_type: "api_error",
      severity: "critical",
      message: "err",
      meeting_filename: null,
      provider: null,
      acknowledged: false,
      created_at: expect.any(String),
    });
  });

  it("auto-acknowledges new error of same type when cooldown is active", () => {
    const futureTime = new Date(Date.now() + 3600 * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
    db.prepare(
      "INSERT INTO system_errors (id, error_type, severity, message, acknowledged, acknowledged_until) VALUES ('e1', 'api_error', 'critical', 'old', 1, ?)"
    ).run(futureTime);
    const result = recordSystemError(db, { error_type: "api_error", message: "new error" });
    expect(result?.acknowledged).toBe(true);
  });

  it("does not auto-acknowledge error of different type during cooldown", () => {
    const futureTime = new Date(Date.now() + 3600 * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
    db.prepare(
      "INSERT INTO system_errors (id, error_type, severity, message, acknowledged, acknowledged_until) VALUES ('e1', 'api_error', 'critical', 'old', 1, ?)"
    ).run(futureTime);
    const result = recordSystemError(db, { error_type: "rate_limit", message: "rate limited" });
    expect(result?.acknowledged).toBe(false);
  });

  it("returns null when DB write fails", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const badDb = createDb(":memory:");
    const result = recordSystemError(badDb, { error_type: "api_error", message: "err" });
    expect(result).toBeNull();
    errSpy.mockRestore();
  });
});

describe("getHealthStatus", () => {
  it("returns healthy status with no errors or meetings", () => {
    const result = getHealthStatus(db);
    expect(result).toEqual({
      status: "healthy",
      error_groups: [],
      meetings_without_artifact: 0,
      last_error_at: null,
    });
  });

  it("returns critical status with single api_error group", () => {
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, provider) VALUES ('e1', 'api_error', 'critical', '[api_error] 402', 'openai')").run();
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, provider) VALUES ('e2', 'api_error', 'critical', '[api_error] 402', 'openai')").run();
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, provider) VALUES ('e3', 'api_error', 'critical', '[api_error] 402', 'openai')").run();
    const result = getHealthStatus(db);
    expect(result.status).toBe("critical");
    expect(result.error_groups).toHaveLength(1);
    expect(result.error_groups[0]).toMatchObject({
      error_type: "api_error",
      severity: "critical",
      count: 3,
      latest_message: "[api_error] 402",
      provider: "openai",
      resolution_hint: "Check your LLM provider account billing and API key validity",
    });
  });

  it("returns two error groups for mixed error types, critical wins", () => {
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e1', 'api_error', 'critical', 'api err')").run();
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e2', 'rate_limit', 'warning', 'rate limited')").run();
    const result = getHealthStatus(db);
    expect(result.status).toBe("critical");
    expect(result.error_groups).toHaveLength(2);
  });

  it("counts meetings without artifact created more than 5 minutes ago", () => {
    db.prepare("INSERT INTO meetings (id, title, date, created_at, ignored) VALUES ('m1', 'Old', '2026-01-01', datetime('now', '-10 minutes'), 0)").run();
    const result = getHealthStatus(db);
    expect(result.meetings_without_artifact).toBe(1);
  });

  it("does not count meetings with artifact", () => {
    db.prepare("INSERT INTO meetings (id, title, date, created_at, ignored) VALUES ('m1', 'Old', '2026-01-01', datetime('now', '-10 minutes'), 0)").run();
    db.prepare("INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, architecture, open_questions, risk_items) VALUES ('m1', '', '', '', '', '', '', '')").run();
    const result = getHealthStatus(db);
    expect(result.meetings_without_artifact).toBe(0);
  });

  it("does not count ignored meetings without artifact", () => {
    db.prepare("INSERT INTO meetings (id, title, date, created_at, ignored) VALUES ('m1', 'Ignored', '2026-01-01', datetime('now', '-10 minutes'), 1)").run();
    const result = getHealthStatus(db);
    expect(result.meetings_without_artifact).toBe(0);
  });

  it("does not count meetings created within the 5-minute window", () => {
    db.prepare("INSERT INTO meetings (id, title, date, created_at, ignored) VALUES ('m1', 'New', '2026-01-01', datetime('now'), 0)").run();
    const result = getHealthStatus(db);
    expect(result.meetings_without_artifact).toBe(0);
  });

  it("counts meeting created 10 minutes ago but not one created now", () => {
    db.prepare("INSERT INTO meetings (id, title, date, created_at, ignored) VALUES ('m1', 'Old', '2026-01-01', datetime('now', '-10 minutes'), 0)").run();
    db.prepare("INSERT INTO meetings (id, title, date, created_at, ignored) VALUES ('m2', 'New', '2026-01-01', datetime('now'), 0)").run();
    const result = getHealthStatus(db);
    expect(result.meetings_without_artifact).toBe(1);
  });

  it("returns last_error_at as the latest created_at among errors", () => {
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, created_at) VALUES ('e1', 'api_error', 'critical', 'a', '2026-04-01 14:00:00')").run();
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, created_at) VALUES ('e2', 'api_error', 'critical', 'b', '2026-04-01 14:30:00')").run();
    const result = getHealthStatus(db);
    expect(result.last_error_at).toBe("2026-04-01 14:30:00");
  });

  it("returns last_error_at as null when no errors exist", () => {
    const result = getHealthStatus(db);
    expect(result.last_error_at).toBeNull();
  });

  it("excludes acknowledged errors from status", () => {
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, acknowledged) VALUES ('e1', 'api_error', 'critical', 'err', 1)").run();
    const result = getHealthStatus(db);
    expect(result.status).toBe("healthy");
    expect(result.error_groups).toHaveLength(0);
  });

  it("auto-prunes errors older than 90 days", () => {
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, created_at) VALUES ('old', 'api_error', 'critical', 'old err', datetime('now', '-91 days'))").run();
    getHealthStatus(db);
    const row = db.prepare("SELECT id FROM system_errors WHERE id = 'old'").get();
    expect(row).toBeUndefined();
  });
});
