import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { Database } from "../core/db.js";

let db: Database;

beforeAll(() => {
  db = createDb(":memory:");
  migrate(db);
});

describe("createDb", () => {
  it("accepts a path and returns a working SQLite connection", () => {
    const result = db.prepare("SELECT 1 AS val").get() as { val: number };
    expect(result).toEqual({ val: 1 });
  });
});

describe("migrate", () => {
  it("creates meetings table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='meetings'").get();
    expect(row).toEqual({ name: "meetings" });
  });

  it("creates artifacts table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='artifacts'").get();
    expect(row).toEqual({ name: "artifacts" });
  });

  it("creates clients table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'").get();
    expect(row).toEqual({ name: "clients" });
  });

  it("creates client_detections table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='client_detections'").get();
    expect(row).toEqual({ name: "client_detections" });
  });

  it("creates clusters table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clusters'").get();
    expect(row).toEqual({ name: "clusters" });
  });

  it("creates meeting_clusters table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='meeting_clusters'").get();
    expect(row).toEqual({ name: "meeting_clusters" });
  });

  it("adds additional_notes column to artifacts", () => {
    const cols = db.prepare("PRAGMA table_info(artifacts)").all() as { name: string }[];
    expect(cols.some(c => c.name === "additional_notes")).toBe(true);
  });

  it("creates action_item_completions table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='action_item_completions'").get();
    expect(row).toEqual({ name: "action_item_completions" });
  });

  it("action_item_completions insert + query round-trip", () => {
    db.prepare("INSERT INTO action_item_completions (id, meeting_id, item_index, completed_at, note) VALUES ('c1', 'm1', 0, '2026-03-01T00:00:00Z', 'done')").run();
    const row = db.prepare("SELECT * FROM action_item_completions WHERE id = 'c1'").get() as { id: string; meeting_id: string; item_index: number; completed_at: string; note: string };
    expect(row).toEqual({ id: "c1", meeting_id: "m1", item_index: 0, completed_at: "2026-03-01T00:00:00Z", note: "done" });
  });

  it("creates item_mentions table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='item_mentions'").get();
    expect(row).toEqual({ name: "item_mentions" });
  });

  it("item_mentions insert + query round-trip", () => {
    db.prepare("INSERT OR IGNORE INTO meetings (id, title, date) VALUES ('im-m1', 'Standup', '2026-01-15')").run();
    db.prepare("INSERT INTO item_mentions (canonical_id, meeting_id, item_type, item_index, item_text, first_mentioned_at) VALUES ('can1', 'im-m1', 'action_items', 0, 'Deploy to prod', '2026-01-15')").run();
    const row = db.prepare("SELECT * FROM item_mentions WHERE canonical_id = 'can1'").get() as { canonical_id: string; meeting_id: string; item_type: string; item_index: number; item_text: string; first_mentioned_at: string };
    expect(row).toEqual({
      canonical_id: "can1",
      meeting_id: "im-m1",
      item_type: "action_items",
      item_index: 0,
      item_text: "Deploy to prod",
      first_mentioned_at: "2026-01-15",
    });
  });

  it("creates artifact_fts virtual table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='artifact_fts'").get();
    expect(row).toEqual({ name: "artifact_fts" });
  });

  it("creates insights table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='insights'").get();
    expect(row).toEqual({ name: "insights" });
  });

  it("creates insight_meetings table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='insight_meetings'").get();
    expect(row).toEqual({ name: "insight_meetings" });
  });

  it("creates insight_messages table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='insight_messages'").get();
    expect(row).toEqual({ name: "insight_messages" });
  });

  it("clients table has id column", () => {
    const cols = db.prepare("PRAGMA table_info(clients)").all() as { name: string }[];
    expect(cols.some(c => c.name === "id")).toBe(true);
  });

  it("meetings table has client_id column", () => {
    const cols = db.prepare("PRAGMA table_info(meetings)").all() as { name: string }[];
    expect(cols.some(c => c.name === "client_id")).toBe(true);
  });

  it("creates milestones table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='milestones'").get();
    expect(row).toEqual({ name: "milestones" });
  });

  it("creates milestone_mentions table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='milestone_mentions'").get();
    expect(row).toEqual({ name: "milestone_mentions" });
  });

  it("creates milestone_action_items table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='milestone_action_items'").get();
    expect(row).toEqual({ name: "milestone_action_items" });
  });

  it("creates milestone_messages table", () => {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='milestone_messages'").get();
    expect(row).toEqual({ name: "milestone_messages" });
  });

  it("adds milestones column to artifacts", () => {
    const cols = db.prepare("PRAGMA table_info(artifacts)").all() as { name: string }[];
    expect(cols.some(c => c.name === "milestones")).toBe(true);
  });

  it("creates tenants table with correct columns", () => {
    const cols = db.prepare("PRAGMA table_info(tenants)").all() as { name: string; type: string; pk: number }[];
    expect(cols.map(c => ({ name: c.name, type: c.type, pk: c.pk }))).toEqual([
      { name: "id", type: "TEXT", pk: 1 },
      { name: "name", type: "TEXT", pk: 0 },
      { name: "slug", type: "TEXT", pk: 0 },
      { name: "created_at", type: "TEXT", pk: 0 },
    ]);
  });

  it("creates users table with correct columns", () => {
    const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string; type: string; pk: number }[];
    expect(cols.map(c => ({ name: c.name, type: c.type, pk: c.pk }))).toEqual([
      { name: "id", type: "TEXT", pk: 1 },
      { name: "email", type: "TEXT", pk: 0 },
      { name: "display_name", type: "TEXT", pk: 0 },
      { name: "password_hash", type: "TEXT", pk: 0 },
      { name: "created_at", type: "TEXT", pk: 0 },
    ]);
  });

  it("creates tenant_memberships table with composite primary key", () => {
    const cols = db.prepare("PRAGMA table_info(tenant_memberships)").all() as { name: string; type: string; pk: number }[];
    expect(cols.map(c => ({ name: c.name, type: c.type, pk: c.pk }))).toEqual([
      { name: "tenant_id", type: "TEXT", pk: 1 },
      { name: "user_id", type: "TEXT", pk: 2 },
      { name: "role", type: "TEXT", pk: 0 },
      { name: "created_at", type: "TEXT", pk: 0 },
    ]);
  });

  it("tenants table enforces unique slug", () => {
    db.prepare("INSERT INTO tenants (id, name, slug) VALUES ('t1', 'Tenant 1', 'tenant-1')").run();
    expect(() => {
      db.prepare("INSERT INTO tenants (id, name, slug) VALUES ('t2', 'Tenant 2', 'tenant-1')").run();
    }).toThrow();
  });

  it("users table enforces unique email", () => {
    db.prepare("INSERT INTO users (id, email, display_name) VALUES ('u1', 'alice@test.com', 'Alice')").run();
    expect(() => {
      db.prepare("INSERT INTO users (id, email, display_name) VALUES ('u2', 'alice@test.com', 'Alice 2')").run();
    }).toThrow();
  });

  it("is idempotent — calling migrate twice does not throw", () => {
    expect(() => migrate(db)).not.toThrow();
  });
});

describe("client PK migration", () => {
  it("migrates clients table to use id as primary key and preserves data", () => {
    const mdb = createDb(":memory:");
    mdb.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        name TEXT PRIMARY KEY,
        aliases TEXT,
        known_participants TEXT
      );
    `);
    mdb.exec("ALTER TABLE clients ADD COLUMN id TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN refinement_prompt TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN meeting_names TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN is_default INTEGER DEFAULT 0");
    mdb.exec("ALTER TABLE clients ADD COLUMN client_team TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN implementation_team TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN additional_extraction_llm_prompt TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN glossary TEXT DEFAULT '[]'");

    mdb.prepare("INSERT INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run(
      "Acme", '["acme-inc"]', '["alice@acme.com"]', "existing-uuid",
    );
    mdb.prepare("INSERT INTO clients (name, aliases, known_participants) VALUES (?, ?, ?)").run(
      "NullId Corp", '["nullid"]', '[]',
    );

    migrate(mdb);

    const clientCols = mdb.prepare("PRAGMA table_info(clients)").all() as { name: string; pk: number }[];
    const idCol = clientCols.find(c => c.name === "id");
    expect(idCol).toEqual(expect.objectContaining({ name: "id", pk: 1 }));
    expect(clientCols.some(c => c.name === "tenant_id")).toBe(true);

    const acme = mdb.prepare("SELECT id, name, aliases FROM clients WHERE name = 'Acme'").get() as { id: string; name: string; aliases: string };
    expect(acme).toEqual({ id: "existing-uuid", name: "Acme", aliases: '["acme-inc"]' });

    const nullCorp = mdb.prepare("SELECT id, name FROM clients WHERE name = 'NullId Corp'").get() as { id: string; name: string };
    expect(nullCorp.name).toBe("NullId Corp");
    expect(nullCorp.id).toEqual(expect.any(String));
    expect(nullCorp.id.length).toBeGreaterThan(0);
  });

  it("skips migration when clients already has id as primary key", () => {
    const mdb = createDb(":memory:");
    migrate(mdb);
    migrate(mdb);
    const tables = mdb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'clients%'").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);
    expect(tableNames).toContain("clients");
  });

  it("adds client_id columns to threads, insights, milestones, client_detections and populates from JOIN", () => {
    const mdb = createDb(":memory:");
    mdb.exec(`
      CREATE TABLE IF NOT EXISTS meetings (id TEXT PRIMARY KEY, title TEXT, date TEXT);
      CREATE TABLE IF NOT EXISTS clients (
        name TEXT PRIMARY KEY, aliases TEXT, known_participants TEXT
      );
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY, client_name TEXT NOT NULL, title TEXT NOT NULL,
        shorthand TEXT DEFAULT '', description TEXT DEFAULT '', status TEXT DEFAULT 'open',
        summary TEXT DEFAULT '', criteria_prompt TEXT DEFAULT '', keywords TEXT DEFAULT '',
        criteria_changed_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY, client_name TEXT NOT NULL, name TEXT DEFAULT '',
        period_type TEXT NOT NULL, period_start TEXT NOT NULL, period_end TEXT NOT NULL,
        status TEXT DEFAULT 'draft', rag_status TEXT DEFAULT 'green', rag_rationale TEXT DEFAULT '',
        executive_summary TEXT DEFAULT '', topic_details TEXT DEFAULT '[]',
        generated_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY, client_name TEXT NOT NULL, title TEXT NOT NULL,
        description TEXT DEFAULT '', target_date TEXT, status TEXT DEFAULT 'identified',
        completed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS client_detections (
        meeting_id TEXT, client_name TEXT, confidence REAL, method TEXT
      );
    `);

    mdb.exec("ALTER TABLE clients ADD COLUMN id TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN refinement_prompt TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN meeting_names TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN is_default INTEGER DEFAULT 0");
    mdb.exec("ALTER TABLE clients ADD COLUMN client_team TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN implementation_team TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN additional_extraction_llm_prompt TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN glossary TEXT DEFAULT '[]'");

    mdb.prepare("INSERT INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run(
      "Acme", "[]", "[]", "acme-uuid",
    );

    const now = "2026-01-01T00:00:00Z";
    mdb.prepare("INSERT INTO threads (id, client_name, title, criteria_changed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      "t1", "Acme", "Thread 1", now, now, now,
    );
    mdb.prepare("INSERT INTO insights (id, client_name, period_type, period_start, period_end, generated_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      "i1", "Acme", "weekly", "2026-01-01", "2026-01-07", now, now, now,
    );
    mdb.prepare("INSERT INTO milestones (id, client_name, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)").run(
      "ms1", "Acme", "Milestone 1", now, now,
    );
    mdb.prepare("INSERT INTO client_detections (meeting_id, client_name, confidence, method) VALUES (?, ?, ?, ?)").run(
      "m1", "Acme", 0.9, "alias",
    );

    migrate(mdb);

    const threadRow = mdb.prepare("SELECT client_id FROM threads WHERE id = 't1'").get() as { client_id: string };
    expect(threadRow).toEqual({ client_id: "acme-uuid" });

    const insightRow = mdb.prepare("SELECT client_id FROM insights WHERE id = 'i1'").get() as { client_id: string };
    expect(insightRow).toEqual({ client_id: "acme-uuid" });

    const milestoneRow = mdb.prepare("SELECT client_id FROM milestones WHERE id = 'ms1'").get() as { client_id: string };
    expect(milestoneRow).toEqual({ client_id: "acme-uuid" });

    const detectionRow = mdb.prepare("SELECT client_id FROM client_detections WHERE meeting_id = 'm1'").get() as { client_id: string };
    expect(detectionRow).toEqual({ client_id: "acme-uuid" });
  });

  it("drops old clients, renames clients_v2 to clients, and auto-bootstraps default tenant", () => {
    const mdb = createDb(":memory:");
    mdb.exec(`
      CREATE TABLE IF NOT EXISTS meetings (id TEXT PRIMARY KEY, title TEXT, date TEXT);
      CREATE TABLE IF NOT EXISTS clients (
        name TEXT PRIMARY KEY, aliases TEXT, known_participants TEXT
      );
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY, client_name TEXT NOT NULL, title TEXT NOT NULL,
        shorthand TEXT DEFAULT '', description TEXT DEFAULT '', status TEXT DEFAULT 'open',
        summary TEXT DEFAULT '', criteria_prompt TEXT DEFAULT '', keywords TEXT DEFAULT '',
        criteria_changed_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS insights (
        id TEXT PRIMARY KEY, client_name TEXT NOT NULL, name TEXT DEFAULT '',
        period_type TEXT NOT NULL, period_start TEXT NOT NULL, period_end TEXT NOT NULL,
        status TEXT DEFAULT 'draft', rag_status TEXT DEFAULT 'green', rag_rationale TEXT DEFAULT '',
        executive_summary TEXT DEFAULT '', topic_details TEXT DEFAULT '[]',
        generated_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS milestones (
        id TEXT PRIMARY KEY, client_name TEXT NOT NULL, title TEXT NOT NULL,
        description TEXT DEFAULT '', target_date TEXT, status TEXT DEFAULT 'identified',
        completed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS client_detections (
        meeting_id TEXT, client_name TEXT, confidence REAL, method TEXT
      );
    `);

    mdb.exec("ALTER TABLE clients ADD COLUMN id TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN refinement_prompt TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN meeting_names TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN is_default INTEGER DEFAULT 0");
    mdb.exec("ALTER TABLE clients ADD COLUMN client_team TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN implementation_team TEXT DEFAULT '[]'");
    mdb.exec("ALTER TABLE clients ADD COLUMN additional_extraction_llm_prompt TEXT");
    mdb.exec("ALTER TABLE clients ADD COLUMN glossary TEXT DEFAULT '[]'");

    mdb.prepare("INSERT INTO clients (name, aliases, known_participants, id) VALUES (?, ?, ?, ?)").run(
      "Acme", "[]", "[]", "acme-uuid",
    );

    migrate(mdb);

    const v2Gone = mdb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clients_v2'").get();
    expect(v2Gone).toBeUndefined();

    const clientsExists = mdb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'").get();
    expect(clientsExists).toEqual({ name: "clients" });

    const clientPk = mdb.prepare("PRAGMA table_info(clients)").all() as { name: string; pk: number }[];
    const idCol = clientPk.find(c => c.name === "id");
    expect(idCol).toEqual(expect.objectContaining({ name: "id", pk: 1 }));

    const acme = mdb.prepare("SELECT id, name, tenant_id FROM clients WHERE id = 'acme-uuid'").get() as { id: string; name: string; tenant_id: string };
    expect(acme.id).toBe("acme-uuid");
    expect(acme.name).toBe("Acme");
    expect(acme.tenant_id).toEqual(expect.any(String));

    const tenant = mdb.prepare("SELECT * FROM tenants WHERE id = ?").get(acme.tenant_id) as {
      id: string; name: string; slug: string; created_at: string;
    };
    expect(tenant).toEqual({
      id: acme.tenant_id,
      name: "Default",
      slug: "default",
      created_at: expect.any(String),
    });

    const user = mdb.prepare("SELECT * FROM users LIMIT 1").get() as {
      id: string; email: string; display_name: string; password_hash: string | null; created_at: string;
    };
    expect(user).toEqual({
      id: expect.any(String),
      email: "owner@localhost",
      display_name: "Owner",
      password_hash: null,
      created_at: expect.any(String),
    });

    const membership = mdb.prepare("SELECT * FROM tenant_memberships LIMIT 1").get() as {
      tenant_id: string; user_id: string; role: string; created_at: string;
    };
    expect(membership).toEqual({
      tenant_id: acme.tenant_id,
      user_id: user.id,
      role: "owner",
      created_at: expect.any(String),
    });
  });

  it("does not bootstrap tenant when tenants table already has rows", () => {
    const mdb = createDb(":memory:");
    migrate(mdb);
    mdb.prepare("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)").run("existing-tenant", "Existing", "existing");
    mdb.prepare("INSERT INTO clients (id, name, aliases) VALUES (?, ?, ?)").run("c1", "SomeCo", "[]");
    migrate(mdb);
    const tenantCount = mdb.prepare("SELECT count(*) as cnt FROM tenants").get() as { cnt: number };
    expect(tenantCount).toEqual({ cnt: 1 });
  });
});

describe("auth tables", () => {
  it("creates oauth_clients table with correct columns", () => {
    const cols = db.prepare("PRAGMA table_info(oauth_clients)").all() as { name: string; type: string; pk: number }[];
    expect(cols.map(c => ({ name: c.name, type: c.type, pk: c.pk }))).toEqual([
      { name: "client_id", type: "TEXT", pk: 1 },
      { name: "tenant_id", type: "TEXT", pk: 0 },
      { name: "client_secret_hash", type: "TEXT", pk: 0 },
      { name: "name", type: "TEXT", pk: 0 },
      { name: "grant_types", type: "TEXT", pk: 0 },
      { name: "scopes", type: "TEXT", pk: 0 },
      { name: "redirect_uris", type: "TEXT", pk: 0 },
      { name: "created_at", type: "TEXT", pk: 0 },
      { name: "revoked", type: "INTEGER", pk: 0 },
    ]);
  });

  it("creates oauth_tokens table with correct columns", () => {
    const cols = db.prepare("PRAGMA table_info(oauth_tokens)").all() as { name: string; type: string; pk: number }[];
    expect(cols.map(c => ({ name: c.name, type: c.type, pk: c.pk }))).toEqual([
      { name: "jti", type: "TEXT", pk: 1 },
      { name: "oauth_client_id", type: "TEXT", pk: 0 },
      { name: "user_id", type: "TEXT", pk: 0 },
      { name: "tenant_id", type: "TEXT", pk: 0 },
      { name: "scopes", type: "TEXT", pk: 0 },
      { name: "token_type", type: "TEXT", pk: 0 },
      { name: "expires_at", type: "TEXT", pk: 0 },
      { name: "revoked", type: "INTEGER", pk: 0 },
      { name: "created_at", type: "TEXT", pk: 0 },
    ]);
  });

  it("creates oauth_authorization_codes table with correct columns", () => {
    const cols = db.prepare("PRAGMA table_info(oauth_authorization_codes)").all() as { name: string; type: string; pk: number }[];
    expect(cols.map(c => ({ name: c.name, type: c.type, pk: c.pk }))).toEqual([
      { name: "code", type: "TEXT", pk: 1 },
      { name: "oauth_client_id", type: "TEXT", pk: 0 },
      { name: "user_id", type: "TEXT", pk: 0 },
      { name: "tenant_id", type: "TEXT", pk: 0 },
      { name: "redirect_uri", type: "TEXT", pk: 0 },
      { name: "scopes", type: "TEXT", pk: 0 },
      { name: "code_challenge", type: "TEXT", pk: 0 },
      { name: "code_challenge_method", type: "TEXT", pk: 0 },
      { name: "expires_at", type: "TEXT", pk: 0 },
      { name: "used", type: "INTEGER", pk: 0 },
      { name: "created_at", type: "TEXT", pk: 0 },
    ]);
  });

  it("creates api_keys table with correct columns", () => {
    const cols = db.prepare("PRAGMA table_info(api_keys)").all() as { name: string; type: string; pk: number }[];
    expect(cols.map(c => ({ name: c.name, type: c.type, pk: c.pk }))).toEqual([
      { name: "key_hash", type: "TEXT", pk: 1 },
      { name: "tenant_id", type: "TEXT", pk: 0 },
      { name: "user_id", type: "TEXT", pk: 0 },
      { name: "name", type: "TEXT", pk: 0 },
      { name: "prefix", type: "TEXT", pk: 0 },
      { name: "scopes", type: "TEXT", pk: 0 },
      { name: "created_at", type: "TEXT", pk: 0 },
      { name: "last_used_at", type: "TEXT", pk: 0 },
      { name: "revoked", type: "INTEGER", pk: 0 },
    ]);
  });

  it("oauth_clients insert + query round-trip", () => {
    db.prepare(`INSERT INTO oauth_clients (client_id, tenant_id, client_secret_hash, name, grant_types, scopes)
      VALUES ('oc1', 't1', 'hash123', 'Test App', 'client_credentials', 'meetings:read')`).run();
    const row = db.prepare("SELECT client_id, tenant_id, name, grant_types, scopes, revoked FROM oauth_clients WHERE client_id = 'oc1'").get() as {
      client_id: string; tenant_id: string; name: string; grant_types: string; scopes: string; revoked: number;
    };
    expect(row).toEqual({
      client_id: "oc1",
      tenant_id: "t1",
      name: "Test App",
      grant_types: "client_credentials",
      scopes: "meetings:read",
      revoked: 0,
    });
  });

  it("api_keys insert + query round-trip", () => {
    db.prepare(`INSERT INTO api_keys (key_hash, tenant_id, user_id, name, prefix, scopes)
      VALUES ('keyhash1', 't1', 'u1', 'My Key', 'mki_abc', 'meetings:read meetings:write')`).run();
    const row = db.prepare("SELECT key_hash, tenant_id, user_id, name, prefix, scopes, revoked FROM api_keys WHERE key_hash = 'keyhash1'").get() as {
      key_hash: string; tenant_id: string; user_id: string; name: string; prefix: string; scopes: string; revoked: number;
    };
    expect(row).toEqual({
      key_hash: "keyhash1",
      tenant_id: "t1",
      user_id: "u1",
      name: "My Key",
      prefix: "mki_abc",
      scopes: "meetings:read meetings:write",
      revoked: 0,
    });
  });
});
