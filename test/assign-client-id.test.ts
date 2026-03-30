import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { assignClient } from "../cli/admin-util/assign-client.js";
import type { DatabaseSync as Database } from "node:sqlite";

describe("assignClient writes client_id", () => {
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
       VALUES ('m1', 'Sprint Planning', '2026-01-15T10:00:00Z', '', 'test.txt', '', 0)`
    ).run();
  });

  it("writes client_id to client_detections and updates meetings.client_id", () => {
    const result = assignClient(db, "m1", "Acme");
    expect(result).toEqual({ matched: 1, client_name: "Acme" });

    const detection = db.prepare(
      "SELECT client_name, client_id FROM client_detections WHERE meeting_id = 'm1'"
    ).get() as { client_name: string; client_id: string };
    expect(detection.client_name).toBe("Acme");
    expect(detection.client_id).toBe(clientId);

    const meeting = db.prepare(
      "SELECT client_id FROM meetings WHERE id = 'm1'"
    ).get() as { client_id: string };
    expect(meeting.client_id).toBe(clientId);
  });
});
