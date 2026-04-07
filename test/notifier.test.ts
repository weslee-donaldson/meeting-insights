import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";
import { createNotifier } from "../core/notifier.js";
import type { SystemError } from "../core/system-health.js";

const makeError = (overrides: Partial<SystemError> = {}): SystemError => ({
  id: "err-uuid-1",
  error_type: "api_error",
  severity: "critical",
  message: "[api_error] 402 Insufficient funds",
  meeting_filename: "2026-04-01_standup.json",
  provider: "openai",
  acknowledged: false,
  created_at: "2026-04-01 14:30:00",
  ...overrides,
});

const makeConfig = () => ({
  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpUser: "bot@gmail.com",
  smtpPass: "app-pass",
  alertEmail: "admin@company.com",
});

let db: Database;

beforeEach(() => {
  db = createDb(":memory:");
  migrate(db);
  vi.resetAllMocks();
});

describe("createNotifier", () => {
  it("no-op notifier does not throw and returns resolved promise", async () => {
    const notifier = createNotifier(null);
    await expect(notifier.sendAlert(db, makeError())).resolves.toBeUndefined();
  });

  it("configured notifier calls sendMail with correct to/from fields", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test" });
    const notifier = createNotifier(makeConfig(), { sendMail: sendMailMock });

    await notifier.sendAlert(db, makeError());

    expect(sendMailMock).toHaveBeenCalledOnce();
    const callArgs = sendMailMock.mock.calls[0][0];
    expect(callArgs.to).toBe("admin@company.com");
    expect(callArgs.from).toBe("bot@gmail.com");
    expect(callArgs.subject).toContain("Critical");
  });

  it("email body contains error message, provider, meeting filename, and resolution hint", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test" });
    const notifier = createNotifier(makeConfig(), { sendMail: sendMailMock });

    await notifier.sendAlert(db, makeError());

    const body = sendMailMock.mock.calls[0][0].text as string;
    expect(body).toContain("[api_error] 402 Insufficient funds");
    expect(body).toContain("openai");
    expect(body).toContain("2026-04-01_standup.json");
    expect(body).toContain("Check your LLM provider account billing and API key validity");
  });

  it("email body includes meetings_without_artifact count from DB", async () => {
    db.prepare("INSERT INTO meetings (id, title, date, created_at, ignored) VALUES ('m1', 'Old', '2026-01-01', datetime('now', '-10 minutes'), 0)").run();

    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test" });
    const notifier = createNotifier(makeConfig(), { sendMail: sendMailMock });

    await notifier.sendAlert(db, makeError());

    const body = sendMailMock.mock.calls[0][0].text as string;
    expect(body).toContain("1 meeting(s)");
  });
});

describe("sendAlert throttle logic", () => {
  it("sends email for first error, throttles second error within 15 min", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test" });
    const notifier = createNotifier(makeConfig(), { sendMail: sendMailMock });

    const err1 = makeError({ id: "e1" });
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e1', 'api_error', 'critical', 'err1')").run();
    await notifier.sendAlert(db, err1);

    const err2 = makeError({ id: "e2" });
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e2', 'api_error', 'critical', 'err2')").run();
    await notifier.sendAlert(db, err2);

    expect(sendMailMock).toHaveBeenCalledOnce();

    const e1Row = db.prepare("SELECT notified FROM system_errors WHERE id = 'e1'").get() as { notified: number };
    const e2Row = db.prepare("SELECT notified FROM system_errors WHERE id = 'e2'").get() as { notified: number };
    expect(e1Row.notified).toBe(1);
    expect(e2Row.notified).toBe(1);
  });

  it("sends email after throttle window expires (20 min ago)", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test" });
    const notifier = createNotifier(makeConfig(), { sendMail: sendMailMock });

    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, notified, last_notified_at) VALUES ('old', 'api_error', 'critical', 'old err', 1, datetime('now', '-20 minutes'))").run();

    const err = makeError({ id: "e-new" });
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e-new', 'api_error', 'critical', 'new err')").run();
    await notifier.sendAlert(db, err);

    expect(sendMailMock).toHaveBeenCalledOnce();
  });

  it("boundary: error notified exactly 15 minutes ago sends email (> not >=)", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test" });
    const notifier = createNotifier(makeConfig(), { sendMail: sendMailMock });

    db.prepare("INSERT INTO system_errors (id, error_type, severity, message, notified, last_notified_at) VALUES ('old15', 'api_error', 'critical', 'old', 1, datetime('now', '-15 minutes'))").run();

    const err = makeError({ id: "e-boundary" });
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e-boundary', 'api_error', 'critical', 'boundary err')").run();
    await notifier.sendAlert(db, err);

    expect(sendMailMock).toHaveBeenCalledOnce();
  });

  it("acknowledging does not affect throttle", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "test" });
    const notifier = createNotifier(makeConfig(), { sendMail: sendMailMock });

    const err1 = makeError({ id: "e1" });
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e1', 'api_error', 'critical', 'err1')").run();
    await notifier.sendAlert(db, err1);

    db.prepare("UPDATE system_errors SET acknowledged = 1 WHERE id = 'e1'").run();

    const err2 = makeError({ id: "e2" });
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e2', 'api_error', 'critical', 'err2')").run();
    await notifier.sendAlert(db, err2);

    expect(sendMailMock).toHaveBeenCalledOnce();
  });

  it("sendMail failure leaves notified=0 and last_notified_at=null, does not throw", async () => {
    const sendMailMock = vi.fn().mockRejectedValue(new Error("SMTP connection failed"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const notifier = createNotifier(makeConfig(), { sendMail: sendMailMock });

    const err = makeError({ id: "e-fail" });
    db.prepare("INSERT INTO system_errors (id, error_type, severity, message) VALUES ('e-fail', 'api_error', 'critical', 'fail err')").run();

    await expect(notifier.sendAlert(db, err)).resolves.toBeUndefined();

    const row = db.prepare("SELECT notified, last_notified_at FROM system_errors WHERE id = 'e-fail'").get() as { notified: number; last_notified_at: string | null };
    expect(row.notified).toBe(0);
    expect(row.last_notified_at).toBeNull();

    errSpy.mockRestore();
  });
});
