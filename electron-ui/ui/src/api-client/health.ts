import { API_BASE, fetchJson, jsonPost } from "./base.js";
import type { HealthStatus } from "../../../electron/channels.js";

export const healthMethods = {
  getHealth: (): Promise<HealthStatus> => fetchJson(`${API_BASE}/api/health`),
  acknowledgeHealthErrors: (errorIds?: string[]): Promise<void> =>
    jsonPost(`${API_BASE}/api/health/acknowledge`, { errorIds }).then(() => undefined),
};
