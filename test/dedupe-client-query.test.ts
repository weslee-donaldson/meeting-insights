import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import type { DatabaseSync as Database } from "node:sqlite";

describe("all-items-dedupe client query uses meetings.client_id", () => {
  let db: Database;
  const clientId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
  const tenantId = "t1000000-0000-0000-0000-000000000001";

  beforeAll(() => {
    db = createDb(":memory:");
    migrate(db);
    db.prepare("INSERT INTO tenants (id, slug, name) VALUES (?, 'default', 'Default')").run(tenantId);
    db.prepare(
      `INSERT INTO clients (id, tenant_id, name, aliases, known_participants, client_team, implementation_team, meeting_names, glossary)
       VALUES (?, ?, 'Acme', '[]', '[]', '[]', '[]', '[]', '[]')`
    ).run(clientId, tenantId);
    db.prepare(
      `INSERT INTO meetings (id, title, date, raw_transcript, source_filename, client_id, ignored)
       VALUES ('m1', 'Sprint Planning', '2026-01-15T10:00:00Z', '', 'test.txt', ?, 0)`
    ).run(clientId);
    db.prepare(
      `INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, open_questions, risk_items, additional_notes, milestones)
       VALUES ('m1', 'summary', '[]', '[]', '[]', '[]', '[]', '[]', '[]')`
    ).run();
  });

  it("joins meetings.client_id to clients.id for client name", () => {
    const rows = db.prepare(`
      SELECT m.id, m.date, m.title,
             COALESCE(c.name, '') AS client
      FROM meetings m
      JOIN artifacts a ON a.meeting_id = m.id
      LEFT JOIN clients c ON m.client_id = c.id
      WHERE m.ignored = 0
        AND NOT EXISTS (SELECT 1 FROM item_mentions im WHERE im.meeting_id = m.id)
      ORDER BY m.date ASC
    `).all() as { id: string; client: string }[];

    expect(rows).toHaveLength(1);
    expect(rows[0].client).toBe("Acme");
  });

  it("returns empty client when meeting has no client_id", () => {
    db.prepare(
      `INSERT INTO meetings (id, title, date, raw_transcript, source_filename, client_id, ignored)
       VALUES ('m2', 'Orphan Meeting', '2026-01-16T10:00:00Z', '', 'test2.txt', '', 0)`
    ).run();
    db.prepare(
      `INSERT INTO artifacts (meeting_id, summary, decisions, proposed_features, action_items, open_questions, risk_items, additional_notes, milestones)
       VALUES ('m2', 'summary', '[]', '[]', '[]', '[]', '[]', '[]', '[]')`
    ).run();

    const rows = db.prepare(`
      SELECT m.id, m.date, m.title,
             COALESCE(c.name, '') AS client
      FROM meetings m
      JOIN artifacts a ON a.meeting_id = m.id
      LEFT JOIN clients c ON m.client_id = c.id
      WHERE m.ignored = 0
        AND NOT EXISTS (SELECT 1 FROM item_mentions im WHERE im.meeting_id = m.id)
      ORDER BY m.date ASC
    `).all() as { id: string; client: string }[];

    const orphan = rows.find(r => r.id === "m2");
    expect(orphan).toBeDefined();
    expect(orphan!.client).toBe("");
  });
});
