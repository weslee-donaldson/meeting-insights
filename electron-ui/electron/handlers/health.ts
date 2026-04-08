import type { DatabaseSync as Database } from "node:sqlite";
import { getHealthStatus, acknowledgeErrors, acknowledgeAllErrors } from "../../../core/system-health.js";
import type { HealthStatus } from "../../../core/system-health.js";

export function handleGetHealth(db: Database): HealthStatus {
  return getHealthStatus(db);
}

export function handleAcknowledgeHealthErrors(db: Database, errorIds?: string[]): void {
  if (errorIds && errorIds.length > 0) {
    acknowledgeErrors(db, errorIds);
  } else {
    acknowledgeAllErrors(db);
  }
}
