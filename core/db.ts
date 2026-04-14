import { DatabaseSync } from "node:sqlite";
import { runMigrations, allMigrations } from "./migrations/index.js";

export type { DatabaseSync as Database };

export function createDb(path: string): DatabaseSync {
  return new DatabaseSync(path);
}

export function migrate(db: DatabaseSync): void {
  runMigrations(db, allMigrations);
}
