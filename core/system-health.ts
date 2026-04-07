import { randomUUID } from "node:crypto";
import type { DatabaseSync as Database } from "node:sqlite";

export interface SystemError {
  id: string;
  error_type: "rate_limit" | "api_error" | "json_parse" | "unknown";
  severity: "critical" | "warning";
  message: string;
  meeting_filename: string | null;
  provider: string | null;
  acknowledged: boolean;
  created_at: string;
}

export interface ErrorGroup {
  error_type: string;
  severity: "critical" | "warning";
  count: number;
  latest_message: string;
  latest_meeting_filename: string | null;
  provider: string | null;
  resolution_hint: string;
}

export interface HealthStatus {
  status: "healthy" | "critical";
  error_groups: ErrorGroup[];
  meetings_without_artifact: number;
  last_error_at: string | null;
}

interface RecordErrorInput {
  error_type: "rate_limit" | "api_error" | "json_parse" | "unknown";
  message: string;
  meeting_filename?: string;
  provider?: string;
}

function deriveSeverity(error_type: string): "critical" | "warning" {
  return error_type === "api_error" ? "critical" : "warning";
}

const RESOLUTION_HINTS: Record<string, string> = {
  api_error: "Check your LLM provider account billing and API key validity",
  rate_limit: "Rate limiting is usually transient and self-resolves. If persistent, check your provider's rate limit tier",
  json_parse: "The LLM returned unparseable output. This is usually transient. If persistent, check the extraction prompt",
  unknown: "Check the application logs for details",
};

export function getHealthStatus(db: Database): HealthStatus {
  db.exec("DELETE FROM system_errors WHERE created_at < datetime('now', '-90 days')");

  const groupRows = db.prepare(`
    SELECT
      error_type,
      severity,
      COUNT(*) as count,
      MAX(message) as latest_message,
      MAX(meeting_filename) as latest_meeting_filename,
      MAX(provider) as provider
    FROM system_errors
    WHERE acknowledged = 0
    GROUP BY error_type
    ORDER BY MAX(created_at) DESC
  `).all() as {
    error_type: string;
    severity: string;
    count: number;
    latest_message: string;
    latest_meeting_filename: string | null;
    provider: string | null;
  }[];

  const error_groups: ErrorGroup[] = groupRows.map(row => ({
    error_type: row.error_type,
    severity: row.severity as ErrorGroup["severity"],
    count: row.count,
    latest_message: row.latest_message,
    latest_meeting_filename: row.latest_meeting_filename,
    provider: row.provider,
    resolution_hint: RESOLUTION_HINTS[row.error_type] ?? RESOLUTION_HINTS.unknown,
  }));

  const withoutArtifactRow = db.prepare(
    "SELECT COUNT(*) as n FROM meetings LEFT JOIN artifacts ON meetings.id = artifacts.meeting_id WHERE artifacts.meeting_id IS NULL AND meetings.ignored = 0 AND meetings.created_at < datetime('now', '-5 minutes')"
  ).get() as { n: number };
  const meetings_without_artifact = withoutArtifactRow.n;

  const lastRow = db.prepare("SELECT MAX(created_at) as last_error_at FROM system_errors").get() as { last_error_at: string | null };
  const last_error_at = lastRow.last_error_at;

  const status: HealthStatus["status"] = error_groups.some(g => g.severity === "critical") ? "critical" : "healthy";

  return { status, error_groups, meetings_without_artifact, last_error_at };
}

export function acknowledgeErrors(db: Database, errorIds: string[]): void {
  if (errorIds.length === 0) return;
  const placeholders = errorIds.map(() => "?").join(", ");
  db.prepare(
    `UPDATE system_errors SET acknowledged = 1, acknowledged_until = datetime('now', '+1 hour') WHERE id IN (${placeholders})`
  ).run(...errorIds);
}

export function acknowledgeAllErrors(db: Database): void {
  db.exec("UPDATE system_errors SET acknowledged = 1, acknowledged_until = datetime('now', '+1 hour') WHERE acknowledged = 0");
}

export function recordSystemError(db: Database, input: RecordErrorInput): SystemError | null {
  try {
    const id = randomUUID();
    const severity = deriveSeverity(input.error_type);
    const meeting_filename = input.meeting_filename ?? null;
    const provider = input.provider ?? null;

    const cooldownRow = db.prepare(
      "SELECT id FROM system_errors WHERE error_type = ? AND acknowledged_until > datetime('now') LIMIT 1"
    ).get(input.error_type) as { id: string } | undefined;

    const acknowledged = cooldownRow ? 1 : 0;

    db.prepare(
      "INSERT INTO system_errors (id, error_type, severity, message, meeting_filename, provider, acknowledged) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(id, input.error_type, severity, input.message, meeting_filename, provider, acknowledged);

    const row = db.prepare("SELECT * FROM system_errors WHERE id = ?").get(id) as {
      id: string;
      error_type: string;
      severity: string;
      message: string;
      meeting_filename: string | null;
      provider: string | null;
      acknowledged: number;
      created_at: string;
    };

    return {
      id: row.id,
      error_type: row.error_type as SystemError["error_type"],
      severity: row.severity as SystemError["severity"],
      message: row.message,
      meeting_filename: row.meeting_filename,
      provider: row.provider,
      acknowledged: row.acknowledged === 1,
      created_at: row.created_at,
    };
  } catch (err) {
    console.error("[system-health] recordSystemError failed:", err);
    return null;
  }
}
