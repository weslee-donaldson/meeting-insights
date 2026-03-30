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
      architecture TEXT,
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

    CREATE TABLE IF NOT EXISTS action_item_completions (
      id TEXT PRIMARY KEY,
      meeting_id TEXT,
      item_index INTEGER,
      completed_at TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS item_mentions (
      canonical_id TEXT,
      meeting_id TEXT,
      item_type TEXT,
      item_index INTEGER,
      item_text TEXT,
      first_mentioned_at TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS artifact_fts USING fts5(
      meeting_id UNINDEXED,
      content,
      tokenize='porter unicode61'
    );

    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      title TEXT NOT NULL,
      shorthand TEXT DEFAULT '',
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'open',
      summary TEXT DEFAULT '',
      criteria_prompt TEXT DEFAULT '',
      keywords TEXT DEFAULT '',
      criteria_changed_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (client_name) REFERENCES clients(name)
    );

    CREATE TABLE IF NOT EXISTS thread_meetings (
      thread_id TEXT NOT NULL,
      meeting_id TEXT NOT NULL,
      relevance_summary TEXT DEFAULT '',
      relevance_score REAL DEFAULT 0,
      evaluated_at TEXT NOT NULL,
      PRIMARY KEY (thread_id, meeting_id),
      FOREIGN KEY (thread_id) REFERENCES threads(id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE TABLE IF NOT EXISTS thread_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      sources TEXT,
      context_stale INTEGER DEFAULT 0,
      stale_details TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (thread_id) REFERENCES threads(id)
    );

    CREATE TABLE IF NOT EXISTS insights (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      name TEXT DEFAULT '',
      period_type TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      rag_status TEXT DEFAULT 'green',
      rag_rationale TEXT DEFAULT '',
      executive_summary TEXT DEFAULT '',
      topic_details TEXT DEFAULT '[]',
      generated_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (client_name) REFERENCES clients(name)
    );

    CREATE TABLE IF NOT EXISTS insight_meetings (
      insight_id TEXT NOT NULL,
      meeting_id TEXT NOT NULL,
      contribution_summary TEXT DEFAULT '',
      PRIMARY KEY (insight_id, meeting_id),
      FOREIGN KEY (insight_id) REFERENCES insights(id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE TABLE IF NOT EXISTS insight_messages (
      id TEXT PRIMARY KEY,
      insight_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      sources TEXT,
      context_stale INTEGER DEFAULT 0,
      stale_details TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (insight_id) REFERENCES insights(id)
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      target_date TEXT,
      status TEXT DEFAULT 'identified',
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (client_name) REFERENCES clients(name)
    );

    CREATE TABLE IF NOT EXISTS milestone_mentions (
      milestone_id TEXT NOT NULL,
      meeting_id TEXT NOT NULL,
      mention_type TEXT NOT NULL,
      excerpt TEXT DEFAULT '',
      target_date_at_mention TEXT,
      mentioned_at TEXT NOT NULL,
      pending_review INTEGER DEFAULT 0,
      PRIMARY KEY (milestone_id, meeting_id),
      FOREIGN KEY (milestone_id) REFERENCES milestones(id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE TABLE IF NOT EXISTS milestone_action_items (
      milestone_id TEXT NOT NULL,
      meeting_id TEXT NOT NULL,
      item_index INTEGER NOT NULL,
      linked_at TEXT NOT NULL,
      PRIMARY KEY (milestone_id, meeting_id, item_index),
      FOREIGN KEY (milestone_id) REFERENCES milestones(id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      storage_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE TABLE IF NOT EXISTS milestone_messages (
      id TEXT PRIMARY KEY,
      milestone_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      sources TEXT,
      context_stale INTEGER DEFAULT 0,
      stale_details TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (milestone_id) REFERENCES milestones(id)
    );
    CREATE TABLE IF NOT EXISTS meeting_messages (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      sources TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      object_type TEXT NOT NULL,
      object_id TEXT NOT NULL,
      title TEXT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notes_object ON notes(object_type, object_id);

    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      password_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tenant_memberships (
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (tenant_id, user_id)
    );
  `);

  const artifactCols = db.prepare("PRAGMA table_info(artifacts)").all() as { name: string }[];
  if (!artifactCols.some(c => c.name === "additional_notes")) {
    db.exec("ALTER TABLE artifacts ADD COLUMN additional_notes TEXT DEFAULT '[]'");
  }
  if (!artifactCols.some(c => c.name === "milestones")) {
    db.exec("ALTER TABLE artifacts ADD COLUMN milestones TEXT DEFAULT '[]'");
  }

  const milestoneCols = db.prepare("PRAGMA table_info(milestones)").all() as { name: string }[];
  if (!milestoneCols.some(c => c.name === "ignored")) {
    db.exec("ALTER TABLE milestones ADD COLUMN ignored INTEGER DEFAULT 0");
  }

  const meetingCols = db.prepare("PRAGMA table_info(meetings)").all() as { name: string }[];
  if (!meetingCols.some(c => c.name === "ignored")) {
    db.exec("ALTER TABLE meetings ADD COLUMN ignored INTEGER DEFAULT 0");
  }

  const clientCols = db.prepare("PRAGMA table_info(clients)").all() as { name: string }[];
  if (!clientCols.some(c => c.name === "refinement_prompt")) {
    db.exec("ALTER TABLE clients ADD COLUMN refinement_prompt TEXT");
  }
  if (!clientCols.some(c => c.name === "meeting_names")) {
    db.exec("ALTER TABLE clients ADD COLUMN meeting_names TEXT DEFAULT '[]'");
  }
  if (!clientCols.some(c => c.name === "is_default")) {
    db.exec("ALTER TABLE clients ADD COLUMN is_default INTEGER DEFAULT 0");
  }
  if (!clientCols.some(c => c.name === "client_team")) {
    db.exec("ALTER TABLE clients ADD COLUMN client_team TEXT DEFAULT '[]'");
  }
  if (!clientCols.some(c => c.name === "implementation_team")) {
    db.exec("ALTER TABLE clients ADD COLUMN implementation_team TEXT DEFAULT '[]'");
  }
  if (!clientCols.some(c => c.name === "additional_extraction_llm_prompt")) {
    db.exec("ALTER TABLE clients ADD COLUMN additional_extraction_llm_prompt TEXT");
  }
  if (!clientCols.some(c => c.name === "id")) {
    db.exec("ALTER TABLE clients ADD COLUMN id TEXT");
  }
  if (!clientCols.some(c => c.name === "glossary")) {
    db.exec("ALTER TABLE clients ADD COLUMN glossary TEXT DEFAULT '[]'");
  }

  if (!meetingCols.some(c => c.name === "client_id")) {
    db.exec("ALTER TABLE meetings ADD COLUMN client_id TEXT");
  }

  if (artifactCols.some(c => c.name === "technical_topics")) {
    db.exec("ALTER TABLE artifacts RENAME COLUMN technical_topics TO architecture");
  }

  if (!meetingCols.some(c => c.name === "recording_url")) {
    db.exec("ALTER TABLE meetings ADD COLUMN recording_url TEXT");
  }

  const noteCols = db.prepare("PRAGMA table_info(notes)").all() as { name: string }[];
  if (!noteCols.some(c => c.name === "note_type")) {
    db.exec("ALTER TABLE notes ADD COLUMN note_type TEXT DEFAULT 'user'");
  }

  const threadCols = db.prepare("PRAGMA table_info(threads)").all() as { name: string }[];
  if (threadCols.length > 0 && !threadCols.some(c => c.name === "keywords")) {
    db.exec("ALTER TABLE threads ADD COLUMN keywords TEXT DEFAULT ''");
  }

  const clientPkInfo = db.prepare("PRAGMA table_info(clients)").all() as { name: string; pk: number }[];
  const needsMigration = clientPkInfo.some(c => c.name === "name" && c.pk === 1);
  if (needsMigration) {
    db.exec(`UPDATE clients SET id = lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random())%4+1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) WHERE id IS NULL`);

    db.exec(`
      CREATE TABLE IF NOT EXISTS clients_v2 (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        name TEXT NOT NULL,
        aliases TEXT,
        known_participants TEXT,
        refinement_prompt TEXT,
        client_team TEXT DEFAULT '[]',
        implementation_team TEXT DEFAULT '[]',
        additional_extraction_llm_prompt TEXT,
        meeting_names TEXT DEFAULT '[]',
        is_default INTEGER DEFAULT 0,
        glossary TEXT DEFAULT '[]'
      )
    `);

    db.exec(`
      INSERT OR IGNORE INTO clients_v2 (id, name, aliases, known_participants, refinement_prompt, client_team, implementation_team, additional_extraction_llm_prompt, meeting_names, is_default, glossary)
      SELECT id, name, aliases, known_participants, refinement_prompt, client_team, implementation_team, additional_extraction_llm_prompt, meeting_names, is_default, glossary
      FROM clients
    `);
  }
}
