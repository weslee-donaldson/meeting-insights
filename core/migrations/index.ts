import * as baseline from "./001-baseline.js";
import type { Migration } from "./runner.js";

export { runMigrations, getCurrentVersion } from "./runner.js";
export type { Migration } from "./runner.js";

export const allMigrations: Migration[] = [
  { version: baseline.version, description: baseline.description, up: baseline.up },
].sort((a, b) => a.version - b.version);
