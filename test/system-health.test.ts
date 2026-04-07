import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { recordSystemError } from "../core/system-health.js";

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
