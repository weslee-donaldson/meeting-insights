import nodemailer from "nodemailer";
import type { DatabaseSync as Database } from "node:sqlite";
import type { SystemError } from "./system-health.js";

export interface NotificationConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  alertEmail: string;
}

export interface Notifier {
  sendAlert(db: Database, error: SystemError): Promise<void>;
}

const RESOLUTION_HINTS: Record<string, string> = {
  api_error: "Check your LLM provider account billing and API key validity",
  rate_limit: "Rate limiting is usually transient and self-resolves. If persistent, check your provider's rate limit tier",
  json_parse: "The LLM returned unparseable output. This is usually transient. If persistent, check the extraction prompt",
  unknown: "Check the application logs for details",
};

function countMeetingsWithoutArtifact(db: Database): number {
  const row = db.prepare(
    "SELECT COUNT(*) as n FROM meetings LEFT JOIN artifacts ON meetings.id = artifacts.meeting_id WHERE artifacts.meeting_id IS NULL AND meetings.ignored = 0 AND meetings.created_at < datetime('now', '-5 minutes')"
  ).get() as { n: number };
  return row.n;
}

function buildEmailBody(db: Database, error: SystemError): string {
  const hint = RESOLUTION_HINTS[error.error_type] ?? RESOLUTION_HINTS.unknown;
  const affected = countMeetingsWithoutArtifact(db);
  return [
    "Meeting Insights has detected a critical error.",
    "",
    `Error type: ${error.error_type}`,
    `Provider: ${error.provider ?? "unknown"}`,
    `Message: ${error.message}`,
    `Meeting: ${error.meeting_filename ?? "N/A"}`,
    `Time: ${error.created_at}`,
    "",
    `Affected meetings so far: ${affected} meeting(s) processed without insights.`,
    "",
    `Action required: ${hint}`,
    "Affected meetings will need to be reprocessed after the issue is resolved.",
  ].join("\n");
}

interface MailTransport {
  sendMail(options: { from: string; to: string; subject: string; text: string }): Promise<unknown>;
}

export function createNotifier(config: NotificationConfig | null, _transport?: MailTransport): Notifier {
  if (!config) {
    return {
      sendAlert: async () => { return; },
    };
  }

  const transport: MailTransport = _transport ?? nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: { user: config.smtpUser, pass: config.smtpPass },
  });

  return {
    sendAlert: async (db: Database, error: SystemError): Promise<void> => {
      const alreadyNotified = db.prepare(
        "SELECT COUNT(*) as n FROM system_errors WHERE last_notified_at > datetime('now', '-15 minutes')"
      ).get() as { n: number };

      if (alreadyNotified.n > 0) {
        db.prepare("UPDATE system_errors SET notified = 1 WHERE id = ?").run(error.id);
        return;
      }

      try {
        await transport.sendMail({
          from: config.smtpUser,
          to: config.alertEmail,
          subject: "[Meeting Insights] Critical: LLM API error",
          text: buildEmailBody(db, error),
        });
        db.prepare("UPDATE system_errors SET notified = 1, last_notified_at = datetime('now') WHERE id = ?").run(error.id);
      } catch (err) {
        console.error("[notifier] sendMail failed:", err);
      }
    },
  };
}

export function createNotifierFromEnv(): Notifier {
  const host = process.env.MTNINSIGHTS_SMTP_HOST;
  const portStr = process.env.MTNINSIGHTS_SMTP_PORT;
  const user = process.env.MTNINSIGHTS_SMTP_USER;
  const pass = process.env.MTNINSIGHTS_SMTP_PASS;
  const alertEmail = process.env.MTNINSIGHTS_ALERT_EMAIL;

  if (!host || !user || !pass || !alertEmail) {
    return createNotifier(null);
  }

  return createNotifier({
    smtpHost: host,
    smtpPort: parseInt(portStr ?? "587", 10),
    smtpUser: user,
    smtpPass: pass,
    alertEmail,
  });
}
