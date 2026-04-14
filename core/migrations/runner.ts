import type { DatabaseSync as Database } from "node:sqlite";

export interface Migration {
  version: number;
  description: string;
  up: (db: Database) => void;
}

function ensureSchemaVersionTable(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now')),
      description TEXT NOT NULL
    )
  `);
}

export function getCurrentVersion(db: Database): number {
  ensureSchemaVersionTable(db);
  const row = db.prepare("SELECT MAX(version) AS v FROM schema_version").get() as { v: number | null };
  return row.v ?? 0;
}

export function runMigrations(db: Database, migrations: Migration[]): void {
  ensureSchemaVersionTable(db);

  const applied = new Set(
    (db.prepare("SELECT version FROM schema_version").all() as { version: number }[]).map((r) => r.version),
  );

  const pending = [...migrations]
    .filter((m) => !applied.has(m.version))
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    db.exec("BEGIN");
    try {
      migration.up(db);
      db.prepare("INSERT INTO schema_version (version, description) VALUES (?, ?)").run(
        migration.version,
        migration.description,
      );
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }
}
