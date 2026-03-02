import { DatabaseSync } from "node:sqlite";

export type { DatabaseSync as Database };

export function createDb(path: string): DatabaseSync {
  return new DatabaseSync(path);
}

export function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      title TEXT,
      meeting_type TEXT,
      date TEXT,
      participants TEXT,
      raw_transcript TEXT,
      source_filename TEXT UNIQUE,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS artifacts (
      meeting_id TEXT PRIMARY KEY,
      summary TEXT,
      decisions TEXT,
      proposed_features TEXT,
      action_items TEXT,
      technical_topics TEXT,
      open_questions TEXT,
      risk_items TEXT,
      needs_reextraction INTEGER DEFAULT 0,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE TABLE IF NOT EXISTS clients (
      name TEXT PRIMARY KEY,
      aliases TEXT,
      known_participants TEXT
    );

    CREATE TABLE IF NOT EXISTS client_detections (
      meeting_id TEXT,
      client_name TEXT,
      confidence REAL,
      method TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id),
      FOREIGN KEY (client_name) REFERENCES clients(name)
    );

    CREATE TABLE IF NOT EXISTS clusters (
      cluster_id TEXT PRIMARY KEY,
      generated_tags TEXT,
      centroid_snapshot TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS meeting_clusters (
      meeting_id TEXT,
      cluster_id TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id),
      FOREIGN KEY (cluster_id) REFERENCES clusters(cluster_id)
    );
  `);

  const artifactCols = db.prepare("PRAGMA table_info(artifacts)").all() as { name: string }[];
  if (!artifactCols.some(c => c.name === "additional_notes")) {
    db.exec("ALTER TABLE artifacts ADD COLUMN additional_notes TEXT DEFAULT '[]'");
  }

  const clientCols = db.prepare("PRAGMA table_info(clients)").all() as { name: string }[];
  if (!clientCols.some(c => c.name === "refinement_prompt")) {
    db.exec("ALTER TABLE clients ADD COLUMN refinement_prompt TEXT");
  }
}
