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
