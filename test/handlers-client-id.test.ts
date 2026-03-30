import { describe, it, expect, beforeAll } from "vitest";
import { createDb, migrate } from "../core/db.js";
import { handleListThreads, handleCreateThread } from "../electron-ui/electron/handlers/threads.js";
import { handleListInsights, handleCreateInsight } from "../electron-ui/electron/handlers/insights.js";
import { handleListMilestones, handleCreateMilestone } from "../electron-ui/electron/handlers/milestones.js";
import { handleGetMeetings } from "../electron-ui/electron/handlers/meetings.js";
import type { DatabaseSync as Database } from "node:sqlite";

describe("IPC handlers accept clientId", () => {
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
  });

  it("handleListThreads resolves client name to ID", () => {
    const result = handleListThreads(db, "Acme");
    expect(result).toEqual([]);
  });

  it("handleListThreads accepts client ID directly", () => {
    const result = handleListThreads(db, clientId);
    expect(result).toEqual([]);
  });

  it("handleCreateThread resolves client_name to client_id", () => {
    const thread = handleCreateThread(db, { client_name: "Acme", title: "T", shorthand: "T", description: "d", criteria_prompt: "c" });
    expect(thread.client_id).toBe(clientId);
  });

  it("handleListInsights resolves client name to ID", () => {
    const result = handleListInsights(db, "Acme");
    expect(result).toEqual([]);
  });

  it("handleCreateInsight resolves client_name to client_id", () => {
    const insight = handleCreateInsight(db, { client_name: "Acme", period_type: "week", period_start: "2026-01-01", period_end: "2026-01-07" });
    expect(insight.client_id).toBe(clientId);
  });

  it("handleListMilestones resolves client name to ID", () => {
    const result = handleListMilestones(db, "Acme");
    expect(result).toEqual([]);
  });

  it("handleCreateMilestone resolves clientName to clientId", () => {
    const milestone = handleCreateMilestone(db, { clientName: "Acme", title: "MS" });
    expect(milestone.client_id).toBe(clientId);
  });

  it("handleGetMeetings filters by client name", () => {
    const result = handleGetMeetings(db, { client: "Acme" });
    expect(result).toHaveLength(1);
    expect(result[0].client).toBe("Acme");
  });

  it("handleGetMeetings filters by client ID", () => {
    const result = handleGetMeetings(db, { client: clientId });
    expect(result).toHaveLength(1);
    expect(result[0].client).toBe("Acme");
  });
});
