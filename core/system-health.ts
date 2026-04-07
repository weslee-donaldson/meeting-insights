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
